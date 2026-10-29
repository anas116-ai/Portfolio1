import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────
   OWNER-ONLY RESUME UPLOADER
   One upload replaces the resume everywhere the site shows it:
   the modal preview pages, both downloadable PDFs, and the 3D
   printed sheet (which reads the same rendered page images).

   Preview and save render the PDF on this machine with the same
   renderer, so what the owner reviews before saving is exactly
   what every resume view shows after saving.

   Visibility rule: this tooling only activates while running the dev
   server on the owner's machine. On the public site the probe reports
   `enabled: false` and the write method answers 404, so no upload
   option can ever appear for visitors — and there is no write path
   for them to reach either.
   ───────────────────────────────────────────────────────────── */

function enabled() {
  return process.env.NODE_ENV !== "production";
}

const root = process.cwd();
const resumeDir = path.join(root, "public", "images", "resume");
const pdfMain = path.join(root, "public", "shaik-mastan-vali-resume.pdf");
const pdfAlt = path.join(root, "public", "resume.pdf");
const manifestPath = path.join(resumeDir, "manifest.json");

interface Manifest {
  pageCount: number;
  titles: string[];
  updatedAt: number;
}

async function readManifest(): Promise<Manifest | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    if (
      parsed &&
      typeof parsed.pageCount === "number" &&
      Array.isArray(parsed.titles)
    ) {
      return parsed as Manifest;
    }
  } catch {
    /* no manifest yet */
  }
  return null;
}

/* Rasterise the PDF to page PNGs. The legacy build is pdf.js's supported
   Node entry and draws through @napi-rs/canvas, so no browser or worker is
   involved anywhere in the upload flow. */
async function renderPages(
  pdf: File
): Promise<{ dataUrls: string[]; pngs: Buffer[] }> {
  const [{ getDocument }, { createCanvas }] = await Promise.all([
    /* webpack must not bundle these: @napi-rs/canvas ships a native .node
       binary and pdf.js expects its Node entry — both load from node_modules
       at runtime, keeping the upload flow outside the browser toolchain. */
    import(/* webpackIgnore: true */ "pdfjs-dist/legacy/build/pdf.mjs"),
    import(/* webpackIgnore: true */ "@napi-rs/canvas"),
  ]);

  const task = getDocument({
    data: new Uint8Array(await pdf.arrayBuffer()),
    disableFontFace: true,
    standardFontDataUrl: `${path.join(
      root,
      "node_modules",
      "pdfjs-dist",
      "standard_fonts"
    )}/`,
  });

  const dataUrls: string[] = [];
  const pngs: Buffer[] = [];
  try {
    const doc = await task.promise;
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: 1240 / base.width });
      const canvas = createCanvas(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height)
      ) as unknown as HTMLCanvasElement;
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, viewport }).promise;
      const native = canvas as unknown as {
        toBuffer: (mime: string) => Uint8Array;
        width: number;
        height: number;
      };
      const png = Buffer.from(native.toBuffer("image/png"));
      pngs.push(png);
      dataUrls.push(`data:image/png;base64,${png.toString("base64")}`);
    }
  } finally {
    try {
      await task.destroy();
    } catch {
      /* loading task already released */
    }
  }
  return { dataUrls, pngs };
}

async function rejectUnusablePdf(pdf: FormDataEntryValue | null) {
  if (!(pdf instanceof File) || pdf.size === 0) {
    return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
  }
  const head = new Uint8Array(await pdf.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...head) !== "%PDF-") {
    return NextResponse.json({ error: "That file is not a PDF" }, { status: 400 });
  }
  return null;
}

/* The probe answers on every deployment so the owner UI can decide itself
   whether to render; in production it only ever says `enabled: false`, and
   the write method below answers 404 — visitors never see, and can never
   reach, an upload control. */
export async function GET() {
  return NextResponse.json({ enabled: enabled() });
}

export async function POST(request: Request) {
  if (!enabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const form = await request.formData();
    const pdf = form.get("pdf");
    const rejected = await rejectUnusablePdf(pdf);
    if (rejected) return rejected;

    const file = pdf as File;
    const action = String(form.get("action") ?? "save");

    /* Preview: render only, nothing written — thumbnails and page count for
       the owner's review, titles prefilled from the current manifest. */
    if (action === "preview") {
      const { dataUrls } = await renderPages(file);
      const existing = await readManifest();
      const titles = dataUrls.map(
        (_, i) => existing?.titles?.[i] || `Page ${i + 1}`
      );
      return NextResponse.json({
        pageCount: dataUrls.length,
        pages: dataUrls,
        titles,
      });
    }

    /* Save: render again, then replace every resume asset in one pass. */
    const { pngs } = await renderPages(file);

    let titles: string[] = [];
    try {
      const parsed = JSON.parse(String(form.get("pagesMeta") ?? "[]"));
      if (Array.isArray(parsed)) titles = parsed.map((t) => String(t ?? ""));
    } catch {
      /* titles fall back to Page N */
    }

    const pdfBytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(pdfMain, pdfBytes);
    await fs.writeFile(pdfAlt, pdfBytes);

    await fs.mkdir(resumeDir, { recursive: true });
    for (let i = 0; i < pngs.length; i++) {
      await fs.writeFile(path.join(resumeDir, `page-${i + 1}.png`), pngs[i]);
    }

    /* Drop page images left over from a longer previous resume. */
    const existing = await fs.readdir(resumeDir);
    for (const name of existing) {
      const m = /^page-(\d+)\.png$/.exec(name);
      if (m && Number(m[1]) > pngs.length) {
        await fs.unlink(path.join(resumeDir, name));
      }
    }

    const manifest: Manifest = {
      pageCount: pngs.length,
      titles: pngs.map((_, i) => titles[i]?.trim() || `Page ${i + 1}`),
      updatedAt: Date.now(),
    };
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    return NextResponse.json(manifest);
  } catch (err) {
    return NextResponse.json(
      { error: `Save failed: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
