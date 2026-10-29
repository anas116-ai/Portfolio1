"use client";

import React, { useEffect, useRef } from "react";

export type BackgroundMode =
  | "aurora"
  | "flowfield"
  | "matrix"
  | "tree"
  | "caustics"
  | "celestial"
  | "synapse"
  | "isometric";

export function VolumetricAuroraGlass() {
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

    const loop = () => {
      t += 0.008;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, w, h);

      // Deep ambient glows
      const g1 = ctx.createRadialGradient(w * 0.75, h * 0.25, 50, w * 0.75, h * 0.25, w * 0.55);
      g1.addColorStop(0, "rgba(217, 255, 0, 0.045)");
      g1.addColorStop(0.5, "rgba(197, 170, 122, 0.02)");
      g1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.2, h * 0.65, 80, w * 0.2, h * 0.65, w * 0.6);
      g2.addColorStop(0, "rgba(197, 170, 122, 0.04)");
      g2.addColorStop(0.6, "rgba(10, 20, 12, 0.02)");
      g2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Volumetric silk curtains
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        const baseY = h * 0.35 + i * 45;
        for (let x = 0; x <= w; x += 30) {
          const y = baseY + Math.sin(x * 0.003 + i * 1.2 + t) * 65 + Math.cos(x * 0.006 + t * 0.7) * 40;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, baseY - 60, 0, h);
        grad.addColorStop(0, i === 1 ? "rgba(217, 255, 0, 0.12)" : "rgba(197, 170, 122, 0.08)");
        grad.addColorStop(0.5, "rgba(12, 18, 12, 0.15)");
        grad.addColorStop(1, "rgba(7, 8, 7, 0)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Crest line
        ctx.beginPath();
        for (let x = 0; x <= w; x += 30) {
          const y = baseY + Math.sin(x * 0.003 + i * 1.2 + t) * 65 + Math.cos(x * 0.006 + t * 0.7) * 40;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = i === 1 ? "rgba(217, 255, 0, 0.35)" : "rgba(197, 170, 122, 0.22)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

export function ThreeUISimplexCurl() {
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

    const particles: { x: number; y: number; speed: number; seed: number; size: number }[] = [];
    for (let i = 0; i < 350; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: Math.random() * 0.6 + 0.3,
        seed: Math.random() * 100,
        size: Math.random() * 2 + 0.8,
      });
    }

    const loop = () => {
      t += 0.005;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "rgba(7, 8, 7, 0.18)";
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p, idx) => {
        const ang = Math.sin(p.x * 0.003 + t) * 1.5 + Math.cos(p.y * 0.004 + t) * 1.2;
        p.x += Math.cos(ang) * p.speed * 1.5;
        p.y += Math.sin(ang) * p.speed * 1.5 + 0.4;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const isLemon = idx % 3 === 0;
        ctx.fillStyle = isLemon ? "rgba(217, 255, 0, 0.75)" : "rgba(197, 170, 122, 0.55)";
        if (p.size > 1.8) {
          ctx.shadowColor = "#D9FF00";
          ctx.shadowBlur = 6;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

export function ArchitecturalMatrixBeams() {
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

    const loop = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, w, h);

      // Dot matrix grid
      const gap = 36;
      for (let x = gap; x < w; x += gap) {
        for (let y = gap; y < h; y += gap) {
          const distToCenter = Math.hypot(x - w * 0.5, y - h * 0.4);
          const flash = Math.sin(x * 0.01 + y * 0.01 + t) * 0.5 + 0.5;
          const alpha = Math.max(0.02, 0.08 - distToCenter / (w * 0.9)) * (flash * 0.8 + 0.4);
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(197, 170, 122, ${alpha})`;
          ctx.fill();
        }
      }

      // Horizontal subtle laser coordinates
      for (let i = 1; i <= 3; i++) {
        const lineY = (h * 0.25 * i + Math.sin(t * 0.4 + i) * 30) % h;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(w, lineY);
        ctx.strokeStyle = "rgba(244, 245, 239, 0.035)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const pulseX = ((t * 180 + i * 250) % (w * 1.4)) - 100;
        const grad = ctx.createLinearGradient(pulseX, lineY, pulseX + 140, lineY);
        grad.addColorStop(0, "rgba(217, 255, 0, 0)");
        grad.addColorStop(0.5, "rgba(217, 255, 0, 0.7)");
        grad.addColorStop(1, "rgba(217, 255, 0, 0)");
        ctx.beginPath();
        ctx.moveTo(pulseX, lineY);
        ctx.lineTo(pulseX + 140, lineY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

export function GenerativeAmbientTree() {
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

    const loop = () => {
      t += 0.015;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, w, h);

      // Ambient halo behind upper-right tree crown
      const treeX = w * 0.78;
      const treeY = h * 0.95;
      const crownGlow = ctx.createRadialGradient(treeX, h * 0.45, 20, treeX, h * 0.45, h * 0.5);
      crownGlow.addColorStop(0, "rgba(217, 255, 0, 0.06)");
      crownGlow.addColorStop(0.5, "rgba(197, 170, 122, 0.025)");
      crownGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = crownGlow;
      ctx.fillRect(0, 0, w, h);

      const drawBranch = (x: number, y: number, len: number, angle: number, depth: number): void => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -len);
        ctx.strokeStyle =
          depth < 3 ? "rgba(197, 170, 122, 0.75)" : depth < 6 ? "rgba(217, 255, 0, 0.65)" : "rgba(240, 255, 140, 0.55)";
        ctx.lineWidth = Math.max(0.7, 6.5 - depth * 0.85);
        ctx.stroke();

        if (depth < 7) {
          const sway = Math.sin(t + depth * 0.45) * 0.038;
          drawBranch(0, -len, len * 0.73, 0.35 + sway, depth + 1);
          drawBranch(0, -len, len * 0.73, -0.35 + sway, depth + 1);
        } else {
          ctx.beginPath();
          ctx.arc(0, -len, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#D9FF00";
          ctx.shadowColor = "#D9FF00";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      };
      drawBranch(treeX, treeY, h * 0.25, -0.05, 0);

      // Pollen dust drifting leftwards across hero
      for (let i = 0; i < 40; i++) {
        const px = ((treeX - (i * 28 + t * 35)) % (w * 1.2) + w * 1.2) % w;
        const py = (h * 0.2 + i * 16 + Math.sin(t + i) * 30) % h;
        ctx.beginPath();
        ctx.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(217, 255, 0, 0.55)";
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

export function QuantumTensorFluid() {
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

    const loop = () => {
      t += 0.012;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, w, h);

      for (let r = 0; r < 14; r++) {
        ctx.beginPath();
        const startY = h * 0.15 + (r * h * 0.7) / 14;
        ctx.moveTo(0, startY);
        for (let x = 0; x <= w; x += 25) {
          const cy = startY + Math.sin(x * 0.005 + r * 0.5 + t) * 55 + Math.cos(x * 0.01 - t * 0.7) * 25;
          ctx.lineTo(x, cy);
        }
        ctx.strokeStyle = r % 2 === 0 ? "rgba(217, 255, 0, 0.22)" : "rgba(197, 170, 122, 0.16)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

export function CelestialGravityMotes() {
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

    const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 240; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
      });
    }

    const loop = () => {
      t += 0.01;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, w, h);

      stars.forEach((s, idx) => {
        s.y += s.speed;
        if (s.y > h) s.y = 0;
        const twinkle = Math.sin(t * 2 + idx) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? `rgba(217, 255, 0, ${s.alpha * twinkle})` : `rgba(197, 170, 122, ${s.alpha * twinkle})`;
        if (s.r > 1.8) {
          ctx.shadowColor = "#D9FF00";
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

export function NeuralSynapseMesh() {
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

    // AI Agent Neural Synapse Nodes
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; isAgent: boolean }[] = [];
    const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 20000));
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        isAgent: i % 5 === 0,
      });
    }

    const loop = () => {
      t += 0.01;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, w, h);

      // Deep ambient glow
      const g = ctx.createRadialGradient(w * 0.7, h * 0.35, 40, w * 0.7, h * 0.35, w * 0.5);
      g.addColorStop(0, "rgba(217, 255, 0, 0.04)");
      g.addColorStop(0.5, "rgba(197, 170, 122, 0.018)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Draw synapse links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const isHighlight = nodes[i].isAgent || nodes[j].isAgent;
            ctx.strokeStyle = isHighlight
              ? `rgba(217, 255, 0, ${alpha * 1.5})`
              : `rgba(197, 170, 122, ${alpha})`;
            ctx.lineWidth = isHighlight ? 1.1 : 0.7;
            ctx.stroke();

            // Occasional pulse traveling along axon
            const pulse = (t * 0.8 + i + j * 0.3) % 1;
            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pulse;
            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pulse;
            ctx.beginPath();
            ctx.arc(px, py, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(217, 255, 0, 0.7)";
            ctx.fill();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        if (n.isAgent) {
          ctx.fillStyle = "#D9FF00";
          ctx.shadowColor = "#D9FF00";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = "rgba(197, 170, 122, 0.65)";
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

export function ObsidianIsometricHorizon() {
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

    const loop = () => {
      t += 0.015;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, w, h);

      // Deep Horizon Glow
      const horizonY = h * 0.58;
      const hGlow = ctx.createRadialGradient(w * 0.5, horizonY, 20, w * 0.5, horizonY, w * 0.6);
      hGlow.addColorStop(0, "rgba(217, 255, 0, 0.08)");
      hGlow.addColorStop(0.3, "rgba(197, 170, 122, 0.03)");
      hGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, 0, w, h);

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.strokeStyle = "rgba(217, 255, 0, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Perspective grid lines vanishing to horizon
      const vanishX = w * 0.5;
      const lines = 32;
      for (let i = -lines; i <= lines; i++) {
        const bottomX = vanishX + i * 70;
        ctx.beginPath();
        ctx.moveTo(vanishX, horizonY);
        ctx.lineTo(bottomX, h);
        const grad = ctx.createLinearGradient(vanishX, horizonY, bottomX, h);
        grad.addColorStop(0, "rgba(217, 255, 0, 0.2)");
        grad.addColorStop(1, "rgba(197, 170, 122, 0.02)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Horizontal receding lines moving forward
      const numHoriz = 16;
      for (let i = 0; i < numHoriz; i++) {
        const progress = ((i / numHoriz) + (t * 0.15)) % 1;
        const y = horizonY + Math.pow(progress, 2.2) * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        const alpha = Math.sin(progress * Math.PI) * 0.25;
        ctx.strokeStyle = `rgba(217, 255, 0, ${alpha})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

