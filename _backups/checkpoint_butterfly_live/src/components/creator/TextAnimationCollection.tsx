"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * TextAnimationCollection — variant `threeui-intro` (stamp drop)
 *
 * The signature MASTAN VALI wordmark behaves like a type slug being pressed
 * onto the page, strictly one letter at a time:
 *
 *   - M is released, falls, and settles completely before N is released.
 *   - Each letter starts ABOVE its final baseline and falls straight down.
 *   - On contact the letter settles: it compresses very slightly on Y, then
 *     eases back out, so it lands exactly in place instead of floating in.
 *   - Letters never translate sideways and never overshoot their slot.
 *   - The face is one lemon, masked with a sparse scratch so nicks break
 *     only the occasional edge and the whole letter stays readable.
 *   - After the word has fully settled the hero holds for REPLAY_MS, then
 *     the sequence starts again from the first letter.
 *
 * Props keep the `<TextAnimationCollection variant mode hue saturation
 * brightness text />` API.
 */

export type TextIntroVariant = "threeui-intro";
export type TextIntroMode = "dark" | "light";

interface TextAnimationCollectionProps {
  variant?: TextIntroVariant;
  mode?: TextIntroMode;
  /** Accepted for API compatibility. The wordmark is a fixed single lemon,
   *  so these three are intentionally not applied as a CSS filter. */
  hue?: number;
  saturation?: number;
  brightness?: number;
  text?: string;
  className?: string;
  /** When true the drop re-strikes every REPLAY_MS while the hero is in view. */
  loop?: boolean;
  /** Full repeat cadence in milliseconds. The hold after settling is derived
   *  from it so the run + hold lands exactly on this period (re-strike every
   *  cycleMs). Omit to fall back to the default hold. */
  cycleMs?: number;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a || 1e-6), 0, 1);

/** Silk descent: slow luxury approach, weightless stop, no impact snap.
    Quartic ease covers most of the distance early and settles long, which
    is what reads as expensive rather than mechanical. */
const eDrop = (t: number) => 1 - Math.pow(1 - t, 4);

/** Soft settle curve for the luxury release. Peaks gently at 32% of the window. */
const settle = (t: number) => Math.sin(clamp(t, 0, 1) * Math.PI) * (1 - clamp(t, 0, 1) * 0.15);

/**
 * Each letter must be unambiguously its own event. At 85ms the eleven glyphs
 * of MASTAN VALI resolved inside a third of a second and read as one simultaneous
 * arrival. 240ms per letter gives every glyph a visible drop, impact, and settle
 * before the next one is released, so M lands, then N, then E, then X.
 */
const LETTER_DELAY = 0.14; // seconds between letters — silk overlap cascade
const FALL_TIME = 0.9; // seconds of slow luxury descent
const SETTLE_TIME = 1.0; // seconds of soft fluid settle
const DROP_HEIGHT = 0.34; // fraction of glyph height — shorter, calmer rise
/* Glyphs are widened 16% and their height eased down 3% so each cap reads
   broad and settled instead of pulled tall and narrow. Applied inside every
   transform write because the tick owns the inline transform and a
   stylesheet scale would be overwritten. */
const GLYPH_WIDE = 1.16;
const GLYPH_TALL = 0.97;

/** Hold this long after the full word has settled, then re-strike. */
const REPLAY_MS = 10000;

