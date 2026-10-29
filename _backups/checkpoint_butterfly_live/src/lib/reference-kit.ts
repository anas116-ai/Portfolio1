/**
 * reference-kit — the shape a Context.dev extraction is normalised into, plus
 * the pure colour maths the 3D piece reads.
 *
 * Deliberately free of any SDK or `process.env` reference. The server wrapper
 * (`src/lib/context-dev.ts`) builds a kit from the live API; the studio page
 * reads one back. Keeping the type and the maths here is what stops the API
 * client, and the key it closes over, from being pulled into a browser bundle
 * by a stray `import type`.
 */

/** One colour lifted out of a reference site, with the role it plays there. */
export interface ReferenceSwatch {
  /** What the site uses it for: background, text, accent, surface. */
  role: string;
  /** CSS hex, `#RRGGBB`. */
  hex: string;
  /** Human name derived from the hue, so the palette can be talked about. */
  name: string;
}

/** One typographic role lifted out of a reference site. */
export interface ReferenceFont {
  role: string;
  family: string;
  fallbacks: string[];
  weight: number;
  size: string;
  lineHeight?: string;
  letterSpacing?: string;
  /** A resolvable font file, when the extractor found one. */
  file?: string;
}

/** A normalised reference: everything the studio needs, nothing vendor-shaped. */
export interface ReferenceKit {
  source: {
    /** Canonical URL the kit describes. */
    url: string;
    /** Host, for display. */
    domain: string;
    /** Page title at extraction time, when the API returned one. */
    title?: string;
    /** Which colour mode was emulated. */
    mode: "light" | "dark";
  };
  palette: ReferenceSwatch[];
  fonts: ReferenceFont[];
  shape: {
    /** Corner radius on the primary control. */
    radius: string;
    /** Corner radius on cards, when the site has them. */
    cardRadius?: string;
  };
  credits: { consumed: number; remaining: number } | null;
  cached: boolean;
  fetchedAt: string;
}

/** One ranked page from a Context.dev web search. */
export interface ReferenceCandidate {
  title: string;
  url: string;
  description: string;
  relevance: "high" | "medium" | "low";
}

/* ── colour ─────────────────────────────────────────────────────────────
   Everything below is pure: no I/O, no env, no SDK. It turns the handful of
   hexes a styleguide returns into an ordered ramp a 3D field can be painted
   with, which is the whole reason the studio is worth having as a piece of
   motion rather than a swatch list. */

export function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgb01ToHex(rgb: [number, number, number]): string {
  const to = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(rgb[0])}${to(rgb[1])}${to(rgb[2])}`.toUpperCase();
}

/** Rec. 709 relative luminance, 0..1. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb01(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hexes, per WCAG 2.x. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * A plain-language name for a colour, so the palette can be discussed instead
 * of recited. Buckets by hue and then by value — the same two questions a
 * painter asks of a swatch.
 */
export function nameColour(hex: string): string {
  const [r, g, b] = hexToRgb01(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const s = max === 0 ? 0 : (max - min) / max;

  if (s < 0.1) {
    if (l < 0.06) return "obsidian";
    if (l < 0.25) return "graphite";
    if (l < 0.6) return "ash";
    if (l < 0.9) return "bone";
    return "chalk";
  }

  let h = 0;
  const d = max - min;
  if (d !== 0) {
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const dark = l < 0.22;
  const pale = l > 0.72;

  if (h < 15 || h >= 345) return dark ? "oxblood" : pale ? "blush" : "vermilion";
  if (h < 45) return dark ? "umber" : pale ? "sand" : "ochre";
  if (h < 70) return dark ? "olive" : pale ? "straw" : "sulphur";
  if (h < 160) return dark ? "pine" : pale ? "mint" : "viridian";
  if (h < 200) return dark ? "teal" : pale ? "glacier" : "cyan";
  if (h < 255) return dark ? "navy" : pale ? "powder" : "cobalt";
  if (h < 290) return dark ? "indigo" : pale ? "lilac" : "violet";
  return dark ? "plum" : pale ? "blossom" : "magenta";
}

/**
 * Order swatches the way a ramp is read: darkest first. A styleguide hands
 * back roles, not sequence, and a ramp built in role order would run from the
 * page background to the text to the accent and back — a zigzag, not a ramp.
 */
export function orderByValue(swatches: ReferenceSwatch[]): ReferenceSwatch[] {
  return [...swatches].sort(
    (a, b) => relativeLuminance(a.hex) - relativeLuminance(b.hex),
  );
}

/**
 * Widen a palette by mixing neighbours, so a three-colour styleguide can still
 * paint a continuous field. Mixing in linear RGB is close enough here and is
 * what keeps the mid-steps inside the family instead of inventing a hue the
 * reference never used.
 */
export function deepenPalette(swatches: ReferenceSwatch[]): ReferenceSwatch[] {
  const ordered = orderByValue(swatches);
  if (ordered.length < 2) return ordered;
  const out: ReferenceSwatch[] = [ordered[0]];
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = hexToRgb01(ordered[i].hex);
    const b = hexToRgb01(ordered[i + 1].hex);
    const mid: [number, number, number] = [
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
      (a[2] + b[2]) / 2,
    ];
    const hex = rgb01ToHex(mid);
    out.push({ role: "blend", hex, name: nameColour(hex) });
    out.push(ordered[i + 1]);
  }
  return out;
}

/**
 * Lift the darkest stops off the page ground.
 *
 * A styleguide frequently returns `#000000` as the background, and a point
 * painted pure black on a near-black page is not a dark point — it is a hole
 * in the sculpture. The whole dark end of the ramp disappears and the form
 * reads as though it were never finished.
 *
 * So the ramp the 3D piece is painted with gets a floor. The lift is toward the
 * palette's own middle stop rather than toward its lightest, so the dark end
 * borrows a hue the reference actually uses instead of being tinted with
 * whatever the accent happens to be. The swatch grid deliberately keeps
 * showing the raw extracted values: the palette is reported as found, and only
 * the surface it is painted onto is compensated.
 */
