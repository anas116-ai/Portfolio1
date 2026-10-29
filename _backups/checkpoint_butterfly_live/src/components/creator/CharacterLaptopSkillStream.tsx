"use client";

import React, { useEffect, useRef } from "react";

// ── Exact Skills specified by user in audio recording ────────────────────────
// Left side: Enterprise SAP, Integration & Data stack
const ENTERPRISE_SKILLS = [
  "SAP BODS",
  "SAP BW",
  "SQL",
  "S/4HANA",
  "BAPI",
  "IDoc",
  "LSMW",
  "LTMC",
  "ServiceNow",
];

// Right side: AI, Agentic & Modern Engineering stack
const AI_SKILLS = [
  "LLMs",
  "RAG",
  "MCP",
  "Agentic AI",
  "Orchestration",
  "Python",
  "FastAPI",
];

interface FloatingBadge {
  text: string;
  side: "left" | "right";
  progress: number;
  speed: number;
  width: number;
  alpha: number;
}

export function CharacterLaptopSkillStream({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let W = 0;
    let H = 0;
    let dpr = 1;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    const activeBadges: FloatingBadge[] = [];
    let leftIndex = 0;
    let rightIndex = 0;
    let hasSpawnedForCurrent = false;

    function spawnBadge(side: "left" | "right") {
      const text =
        side === "left"
          ? ENTERPRISE_SKILLS[leftIndex % ENTERPRISE_SKILLS.length]
          : AI_SKILLS[rightIndex % AI_SKILLS.length];

      if (side === "left") leftIndex++;
      else rightIndex++;

      const measured = text.length * 6.8 + 24;

      // Calm, readable floating speed as requested by user
      activeBadges.push({
        text,
        side,
        progress: 0,
        speed: 0.0028 + Math.random() * 0.0002,
        width: measured,
        alpha: 0,
      });
    }

    // Ping-Pong Cascade: seed Right badge high near apex, Left badge emerging from laptop
    spawnBadge("right");
    if (activeBadges[0]) activeBadges[0].progress = 0.52;

    spawnBadge("left");
    if (activeBadges[1]) activeBadges[1].progress = 0.04;

    // Active burst animations
    interface LocalSpark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      radius: number;
    }

    interface LocalBlastRing {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
      color: string;
    }

    const activeSparks: LocalSpark[] = [];
    const activeRings: LocalBlastRing[] = [];

    // Cubic Bezier interpolation
    function getBezierPoint(
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      t: number
    ) {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      return {
        x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
      };
    }

    function render() {
      ctx!.clearRect(0, 0, W, H);

      // Ping-Pong alternation: When latest badge reaches ~0.52, trigger opposite side
      const latestBadge = activeBadges[activeBadges.length - 1];
      if (latestBadge && latestBadge.progress >= 0.52 && !hasSpawnedForCurrent) {
        const nextSide = latestBadge.side === "right" ? "left" : "right";
        spawnBadge(nextSide);
        hasSpawnedForCurrent = true;
      }
      if (activeBadges.length > 0 && activeBadges[activeBadges.length - 1].progress < 0.52) {
        hasSpawnedForCurrent = false;
      }

      // ── EXACT PHYSICAL LAPTOP CORNERS TRAJECTORY ANCHORS ─────────────────────────
      // Character centerline is charCenterX = W * 0.50
      // Character 3D plane width is approx H * 0.70
      const charCenterX = W * 0.50;
      const charW = H * 0.70;

      // LEFT STREAM: Emerges from the left of the keyboard, goes STRAIGHT SIDEWAYS out
      // clear of the body at keyboard level (H * 0.452), then ascends along the left flank to apex.
      const leftP0 = { x: charCenterX - charW * 0.16, y: H * 0.452 };
      const leftP1 = { x: charCenterX - charW * 0.48, y: H * 0.452 };
      const leftP2 = { x: charCenterX - charW * 0.52, y: H * 0.18 };
      const leftP3 = { x: charCenterX - charW * 0.44, y: H * 0.06 };

      // RIGHT STREAM: Emerges DIRECTLY FROM THE FINGERS ON THE KEYBOARD (H * 0.452),
      // slides STRAIGHT SIDEWAYS horizontally out clear of his arm (staying at H * 0.452),
      // and from there climbs vertically along the right flank to apex and blasts.
      const rightP0 = { x: charCenterX + charW * 0.06, y: H * 0.452 };
      const rightP1 = { x: charCenterX + charW * 0.46, y: H * 0.452 };
      const rightP2 = { x: charCenterX + charW * 0.50, y: H * 0.18 };
      const rightP3 = { x: charCenterX + charW * 0.44, y: H * 0.06 };

      // ── RENDER BADGES ────────────────────────────────────────────────────────
      for (let i = activeBadges.length - 1; i >= 0; i--) {
        const b = activeBadges[i];
        b.progress += b.speed;

        // Smooth opacity envelope: begins at 0, lifts off gracefully from laptop, stays crisp, then fades during blast
        if (b.progress < 0.15) {
          b.alpha = b.progress / 0.15;
        } else if (b.progress > 0.88) {
          b.alpha = Math.max(0, (0.98 - b.progress) / 0.10);
        } else {
          b.alpha = 1;
        }

        const pt =
          b.side === "left"
            ? getBezierPoint(leftP0, leftP1, leftP2, leftP3, b.progress)
            : getBezierPoint(rightP0, rightP1, rightP2, rightP3, b.progress);

        // Smooth Blast Animation at apex
        if (b.progress >= 0.97) {
          const isLeft = b.side === "left";
          const blastColor = isLeft ? "#F4F5EF" : "#D9FF00";

          // Dedicated local expanding blast ring
          activeRings.push({
            x: pt.x,
            y: pt.y,
            r: 4,
            maxR: 26,
            alpha: 0.85,
            color: blastColor,
          });

          // Dedicated local spark burst
          for (let s = 0; s < 10; s++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 0.6 + Math.random() * 1.5;
            activeSparks.push({
              x: pt.x,
              y: pt.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              alpha: 0.9,
              color: blastColor,
              radius: 1.0 + Math.random() * 0.8,
            });
          }

          if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            window.dispatchEvent(
              new CustomEvent("character-skill-burst", {
                detail: {
                  x: canvasRect.left + pt.x,
                  y: canvasRect.top + pt.y,
                },
              })
            );
          }
          activeBadges.splice(i, 1);
          continue;
        }

        // Lift-off scale envelope:
        // Emerges gently from laptop corner (0.50 -> 1.0)
        // At peak apex (progress > 0.88), blooms smoothly up to 1.12 before popping
        let currentScale = 1.0;
        if (b.progress < 0.20) {
          currentScale = 0.50 + (b.progress / 0.20) * 0.50;
        } else if (b.progress > 0.88) {
          const blastT = (b.progress - 0.88) / 0.09;
          currentScale = 1.0 + blastT * 0.14;
        }

        // Render clean haute-tech glass pill badge
        const badgeW = b.width;
        const badgeH = 22;
        const badgeX = -badgeW / 2;
        const badgeY = -badgeH / 2;
        const cornerR = 5;

        ctx!.save();
        ctx!.translate(pt.x, pt.y);
        ctx!.scale(currentScale, currentScale);
        ctx!.globalAlpha = b.alpha * 0.94;

        // Pure dark glass backing
        ctx!.fillStyle = "rgba(10, 13, 10, 0.88)";
        ctx!.beginPath();
        ctx!.roundRect(badgeX, badgeY, badgeW, badgeH, cornerR);
        ctx!.fill();

        // Delicate glowing hairline border
        const isLeft = b.side === "left";
        ctx!.strokeStyle = isLeft
          ? "rgba(244, 245, 239, 0.44)" // Crisp Starlight Bone White
          : "rgba(217, 255, 0, 0.50)";  // Radiant Lemon
        ctx!.lineWidth = 1;
        ctx!.stroke();

        // Sharp mono typography
        ctx!.font = "500 10.5px var(--font-geist-mono), monospace";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillStyle = isLeft ? "#F4F5EF" : "#F8FFE0";
        ctx!.fillText(b.text, 0, 0.5);

        ctx!.restore();
      }

      // ── RENDER EXPANDING BLAST RINGS ──────────────────────────────────────
      for (let r = activeRings.length - 1; r >= 0; r--) {
        const ring = activeRings[r];
        ring.r += 0.85;
        ring.alpha -= 0.032;
        if (ring.alpha <= 0 || ring.r >= ring.maxR) {
          activeRings.splice(r, 1);
          continue;
        }
        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx!.strokeStyle = ring.color;
        ctx!.globalAlpha = ring.alpha * 0.75;
        ctx!.lineWidth = 1;
        ctx!.stroke();
        ctx!.restore();
      }

      // ── RENDER LOCAL SPARK BURST PARTICLES ────────────────────────────────
      for (let s = activeSparks.length - 1; s >= 0; s--) {
        const sp = activeSparks[s];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy *= 0.94;
        sp.alpha -= 0.030;
        if (sp.alpha <= 0) {
          activeSparks.splice(s, 1);
          continue;
        }
        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx!.fillStyle = sp.color;
        ctx!.globalAlpha = sp.alpha * 0.85;
        ctx!.fill();
        ctx!.restore();
      }

      rafId = requestAnimationFrame(render);
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) {
      rafId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full block pointer-events-none z-20 ${className}`}
    />
  );
}