export function TextAnimationCollection({
  variant = "threeui-intro",
  mode = "dark",
  hue = 0,
  saturation = 1.0,
  brightness = 1.0,
  text = "MASTAN VALI",
  className = "",
  loop = true,
  cycleMs,
}: TextAnimationCollectionProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const reduced = useReducedMotion();
  const playingRef = useRef(false);
  const replayRef = useRef<number | null>(null);

  const words = useMemo(() => text.split(" "), [text]);
  const letterCount = useMemo(() => text.replace(/ /g, "").length, [text]);
  const total = useMemo(
    () => LETTER_DELAY * (letterCount - 1) + FALL_TIME + SETTLE_TIME,
    [letterCount]
  );

  useEffect(() => {
    if (variant !== "threeui-intro") return;
    const root = rootRef.current;
    const nodes = charsRef.current;
    if (!root || !nodes.length) return;

    const settleAll = () => {
      for (const n of nodes) {
        if (!n) continue;
        n.style.transform = `scale(${GLYPH_WIDE}, ${GLYPH_TALL})`;
        n.style.opacity = "1";
        n.style.filter = "none";
      }
    };

    const clearReplay = () => {
      if (replayRef.current !== null) {
        window.clearTimeout(replayRef.current);
        replayRef.current = null;
      }
    };

    if (reduced) {
      settleAll();
      return;
    }

    let raf = 0;
    let cancelled = false;

    const play = () => {
      if (playingRef.current || cancelled) return;
      playingRef.current = true;
      const t0 = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = (now - t0) / 1000;

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          if (!n) continue;

          const start = i * LETTER_DELAY;
          const land = start + FALL_TIME;

          if (elapsed <= start) {
            // Waiting its turn: parked above the baseline, out of sight.
            n.style.transform = `translateY(${-DROP_HEIGHT}em) scale(${GLYPH_WIDE}, ${GLYPH_TALL})`;
            n.style.opacity = "0";
            n.style.filter = "none";
            continue;
          }

          if (elapsed < land) {
            // Free fall from above. Accelerating, straight down.
            const fall = eDrop(seg(elapsed, start, land));
            n.style.transform = `translateY(${(-DROP_HEIGHT * (1 - fall)).toFixed(4)}em) scale(${GLYPH_WIDE}, ${GLYPH_TALL})`;
            n.style.opacity = "1";
            n.style.filter = "none";
            continue;
          }

          if (elapsed < land + SETTLE_TIME) {
            // Silk settle: gentle breathe, then exact final slot.
            const s = settle(seg(elapsed, land, land + SETTLE_TIME));
            n.style.transform = `translateY(${(s * 0.028).toFixed(4)}em) scale(${GLYPH_WIDE}, ${(GLYPH_TALL * (1 - s * 0.035)).toFixed(4)})`;
            n.style.opacity = "1";
            n.style.filter = "none";
            continue;
          }

          n.style.transform = `scale(${GLYPH_WIDE}, ${GLYPH_TALL})`;
          n.style.opacity = "1";
          n.style.filter = "none";
        }

        if (elapsed < total + 0.15) {
          raf = requestAnimationFrame(tick);
        } else {
          settleAll();
          playingRef.current = false;
          clearReplay();
          if (loop) {
            /* The hold is whatever is left of the requested cadence once the
               run itself has played, so cycleMs reads as "re-strike every N". */
            const hold =
              cycleMs !== undefined
                ? Math.max(cycleMs - (total + 0.15) * 1000, 400)
                : REPLAY_MS;
            replayRef.current = window.setTimeout(play, hold);
          }
        }
      };

      raf = requestAnimationFrame(tick);
    };

    play();

    // Re-strike when the hero returns to view, and stop burning frames when it leaves.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) play();
        else clearReplay();
      },
      { threshold: 0.4 }
    );
    io.observe(root);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearReplay();
      io.disconnect();
    };
  }, [variant, reduced, total, text, loop, cycleMs]);

  let charIndex = -1;

  return (
    <span
      ref={rootRef}
      className={`threeui-intro-wordmark scratch-face ${
        mode === "light" ? "is-light" : "is-dark"
      } ${className}`}
      role="text"
      aria-label={text}
      // The wordmark is one lemon. The filter stays at identity so no hue,
      // saturation, or brightness shift can ever split the name into
      // multiple colours; the form prop is kept for API compatibility only.
      style={{ filter: "none" }}
      data-filter-unused={`${hue}/${saturation}/${brightness}`}
    >
      <span className="threeui-intro-line" aria-hidden="true">
        {words.map((word, wi) => (
          <span key={wi} className="threeui-intro-word" aria-hidden="true">
            {word.split("").map((c, ci) => {
              charIndex += 1;
              const idx = charIndex;
              return (
                <span
                  key={ci}
                  ref={(el) => {
                    if (el) charsRef.current[idx] = el;
                  }}
                  className="threeui-intro-char"
                  /* Each letter samples a different slice of the worn plate:
                     --sx drifts by 0.61em per character (non-multiple of the
                     tile width), so no two glyphs show the same streak. */
                  style={{ "--sx": `${(idx * 0.61).toFixed(2)}em` } as CSSProperties}
                >
                  {c}
                </span>
              );
            })}
            {wi < words.length - 1 ? (
              <span className="threeui-intro-space" aria-hidden="true">
                &nbsp;
              </span>
            ) : null}
          </span>
        ))}
      </span>
    </span>
  );
}

export default TextAnimationCollection;
