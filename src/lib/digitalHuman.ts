/**
 * digitalHuman — turns a studio photograph into a real 3D point form.
 *
 * The photograph is not pasted onto the page. Every point you see is one
 * pixel of the original frame, lifted off the plate and given a depth:
 *
 *   · the background is keyed away with the same luminous-neutral test the
 *     portrait matte uses, so only the body survives
 *   · depth comes from the subject's own luminance, which on a key-lit
 *     portrait is a usable proxy for proximity, plus a gentle forward bulge
 *     on the face
 *   · the colour is designed, never inherited. A studio plate lights a face
 *     with two practicals at opposite ends of the colour wheel, so the
 *     photograph is already three competing colours across a span the size
 *     of a thumbnail; keeping any of it reintroduces exactly that split.
 *     Instead the luminance walks one palette read off a painter's limited
 *     palette — the progression a portrait is actually built in, from the
 *     cool dark of the deepest shadow up through alizarin, burnt sienna and
 *     ochre into naples and warm ivory. One palette, one light.
 *
 * The result is a cloud of measured points in three dimensions. It rotates,
 * breathes and settles like a body because it is a body, just sampled.
 */

export interface DigitalHumanCloud {
  count: number;
  /** xyz, in world units, head at +y, chest at -y. */
  positions: Float32Array;
  /** rgb, already in display space. */
  colors: Float32Array;
  /** per-point render scale. */
  sizes: Float32Array;
  /** per-point 0..1 phase for organic drift. */
  seeds: Float32Array;
  /** xyz the point flies in from during the resolve. */
  scatter: Float32Array;
  /** per-point 0..1 entrance delay: the face arrives first. */
  delays: Float32Array;
  /** World-space surface normal, xyz per point. This is what lets a light
   *  fall across the form: without it every point faces the camera and the
   *  bust can only ever be as flat as the plate it came from. */
  normals: Float32Array;
  /** Three shaded terms per point: ambient occlusion, the specular mask, and
   *  how near the silhouette the point sits. The first keeps the creases dark,
   *  the second keeps the sheen on the ridges, the third keeps the rim light
   *  on the actual edge of the head and off the shadow side of the face. */
  shade: Float32Array;
  /** image width / height. */
  aspect: number;
}

/** World height the cloud is normalised to. The rig scales it to the frame. */
export const CLOUD_HEIGHT = 4.2;

/** Long edge the sample canvas is capped at. The face is only a few hundred
 *  pixels wide in the original, so sampling near full resolution is what
 *  buys definition — a downscaled plate can never resolve the eyes, the
 *  beard or the edge of the jaw. */
const SAMPLE_LONG_EDGE = 1800;
/** Grid pitch, in sample-canvas pixels. Coarse on purpose: the body reads
 *  better as separated points than as a packed mass. */
const STEP = 3;
/** Pitch of the head band. Finer than the body so the face resolves. Two is
 *  the pitch at which the eyes and the jaw still read — the cells stay
 *  separated because the sprite is kept well inside the pitch, which is what
 *  draws a lattice instead of a sheet. */
const HEAD_STEP = 2;
/** Above this we stride down so the GPU stays comfortable. */
const MAX_POINTS = 300000;
/** Depth the form is given, in world units, front to back. */
const DEPTH_SPAN = 0.9;
/** The relief field is built on its own coarser lattice. A surface slope does
 *  not need the full sample pitch to be believed, and the field costs four
 *  bytes a cell, so halving it quarters the memory the hero holds. */
const RELIEF_DOWN = 2;
/** Blur radius, in relief cells, of the field the normals are read from.
 *  Wide enough that hair and knit stop reading as static: their own texture is
 *  high frequency, and at a smaller radius the slope it produces is a normal
 *  pointing somewhere different on every point. */
const RELIEF_SMOOTH = 4;
/** Second radius for the wide compare. Narrow minus wide is positive on a
 *  ridge and negative in a crease, which is the whole occlusion map. */
const RELIEF_WIDE = 7;
/** Share of the measured relief a normal is allowed to believe. Straight off
 *  the plate the field is steeper than any face — read at full strength it
 *  turns a cheek into a cliff and the key rakes across the whole head. */
