/**
 * context-dev — the one door to Context.dev.
 *
 * Server only. Every Context.dev call in this project goes through this file;
 * nothing else imports the SDK, and nothing here is reachable from a browser
 * bundle (the pure types live in `./reference-kit`, which is what the client
 * imports). The key is read from `CONTEXT_DEV_API_KEY` at call time and never
 * leaves the process.
 *
 * What it is used for here: the portfolio's `/studio` route extracts the design
 * system of a reference site and paints a 3D field with it. The catalogue is
 * much wider (crawl, brand, news, people, parse, batches, monitors) — add a
 * function here rather than calling the SDK from a route, so retries, caching
 * and error shapes stay in one place.
 *
 * Docs: https://docs.context.dev  ·  API reference: https://docs.context.dev/api-reference
 */

import ContextDev, { APIError } from "context.dev";
import {
  type ReferenceCandidate,
  type ReferenceFont,
  type ReferenceKit,
  type ReferenceSwatch,
  nameColour,
} from "./reference-kit";

/* ── the key ────────────────────────────────────────────────────────────
   Read per call, not at module load: Next reads `.env.local` before the first
   request, and a module-level read would freeze whatever was in the
   environment when the bundle was first evaluated. */

export function hasContextKey(): boolean {
  return Boolean(process.env.CONTEXT_DEV_API_KEY?.trim());
}

let client: ContextDev | null = null;

function getClient(): ContextDev {
  const apiKey = process.env.CONTEXT_DEV_API_KEY?.trim();
  if (!apiKey) {
    throw new ContextDevRequestError(
      "CONTEXT_DEV_API_KEY is not set. Add it to .env.local — see .env.example.",
      { status: 401, code: "NO_KEY" },
    );
  }
  if (!client) {
    client = new ContextDev({
      apiKey,
      ...(process.env.CONTEXT_DEV_BASE_URL
        ? { baseURL: process.env.CONTEXT_DEV_BASE_URL }
        : {}),
    });
  }
  return client;
}

/* ── errors ─────────────────────────────────────────────────────────────
   One shape for the route layer to map: what happened, whether trying again
   could help, and the vendor's own error code so a `401 NOT_FOUND` (wrong key)
   is never confused with a `401 DISABLED` (key turned off). */

export class ContextDevRequestError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly retryable: boolean;

  constructor(
    message: string,
    opts: { status?: number; code?: string; retryable?: boolean } = {},
  ) {
    super(message);
    this.name = "ContextDevRequestError";
    this.status = opts.status;
    this.code = opts.code;
    this.retryable = opts.retryable ?? false;
  }
}

/** Pull the vendor's `error_code` out of the SDK's parsed body. */
function errorCodeOf(err: APIError): string | undefined {
  const body = err.error as { error_code?: unknown; code?: unknown } | undefined;
  const raw = body?.error_code ?? body?.code;
  return typeof raw === "string" ? raw : undefined;
}

/**
 * How long to wait before retrying, in ms.
 *
 * `429` is the one status with an authoritative answer in the headers, and the
 * SDK's own `retry-after-ms` comes first because it cannot be misread. An HTTP
 * `Retry-After` may be seconds or an absolute date; both appear in the wild.
 */
function retryDelayMs(err: APIError, attempt: number): number | null {
  if (err.status === 429) {
    const headers = err.headers as Headers | undefined;
    const ms = headers?.get?.("retry-after-ms");
    if (ms && Number.isFinite(Number(ms))) {
      return Math.min(60_000, Math.max(0, Number(ms)));
    }
    const after = headers?.get?.("retry-after");
    if (after) {
      const seconds = Number(after);
      if (Number.isFinite(seconds)) {
        return Math.min(60_000, Math.max(0, seconds * 1000));
      }
      const when = Date.parse(after);
      if (Number.isFinite(when)) {
        return Math.min(60_000, Math.max(0, when - Date.now()));
      }
    }
    return 2_000 * (attempt + 1);
  }

  // 408 and 5xx: transient, but the server has told us nothing about timing, so
  // back off with jitter to keep a burst of retries from landing together.
  if (err.status === 408 || (err.status !== undefined && err.status >= 500)) {
    return Math.round(600 * 2 ** attempt * (0.75 + Math.random() * 0.5));
  }

  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Run one vendor call with the retry policy the docs ask for: honour
 * `Retry-After` on 429, back off on 408/5xx, and never retry a validation
 * error — retrying a 400 unchanged just spends the same rejection twice.
 */
async function call<T>(
  label: string,
  run: () => Promise<T>,
  { attempts = 3 }: { attempts?: number } = {},
): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await run();
    } catch (err) {
      last = err;
      if (!(err instanceof APIError)) throw err; // network/abort: surface as-is
      const delay = retryDelayMs(err, attempt);
      if (delay === null || attempt === attempts - 1) {
        throw new ContextDevRequestError(
          `${label}: ${err.message}`,
          {
            status: err.status,
            code: errorCodeOf(err),
            retryable: delay !== null,
          },
        );
      }
      await sleep(delay);
    }
  }
  throw last;
}

