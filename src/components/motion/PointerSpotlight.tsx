"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pointer spotlight driver — wires the existing .spotlight-layer CSS
 * (pool + ring) to the pointer with inertial lerp. Transform only,
 * no glow stacking. Disabled on touch pointers and reduced motion.
 */
export function PointerSpotlight() {
  const layerRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setDisabled(true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisabled(true);
      return;
    }

    let mx = window.innerWidth / 2;
    let my = window.innerHeight * 0.35;
    let poolX = mx;
    let poolY = my;
    let ringX = mx;
    let ringY = my;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (layerRef.current?.dataset.active !== "true") {
        layerRef.current?.setAttribute("data-active", "true");
      }
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        "button, a, input, select, textarea, [data-interactive], [role='button'], .cursor-pointer"
      );
      layerRef.current?.setAttribute("data-hover", interactive ? "true" : "false");
    };

    const onLeave = () => {
      layerRef.current?.setAttribute("data-active", "false");
    };

    const tick = () => {
      // Pool drifts slow (light body), ring tracks tight (touch edge).
      poolX += (mx - poolX) * 0.07;
      poolY += (my - poolY) * 0.07;
      ringX += (mx - ringX) * 0.2;
      ringY += (my - ringY) * 0.2;
      if (poolRef.current) {
        poolRef.current.style.transform = `translate3d(${poolX}px, ${poolY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
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

  if (disabled) return null;

  return (
    <div ref={layerRef} aria-hidden="true" className="spotlight-layer" data-active="false" data-hover="false">
      <div ref={poolRef} className="spotlight-pool" />
      <div ref={ringRef} className="spotlight-ring" />
    </div>
  );
}
