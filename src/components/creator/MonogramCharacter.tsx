"use client";

import { TextAnimationCollection } from "./TextAnimationCollection";

/**
 * MonogramCharacter — the portfolio character is a monogram, not a face.
 * Giant Warpaint "MV" stamped by the same plate + animation as the hero
 * wordmark, so the identity system rhymes. Light sweep + hairline frame.
 * No images, no avatar, nothing that can read as AI-generated.
 */
export function MonogramCharacter({ className = "" }: { className?: string }) {
  return (
    <figure className={`relative w-full select-none ${className}`}>
      <div className="relative overflow-hidden rounded-[8px] border border-[rgba(244,245,239,0.14)] bg-[#0B0D0A]">
        <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-5 px-6">
          <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#C5AA7A]">
            Data · Agents · Web
          </span>
          <span className="font-warpaint inline-block text-[clamp(4rem,10vw,7rem)] uppercase leading-[0.95] tracking-[0.07em]">
            <TextAnimationCollection variant="threeui-intro" mode="dark" text="MV" loop cycleMs={8000} />
          </span>
          <span aria-hidden="true" className="h-px w-12 bg-[rgba(197,170,122,0.55)]" />
          <span className="font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase leading-[2] tracking-[0.24em] text-[#7D8178]">
            Mastan Vali
            <br />
            Hyderabad / 2026
          </span>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[8px] border border-[rgba(255,255,255,0.06)]"
        />
        <span
          aria-hidden
          className="pane-sweep pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
        />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase tracking-[0.22em] text-[#6A6A66]">
        <span>Monogram study</span>
        <span>Stamp / Live</span>
      </figcaption>
    </figure>
  );
}
