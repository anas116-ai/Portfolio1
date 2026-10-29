import { NextResponse } from "next/server";
import {
  ContextDevRequestError,
  extractReferenceKit,
  hasContextKey,
  readPage,
  searchReferences,
} from "@/lib/context-dev";
import { HOUSE_KIT, type ReferenceKit } from "@/lib/reference-kit";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────
   STUDIO · REFERENCE

   The one server route in front of the Context.dev wrapper. It answers in a
   shape the studio page can render directly — a kit, a candidate list, or a
   page outline — and never forwards the vendor's response, so the client is
   never coupled to an API version.

   Cost, per call: a styleguide read is 10 credits, a search is 1 per ten
   results, a page read is 1. That is why the route is owner-only: like the
   resume uploader, it is live while the dev server runs on the owner's machine
   and answers 404 on the public site. `STUDIO_REFERENCE_PUBLIC=1` opens it up
   if the owner ever wants to pay for public traffic.
   ───────────────────────────────────────────────────────────── */

function enabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.STUDIO_REFERENCE_PUBLIC === "1"
  );
}

const notFound = () =>
  NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

/** Map a wrapper failure onto a status the UI can explain. */
function failure(err: unknown) {
  if (err instanceof ContextDevRequestError) {
    const status =
      err.status && err.status >= 400 && err.status < 600
        ? err.status
        : err.code === "NO_KEY"
          ? 503
          : 502;
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        code: err.code ?? null,
        retryable: err.retryable,
        // Without a key the studio still works: it paints the house palette.
        fallback: !hasContextKey() ? HOUSE_KIT : undefined,
      },
      { status },
    );
  }
  return NextResponse.json(
    { ok: false, error: (err as Error).message ?? "Unknown failure" },
    { status: 500 },
  );
}

interface StudioRequest {
  mode?: string;
  input?: string;
  scheme?: string;
  fresh?: boolean | string;
  limit?: number | string;
}

async function resolve(body: StudioRequest) {
  if (!enabled()) return notFound();

  const mode = body.mode ?? "kit";
  const input = (body.input ?? "").trim();
  if (!input) {
    return NextResponse.json(
      { ok: false, error: "Provide a domain, URL, or query." },
      { status: 400 },
    );
  }

  const fresh = body.fresh === true || body.fresh === "1" || body.fresh === "true";

  try {
    if (mode === "search") {
      const results = await searchReferences({
        query: input,
        limit: Number(body.limit) > 10 ? Number(body.limit) : 10,
      });
      return NextResponse.json({ ok: true, results });
    }

    if (mode === "read") {
      const page = await readPage({
        url: /^https?:\/\//i.test(input) ? input : `https://${input}`,
        fresh,
      });
      return NextResponse.json({ ok: true, page });
    }

    const kit: ReferenceKit = await extractReferenceKit({
      input,
      colorScheme: body.scheme === "light" ? "light" : "dark",
      fresh,
    });
    return NextResponse.json({ ok: true, kit });
  } catch (err) {
    return failure(err);
  }
}

/** The studio page reads with GET so a reference is a shareable URL. */
export async function GET(request: globalThis.Request) {
  const url = new URL(request.url);
  const q = url.searchParams;
  return resolve({
    mode: q.get("mode") ?? "kit",
    input: q.get("input") ?? q.get("domain") ?? q.get("url") ?? q.get("q") ?? "",
    scheme: q.get("scheme") ?? undefined,
    fresh: q.get("fresh") ?? undefined,
    limit: q.get("limit") ?? undefined,
  });
}

export async function POST(request: globalThis.Request) {
  let body: StudioRequest = {};
  try {
    body = (await request.json()) as StudioRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected a JSON body." },
      { status: 400 },
    );
  }
  return resolve(body);
}
