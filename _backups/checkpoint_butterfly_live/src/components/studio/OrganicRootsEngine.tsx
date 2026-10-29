"use client";

import React, { useEffect, useRef } from "react";

export type RootConceptMode = "dense_lichen" | "slender_bonsai" | "corner_buttress" | "moss_arch";

interface OrganicRootsEngineProps {
  mode: RootConceptMode;
}

export function OrganicRootsEngine({ mode }: OrganicRootsEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Root definitions per mode
    const draw = () => {
      t += 0.005;
      const w = canvas.width;
      const h = canvas.height;

      // Deep matte obsidian base (#070807)
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, w, h);

      // Subtle warm ambient light on the left floor where roots rest
      const floorGlow = ctx.createRadialGradient(w * 0.18, h * 0.88, 30, w * 0.25, h * 0.88, w * 0.55);
      floorGlow.addColorStop(0, "rgba(217, 255, 0, 0.04)");
      floorGlow.addColorStop(0.4, "rgba(197, 170, 122, 0.02)");
      floorGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = floorGlow;
      ctx.fillRect(0, 0, w, h);

      // Clean character spotlight on the right (NO smoke, pure crisp studio illumination)
      const charSpot = ctx.createRadialGradient(w * 0.78, h * 0.45, 40, w * 0.78, h * 0.45, w * 0.45);
      charSpot.addColorStop(0, "rgba(244, 245, 239, 0.035)");
      charSpot.addColorStop(0.5, "rgba(217, 255, 0, 0.015)");
      charSpot.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = charSpot;
      ctx.fillRect(0, 0, w, h);

      // Render root systems based on selected mode
      ctx.save();

      if (mode === "dense_lichen") {
        renderDenseLichenRoots(ctx, w, h, t);
      } else if (mode === "slender_bonsai") {
        renderSlenderBonsaiRoots(ctx, w, h, t);
      } else if (mode === "corner_buttress") {
        renderCornerButtress(ctx, w, h, t);
      } else if (mode === "moss_arch") {
        renderMossArchFloor(ctx, w, h, t);
      }

      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DENSE LICHEN ROOTS (Closest to user reference)
// ─────────────────────────────────────────────────────────────────────────────
function renderDenseLichenRoots(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Main sprawling floor root
  drawRootBranch(ctx, [
    [-40, h * 0.45],
    [w * 0.04, h * 0.58],
    [w * 0.08, h * 0.75],
    [w * 0.16, h * 0.88],
    [w * 0.28, h * 0.94],
    [w * 0.45, h * 0.96],
    [w * 0.62, h * 0.98],
  ], 28, true);

  // Vertical root creeping up left margin
  drawRootBranch(ctx, [
    [-20, h * 0.82],
    [w * 0.03, h * 0.64],
    [w * 0.02, h * 0.42],
    [w * 0.05, h * 0.26],
    [w * 0.02, h * 0.12],
    [w * 0.04, h * 0.02],
  ], 22, true);

  // Secondary undulating branches
  drawRootBranch(ctx, [
    [w * 0.08, h * 0.75],
    [w * 0.12, h * 0.82],
    [w * 0.22, h * 0.86],
    [w * 0.35, h * 0.91],
    [w * 0.48, h * 0.93],
  ], 16, true);

  drawRootBranch(ctx, [
    [w * 0.03, h * 0.64],
    [w * 0.07, h * 0.62],
    [w * 0.12, h * 0.68],
    [w * 0.18, h * 0.76],
  ], 12, true);

  // Fine offshoots spreading on bottom
  drawRootBranch(ctx, [
    [w * 0.28, h * 0.94],
    [w * 0.34, h * 0.98],
    [w * 0.42, h * 0.99],
  ], 8, false);

  drawRootBranch(ctx, [
    [w * 0.05, h * 0.26],
    [w * 0.08, h * 0.22],
    [w * 0.11, h * 0.25],
  ], 7, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SLENDER BONSAI ROOTS (Delicate, ancient, weathered)
// ─────────────────────────────────────────────────────────────────────────────
function renderSlenderBonsaiRoots(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Sinuous horizontal floor root
  drawRootBranch(ctx, [
    [-30, h * 0.65],
    [w * 0.06, h * 0.76],
    [w * 0.15, h * 0.84],
    [w * 0.26, h * 0.89],
    [w * 0.38, h * 0.92],
    [w * 0.52, h * 0.95],
  ], 18, true);

  // Delicate climbing vine up left frame
  drawRootBranch(ctx, [
    [w * 0.02, h * 0.88],
    [w * 0.04, h * 0.68],
    [w * 0.03, h * 0.48],
    [w * 0.06, h * 0.32],
    [w * 0.03, h * 0.18],
  ], 14, true);

  // Fine tendrils weaving along ground
  drawRootBranch(ctx, [
    [w * 0.15, h * 0.84],
    [w * 0.20, h * 0.90],
    [w * 0.30, h * 0.94],
    [w * 0.44, h * 0.96],
  ], 9, false);

  drawRootBranch(ctx, [
    [w * 0.04, h * 0.68],
    [w * 0.09, h * 0.64],
    [w * 0.13, h * 0.66],
  ], 8, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CORNER BUTTRESS (Anchored strong roots in bottom-left corner)
// ─────────────────────────────────────────────────────────────────────────────
function renderCornerButtress(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Heavy weathered trunk base
  drawRootBranch(ctx, [
    [-50, h * 0.55],
    [w * 0.05, h * 0.70],
    [w * 0.12, h * 0.85],
    [w * 0.22, h * 0.92],
    [w * 0.36, h * 0.96],
    [w * 0.55, h * 0.98],
  ], 34, true);

  drawRootBranch(ctx, [
    [-30, h * 0.78],
    [w * 0.08, h * 0.86],
    [w * 0.18, h * 0.93],
    [w * 0.30, h * 0.97],
  ], 24, true);

  drawRootBranch(ctx, [
    [-20, h * 0.45],
    [w * 0.03, h * 0.32],
    [w * 0.04, h * 0.18],
    [w * 0.02, h * 0.06],
  ], 16, true);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MOSS ARCH FLOOR (Organic wave arch framing bottom)
// ─────────────────────────────────────────────────────────────────────────────
function renderMossArchFloor(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Elegant low arch framing bottom
  drawRootBranch(ctx, [
    [-40, h * 0.72],
    [w * 0.10, h * 0.82],
    [w * 0.24, h * 0.88],
    [w * 0.38, h * 0.86],
    [w * 0.50, h * 0.92],
    [w * 0.64, h * 0.96],
  ], 26, true);

  drawRootBranch(ctx, [
    [-20, h * 0.58],
    [w * 0.04, h * 0.46],
    [w * 0.05, h * 0.30],
    [w * 0.03, h * 0.14],
  ], 18, true);

  drawRootBranch(ctx, [
    [w * 0.24, h * 0.88],
    [w * 0.32, h * 0.94],
    [w * 0.44, h * 0.98],
  ], 12, false);
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE ROOT & MOSS RENDERING HELPER
// ─────────────────────────────────────────────────────────────────────────────
function drawRootBranch(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  baseRadius: number,
  withLichen: boolean
) {
  if (points.length < 2) return;

  // 1. Soft ground contact shadow
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1] + 8);
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i - 1][0] + points[i][0]) / 2;
    const yc = (points[i - 1][1] + points[i][1]) / 2 + 8;
    ctx.quadraticCurveTo(points[i - 1][0], points[i - 1][1] + 8, xc, yc);
  }
  ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
  ctx.lineWidth = baseRadius * 1.8;
  ctx.lineCap = "round";
  ctx.filter = "blur(14px)";
  ctx.stroke();
  ctx.restore();

  // 2. Dark weathered bark base (#1A1813 to #0D0E0C)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i - 1][0] + points[i][0]) / 2;
    const yc = (points[i - 1][1] + points[i][1]) / 2;
    ctx.quadraticCurveTo(points[i - 1][0], points[i - 1][1], xc, yc);
  }
  ctx.strokeStyle = "#171612";
  ctx.lineWidth = baseRadius;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  // Bark grain & longitudinal wood fibers
  ctx.strokeStyle = "rgba(42, 38, 30, 0.65)";
  ctx.lineWidth = baseRadius * 0.65;
  ctx.stroke();

  ctx.strokeStyle = "rgba(75, 68, 52, 0.35)";
  ctx.lineWidth = baseRadius * 0.35;
  ctx.stroke();
  ctx.restore();

  // 3. Moss and Lichen cushions (Electric Lemon-Green #D9FF00 & Forest Moss #6E882E)
  if (withLichen) {
    ctx.save();
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const steps = 14;

      for (let s = 0; s < steps; s++) {
        const u = s / steps;
        const x = p1[0] + (p2[0] - p1[0]) * u;
        const y = p1[1] + (p2[1] - p1[1]) * u;

        // Lichen spots along top edge of root
        const rOffset = (Math.sin(s * 2.3 + i * 4.7) * 0.5 + 0.5) * (baseRadius * 0.45);
        const mossY = y - rOffset;
        const mossSize = Math.max(1.8, (Math.cos(s * 1.9 + i) * 0.5 + 0.5) * 6.5);

        ctx.beginPath();
        ctx.arc(x, mossY, mossSize, 0, Math.PI * 2);

        // Mix between Electric Lemon #D9FF00 and Forest Lichen #8CAE38
        if (s % 3 === 0) {
          ctx.fillStyle = "rgba(217, 255, 0, 0.85)";
          ctx.shadowColor = "#D9FF00";
          ctx.shadowBlur = 6;
        } else if (s % 3 === 1) {
          ctx.fillStyle = "rgba(154, 186, 62, 0.75)";
          ctx.shadowColor = "rgba(154, 186, 62, 0.5)";
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = "rgba(88, 112, 38, 0.65)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Micro-lichen stippling
        for (let m = 0; m < 3; m++) {
          const mx = x + (Math.sin(m * 3.7 + s) * 7);
          const my = mossY + (Math.cos(m * 2.1 + s) * 5);
          ctx.beginPath();
          ctx.arc(mx, my, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(217, 255, 0, 0.6)";
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}
