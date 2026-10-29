"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cutoutOnNeutralField } from "@/lib/portraitCutout";

export interface LightPortraitProps {
  /** Path to a studio portrait shot against a bright, neutral field. */
  src: string;
  alt: string;
  className?: string;
  /** Pixels of pointer parallax on the X axis; Y tracks at 45% of it. */
  parallax?: number;
  /** Resolve the figure out of a dot matrix once the matte is ready. */
  reveal?: boolean;
  /** Keep the plate drifting, swaying and breathing. */
  living?: boolean;
  /** Light motes lifting in front of the figure. */
  motes?: number;
  eager?: boolean;
  /** Fallback intrinsic size, used until the matte is computed. */
  width?: number;
  height?: number;
}

/** Deterministic mote field: same every render, so nothing shifts on hydration. */
const MOTES = Array.from({ length: 18 }, (_, i) => {
  const r = (k: number) => {
    const v = Math.sin((i + 1) * (k + 1) * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    left: 4 + r(1) * 90,
    top: 26 + r(2) * 68,
    size: 1.5 + r(3) * 2.8,
    duration: 12 + r(4) * 14,
    delay: r(5) * 18,
  };
});

/**
 * LightPortrait — a real photograph with a real matte, and it keeps moving.
 *
 * The studio shots are lit on a bright neutral field, so the plate comes off
 * properly: an alpha matte keyed from `luminance - saturation`, feathered by
 * a pixel, cropped to the subject. What is left is the photograph itself,
 * with nothing behind it.
 *
 * Motion is the point here, so it is layered rather than hinted at:
 *   · a slow dolly drift across the plate (30s)
 *   · an axis sway, as if the sitter shifted weight (23s)
 *   · a breath (8s) and a pointer parallax on the whole frame
 *   · one studio light crossing the face per cycle, clipped to the matte
 *   · light motes lifting in front, so the depth reads as air, not as a cutout
 *   · a brass key behind that pulses, holding the silhouette off the ground
 *
 * Nothing is redrawn and nothing is regenerated: only transforms and opacity
 * move, so the face stays exactly the face in the photograph.
 */
export function LightPortrait({
  src,
  alt,
  className = "",
  parallax = 20,
  reveal = true,
  living = true,
  motes = 14,
  eager = false,
  width = 1280,
  height = 1920,
}: LightPortraitProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const lastUrl = useRef<string | null>(null);
  const reduce = useReducedMotion();

  const [url, setUrl] = useState<string | null>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: width, h: height });
  const [shown, setShown] = useState(false);
  const [settled, setSettled] = useState(!reveal);

  useEffect(() => {
    let dead = false;
    cutoutOnNeutralField(src)
      .then((res) => {
        if (dead) {
          URL.revokeObjectURL(res.url);
          return;
        }
        if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
        lastUrl.current = res.url;
        setBox({ w: res.width, h: res.height });
        setUrl(res.url);
      })
      .catch(() => {
        if (!dead) setUrl(src);
      });
    return () => {
      dead = true;
    };
  }, [src]);

  useEffect(() => {
    if (!url) return;
    const t = window.setTimeout(() => setShown(true), 30);
    return () => window.clearTimeout(t);
  }, [url]);

  useEffect(() => {
    if (!shown || !reveal) return;
    const t = window.setTimeout(() => setSettled(true), 300);
    return () => window.clearTimeout(t);
  }, [shown, reveal]);

  // Shallow pointer parallax, eased, transform only.
  useEffect(() => {
    if (reduce) return;
    const frame = frameRef.current;
    const drift = driftRef.current;
    if (!frame || !drift) return;

    let raf = 0;
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      tx = -nx * parallax;
      ty = -ny * parallax * 0.45;
    };

    const tick = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      drift.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce, parallax]);

  const matteMask = url
    ? {
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }
    : undefined;

  return (
    <div
      ref={frameRef}
      className={`relative select-none ${className}`}
      style={{ aspectRatio: `${box.w} / ${box.h}` }}
    >
      {/* Key light behind the subject. The photograph brings no backdrop, so
          the silhouette has to be separated from obsidian by light. */}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${living ? "rim-pulse" : ""}`}>
        <div
          className="absolute left-1/2 top-[6%] h-[54%] w-[74%] -translate-x-1/2 rounded-full blur-[78px]"
          style={{ background: "radial-gradient(ellipse at center, rgba(197,170,122,0.34) 0%, transparent 68%)" }}
        />
        <div
          className="absolute bottom-[10%] left-1/2 h-[24%] w-[92%] -translate-x-1/2 rounded-full blur-[70px]"
          style={{ background: "radial-gradient(ellipse at center, rgba(217,255,0,0.16) 0%, transparent 72%)" }}
        />
        <div
          className="absolute left-1/2 top-[2%] h-[30%] w-[88%] -translate-x-1/2 rounded-full blur-[64px]"
          style={{ background: "radial-gradient(ellipse at center, rgba(244,245,239,0.10) 0%, transparent 70%)" }}
        />
      </div>

      {/* Everything photographic lives inside one clipped stage. */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="portrait-breathe h-full w-full">
          <div ref={driftRef} className="relative h-full w-full will-change-transform">
            <div className={`absolute inset-0 ${living ? "plate-drift" : ""}`}>
              <div className={`absolute inset-0 ${living ? "plate-sway" : ""}`}>
                {url && (
                  <img
                    src={url}
                    alt={alt}
                    width={box.w}
                    height={box.h}
                    loading={eager ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    className="light-portrait-img h-full w-full object-cover transition-opacity duration-700 ease-out"
                    style={{ opacity: shown ? 1 : 0 }}
                  />
                )}
                {/* One studio light crossing the plate per cycle. */}
                {url && (
                  <span
                    aria-hidden="true"
                    className="light-portrait-sweep transition-opacity duration-[900ms] ease-out"
                    style={{ ...matteMask, opacity: shown ? 1 : 0 }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Air in front of the figure, inside the same clip so it never
            spills into the copy column. */}
        {url && motes > 0 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {MOTES.slice(0, motes).map((m, i) => (
              <span
                key={i}
                className="portrait-mote"
                style={{
                  left: `${m.left}%`,
                  top: `${m.top}%`,
                  width: `${m.size}px`,
                  height: `${m.size}px`,
                  animationDuration: `${m.duration}s`,
                  animationDelay: `-${m.delay}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {reveal && (
        <span
          aria-hidden="true"
          className={`dot-matrix ${settled ? "dot-matrix--off" : ""}`}
        />
      )}
    </div>
  );
}
