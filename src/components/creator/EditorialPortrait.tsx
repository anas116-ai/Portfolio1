"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Monogram identity plate — hero visual with no photo dependency.
 * If a real photo is ever dropped at public/images/portrait.jpg it
 * renders in the same frame; otherwise the MV plate stands alone.
 * Pointer tilt (max 5deg) + slow light sweep + breathe. Transform
 * and opacity only. Disabled on touch pointers and reduced motion.
 */
export function EditorialPortrait({ className = "" }: { className?: string }) {
  const [hasPhoto, setHasPhoto] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ponytail: only attempt the photo when the file actually exists —
    // monogram stays visible otherwise, never a broken image slot.
    fetch("/images/portrait.jpg", { method: "HEAD" })
      .then((r) => setHasPhoto(r.ok))
      .catch(() => setHasPhoto(false));
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      // Clamp influence to near-field so the plate rests at neutral.
      const d = Math.hypot(nx, ny);
      const k = d > 2.4 ? 0 : 1 - d / 2.4;
      tx = Math.max(-1, Math.min(1, nx)) * 5 * k;
      ty = Math.max(-1, Math.min(1, ny)) * -5 * k;
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      if (frameRef.current) {
        frameRef.current.style.transform = `perspective(900px) rotateY(${cx.toFixed(2)}deg) rotateX(${cy.toFixed(2)}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <figure className={`relative w-full select-none ${className}`}>
      <div className="portrait-breathe relative overflow-hidden rounded-[8px] border border-[rgba(244,245,239,0.14)] bg-[#0C0E0C]">
        <div ref={frameRef} className="relative will-change-transform">
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
        </div>
        {/* Single hairline inner rim, no glow */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[8px] border border-[rgba(255,255,255,0.06)]"
        />
        {/* Slow studio light crossing the plate */}
        <span
          aria-hidden
          className="pane-sweep pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
        />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase tracking-[0.22em] text-[#6A6A66]">
        <span>01 — Identity</span>
        <span>Studio / 2026</span>
      </figcaption>
    </figure>
  );
}
