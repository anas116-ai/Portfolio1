# AGENTS.md

Conventions for this repository. Read this before adding an integration.

The project is **Mastan Vali's portfolio** — Next.js 15 (App Router) · React 19 ·
TypeScript · Tailwind v4 · npm. `DESIGN.md` holds the visual language
(obsidian `#070807` ground, bone `#F4F5EF`, lemon `#D9FF00`, brass `#C5AA7A`);
`docs/portfolio-content.md` holds the copy. Owner-only tooling lives under
`src/app/api/*` plus a `*-lab` / `*-studio` page, and is gated on
`NODE_ENV !== "production"` so it never appears to visitors.

---

## Context.dev — web data

One API for scraping, crawling, web search, structured extraction, brand
intelligence, file parsing and change monitoring. One key covers all of it.
Base URL `https://api.context.dev/v1`; every request sends
`Authorization: Bearer $CONTEXT_DEV_API_KEY`. Docs: <https://docs.context.dev>
(append `.md` to any docs URL for plain markdown).

### Environment

| Variable | Where | Notes |
| - | - | - |
| `CONTEXT_DEV_API_KEY` | `.env.local` (gitignored) | Server-side secret. The SDK reads it automatically. Rotate at <https://www.context.dev/dashboard/api-keys>. |
| `STUDIO_REFERENCE_PUBLIC` | `.env.local` | `1` lets the studio route answer from a production build. Default `0` (owner-only). |
| `CONTEXT_DEV_BASE_URL` | `.env.local` | Optional override, for a proxy or a local mock. |

`.env.example` documents all three. **The key must never reach a browser
bundle.** Two rules keep it there:

1. The SDK is imported in exactly one file, `src/lib/context-dev.ts`.
2. Client components import *types and pure helpers only* from
   `src/lib/reference-kit.ts`, never from `src/lib/context-dev.ts`. A stray
   `import type` from the wrong module is what would pull the key-bearing
   module into the client graph, so it is worth a look before merging.

### The wrapper

`src/lib/context-dev.ts` is the single door. Nothing else imports `context.dev`.

```ts
import {
  extractReferenceKit, // GET  /web/styleguide  → ReferenceKit
  searchReferences,    // POST /web/search      → ReferenceCandidate[]
  readPage,            // POST /web/scrape      → PageRead
  normaliseDomain,     // "example.com" | url   → hostname
  hasContextKey,
  ContextDevRequestError,
} from "@/lib/context-dev";
```

It owns four things so routes do not have to:

- **Retries.** `429` honours `Retry-After` (and `retry-after-ms`, which cannot be
  misread) capped at 60s. `408` and `5xx` get exponential backoff with jitter.
  Validation errors are never retried — repeating a `400` unchanged only spends
  the same rejection twice. Three attempts, then a typed throw.
- **Errors.** Everything becomes a `ContextDevRequestError` carrying `status`,
  the vendor's `error_code`, and `retryable`. A `401 NOT_FOUND` (key missing or
  wrong) is never confused with a `401 DISABLED` (key switched off).
- **Normalisation.** Vendor responses never leave this module. `ReferenceKit` is
  a stable, documented shape, so a vendor field rename is a one-file change.
- **Caching.** `maxAgeMs` is passed explicitly when freshness matters; otherwise
  the vendor default applies (three days for a scrape, three months for a
  styleguide). Styleguide light and dark are cached separately.

### Endpoints in use, and why

| Endpoint | Credits | Used for | Docs |
| - | - | - | - |
| `GET /web/styleguide` | 10 | Read a reference site's colours, type and radii; drives the sculpture's palette | <https://docs.context.dev/api-reference/brand-intelligence/styleguide> |
| `POST /web/search` | 1 per 10 results | Find candidate references from a query | <https://docs.context.dev/api-reference/web-scraping/search> |
| `POST /web/scrape` | 1 | Read a page as Markdown and lift its heading outline | <https://docs.context.dev/api-reference/web-scraping/scrape> |

Not yet wired, but one wrapper function away, and the right tool for these jobs:
`GET /web/urls` (map a site), `POST /web/crawl` (whole-site Markdown),
`POST /web/answers` (researched answers in a JSON shape — 10 credits fast mode,
100 in Ultra), `POST /brand/retrieve` + `GET /brand/search` (brand profiles and
logos), `POST /news/search`, `POST /people/enrich`, `POST /parse` (files as
Markdown). For anything past a few hundred URLs use `POST /batch/submit` rather
than a loop, and for repeat checks use monitors (`POST /monitors`) rather than a
polling loop. MCP users can point at `https://mcp.context.dev/mcp`.

**Add a function to the wrapper rather than calling the SDK from a route.**
Otherwise retries, error shapes and caching start to diverge.

### The route

`src/app/api/studio/reference/route.ts` — GET (so a reference is a shareable
URL) and POST. `?mode=kit|search|read`, plus `input`, `scheme=dark|light`,
`fresh=1`, `limit`. It answers in `{ ok, kit | results | page }` and maps
failures onto an HTTP status. With no key configured it still answers, returning
the house palette as a `fallback` so the studio is never a blank page.

Owner-only, like the resume uploader: live under `next dev`, `404` on the public
site unless `STUDIO_REFERENCE_PUBLIC=1`.

### The page

`/studio` — "Reference Studio". Point it at a site you admire and it comes back
as a design system, then paints that system onto a 3D form
(`src/components/studio/ReferenceSculpture.tsx`, a (2,3) torus-knot particle
field). Two decisions there are worth keeping:

- The bloom pass is gated on a point's **rank on the ramp**, not on its
  brightness. A reference whose accent is lemon is bright in the middle *and* at
  the top, and a luminance gate bloomed half the field.
- The ramp gets a **floor** (`liftToFloor`). Styleguides very often return
  `#000000` as the background, and pure-black points on a near-black page are
  holes, not shadows. The swatch grid still shows the raw extracted values —
  the palette is reported as found and only the surface is compensated.

### Cost discipline

Real calls cost credits and are shared across the organisation.

- Never loop over the live API. One targeted call.
- Use the batch API past a few hundred URLs, monitors instead of polling.
- Tests must **mock `src/lib/context-dev.ts`**, not hit the network. There is no
  integration test that spends credits.
- The studio page labels each action with its cost so the price of a click is
  visible before it is paid.
- If a call fails or comes back empty, check
  <https://docs.context.dev/optimization/troubleshooting> before changing
  approach. If an endpoint behaves differently than its docs, report it with
  `POST /feedback` (0 credits, any key) and include the `request_id` —
  <https://docs.context.dev/optimization/agent-feedback>.

### Verified working

One real end-to-end call, through the route and the wrapper:

```
GET /api/studio/reference?mode=kit&input=spline.design&scheme=dark  →  200

source   spline.design (dark)        credits  10 consumed · 990 remaining
palette  background #000000 obsidian · primary #FFFFFF chalk · accent #0062FF cobalt
fonts    Spline Sans w500 38px (display) · w500 32px (heading) · w400 18px (body)
shape    control radius 50px · card radius 16px
```

Search was verified too: `?mode=search&input=creative 3d webgl portfolio studios
awwwards` returned 10 ranked candidates.
