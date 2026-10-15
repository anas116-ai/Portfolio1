"use client";

import { useEffect, useRef, useState } from "react";
import { TextAnimationCollection } from "./TextAnimationCollection";

/**
 * MonogramCharacter — the portfolio character is a monogram, not a face.
 * Giant Warpaint "MV" stamped by the same plate + animation as the hero
 * wordmark, over bone and brass letterpress echoes. Pointer tilt (max 4°)
 * + cursor-tracked spotlight (CSS vars, zero lib). Click re-stamps.
 */
export function MonogramCharacter({ className = "" }: { className?: string }) {
  const [strike, setStrike] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = cardRef.current;
    if (!el) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      // ponytail: clamp pull so the card never leaves its hit box
      tx = Math.max(-1, Math.min(1, nx)) * 4;
      ty = Math.max(-1, Math.min(1, ny)) * -4;
      el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.transform = `perspective(900px) rotateY(${cx.toFixed(2)}deg) rotateX(${cy.toFixed(2)}deg)`;
      rafId = requestAnimationFrame(tick);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    rafId = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <figure className={`relative w-full select-none ${className}`}>
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        title="Restamp the monogram"
        aria-label="Restamp the monogram"
        onClick={() => setStrike((s) => s + 1)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setStrike((s) => s + 1);
        }}
        className="relative cursor-pointer overflow-hidden rounded-[8px] border border-[rgba(244,245,239,0.14)] bg-[#0B0D0A] will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9FF00]"
      >
        {/* Cursor-tracked spotlight — 10 lines, zero lib */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(217,255,0,0.10), transparent 70%)",
          }}
        />
        <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-5 px-6">
          <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#C5AA7A]">
            Data · Agents · Web
          </span>
          {/* Letterpress stack: bone echo, brass echo, live lemon strike */}
          <span className="relative inline-block text-[clamp(4rem,10vw,7rem)] uppercase leading-[0.95] tracking-[0.07em]">
            <span
              aria-hidden
              className="font-warpaint absolute inset-0 translate-x-[5px] translate-y-[5px] text-[#F4F5EF] opacity-[0.13]"
            >
              MV
            </span>
            <span
              aria-hidden
              className="font-warpaint absolute inset-0 translate-x-[2.5px] translate-y-[2.5px] text-[#C5AA7A] opacity-30"
            >
              MV
            </span>
            <span className="font-warpaint relative inline-block">
              <TextAnimationCollection
                key={strike}
                variant="threeui-intro"
                mode="dark"
                text="MV"
                loop
                cycleMs={8000}
              />
            </span>
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
        <span>Click to restamp</span>
      </figcaption>
    </figure>
  );
}
