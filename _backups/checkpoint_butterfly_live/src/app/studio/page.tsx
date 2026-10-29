"use client";

import { useCallback, useMemo, useState } from "react";
import ReferenceSculpture from "@/components/studio/ReferenceSculpture";
import {
  HOUSE_KIT,
  contrastRatio,
  deepenPalette,
  kitToCss,
  liftToFloor,
  type ReferenceCandidate,
  type ReferenceKit,
} from "@/lib/reference-kit";

/* ─────────────────────────────────────────────────────────────
   STUDIO · REFERENCE

   Point this at a site you admire and it comes back as a design system, then
   paints that system onto a 3D form. The extraction runs on the server through
   `/api/studio/reference`, which is the only place Context.dev is called — so
   the key never reaches this bundle, and neither does any vendor response.

   Owner tool, like the resume uploader: live while the dev server is running,
   404 on the public site. A styleguide read costs 10 credits, a search 1 per
   ten results, a page read 1.
   ───────────────────────────────────────────────────────────── */

type Mode = "kit" | "search" | "read";

interface PageRead {
  url: string;
  title?: string;
  wordCount: number;
  outline: string[];
}

export default function StudioPage() {
  const [input, setInput] = useState("spline.design");
  const [scheme, setScheme] = useState<"dark" | "light">("dark");
  const [fresh, setFresh] = useState(false);
  const [busy, setBusy] = useState<Mode | null>(null);
  const [kit, setKit] = useState<ReferenceKit | null>(null);
  const [results, setResults] = useState<ReferenceCandidate[] | null>(null);
  const [page, setPage] = useState<PageRead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = useCallback(
    async (mode: Mode, value?: string) => {
      const target = (value ?? input).trim();
      if (!target) return;
      if (value) setInput(value);
      setBusy(mode);
      setError(null);
      setNote(null);
      try {
        const params = new URLSearchParams({
          mode,
          input: target,
          scheme,
          ...(fresh ? { fresh: "1" } : {}),
        });
        const res = await fetch(`/api/studio/reference?${params}`);
        const body = await res.json();

        if (!body.ok) {
          if (body.fallback) setKit(body.fallback as ReferenceKit);
          setError(body.error ?? "Request failed");
          if (body.fallback) {
            setNote(
              "No key in this process, so the house palette is standing in — the sculpture is still live.",
            );
          }
          return;
        }

        if (mode === "search") {
          setResults(body.results as ReferenceCandidate[]);
          setPage(null);
        } else if (mode === "read") {
          setPage(body.page as PageRead);
        } else {
          setKit(body.kit as ReferenceKit);
          setResults(null);
          setPage(null);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(null);
      }
    },
    [input, scheme, fresh],
  );

  const active = kit ?? HOUSE_KIT;
  const isHouse = active.source.domain === "house";

  /* The ramp the sculpture is painted with: the reference's own colours, in
     value order, with the blend steps a three-colour styleguide needs before
     it can cover a continuous surface, and a floor under the darkest stop so a
     `#000000` background does not punch holes through the form. */
  const ramp = useMemo(
    () => liftToFloor(deepenPalette(active.palette).map((s) => s.hex)),
    [active],
  );

  const copyTokens = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(kitToCss(active));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard is blocked in this browser context.");
    }
  }, [active]);

  const label =
    "font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]";
  const panel =
    "border border-[var(--color-border-hairline)] bg-[var(--color-surface)] backdrop-blur-sm";
  const field =
    "w-full bg-[color-mix(in_srgb,var(--color-bg-primary)_80%,transparent)] border border-[var(--color-border-hairline)] rounded-[2px] px-3 py-2.5 font-mono text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors";
  const button =
    "border border-[var(--color-border-strong)] rounded-[2px] px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40 disabled:hover:border-[var(--color-border-strong)] disabled:hover:text-[var(--color-text-primary)]";

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] px-6 py-16 text-[var(--color-text-primary)] md:px-10 md:py-24">
      <div className="mx-auto w-full max-w-6xl">
        {/* ── head ────────────────────────────────────────────── */}
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-[var(--color-border-hairline)] pb-6">
          <div>
            <p className={label}>Studio · Reference</p>
            <h1 className="mt-3 text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[0.95] tracking-[-0.02em]">
              A site you admire,
              <br />
              drawn as a solid.
            </h1>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Context.dev reads the reference&rsquo;s colours, type and shape. Those
            values are painted onto a torus knot, so a palette can be judged as a
            surface instead of a row of swatches. The house palette stands in
            until a reference answers.
          </p>
        </header>

        {/* ── controls ────────────────────────────────────────── */}
        <section className={`${panel} mb-8 p-5`}>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className={`${field} min-w-[240px] flex-1`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") run("kit");
              }}
              placeholder="spline.design · or a full URL · or a search query"
              spellCheck={false}
              aria-label="Reference domain, URL, or search query"
            />
            <button className={button} onClick={() => run("kit")} disabled={busy !== null}>
              {busy === "kit" ? "Reading…" : "Extract kit · 10cr"}
            </button>
            <button className={button} onClick={() => run("search")} disabled={busy !== null}>
              {busy === "search" ? "Searching…" : "Search · 1cr"}
            </button>
            <button
              className={button}
              onClick={() => run("read")}
              disabled={busy !== null || !/^https?:|\./.test(input)}
            >
              {busy === "read" ? "Reading…" : "Read page · 1cr"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className={label}>Mode</span>
              {(["dark", "light"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScheme(s)}
                  className={`rounded-[2px] border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                    scheme === s
                      ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                      : "border-[var(--color-border-hairline)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={fresh}
                onChange={(e) => setFresh(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--color-accent)]"
              />
              <span className={label}>Bypass cache (maxAgeMs: 0)</span>
            </label>
          </div>

          {(error || note) && (
            <p
              className="mt-4 max-w-2xl border-l-2 pl-3 text-[12px] leading-relaxed"
              style={{
                borderColor: error ? "#C5633F" : "var(--color-border-strong)",
                color: error ? "#D98A63" : "var(--color-text-secondary)",
              }}
            >
              {error ?? note}
            </p>
          )}
        </section>

        {/* ── sculpture ───────────────────────────────────────── */}
        <section className={`${panel} relative mb-8 overflow-hidden`}>
          <ReferenceSculpture
            ramp={ramp}
            className="h-[380px] w-full md:h-[480px]"
          />
          <div className="pointer-events-none absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={label}>{isHouse ? "House palette" : "Reference"}</p>
              <p className="mt-1 font-mono text-[13px] text-[var(--color-text-primary)]">
                {isHouse ? "DESIGN.md" : active.source.domain}
              </p>
            </div>
            <div className="text-right">
              <p className={label}>
                {active.credits
                  ? `${active.credits.consumed} credits · ${active.credits.remaining} left`
                  : "no credits spent"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[var(--color-text-muted)]">
                {ramp.length} ramp stops
                {active.cached && !isHouse ? " · cached" : ""}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* ── palette ───────────────────────────────────────── */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className={label}>Palette</p>
              <button className={`${button} py-1.5`} onClick={copyTokens}>
                {copied ? "Copied" : "Copy tokens"}
              </button>
            </div>

            <div
              className="grid gap-px overflow-hidden border border-[var(--color-border-hairline)] bg-[var(--color-border-subtle)]"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))" }}
            >
              {active.palette.map((s, i) => {
                const onLight = contrastRatio(s.hex, "#F4F5EF") < 4.5;
                const ink = onLight ? "#191A16" : "#F4F5EF";
                return (
                  <div
                    key={`${s.role}-${i}`}
                    className="flex h-24 flex-col justify-between p-3"
                    style={{ backgroundColor: s.hex }}
                  >
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.2em]"
                      style={{ color: ink, opacity: 0.72 }}
                    >
                      {s.role}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: ink }}>
                      {s.name} · {s.hex}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
              Value order runs dark to light across the grid, which is the order the
              knot reads. Blends between neighbours are generated, so a three-colour
              extraction can still cover a surface without inventing a hue the
              reference never used.
            </p>
          </section>

          {/* ── type + shape ──────────────────────────────────── */}
          <section>
            <p className={`${label} mb-4`}>Type &amp; shape</p>
            <ul className="border border-[var(--color-border-hairline)]">
              {active.fonts.length === 0 && (
                <li className="px-4 py-3 font-mono text-[12px] text-[var(--color-text-muted)]">
                  No typography in this extraction.
                </li>
              )}
              {active.fonts.map((f) => (
                <li
                  key={f.role}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border-subtle)] px-4 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[13px] text-[var(--color-text-primary)]">
                      {f.family}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-[var(--color-text-faint)]">
                      {[f.family, ...f.fallbacks].slice(0, 3).join(", ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={label}>{f.role}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {f.weight} · {f.size || "—"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-[var(--color-border-hairline)]">
              <div className="bg-[var(--color-surface-subtle)] px-4 py-3">
                <dt className={label}>Control radius</dt>
                <dd className="mt-1 font-mono text-[13px]">{active.shape.radius}</dd>
              </div>
              <div className="bg-[var(--color-surface-subtle)] px-4 py-3">
                <dt className={label}>Card radius</dt>
                <dd className="mt-1 font-mono text-[13px]">{active.shape.cardRadius ?? "—"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
              Extracted values are a starting point, not a verdict. Contrast,
              responsive sizes and interactive states still get checked by eye
              before any of it ships.
            </p>
          </section>
        </div>

        {/* ── search results ──────────────────────────────────── */}
        {results && (
          <section className="mt-12">
            <div className="mb-4 flex items-baseline justify-between">
              <p className={label}>Candidates · {results.length}</p>
              <p className="font-mono text-[10px] text-[var(--color-text-faint)]">
                select one to extract its kit
              </p>
            </div>
            <ul className="border border-[var(--color-border-hairline)]">
              {results.map((r) => (
                <li key={r.url} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
                  <button
                    className="w-full px-4 py-3.5 text-left transition-colors hover:bg-[var(--color-surface-subtle)]"
                    onClick={() => run("kit", new URL(r.url).hostname)}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="truncate font-mono text-[13px] text-[var(--color-text-primary)]">
                        {r.title}
                      </p>
                      <span className={`${label} shrink-0`}>{r.relevance}</span>
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] text-[var(--color-text-faint)]">
                      {r.url}
                    </p>
                    {r.description && (
                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                        {r.description}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── page outline ────────────────────────────────────── */}
        {page && (
          <section className="mt-12">
            <div className="mb-4 flex items-baseline justify-between">
              <p className={label}>Page outline</p>
              <p className="font-mono text-[10px] text-[var(--color-text-faint)]">
                {page.wordCount.toLocaleString()} words
              </p>
            </div>
            <div className={`${panel} p-5`}>
              <p className="font-mono text-[12px] text-[var(--color-text-muted)]">
                {page.title ?? page.url}
              </p>
              <ol className="mt-4 space-y-1.5">
                {page.outline.map((h, i) => (
                  <li key={`${h}-${i}`} className="font-mono text-[12px] text-[var(--color-text-secondary)]">
                    <span className="mr-3 text-[var(--color-text-faint)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {h}
                  </li>
                ))}
                {page.outline.length === 0 && (
                  <li className="font-mono text-[12px] text-[var(--color-text-muted)]">
                    No headings found on this page.
                  </li>
                )}
              </ol>
            </div>
          </section>
        )}

        {/* ── footnote ────────────────────────────────────────── */}
        <footer className="mt-16 border-t border-[var(--color-border-hairline)] pt-6">
          <p className="max-w-3xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[var(--color-text-faint)]">
            GET /web/styleguide · POST /web/search · POST /web/scrape — all via
            src/lib/context-dev.ts. Owner-only: this route answers while the dev
            server runs, and 404s on the public site.
          </p>
        </footer>
      </div>
    </main>
  );
}
