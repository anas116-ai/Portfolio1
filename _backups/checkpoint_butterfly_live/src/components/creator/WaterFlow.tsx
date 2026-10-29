"use client";

import React, { useEffect, useRef } from "react";

/* Water bed only: deep volume gradient plus edge falloff. The light shafts
   (lines) and caustic pools (shaded patches) are deliberately gone — the
   card should read as clean dark water, nothing drawn across it. */

export function WaterFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let time = 0;

    const pointer = { x: 0.5, y: 0.5, active: false };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = motionQuery.matches;
    motionQuery.addEventListener("change", () => {
      reducedMotion.current = motionQuery.matches;
    });

    const resize = () => {
      const host = canvas.parentElement;
      if (!host) return;
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect) return;
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = (e.clientY - rect.top) / rect.height;
      pointer.active = true;
    };

    const handleMouseLeave = () => {
      pointer.active = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || width === 0 || height === 0) return;

      time += reducedMotion.current ? 0.003 : 0.011;

      ctx.clearRect(0, 0, width, height);

      /* 1. Deep water volume */
      const body = ctx.createLinearGradient(0, 0, 0, height);
      body.addColorStop(0, "rgba(24,26,30,0.55)");
      body.addColorStop(0.15, "rgba(20,22,26,0.62)");
      body.addColorStop(0.4, "rgba(14,15,18,0.74)");
      body.addColorStop(0.7, "rgba(10,11,13,0.82)");
      body.addColorStop(1, "rgba(8,9,11,0.9)");
      ctx.fillStyle = body;
      ctx.fillRect(0, 0, width, height);

      /* 2. Lines and shades removed on purpose: no caustic pools, no light
         shafts. The bed is clean dark water — only depth and falloff. */

      /* 3. Soft vignette for depth */
      const vig = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        Math.min(width, height) * 0.35,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.78
      );
      vig.addColorStop(0, "rgba(0, 0, 0, 0)");
      vig.addColorStop(1, "rgba(2, 3, 4, 0.35)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    };

    render();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}
