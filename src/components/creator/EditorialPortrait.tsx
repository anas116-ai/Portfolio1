"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Monogram identity plate — hero visual with no photo dependency.
 * If a real photo is ever dropped at public/images/portrait.jpg it
 * renders in the same frame; otherwise the MV plate stands alone.
 * One slow breathe, no WebGL, no pills, no blasts.
 */
export function EditorialPortrait({ className = "" }: { className?: string }) {
  const [hasPhoto, setHasPhoto] = useState(false);

  useEffect(() => {
    // ponytail: only attempt the photo when the file actually exists —
    // monogram stays visible otherwise, never a broken image slot.
    fetch("/images/portrait.jpg", { method: "HEAD" })
      .then((r) => setHasPhoto(r.ok))
      .catch(() => setHasPhoto(false));
  }, []);

  return (
    <figure className={`relative w-full select-none ${className}`}>
      <div className="portrait-breathe relative overflow-hidden rounded-[8px] border border-[rgba(244,245,239,0.14)] bg-[#0C0E0C]">
        {hasPhoto ? (
          <Image
            src="/images/portrait.jpg"
            alt="Mastan Vali — portrait, studio 2026"
            width={760}
            height={960}
            priority
            sizes="(max-width: 1024px) 70vw, 400px"
            className="h-auto w-full object-cover object-top grayscale-[18%] contrast-[1.04]"
            onError={() => setHasPhoto(false)}
            draggable={false}
          />
        ) : (
          <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-[#0C0E0C] px-6 text-center">
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#C5AA7A]">
              Data · Agents · Web
            </span>
            <span className="font-[family-name:var(--font-warpaint)] text-[4.4rem] leading-none tracking-[0.06em] text-[#E8FF45]">
              MV
            </span>
            <span aria-hidden="true" className="h-px w-12 bg-[rgba(197,170,122,0.55)]" />
            <span className="font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase leading-[2] tracking-[0.24em] text-[#7D8178]">
              Mastan Vali
              <br />
              Hyderabad / 2026
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
        <span>01 — Identity</span>
        <span>Studio / 2026</span>
      </figcaption>
    </figure>
  );
}
