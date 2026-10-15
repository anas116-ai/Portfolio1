"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Editorial portrait — replaces the AI 3D avatar rig.
 * Drop the real passport-derived photo at public/images/portrait.jpg
 * (any hi-res jpg). Until then a monogram plate renders — never the
 * old AI avatar. One slow breathe, no WebGL, no pills, no blasts.
 */
export function EditorialPortrait({ className = "" }: { className?: string }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <figure className={`relative w-full select-none ${className}`}>
      <div className="portrait-breathe relative overflow-hidden rounded-[8px] border border-[rgba(244,245,239,0.14)] bg-[#0C0E0C]">
        {imgOk ? (
          <Image
            src="/images/portrait.jpg"
            alt="Mastan Vali — portrait, studio 2026"
            width={760}
            height={960}
            priority
            sizes="(max-width: 1024px) 70vw, 400px"
            className="h-auto w-full object-cover object-top grayscale-[18%] contrast-[1.04]"
            onError={() => setImgOk(false)}
            draggable={false}
          />
        ) : (
          <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 bg-[#0C0E0C]">
            <span className="font-[family-name:var(--font-warpaint)] text-[3.2rem] leading-none tracking-[0.06em] text-[#E8FF45]">
              MV
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase tracking-[0.24em] text-[#7D8178]">
              Portrait — drop images/portrait.jpg
            </span>
          </div>
        )}
        {/* Single hairline inner rim, no glow */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[8px] border border-[rgba(255,255,255,0.06)]"
        />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase tracking-[0.22em] text-[#6A6A66]">
        <span>01 — Portrait</span>
        <span>Studio / 2026</span>
      </figcaption>
    </figure>
  );
}