export function liftToFloor(hexes: string[], floor = 0.085): string[] {
  if (hexes.length < 2) return hexes;
  const ordered = [...hexes].sort((a, b) => relativeLuminance(a) - relativeLuminance(b));
  const mid = ordered[Math.floor(ordered.length / 2)];
  const midRgb = hexToRgb01(mid);
  const midLum = relativeLuminance(mid);

  return hexes.map((hex) => {
    const l = relativeLuminance(hex);
    if (l >= floor || midLum <= l) return hex;
    // linear in luminance, which is close enough over this short a span and
    // lands on the floor exactly rather than near it
    const k = Math.min(1, (floor - l) / (midLum - l));
    const a = hexToRgb01(hex);
    return rgb01ToHex([
      a[0] + (midRgb[0] - a[0]) * k,
      a[1] + (midRgb[1] - a[1]) * k,
      a[2] + (midRgb[2] - a[2]) * k,
    ]);
  });
}

function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/**
 * Evaluate the palette as a continuous ramp at `t`, 0..1.
 *
 * A spline rather than a chain of lerps: a piecewise mix has a flat joint at
 * every stop, and on a lit surface those joints print as visible bands. This
 * is the same reasoning the hero's own palette ramp is built on.
 */
export function sampleRamp(
  hexes: string[],
  t: number,
): [number, number, number] {
  const stops = hexes.map(hexToRgb01);
  if (stops.length === 0) return [0.5, 0.5, 0.5];
  if (stops.length === 1) return stops[0];
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  const scaled = clamped * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  const u = scaled - i;
  const p0 = stops[Math.max(0, i - 1)];
  const p1 = stops[i];
  const p2 = stops[i + 1];
  const p3 = stops[Math.min(stops.length - 1, i + 2)];
  const out: [number, number, number] = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const v = catmullRom(p0[k], p1[k], p2[k], p3[k], u);
    out[k] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  return out;
}

/** `count` evenly spaced samples of the ramp, ready for a shader uniform. */
export function rampStops(hexes: string[], count = 16): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < count; i++) {
    out.push(sampleRamp(hexes, count === 1 ? 0 : i / (count - 1)));
  }
  return out;
}

/** The palette as CSS custom properties, for the copy-tokens action. */
export function kitToCss(kit: ReferenceKit, prefix = "ref"): string {
  const lines = kit.palette.map(
    (s, i) =>
      `  --${prefix}-${s.role.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `c${i}`}: ${s.hex};`,
  );
  for (const f of kit.fonts) {
    lines.push(
      `  --${prefix}-font-${f.role.toLowerCase()}: ${[f.family, ...f.fallbacks]
        .filter(Boolean)
        .join(", ")};`,
    );
  }
  lines.push(`  --${prefix}-radius: ${kit.shape.radius};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

/**
 * The house kit.
 *
 * Served when there is no key, no credit, or no network, so the studio is
 * never a blank page — and labelled as such in the UI rather than passed off
 * as an extraction. The values are this site's own DESIGN.md tokens, which
 * makes the fallback honest: it is what the studio looks like before a
 * reference has told it anything.
 */
export const HOUSE_KIT: ReferenceKit = {
  source: { url: "https://github.com/shaikmastanvali", domain: "house", mode: "dark" },
  palette: [
    { role: "background", hex: "#070807", name: "obsidian" },
    { role: "deep", hex: "#0B0D0A", name: "graphite" },
    { role: "brass", hex: "#C5AA7A", name: "ochre" },
    { role: "text", hex: "#F4F5EF", name: "bone" },
    { role: "accent", hex: "#D9FF00", name: "sulphur" },
  ],
  fonts: [
    {
      role: "display",
      family: "Cabinet Grotesk",
      fallbacks: ["Geist", "sans-serif"],
      weight: 700,
      size: "clamp(2.5rem, 6vw, 6rem)",
    },
    {
      role: "body",
      family: "Geist",
      fallbacks: ["system-ui", "sans-serif"],
      weight: 400,
      size: "1rem",
    },
  ],
  shape: { radius: "2px" },
  credits: null,
  cached: false,
  fetchedAt: new Date(0).toISOString(),
};