/* ── normalisation ──────────────────────────────────────────────────────
   The API answers in its own shapes; the studio should never see them. These
   turn a response into a `ReferenceKit`: deduped swatches in role order, the
   heading and body type roles that actually exist, and the two radii. */

function swatchesFrom(style: {
  colors: { accent: string; background: string; text: string };
  components?: {
    button?: {
      primary?: { backgroundColor?: string };
      secondary?: { backgroundColor?: string };
    };
    card?: { backgroundColor?: string };
  };
}): ReferenceSwatch[] {
  const roles: Array<[string, string | undefined]> = [
    ["background", style.colors.background],
    ["surface", style.components?.card?.backgroundColor],
    ["secondary", style.components?.button?.secondary?.backgroundColor],
    ["primary", style.components?.button?.primary?.backgroundColor],
    ["accent", style.colors.accent],
    ["text", style.colors.text],
  ];

  const seen = new Set<string>();
  const out: ReferenceSwatch[] = [];
  for (const [role, raw] of roles) {
    if (!raw || typeof raw !== "string") continue;
    // Some computed colours carry alpha: `#RRGGBBAA`. A ramp is opaque, so the
    // alpha pair is dropped rather than silently misread as blue.
    const hex = raw.trim().slice(0, 7).toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(hex) || seen.has(hex)) continue;
    seen.add(hex);
    out.push({ role, hex, name: nameColour(hex) });
  }
  return out;
}