const RELIEF = 0.3;
/** World units of crease depth that span the whole occlusion range. */
const CREASE_SPAN = 0.05;
/** Curvature at which a point counts as a crease, and as a ridge. */
const AO_FLOOR = 0.45;
const SPEC_FLOOR = 0.22;
/** Share of the baked tone given up to the light model. The photograph's own
 *  shading is the likeness and is kept; this much of it is set aside so a
 *  single directional light can describe the form coherently instead of the
 *  plate's own three lamps being read as three directions at once. */
const TONE_FLATTEN = 0.2;

function hash(x: number, y: number): number {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Tone curve — one luminance in, one luminance out.
 *
 * Studio portraits on a bright plate sit high in the mid-tones, which is
 * where facial structure is least legible. Pull the floor down and run a
 * gentle S for separation. This shapes brightness only; the colour of the
 * form is decided afterwards by the ramp below.
 */
function toneCurve(v: number): number {
  const t = clamp01((v - 0.035) / 0.9);
  const s = t * t * (3 - 2 * t);
  return clamp01(t * 0.4 + s * 0.6);
}

/**
 * The face-core tone curve. The middle of a key-lit face sits in flat
 * mid-dark tones with almost no local separation, which is where the eyes
 * stop reading, so the core takes a lifted floor and a steeper S. Blended
 * in per point by the face mask.
 */
function toneCurveFace(v: number): number {
  const t = clamp01((v - 0.01) / 0.9);
  const s = t * t * (3 - 2 * t);
  return clamp01(t * 0.26 + s * 0.74);
}

/* ── the palette ──────────────────────────────────────────────────────
   A painter's limited palette, in the order a portrait is actually built:
   the cool dark of the deepest shadow first, then the warm earths, then
   the lights. Two rules, both borrowed from oil practice.

   · There is no black and there is no deep hole. The darkest note is a warm
     umber, and it sits well up the scale: the ground is #070807, so a floor
     at this luminance reads as a brown that is clearly a colour, where the
     old near-neutral floor at half of it read as a black bite taken out of
     the figure. The beard, the jaw and the collar are the darkest things in
     the frame and they are the reason the floor is lifted at all.

   · It is entered as one continuous field. The stops are joined with a
     Catmull-Rom spline, not a smoothstep. Smoothstep flattens at every
     knot, and a flat joint prints as a band of one colour followed by a
     band of the next across a cheek — which is the "half one shade, half
     another" the eye catches. A spline has no flat joint, so colour is
     always moving and the form reads as one skin under one lamp. */
const OIL_STOPS: { at: number; c: [number, number, number] }[] = [
  { at: 0.0, c: [0.335, 0.22, 0.185] },  // warm umber. the darkest note, and still a colour
  { at: 0.24, c: [0.44, 0.28, 0.215] },  // rose brown
  { at: 0.5, c: [0.55, 0.36, 0.25] },    // burnt sienna
  { at: 0.72, c: [0.66, 0.46, 0.315] },  // yellow ochre
  { at: 0.88, c: [0.765, 0.575, 0.405] },// naples yellow
  { at: 1.0, c: [0.85, 0.67, 0.5] },     // warm tan highlight
];

function oilRamp(l: number): [number, number, number] {
  const t = clamp01(l);
  const n = OIL_STOPS.length;
  let i = 0;
  while (i < n - 2 && t > OIL_STOPS[i + 1].at) i++;

  const a = OIL_STOPS[i];
  const b = OIL_STOPS[i + 1];
  const p0 = OIL_STOPS[Math.max(0, i - 1)].c;
  const p1 = a.c;
  const p2 = b.c;
  const p3 = OIL_STOPS[Math.min(n - 1, i + 2)].c;

  const span = Math.max(0.0001, b.at - a.at);
  const u = clamp01((t - a.at) / span);
  const u2 = u * u;
  const u3 = u2 * u;
  const out: [number, number, number] = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    out[k] = clamp01(
      0.5 *
        (2 * p1[k] +
          (-p0[k] + p2[k]) * u +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 +
          (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3),
    );
  }
  return out;
}

/** How far the darkest note in the frame is lifted toward the middle of the
 *  palette. The photograph's knit and the base of the beard are almost black,
 *  and at that luminance the ramp can only reach its own floor; a warning
 *  grey over an obsidian page is a shape nobody can see. Lifting the very
 *  bottom of the tonal range — with a curve weighted to the bottom, so the
 *  cheeks and the lights barely move — means every point in the form carries
 *  a colour, and the darkest thing on the page is still unmistakably brown. */
const SHADOW_FLOOR = 0.1;

/** Share of the silhouette rim rolled toward the top of the same palette.
 *  The points that only just survived the key are the lit rim of the hair
 *  and the jaw, and warming them into the palette's own light reads as
 *  studio backlight. Deliberately not the page's brass: a second hue on
 *  the outline is one of the things that turned the figure into three
 *  colours across a cheek. */
const RIM_LIGHT = 0.15;
const RIM_COLOR: [number, number, number] = [0.92, 0.78, 0.6];

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Separable box blur, run twice so the kernel is near enough gaussian.
 *
 * The relief field is taken off a photograph, and a photograph's luminance is
 * full of grain, weave and jpeg noise. Differentiated raw, that noise becomes
 * a normal per point pointing in a different direction to its neighbour, and a
 * lit field of those reads as television static. Blurring first is what turns
 * the same numbers into a surface.
 */
function blurField(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const out = src.slice();
  const tmp = new Float32Array(src.length);
  const d = Math.max(1, Math.round(r));
  const w2 = 2 * d + 1;
  const clampI = (v: number, n: number) => (v < 0 ? 0 : v > n - 1 ? n - 1 : v);

  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let sum = 0;
      for (let x = -d; x <= d; x++) sum += out[row + clampI(x, w)];
      for (let x = 0; x < w; x++) {
        tmp[row + x] = sum / w2;
        sum += out[row + clampI(x + d + 1, w)] - out[row + clampI(x - d, w)];
      }
    }
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let y = -d; y <= d; y++) sum += tmp[clampI(y, h) * w + x];
      for (let y = 0; y < h; y++) {
        out[y * w + x] = sum / w2;
        sum += tmp[clampI(y + d + 1, h) * w + x] - tmp[clampI(y - d, h) * w + x];
      }
    }
  }
  return out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`digitalHuman: could not load ${src}`));
    img.src = src;
  });
}

