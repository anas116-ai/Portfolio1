"use client";

import { useEffect, useRef } from "react";

/**
 * GeometricCharacter — an openly graphic build-unit, not a fake human.
 * Circle head, lemon visor with scan sweep, hood, headphone cups.
 * Faceless by design: nothing to read as AI or clip-art portrait.
 * Bob + pointer lean + visor scan. Transform/opacity only.
 */
export function GeometricCharacter({ className = "" }: { className?: string }) {
  const rigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = rigRef.current;
    if (!el) return;

    let tx = 0;
    let cx = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      // ponytail: lean ±3deg toward the pointer, clamped
      tx = Math.max(-1, Math.min(1, nx)) * 3;
    };
    const tick = () => {
      cx += (tx - cx) * 0.07;
      el.style.transform = `perspective(900px) rotateY(${cx.toFixed(2)}deg)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <figure className={`relative w-full select-none ${className}`}>
      <div className="relative overflow-hidden rounded-[8px] border border-[rgba(244,245,239,0.14)] bg-[#0B0D0A]">
        <div ref={rigRef} className="will-change-transform">
          <svg
            viewBox="0 0 400 460"
            role="img"
            aria-label="Geometric build unit — visor, hood, headphones"
            className="geo-bob h-auto w-full"
          >
            {/* Hood behind head */}
            <path d="M96,250 C88,130 140,70 200,70 C260,70 312,130 304,250 L278,250 C284,150 248,100 200,100 C152,100 116,150 122,250 Z" fill="#15181C" />
            {/* Shoulders */}
            <path d="M62,460 C62,386 114,344 200,344 C286,344 338,386 338,460 Z" fill="#15181C" />
            <path d="M62,460 C62,386 114,344 200,344 L200,460 Z" fill="#101315" opacity="0.5" />
            {/* Zipper */}
            <line x1="200" y1="352" x2="200" y2="460" stroke="#F4F5EF" strokeWidth="3" opacity="0.22" />
            {/* Pocket rule */}
            <line x1="128" y1="432" x2="272" y2="432" stroke="#C5AA7A" strokeWidth="2" opacity="0.55" />
            {/* Lemon chest tab */}
            <rect x="188" y="392" width="24" height="10" rx="2" fill="#D9FF00" />
            {/* Neck */}
            <rect x="184" y="272" width="32" height="70" fill="#23282E" />
            {/* Head */}
            <circle cx="200" cy="196" r="94" fill="#1B1F24" stroke="#F4F5EF" strokeOpacity="0.22" strokeWidth="1.5" />
            {/* Visor */}
            <rect x="122" y="168" width="156" height="56" rx="28" fill="#D9FF00" />
            <rect x="122" y="168" width="156" height="56" rx="28" fill="none" stroke="#101315" strokeWidth="4" />
            {/* Visor scan sweep */}
            <clipPath id="visorClip">
              <rect x="122" y="168" width="156" height="56" rx="28" />
            </clipPath>
            <g clipPath="url(#visorClip)">
              <rect x="122" y="168" width="26" height="56" fill="#101315" opacity="0.85" className="geo-scan" />
            </g>
            {/* Visor slits */}
            <rect x="150" y="188" width="34" height="8" rx="4" fill="#101315" />
            <rect x="216" y="188" width="34" height="8" rx="4" fill="#101315" />
            {/* Headphone band */}
            <path d="M104,192 C104,80 296,80 296,192" stroke="#2A2F36" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* Ear cups */}
            <rect x="86" y="172" width="36" height="66" rx="15" fill="#23282E" stroke="#F4F5EF" strokeOpacity="0.2" strokeWidth="1.5" />
            <rect x="278" y="172" width="36" height="66" rx="15" fill="#23282E" stroke="#F4F5EF" strokeOpacity="0.2" strokeWidth="1.5" />
            {/* LEDs */}
            <circle cx="104" cy="188" r="4" fill="#D9FF00" className="vec-led" />
            <circle cx="296" cy="188" r="4" fill="#D9FF00" className="vec-led" />
            {/* Antenna */}
            <line x1="262" y1="76" x2="278" y2="44" stroke="#C5AA7A" strokeWidth="3" strokeLinecap="round" />
            <circle cx="279" cy="42" r="5" fill="#D9FF00" className="vec-led" />
          </svg>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[8px] border border-[rgba(255,255,255,0.06)]"
        />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase tracking-[0.22em] text-[#6A6A66]">
        <span>Build unit 01</span>
        <span>On duty</span>
      </figcaption>
    </figure>
  );
}
