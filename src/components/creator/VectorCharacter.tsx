"use client";

import { useEffect, useRef } from "react";

/**
 * VectorCharacter — the previous 3D avatar redrawn as a flat vector
 * study in the site palette (bone/lemon/brass/ink). No images, no
 * WebGL: pure SVG shapes. Alive via blink + breathe + pointer-following
 * pupils. Transform/opacity only. Static when reduced motion is set.
 */
export function VectorCharacter({ className = "" }: { className?: string }) {
  const pupilsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pupils = pupilsRef.current;
    if (!pupils) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      // ponytail: pupils roam ±4px toward the pointer, viewport-normalized
      tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1)) * 4;
      ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1)) * 3;
    };
    const tick = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      pupils.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
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
        <svg
          viewBox="0 0 400 460"
          role="img"
          aria-label="Vector portrait of Mastan Vali — glasses, hoodie, headphones"
          className="vec-bob h-auto w-full"
        >
          {/* Shoulders / hoodie */}
          <path d="M58,460 C58,384 112,342 200,342 C288,342 342,384 342,460 Z" fill="#15181C" />
          <path d="M58,460 C58,384 112,342 200,342 L200,460 Z" fill="#101315" opacity="0.55" />
          {/* Hood hump */}
          <ellipse cx="200" cy="348" rx="72" ry="34" fill="#1B1F24" />
          {/* Collar V */}
          <path d="M176,344 L200,372 L224,344 L214,340 L200,358 L186,340 Z" fill="#0C0E10" />
          {/* Drawstrings */}
          <line x1="182" y1="366" x2="176" y2="424" stroke="#D9FF00" strokeWidth="4" strokeLinecap="round" />
          <line x1="218" y1="366" x2="224" y2="424" stroke="#D9FF00" strokeWidth="4" strokeLinecap="round" />
          {/* Neck */}
          <rect x="182" y="284" width="36" height="58" fill="#B57E52" />
          {/* Ears */}
          <circle cx="112" cy="202" r="16" fill="#CE9463" />
          <circle cx="288" cy="202" r="16" fill="#CE9463" />
          {/* Head */}
          <rect x="120" y="108" width="160" height="174" rx="78" fill="#CE9463" />
          {/* Jaw shade (short beard zone) */}
          <path
            d="M132,228 C134,290 160,314 200,314 C240,314 266,290 268,228 L256,230 C252,278 230,300 200,300 C170,300 148,278 144,230 Z"
            fill="#141210"
            opacity="0.9"
          />
          {/* Hair swoosh */}
          <path
            d="M116,202 C106,94 152,44 200,44 C248,44 294,94 284,202 L266,202 C272,150 258,118 240,110 C244,130 236,142 226,144 C208,118 170,120 158,146 C148,142 140,152 142,170 C144,184 138,192 130,202 Z"
            fill="#0D0F0D"
          />
          {/* Brows */}
          <rect x="146" y="194" width="36" height="9" rx="4.5" fill="#0D0F0D" />
          <rect x="218" y="194" width="36" height="9" rx="4.5" fill="#0D0F0D" />
          {/* Eyes (blink group) */}
          <g className="vec-eyes">
            <ellipse cx="165" cy="220" rx="14" ry="12" fill="#F4F5EF" />
            <ellipse cx="235" cy="220" rx="14" ry="12" fill="#F4F5EF" />
          </g>
          {/* Pupils (pointer group) */}
          <g ref={pupilsRef} className="will-change-transform">
            <circle cx="165" cy="221" r="6" fill="#101315" />
            <circle cx="235" cy="221" r="6" fill="#101315" />
            <circle cx="167" cy="219" r="1.8" fill="#F4F5EF" />
            <circle cx="237" cy="219" r="1.8" fill="#F4F5EF" />
          </g>
          {/* Glasses */}
          <g fill="rgba(217,255,0,0.10)" stroke="#101315" strokeWidth="5">
            <rect x="136" y="200" width="58" height="42" rx="10" />
            <rect x="206" y="200" width="58" height="42" rx="10" />
          </g>
          <path d="M194,214 h12" stroke="#101315" strokeWidth="5" strokeLinecap="round" />
          <line x1="136" y1="212" x2="114" y2="206" stroke="#101315" strokeWidth="5" strokeLinecap="round" />
          <line x1="264" y1="212" x2="286" y2="206" stroke="#101315" strokeWidth="5" strokeLinecap="round" />
          {/* Nose */}
          <path d="M200,224 C196,242 192,252 187,258" stroke="#B57E52" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Mustache */}
          <path
            d="M166,280 C180,271 192,275 200,282 C208,275 220,271 234,280 C226,292 210,294 200,290 C190,294 174,292 166,280 Z"
            fill="#0D0F0D"
          />
          {/* Headphone band */}
          <path d="M102,196 C102,84 298,84 298,196" stroke="#23282E" strokeWidth="15" fill="none" strokeLinecap="round" />
          {/* Ear cups */}
          <rect x="84" y="176" width="36" height="66" rx="15" fill="#1B1F24" stroke="#F4F5EF" strokeOpacity="0.14" strokeWidth="1.5" />
          <rect x="280" y="176" width="36" height="66" rx="15" fill="#1B1F24" stroke="#F4F5EF" strokeOpacity="0.14" strokeWidth="1.5" />
          {/* LED */}
          <circle cx="298" cy="190" r="4" fill="#D9FF00" className="vec-led" />
          {/* Brass pocket rule */}
          <line x1="120" y1="436" x2="280" y2="436" stroke="#C5AA7A" strokeWidth="2" opacity="0.5" />
        </svg>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[8px] border border-[rgba(255,255,255,0.06)]"
        />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase tracking-[0.22em] text-[#6A6A66]">
        <span>Character study</span>
        <span>Vector / Live</span>
      </figcaption>
    </figure>
  );
}
