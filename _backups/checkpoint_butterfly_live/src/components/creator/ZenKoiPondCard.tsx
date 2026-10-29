"use client";

import React, { useRef, useEffect, useState } from "react";
import { type LucideIcon } from "lucide-react";
import { WaterFlow } from "./WaterFlow";

export interface CapabilityArea {
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  points: string[];
  accent: string;
  borderColor: string;
  icon: LucideIcon;
  systemTag: string;
  fishCount: number;
}

interface ZenKoiPondCardProps {
  area: CapabilityArea;
  index: number;
}

interface Koi {
  x: number;
  y: number;
  baseSpeed: number;
  speed: number;
  angle: number;
  targetAngle: number;
  targetX: number;
  targetY: number;
  tailPhase: number;
  tailSpeed: number;
  scaleX: number;
  scaleY: number;
  turnSpeed: number;
  surgePhase: number;
  surgeSpeed: number;
  retarget: number;
  sway: number;
  rippleCooldown: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  decay: number;
  aspect: number;
}

export function ZenKoiPondCard({ area, index }: ZenKoiPondCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const pointer = useRef({ x: 0, y: 0, active: false });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointer.current.x = e.clientX - rect.left;
    pointer.current.y = e.clientY - rect.top;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

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

    const torso = new Image();
    torso.src = "/koi_kohaku_torso_v2.png";
    let torsoReady = false;
    torso.onload = () => {
      torsoReady = true;
    };

    const tail = new Image();
    tail.src = "/koi_kohaku_tail_v2.png";
    let tailReady = false;
    tail.onload = () => {
      tailReady = true;
    };

    const dims =
      index === 0
        ? [{ sx: 0.215, sy: 0.15 }]
        : index === 1
        ? [
            { sx: 0.18, sy: 0.126 },
            { sx: 0.155, sy: 0.111 },
          ]
        : [
            { sx: 0.16, sy: 0.115 },
            { sx: 0.142, sy: 0.102 },
            { sx: 0.126, sy: 0.092 },
          ];

    const pickTarget = () => ({
      x: width * 0.09 + Math.random() * width * 0.82,
      y: height * 0.16 + Math.random() * height * 0.7,
    });

    const koi: Koi[] = Array.from({ length: area.fishCount }, (_, i) => {
      const d = dims[i % dims.length];
      const startX = width * (0.14 + (i / Math.max(1, area.fishCount)) * 0.72);
      const startY = height * (0.28 + (i % 2) * 0.4);
      const tg = pickTarget();
      const ang = Math.atan2(tg.y - startY, tg.x - startX);
      return {
        x: startX,
        y: startY,
        baseSpeed: 1.42 + Math.random() * 0.2,
        speed: 1.42,
        angle: ang,
        targetAngle: ang,
        targetX: tg.x,
        targetY: tg.y,
        tailPhase: i * 2.3,
        tailSpeed: 0.15,
        scaleX: d.sx,
        scaleY: d.sy,
        turnSpeed: 0.062,
        surgePhase: Math.random() * Math.PI * 2,
        surgeSpeed: 0.03 + Math.random() * 0.014,
        retarget: 90 + Math.random() * 80,
        sway: 0,
        rippleCooldown: i * 24,
      };
    });

    const ripples: Ripple[] = [
      {
        x: width * 0.5,
        y: height * 0.5,
        radius: 10,
        maxRadius: 180,
        speed: 0.68,
        alpha: 0.3,
        decay: 0.0022,
        aspect: 0.7,
      },
    ];

    /* Small bubble field: fine rising specks, seeded once per mount. Kept tiny
       (under 2px) so the water still reads as clear glass — same small style,
       drifting slowly upward with a soft twinkle. */
    const bubbles = Array.from({ length: 22 }, () => ({
      fx: Math.random(),
      fy: Math.random(),
      r: 0.5 + Math.random() * 1.3,
      tw: Math.random() * Math.PI * 2,
      base: 0.1 + Math.random() * 0.09,
      rise: 0.0006 + Math.random() * 0.0011,
      drift: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    let lastPointerRipple = 0;
    let visible = true;
    let raf = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    /**
     * Light on the pond floor. Built from soft elliptical pools in neutral
     * bone light — no yellow cast — so the water reads as depth and light
     * instead of as wave lines or a tinted wash drawn across the card.
     */
    /* Light layers removed on purpose: no caustic pools, no raking shafts —
       the card reads as clean dark water with only the fish, ripples and
       bubbles moving inside it. */

    /* Fine bubble field: small rising specks in bone light — the same tiny
       style, slowly floating upward with a soft twinkle, slightly brighter
       near the fish. */
    const drawBubbles = (koi: Koi[]) => {
      ctx.save();
      for (const b of bubbles) {
        b.fy -= b.rise / Math.max(1, height);
        b.tw += 0.02;
        if (b.fy < -0.02) {
          b.fy = 1.02;
          b.fx = Math.random();
        }
        const x = b.fx * width + Math.sin(t * 0.7 + b.drift) * 4;
        const y = b.fy * height;
        let lift = 1;
        for (const f of koi) {
          const d = Math.hypot(f.x - x, f.y - y);
          if (d < 70) {
            lift = 1.5;
            break;
          }
        }
        const tw = (0.72 + 0.28 * Math.sin(b.tw)) * lift;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,245,239,${(b.base * tw).toFixed(3)})`;
        ctx.fill();
        /* Tiny ring on the larger specks so they read as glass bubbles. */
        if (b.r > 1.3) {
          ctx.beginPath();
          ctx.arc(x, y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244,245,239,${(b.base * tw * 0.8).toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    /* Edge falloff so the pond closes into the dark like the reference. */
    const drawVignette = () => {
      const vig = ctx.createRadialGradient(
        width / 2, height * 0.45, Math.min(width, height) * 0.35,
        width / 2, height * 0.5, Math.max(width, height) * 0.75
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(2,3,6,0.42)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    };

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || width === 0 || height === 0) return;

      t += 0.016;
      const energy = pointer.current.active ? 1.35 : 1;

      ctx.clearRect(0, 0, width, height);

      /* 1. Volume. Translucent neutral water — the section depth shows
         through the pond like the reference. No blue cast. */
      const body = ctx.createLinearGradient(0, 0, 0, height);
      body.addColorStop(0, "rgba(20,20,22,0.28)");
      body.addColorStop(0.03, "rgba(17,17,19,0.45)");
      body.addColorStop(0.34, "rgba(13,13,15,0.55)");
      body.addColorStop(0.7, "rgba(9,9,11,0.8)");
      body.addColorStop(1, "rgba(5,5,7,0.9)");
      ctx.fillStyle = body;
      ctx.fillRect(0, 0, width, height);

      /* 2-3. Caustics and shafts removed — no lines, no shaded patches. */

      /* Wave curves removed: the water reads through
         ripples, and the surface meniscus, not through drawn lines. */

      /* 4. Ripples: dark trough beneath a bright crest. */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += rp.speed * energy;
        rp.alpha -= rp.decay;
        if (rp.alpha <= 0 || rp.radius >= rp.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const rx = rp.radius;
        const ry = rp.radius * rp.aspect;

        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y + 1.6, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 0, 0, ${rp.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(244,245,239, ${rp.alpha * 0.7})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();

        if (rx > 26) {
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, rx - 18, ry - 12, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244,245,239, ${rp.alpha * 0.26})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      /* 5. The pointer touches the surface. */
      if (pointer.current.active && t - lastPointerRipple > 0.45) {
        lastPointerRipple = t;
        ripples.push({
          x: pointer.current.x,
          y: pointer.current.y,
          radius: 5,
          maxRadius: 110,
          speed: 0.62,
          alpha: 0.34,
          decay: 0.003,
          aspect: 0.72,
        });
      }

      /* Fine bubble specks, seeded once, sitting under the fish. */
      drawBubbles(koi);

      /* 7. Koi. */
      koi.forEach((f, fi) => {
        f.retarget -= 1;
        if (Math.hypot(f.targetX - f.x, f.targetY - f.y) < 42 || f.retarget <= 0) {
          const tg = pickTarget();
          f.targetX = tg.x;
          f.targetY = tg.y;
          f.retarget = 170 + Math.random() * 150;
        }

        let sx = f.targetX - f.x;
        let sy = f.targetY - f.y;

        const mx = width * 0.05;
        const my = height * 0.08;
        if (f.x < mx) sx += (mx - f.x) * 3.6;
        if (f.x > width - mx) sx -= (f.x - (width - mx)) * 3.6;
        if (f.y < my) sy += (my - f.y) * 3.6;
        if (f.y > height - my) sy -= (f.y - (height - my)) * 3.6;

        koi.forEach((o, oi) => {
          if (oi === fi) return;
          const dx = f.x - o.x;
          const dy = f.y - o.y;
          const d = Math.hypot(dx, dy);
          if (d < 56 && d > 1) {
            sx += (dx / d) * 44;
            sy += (dy / d) * 44;
          }
        });

        if (pointer.current.active) {
          const dx = f.x - pointer.current.x;
          const dy = f.y - pointer.current.y;
          const d = Math.hypot(dx, dy);
          if (d < 86 && d > 1) {
            sx += (dx / d) * 88;
            sy += (dy / d) * 88;
          }
        }

        f.targetAngle = Math.atan2(sy, sx);
        let diff = f.targetAngle - f.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        f.angle += diff * f.turnSpeed;

        f.surgePhase += f.surgeSpeed;
        const surge = Math.max(0, Math.sin(f.surgePhase));
        f.speed = f.baseSpeed * (0.84 + surge * 0.44);
        f.tailSpeed = 0.14 + surge * 0.1;

        f.x += Math.cos(f.angle) * f.speed;
        f.y += Math.sin(f.angle) * f.speed;

        f.tailPhase += f.tailSpeed;
        f.sway = Math.sin(f.tailPhase) * 0.055;

        /* Depth cue: fish nearer the top sit slightly deeper — a touch dimmer
           and softer, so the pond reads as real water, not a flat sticker. */
        const depthT = Math.max(0, Math.min(1, f.y / Math.max(1, height)));
        const depthDim = 1 - depthT * 0.14;
        const depthBlur = depthT * 0.7;

        f.rippleCooldown += 1;
        if (surge > 0.82 && f.rippleCooldown > 56 && ripples.length < 7) {
          f.rippleCooldown = 0;
          ripples.push({
            x: f.x - Math.cos(f.angle) * f.scaleX * 100,
            y: f.y - Math.sin(f.angle) * f.scaleX * 100,
            radius: 6,
            maxRadius: 100 + Math.random() * 30,
            speed: 0.68,
            alpha: 0.26,
            decay: 0.0028,
            aspect: 0.74,
          });
        }

        /* Soft floor shadow — larger and more diffuse so the koi reads as
           floating in water rather than stuck on the card. */
        ctx.save();
        ctx.translate(f.x + 11, f.y + 15);
        ctx.rotate(f.angle + f.sway);
        ctx.scale(f.scaleX * 1.02, f.scaleY * 0.9);
        ctx.beginPath();
        ctx.ellipse(0, 0, 104, 27, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(3,4,7,0.26)";
        ctx.filter = "blur(11px)";
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle + f.sway);
        ctx.scale(f.scaleX, f.scaleY);

        if (torsoReady && tailReady && torso.complete && tail.complete) {
          const w = 322;
          const h = 169;

          /* Depth dimming for fish sitting lower in the frame. */
          ctx.globalAlpha = depthDim;

          ctx.drawImage(torso, -161, -h * 0.5, w, h);

          /* Slower, deeper tail beat — real koi sweep rather than flick. */
          const flex = Math.sin(f.tailPhase - 0.55) * 0.13;
          ctx.save();
          ctx.translate(-16, 0);
          ctx.rotate(flex);
          ctx.drawImage(tail, -145, -h * 0.5, w, h);
          ctx.restore();

          ctx.globalAlpha = 1;
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, 50, 14, 0, 0, Math.PI * 2);
          ctx.fillStyle = "#B4591F";
          ctx.fill();
        }

        /* Specular band bent along the back: instead of one flat white bar,
           two soft arcs that follow the body curve, like light raking wet
           scales from above. */
        ctx.save();
        ctx.filter = depthBlur > 0.05 ? `blur(${depthBlur.toFixed(2)}px)` : "none";
        ctx.beginPath();
        ctx.ellipse(20, -16, 46, 7, -0.14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,245,239,${(0.14 * depthDim).toFixed(3)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-6, -9, 26, 5, -0.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,245,239,${(0.09 * depthDim).toFixed(3)})`;
        ctx.fill();
        ctx.restore();

        ctx.restore();
      });

      /* 8. No meniscus wave line drawn across the surface: the water reads
         through caustics, shafts and the ripples alone, so no line ever sits
         over the pond. */

      /* 9. Edge falloff. */
      drawVignette();
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [area.accent, area.fishCount, index]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => {
        setIsHovered(true);
        pointer.current.active = true;
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        pointer.current.active = false;
      }}
      className="group relative rounded-[18px] overflow-hidden flex flex-col justify-between h-full min-h-[500px] sm:min-h-[540px] select-none transition-all duration-1000 ease-[cubic-bezier(0.165,0.84,0.44,1)] hover:-translate-y-1"
      style={{
        border: `1px solid ${isHovered ? "rgba(244,245,239,0.24)" : "rgba(244,245,239,0.11)"}`,
        background: "rgba(10, 12, 10, 0.36)",
        backdropFilter: "blur(44px) saturate(1.7)",
        WebkitBackdropFilter: "blur(44px) saturate(1.7)",
        boxShadow: isHovered
          ? "0 24px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14)"
          : "0 12px 40px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.09)",
      }}
    >
      {/* Realistic clear-cut flowing water bed */}
      <WaterFlow />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* The pond opens straight into dark water. Clean, elegant layout without numbers or icons */}
      <div className="relative z-20 p-6 sm:p-7 flex-1 flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span
                className="font-mono text-[10.5px] tracking-[0.22em] uppercase font-medium"
                style={{ color: "#C5AA7A" }}
              >
                {area.systemTag}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h3 className="stylish-header text-[20px] sm:text-[23px] text-[#D9FF00] leading-[1.15]">
              {area.title}
            </h3>
            <div
              className="font-[family-name:var(--font-geist-sans)] text-[13px] font-medium tracking-[-0.005em]"
              style={{ color: "#C5AA7A" }}
            >
              {area.subtitle}
            </div>
            <p className="font-[family-name:var(--font-geist-sans)] text-[13.5px] text-[#E4E6DF] leading-[1.72] pt-2">
              {area.desc}
            </p>
          </div>
        </div>

        <ul className="pt-5 border-t border-[rgba(244,245,239,0.09)] space-y-2.5 mt-auto">
          {area.points.map((point, i) => (
            <li
              key={i}
              className="flex items-start gap-3 font-[family-name:var(--font-geist-sans)] text-[12.5px] text-[#D4D6CF] leading-[1.6]"
            >
              <span
                className="mt-[7px] h-px w-3 shrink-0"
                style={{ backgroundColor: "#C5AA7A", opacity: 0.9 }}
                aria-hidden="true"
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
