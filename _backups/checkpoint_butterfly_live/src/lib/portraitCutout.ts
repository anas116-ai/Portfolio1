/**
 * Portrait cutout — real alpha from a studio plate.
 *
 * The source shots are lit on a bright, colourless field. A pixel that is
 * both bright and unsaturated is almost certainly the plate, so a score of
 * `luminance - saturation` separates the two cleanly: skin highlights stay
 * because they carry chroma, the neutral background drops out because it
 * carries none. The matte is then feathered by one pixel and cropped to the
 * subject so the figure can be composed without any plate behind it.
 *
 * This never redraws the face — it only removes what was never part of it.
 */

export interface CutoutOptions {
  /** Score at or below which a pixel is fully opaque. Overrides the adaptive value. */
  lo?: number;
  /** Score at or above which a pixel is fully transparent. Overrides the adaptive value. */
  hi?: number;
  /** How much chroma counts as "definitely not the plate". */
  saturationWeight?: number;
  /** Extra transparent trim around the subject, as a fraction of its box. */
  margin?: number;
  /** Longest edge of the exported matte. */
  maxWidth?: number;
}

export interface CutoutResult {
  url: string;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

export async function cutoutOnNeutralField(
  src: string,
  opts: CutoutOptions = {},
): Promise<CutoutResult> {
  const saturationWeight = opts.saturationWeight ?? 0.9;
  const margin = opts.margin ?? 0.015;
  const maxWidth = opts.maxWidth ?? 900;

  const img = await loadImage(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) throw new Error(`Empty image: ${src}`);

  const work = document.createElement("canvas");
  work.width = w;
  work.height = h;
  const ctx = work.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D context unavailable");
  ctx.drawImage(img, 0, 0);

  const frame = ctx.getImageData(0, 0, w, h);
  const px = frame.data;
  const alpha = new Uint8ClampedArray(w * h);
  const score = new Uint8ClampedArray(w * h);

  const borderX = Math.max(2, Math.round(w * 0.04));
  const borderY = Math.max(2, Math.round(h * 0.04));
  const borderScores: number[] = [];

  for (let y = 0; y < h; y++) {
    const row = y * w;
    const onBorderRow = y < borderY || y >= h - borderY;
    for (let x = 0; x < w; x++) {
      const i = (row + x) * 4;
      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const mx = r > g ? (r > b ? r : b) : g > b ? g : b;
      const mn = r < g ? (r < b ? r : b) : g < b ? g : b;
      const sat = mx - mn;
      const s = lum - sat * saturationWeight;
      const clamped = s < 0 ? 0 : s > 255 ? 255 : s;
      score[row + x] = clamped;
      if (onBorderRow || x < borderX || x >= w - borderX) borderScores.push(clamped);
    }
  }

  // The plate is whatever fills the frame of the shot. Reading it from the
  // border means one set of thresholds works across every studio setup
  // instead of being tuned per file.
  borderScores.sort((a, b) => a - b);
  const plate = borderScores[Math.floor(borderScores.length * 0.5)] ?? 0;

  // A bright, colourless field is required. A dark plate (a low-key shot)
  // cannot be keyed this way, so say so and let the caller fall back.
  if (plate < 150) throw new Error("Plate is too dark to key");

  const hi = opts.hi ?? plate - 6;
  const lo = Math.max(1, opts.lo ?? plate - 34);

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const s = score[row + x];
      let raw: number;
      if (s >= hi) raw = 0;
      else if (s <= lo) raw = 255;
      else raw = Math.round((255 * (hi - s)) / (hi - lo));

      // Anything the ramp leaves half-decided is plate, not subject: a
      // studio wall keeps a faint gradient and this is what stops it showing
      // as a haze rectangle. What survives is re-spread into a real feather.
      const a = raw <= 96 ? 0 : Math.round(((raw - 96) * 255) / (255 - 96));

      alpha[row + x] = a;
      if (a >= 180) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) throw new Error("Cutout produced an empty matte");

  // One-pixel feather on the matte only. Keeps the silhouette honest while
  // removing the stair-stepping a hard threshold leaves on hair.
  const feathered = new Uint8ClampedArray(alpha);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          sum += alpha[ny * w + nx];
          count++;
        }
      }
      feathered[idx] = sum / count;
    }
  }

  // Write the matte and crop to the subject.
  const padX = Math.round((maxX - minX) * margin);
  const padY = Math.round((maxY - minY) * margin);
  const cx = Math.max(0, minX - padX);
  const cy = Math.max(0, minY - padY);
  const cw = Math.min(w - cx, maxX - minX + 1 + padX * 2);
  const chh = Math.min(h - cy, maxY - minY + 1 + padY * 2);

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      px[(row + x) * 4 + 3] = feathered[row + x];
    }
  }
  ctx.putImageData(frame, 0, 0);

  const out = document.createElement("canvas");
  const scale = Math.min(1, maxWidth / cw);
  out.width = Math.round(cw * scale);
  out.height = Math.round(chh * scale);
  const octx = out.getContext("2d");
  if (!octx) throw new Error("2D context unavailable");
  octx.imageSmoothingQuality = "high";
  octx.drawImage(work, cx, cy, cw, chh, 0, 0, out.width, out.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    out.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Cutout export failed");

  return {
    url: URL.createObjectURL(blob),
    width: out.width,
    height: out.height,
  };
}