export async function buildDigitalHuman(
  src: string,
  maxPoints = MAX_POINTS,
): Promise<DigitalHumanCloud> {
  const img = await loadImage(src);

  const long = Math.max(img.naturalWidth, img.naturalHeight) || 1;
  const k = Math.min(1, SAMPLE_LONG_EDGE / long);
  const w = Math.max(2, Math.round(img.naturalWidth * k));
  const h = Math.max(2, Math.round(img.naturalHeight * k));

  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("digitalHuman: no 2d context");
  ctx.drawImage(img, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;

  const lumAt = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
  };
  const satAt = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    const r = px[i] / 255;
    const g = px[i + 1] / 255;
    const b = px[i + 2] / 255;
    const mx = r > g ? (r > b ? r : b) : g > b ? g : b;
    const mn = r < g ? (r < b ? r : b) : g < b ? g : b;
    return mx <= 0.0001 ? 0 : (mx - mn) / mx;
  };

  /* ── the plate ────────────────────────────────────────────────────────
     Studio shots sit on a bright neutral field, so the border is the plate.
     Its median luminous-neutral score is the threshold the body is cut at. */
  const border: number[] = [];
  const xStride = Math.max(1, Math.floor(w / 64));
  const yStride = Math.max(1, Math.floor(h / 64));
  for (let x = 0; x < w; x += xStride) {
    for (let d = 0; d < 4; d++) {
      border.push(lumAt(x, d) - 0.9 * satAt(x, d));
      border.push(lumAt(x, h - 1 - d) - 0.9 * satAt(x, h - 1 - d));
    }
  }
  for (let y = 0; y < h; y += yStride) {
    for (let d = 0; d < 4; d++) {
      border.push(lumAt(d, y) - 0.9 * satAt(d, y));
      border.push(lumAt(w - 1 - d, y) - 0.9 * satAt(w - 1 - d, y));
    }
  }
  border.sort((a, b) => a - b);
  const plate = border[Math.floor(border.length / 2)] ?? 0;

  const keyed = plate > 0.42;
  const hi = keyed ? plate - 0.026 : 0.42;
  const lo = keyed ? plate - 0.135 : 0.2;
  const band = Math.max(0.02, hi - lo);

  /* ── candidates ─────────────────────────────────────────────────────── */
  const cx: number[] = [];
  const cy: number[] = [];
  const cl: number[] = [];
  const cr: number[] = [];
  const cg: number[] = [];
  const cb: number[] = [];
  /** How far inside the subject each candidate sits. Needed to close the
   *  silhouette; see the size pass. */
  const cm: number[] = [];

  for (let y = STEP; y < h - STEP; y += STEP) {
    for (let x = STEP; x < w - STEP; x += STEP) {
      // Jitter is kept, but only as a whisper: a panel's cells are on a
      // lattice, and a full cell of jitter scrambles exactly the rows and
      // columns that make it read as one.
      const jx = x + (hash(x, y) - 0.5) * STEP * 0.25;
      const jy = y + (hash(y, x) - 0.5) * STEP * 0.25;
      const sx = Math.min(w - 1, Math.max(0, Math.round(jx)));
      const sy = Math.min(h - 1, Math.max(0, Math.round(jy)));

      const lum = lumAt(sx, sy);
      const score = lum - 0.9 * satAt(sx, sy);
      // the plate is the bright neutral field, so the body is everything
      // BELOW it: the matte closes above the threshold band, not below.
      // The 0.5 floor discards the band itself, which is where the plate
      // casts its soft shadow, so no ghost of the backdrop survives.
      const matte = (hi - score) / band;
      if (matte < 0.5) continue;

      const i = (sy * w + sx) * 4;
      cx.push(sx);
      cy.push(sy);
      cl.push(lum);
      cm.push(matte);
      cr.push(px[i] / 255);
      cg.push(px[i + 1] / 255);
      cb.push(px[i + 2] / 255);
    }
  }

  if (cx.length === 0) throw new Error("digitalHuman: no subject found in plate");

  /* ── frame the subject ──────────────────────────────────────────────
     The plate is discarded, so the body's own extent is the true frame.
     Mapping from its bounding box rather than the photograph's edge is
     what stops the form reading as a small figure lost in a tall crop. */
  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;
  for (let i = 0; i < cx.length; i++) {
    if (cx[i] < minX) minX = cx[i];
    if (cx[i] > maxX) maxX = cx[i];
    if (cy[i] < minY) minY = cy[i];
    if (cy[i] > maxY) maxY = cy[i];
  }

  /* The photograph runs on past the shoulders into a field of unlit knit and
     studio floor. That region is dark and unsaturated, so the key reads it as
     subject, but it is also the full width of the frame — which drags the
     measured body out to the edges of the picture and turns the bust into a
     slab. The body is what is narrower than the picture: walk up from the
     bottom until a row stops spanning the frame, and cut there. The result is
     clamped into a sane fraction of the subject so no photograph can collapse
     the bust to a sliver or keep the whole frame. */
  const rowMin = new Int32Array(h).fill(w);
  const rowMax = new Int32Array(h).fill(-1);
  for (let i = 0; i < cx.length; i++) {
    const y = cy[i];
    if (cx[i] < rowMin[y]) rowMin[y] = cx[i];
    if (cx[i] > rowMax[y]) rowMax[y] = cx[i];
  }

  let bodyBottom = minY;
  for (let y = maxY; y > minY; y--) {
    if (rowMax[y] < 0) continue;
    if (rowMax[y] - rowMin[y] <= w * 0.8) {
      bodyBottom = y;
      break;
    }
  }

  const spanY = maxY - minY;
  const cropBottom = Math.min(
    minY + spanY * 0.86,
    Math.max(minY + spanY * 0.45, bodyBottom + STEP * 2),
  );
  let keep = 0;
  let cMinX = w;
  let cMaxX = 0;
  for (let i = 0; i < cx.length; i++) {
    if (cy[i] > cropBottom) continue;
    if (cx[i] < cMinX) cMinX = cx[i];
    if (cx[i] > cMaxX) cMaxX = cx[i];
    cx[keep] = cx[i];
    cy[keep] = cy[i];
    cl[keep] = cl[i];
    cm[keep] = cm[i];
    cr[keep] = cr[i];
    cg[keep] = cg[i];
    cb[keep] = cb[i];
    keep++;
  }
  cx.length = keep;
  cy.length = keep;
  cl.length = keep;
  cm.length = keep;
  cr.length = keep;
  cg.length = keep;
  cb.length = keep;

  if (keep === 0) throw new Error("digitalHuman: bust crop removed every point");

  const subW = Math.max(2, cMaxX - cMinX);
  const subH = Math.max(2, cropBottom - minY);
  const cenX = (cMinX + cMaxX) / 2;
  const cenY = (minY + cropBottom) / 2;

  /* ── resolve the head ─────────────────────────────────────────────
     The grid above is deliberately coarse so the whole body stays cheap,
     then the head is sampled again at double density. Density is what
     makes a face read — the rim-lit hair, the eyes, the jaw — but the
     points must stay separated to read as a point form. Packed solid they
     turn into a photograph and the looking is gone.

     The band runs down past the mouth and the beard to the base of the
     jaw. It used to stop at the mouth on the theory that a dark mass gains
     nothing from more points, and that is exactly what failed: the beard
     and the jaw were sampled at a ninth of the face's density, so their
     points were too far apart to hold the palette's colour and the lower
     half of the head dissolved into the black ground. Only the shoulders
     and the knit below are left coarse now, and those carry no structure. */
  const bandTop = minY + subH * 0.05;
  const bandBottom = minY + subH * 0.8;
  let hx0 = w;
  let hx1 = 0;
  for (let i = 0; i < cx.length; i++) {
    if (cy[i] < bandTop || cy[i] > bandBottom) continue;
    if (cx[i] < hx0) hx0 = cx[i];
    if (cx[i] > hx1) hx1 = cx[i];
  }

  if (hx1 > hx0) {
    hx0 = Math.max(0, hx0 - STEP * 2);
    hx1 = Math.min(w - 1, hx1 + STEP * 2);
    const y0 = Math.max(0, Math.round(bandTop));
    const y1 = Math.min(h - 1, Math.round(bandBottom));

    for (let y = y0; y <= y1; y += HEAD_STEP) {
      for (let x = hx0; x <= hx1; x += HEAD_STEP) {
        // the same whisper of jitter the body grid uses, so the head is a
        // finer pitch of the same panel rather than a lattice of its own
        const jx = x + (hash(x * 1.7, y * 0.9) - 0.5) * HEAD_STEP * 0.25;
        const jy = y + (hash(y * 1.3, x * 1.7) - 0.5) * HEAD_STEP * 0.25;
        const sx = Math.min(w - 1, Math.max(0, Math.round(jx)));
        const sy = Math.min(h - 1, Math.max(0, Math.round(jy)));

        const lum = lumAt(sx, sy);
        const score = lum - 0.9 * satAt(sx, sy);
        const matte = (hi - score) / band;
        if (matte < 0.5) continue;

        const i = (sy * w + sx) * 4;
        cx.push(sx);
        cy.push(sy);
        cl.push(lum);
        cm.push(matte);
        cr.push(px[i] / 255);
        cg.push(px[i + 1] / 255);
        cb.push(px[i + 2] / 255);
      }
    }
  }

  /* ── depth range, taken from the subject itself ─────────────────────── */
  let lumMin = 1;
  let lumMax = 0;
  for (let i = 0; i < cl.length; i++) {
    if (cl[i] < lumMin) lumMin = cl[i];
    if (cl[i] > lumMax) lumMax = cl[i];
  }
  const lumSpan = Math.max(0.05, lumMax - lumMin);

  /* ── the relief ───────────────────────────────────────────────────────
     A photograph has no geometry, but a key-lit portrait carries one
     implicitly: the planes turned toward the lamp are the bright ones, so the
     subject's own luminance is a usable height field. Read its slope and every
     point gets a real normal — and a normal is the entire difference between a
     cloud of dots and a lit object, because it is what lets one light fall
     across the brow, rake the cheek and leave the socket alone.

     Read straight off the plate, the slope is noise; differentiated raw it
     sparkles like static. So the field is built on its own coarse lattice and
     blurred twice. Two radii are kept: the narrow one is the surface the
     normals come from, and narrow-minus-wide is the crease map — where the
     surface folds away from itself, which is exactly where a face is occluded
     and exactly where the ridge of a nose catches light. */
  const gw = Math.max(3, Math.ceil(w / RELIEF_DOWN));
  const gh = Math.max(3, Math.ceil(h / RELIEF_DOWN));
  const reliefRaw = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    const sy = Math.min(h - 1, gy * RELIEF_DOWN);
    for (let gx = 0; gx < gw; gx++) {
      const sx = Math.min(w - 1, gx * RELIEF_DOWN);
      const l = clamp01((lumAt(sx, sy) - lumMin) / lumSpan);
      const xN = (sx - minX) / subW;
      const yN = (sy - minY) / subH;
      reliefRaw[gy * gw + gx] =
        (l - 0.5) * DEPTH_SPAN +
        0.22 *
          Math.exp(-(((xN - 0.5) * (xN - 0.5)) / 0.075 + ((yN - 0.3) * (yN - 0.3)) / 0.05));
    }
  }
  const relief = blurField(reliefRaw, gw, gh, RELIEF_SMOOTH);
  const reliefWide = blurField(relief, gw, gh, RELIEF_WIDE);

  /* bilinear read of a relief field, in relief-cell coordinates */
  const reliefAt = (f: Float32Array, x: number, y: number) => {
    const fx = x < 0 ? 0 : x > gw - 1.001 ? gw - 1.001 : x;
    const fy = y < 0 ? 0 : y > gh - 1.001 ? gh - 1.001 : y;
    const x0 = fx | 0;
    const y0 = fy | 0;
    const tx = fx - x0;
    const ty = fy - y0;
    const i0 = y0 * gw + x0;
    const i1 = i0 + gw;
    const a0 = f[i0] + (f[i0 + 1] - f[i0]) * tx;
    const a1 = f[i1] + (f[i1 + 1] - f[i1]) * tx;
    return a0 + (a1 - a0) * ty;
  };

  /* ── stride down if the field is heavy ──────────────────────────────── */
  const stride = Math.max(1, Math.ceil(cx.length / maxPoints));
  const count = Math.ceil(cx.length / stride);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const scatter = new Float32Array(count * 3);
  const delays = new Float32Array(count);
  const normals = new Float32Array(count * 3);
  const shade = new Float32Array(count * 3);

  for (let n = 0; n < count; n++) {
    const c = n * stride;
    const sx = cx[c];
    const sy = cy[c];
    const lum = cl[c];
    const xN = (sx - minX) / subW;
    const yN = (sy - minY) / subH;
    // how far inside the key this point sits: 1 deep in the body, ~0.5 on
    // the rim. Drives the silhouette size pass, the rim light and the normal.
    const edgeM = Math.min(1, cm[c]);

    /* Depth comes from the smoothed relief rather than the raw per-pixel
       luminance, so the surface has one continuous shape and the normals
       below agree with the geometry they are lighting. */
    const gx = sx / RELIEF_DOWN;
    const gy = sy / RELIEF_DOWN;
    const z = reliefAt(relief, gx, gy);

    const p3 = n * 3;
    positions[p3] = ((sx - cenX) / subH) * CLOUD_HEIGHT;
    positions[p3 + 1] = ((cenY - sy) / subH) * CLOUD_HEIGHT;
    positions[p3 + 2] = z;

    /* The normal: the slope of that relief, converted out of sample pixels
       into world units. Sampled y runs down the plate and world y runs up,
       which is the sign that keeps the light above the brow where it belongs.
       Rim points are rolled back toward the camera — they only just made the
       key, and the plate's own bright field sits immediately behind them, so
       read there the slope would describe the backdrop rather than the face. */
    const worldPerSample = subH / CLOUD_HEIGHT;
    const step = 1 / (2 * RELIEF_DOWN);
    const gradX =
      (reliefAt(relief, gx + 1, gy) - reliefAt(relief, gx - 1, gy)) *
      step *
      worldPerSample;
    const gradY =
      (reliefAt(relief, gx, gy + 1) - reliefAt(relief, gx, gy - 1)) *
      step *
      worldPerSample;
    const nx = -gradX * RELIEF * edgeM;
    const ny = gradY * RELIEF * edgeM;
    const nz = 1 + (1 - edgeM);
    const nl = 1 / Math.max(1e-5, Math.sqrt(nx * nx + ny * ny + nz * nz));
    normals[p3] = nx * nl;
    normals[p3 + 1] = ny * nl;
    normals[p3 + 2] = nz * nl;

    /* Occlusion and sheen, both off the same crease map: a point sitting
       lower than its wide neighbourhood is folded away from the light and
       goes dark — the socket, the side of the nose, under the jaw — while a
       point sitting higher is a ridge and takes the sheen. */
    const crease = z - reliefAt(reliefWide, gx, gy);
    const cv = clamp01(0.5 + crease / CREASE_SPAN);
    const n3 = n * 3;
    shade[n3] = AO_FLOOR + (1 - AO_FLOOR) * cv;
    shade[n3 + 1] = SPEC_FLOOR + (1 - SPEC_FLOOR) * cv;
    shade[n3 + 2] = edgeM;

    // The entrance is directed, not uniform: the face arrives first, then
    // the crown, then the shoulders. Measured in the frame's own units so
    // no photograph can invert the order.
    const belowM = clamp01((yN - 0.6) / 0.05);
    const aboveM = clamp01((0.2 - yN) / 0.05);
    const faceM = (1 - belowM) * (1 - aboveM);
    delays[n] = 0.6 * belowM + 0.35 * aboveM * (1 - belowM);

    // colour: designed, not inherited. Brightness is shaped by the tone curve
    // (the face core on its own lifted curve), the very bottom of the range is
    // lifted off black, a hair of dither keeps neighbours off the same note,
    // and the result walks the oil palette. One lamp, one palette, no patches,
    // and none of the photograph's own three-way colour split survives.
    const baked = toneCurve(lum) * (1 - faceM) + toneCurveFace(lum) * faceM;
    // part of the plate's own shading is set aside here: the light model below
    // puts a single coherent direction back on the form, and a form carrying
    // two directions at once is exactly what reads as flat
    const toned = baked * (1 - TONE_FLATTEN) + 0.5 * TONE_FLATTEN;
    const gl = clamp01(
      toned +
        SHADOW_FLOOR * (1 - toned) * (1 - toned) +
        (hash(sx * 0.53, sy * 1.31) - 0.5) * 0.012,
    );
    const ramp = oilRamp(gl);
    let r1 = ramp[0];
    let g1 = ramp[1];
    let b1 = ramp[2];

    // the silhouette rim rolls into the palette's own light, so the outline
    // reads as backlight rather than as the cut edge of a pasted figure
    const rim = clamp01((0.85 - edgeM) / 0.35) * RIM_LIGHT;
    if (rim > 0) {
      r1 += (RIM_COLOR[0] - r1) * rim;
      g1 += (RIM_COLOR[1] - g1) * rim;
      b1 += (RIM_COLOR[2] - b1) * rim;
    }

    colors[p3] = clamp01(r1);
    colors[p3 + 1] = clamp01(g1);
    colors[p3 + 2] = clamp01(b1);

    // The key is a soft test, so its outermost pixels survive as a fringe of
    // bright specks hanging off the silhouette — the hair reads as static
    // rather than as hair. Points that only just made the cut are held back
    // in size, which closes the outline and hands the density to the
    // interior where it actually describes a face.
    // Size carries the material. The correlation between brightness and size
    // is what does the shading, so it is kept intact; what is added is a lift
    // that reaches only the deepest notes. Measured on the live frame, the
    // knit and the beard sat at about a tenth of the coverage of the cheek,
    // so ninety per cent of those pixels were bare page and the whole lower
    // half read as a hole rather than as wool. The lift stops at 0.2 so the
    // eyes, which also live low, keep their size and do not go to blobs.
    // ── size: a panel, not a scatter ─────────────────────────────────────
    // On an LED matrix the pixel is fixed hardware and the picture lives
    // entirely in its colour, so brightness must not buy size. Correlating
    // the two is what made the bead field read as depth; on square cells it
    // reads as confetti, because neighbouring pixels of different sizes break
    // the one thing the eye uses to see a lattice. What survives is a shallow
    // taper at the rim: the key is soft, and its outermost points are a fringe
    // of specks that would otherwise stand off the head as a halo of bricks.
    sizes[n] = 0.8 + 0.2 * edgeM;
    seeds[n] = hash(sx * 0.37, sy * 0.61);

    // scatter: a shell the resolve pulls the body out of
    const a = hash(sx, sy * 0.5) * Math.PI * 2;
    const b = (hash(sy, sx * 0.5) - 0.5) * Math.PI;
    const r = 1.8 + hash(sx * 1.7, sy * 1.3) * 2.6;
    scatter[p3] = Math.cos(b) * Math.cos(a) * r * 1.25;
    scatter[p3 + 1] = Math.sin(b) * r * 1.5;
    scatter[p3 + 2] = Math.cos(b) * Math.sin(a) * r;
  }

  /* ── order far to near ──────────────────────────────────────────────
     Blending composites like a body rather than a haze only if the points
     are drawn back to front. A depth histogram does that in one linear
     pass, which is what keeps this affordable at a couple of hundred
     thousand points where a comparator sort would stall the hero. */
  let zMin = Infinity;
  let zMax = -Infinity;
  for (let i = 0; i < count; i++) {
    const z = positions[i * 3 + 2];
    if (z < zMin) zMin = z;
    if (z > zMax) zMax = z;
  }
  const zSpan = Math.max(0.0001, zMax - zMin);

  const BINS = 128;
  const starts = new Uint32Array(BINS + 1);
  const binOf = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    const b = Math.min(BINS - 1, Math.floor(((positions[i * 3 + 2] - zMin) / zSpan) * BINS));
    binOf[i] = b;
    starts[b + 1]++;
  }
  for (let b = 0; b < BINS; b++) starts[b + 1] += starts[b];

  const P = new Float32Array(count * 3);
  const C = new Float32Array(count * 3);
  const S = new Float32Array(count);
  const D = new Float32Array(count);
  const Q = new Float32Array(count * 3);
  const DL = new Float32Array(count);
  const NR = new Float32Array(count * 3);
  const SH = new Float32Array(count * 3);

  const cursor = starts.slice(0, BINS);
  for (let i = 0; i < count; i++) {
    const n = cursor[binOf[i]]++;
    P[n * 3] = positions[i * 3];
    P[n * 3 + 1] = positions[i * 3 + 1];
    P[n * 3 + 2] = positions[i * 3 + 2];
    C[n * 3] = colors[i * 3];
    C[n * 3 + 1] = colors[i * 3 + 1];
    C[n * 3 + 2] = colors[i * 3 + 2];
    S[n] = sizes[i];
    D[n] = seeds[i];
    DL[n] = delays[i];
    Q[n * 3] = scatter[i * 3];
    Q[n * 3 + 1] = scatter[i * 3 + 1];
    Q[n * 3 + 2] = scatter[i * 3 + 2];
    NR[n * 3] = normals[i * 3];
    NR[n * 3 + 1] = normals[i * 3 + 1];
    NR[n * 3 + 2] = normals[i * 3 + 2];
    SH[n * 3] = shade[i * 3];
    SH[n * 3 + 1] = shade[i * 3 + 1];
    SH[n * 3 + 2] = shade[i * 3 + 2];
  }

  return {
    count,
    positions: P,
    colors: C,
    sizes: S,
    seeds: D,
    scatter: Q,
    delays: DL,
    normals: NR,
    shade: SH,
    aspect: subW / subH,
  };
}