function fontsFrom(style: {
  typography: {
    headings: {
      h1?: {
        fontFamily: string;
        fontFallbacks: string[];
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
      h2?: {
        fontFamily: string;
        fontFallbacks: string[];
        fontWeight: number;
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
      };
    };
    p?: {
      fontFamily: string;
      fontFallbacks: string[];
      fontWeight: number;
      fontSize: string;
      lineHeight: string;
      letterSpacing: string;
    };
  };
  fontLinks: Record<string, { files: Record<string, string> } | undefined>;
}): ReferenceFont[] {
  const roles: Array<[string, (typeof style.typography.headings)["h1"]]> = [
    ["display", style.typography.headings.h1],
    ["heading", style.typography.headings.h2],
    ["body", style.typography.p],
  ];

  const out: ReferenceFont[] = [];
  for (const [role, t] of roles) {
    if (!t?.fontFamily) continue;
    const link = style.fontLinks?.[t.fontFamily];
    // The family's weight map is keyed by string weight; ask for the exact
    // weight first and fall back to whichever file the site shipped.
    const files = link?.files ?? {};
    const file =
      files[String(t.fontWeight)] ??
      files[Object.keys(files)[0] ?? ""] ??
      undefined;
    out.push({
      role,
      family: t.fontFamily,
      fallbacks: t.fontFallbacks ?? [],
      weight: t.fontWeight ?? 400,
      size: t.fontSize ?? "",
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      ...(file ? { file } : {}),
    });
  }
  return out;
}

/** Accept `example.com`, `www.example.com/path`, or a full URL. */
export function normaliseDomain(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/* ── the endpoints in use ───────────────────────────────────────────────
   POST /web/scrape     1 credit    → read a page as Markdown
   POST /web/search     1 per 10    → find candidate references
   GET  /web/styleguide 10 credits  → extract a site's design system
   Docs links for each are recorded in AGENTS.md. */

export interface ExtractKitInput {
  /** Domain or URL. One of `url`/`domain` is required. */
  input: string;
  /** Emulated colour mode. Cached separately, so light and dark are two reads. */
  colorScheme?: "light" | "dark";
  /** `true` bypasses the cache (`maxAgeMs: 0`) — costs a fresh extraction. */
  fresh?: boolean;
  /** Deadline for the vendor call. */
  timeoutMs?: number;
}

export async function extractReferenceKit({
  input,
  colorScheme = "dark",
  fresh = false,
  timeoutMs = 45_000,
}: ExtractKitInput): Promise<ReferenceKit> {
  const domain = normaliseDomain(input);
  if (!domain) {
    throw new ContextDevRequestError(
      `Not a usable domain or URL: "${input}"`,
      { status: 400, code: "BAD_DOMAIN" },
    );
  }

  const res = await call(`styleguide ${domain}`, () =>
    getClient().web.extractStyleguide({
      domain,
      colorScheme,
      ...(fresh ? { maxAgeMs: 0 } : {}),
      timeoutOpts: { milliseconds: timeoutMs, behavior: "fail" },
      tags: ["studio", "reference"],
    }),
  );

  const style = res.styleguide;
  if (!style) {
    throw new ContextDevRequestError(
      `No styleguide came back for ${domain}. The site may be unreachable or blocked.`,
      { code: "EMPTY_STYLEGUIDE" },
    );
  }

  return {
    source: {
      url: `https://${domain}`,
      domain,
      mode: style.mode ?? colorScheme,
    },
    palette: swatchesFrom(style),
    fonts: fontsFrom(style),
    shape: {
      radius: style.components?.button?.primary?.borderRadius ?? "0px",
      ...(style.components?.card?.borderRadius
        ? { cardRadius: style.components.card.borderRadius }
        : {}),
    },
    credits: res.key_metadata
      ? {
          consumed: res.key_metadata.credits_consumed,
          remaining: res.key_metadata.credits_remaining,
        }
      : null,
    cached: res.cache_metadata?.status !== "miss",
    fetchedAt: new Date().toISOString(),
  };
}

export interface SearchInput {
  query: string;
  /** 10–100; the API may return fewer. */
  limit?: number;
  includeDomains?: string[];
}

export async function searchReferences({
  query,
  limit = 10,
  includeDomains,
}: SearchInput): Promise<ReferenceCandidate[]> {
  const res = await call(`search "${query}"`, () =>
    getClient().web.search({
      query,
      numResults: Math.max(10, Math.min(100, limit)),
      ...(includeDomains?.length ? { includeDomains } : {}),
    }),
  );

  return (res.results ?? []).map((r) => ({
    title: r.title ?? r.url,
    url: r.url,
    description: (r.description ?? "").trim().slice(0, 280),
    relevance: r.relevance ?? "medium",
  }));
}

export interface PageRead {
  url: string;
  title?: string;
  wordCount: number;
  /** Section headings, in document order — the outline of the page. */
  outline: string[];
  markdown: string;
}

/**
 * Read one page as Markdown.
 *
 * `maxAgeMs: 0` when `fresh`, otherwise the vendor default (up to three days),
 * which is the right trade for a page whose copy has not changed.
 */
export async function readPage({
  url,
  fresh = false,
  timeoutMs = 45_000,
}: {
  url: string;
  fresh?: boolean;
  timeoutMs?: number;
}): Promise<PageRead> {
  const res = await call(`scrape ${url}`, () =>
    getClient().web.scrape({
      url,
      formats: { markdown: true },
      sharedParams: { mainContentOnly: true },
      ...(fresh ? { maxAgeMs: 0 } : {}),
      timeoutOpts: { milliseconds: timeoutMs, behavior: "return-partial" },
      tags: ["studio", "reference"],
    }),
  );

  const markdown = res.markdown?.data ?? "";
  if (!res.markdown?.success || !markdown) {
    throw new ContextDevRequestError(
      `Scrape of ${url} returned no Markdown${
        res.markdown?.error_code ? ` (${res.markdown.error_code})` : ""
      }.`,
      { code: res.markdown?.error_code ?? "EMPTY_MARKDOWN" },
    );
  }

  const outline: string[] = [];
  for (const line of markdown.split("\n")) {
    const m = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (m) outline.push(m[2].replace(/[*_`]/g, "").trim());
  }

  return {
    url,
    ...(res.metadata?.title ? { title: res.metadata.title } : {}),
    wordCount: markdown.split(/\s+/).filter(Boolean).length,
    outline: outline.slice(0, 14),
    markdown,
  };
}
