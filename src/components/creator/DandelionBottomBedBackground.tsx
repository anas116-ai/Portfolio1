"use client";

import { useEffect, useRef } from "react";

/**
 * DandelionBottomBedBackground — background-only layer.
 * Adds NOTHING to content, character, or existing animations.
 * - Real meadow photo across the bottom 44vh, crystal clear, feather-light top fade.
 * - Crop framed on the fluffy-heads band (white / pink / golden), never stems only.
 * - Text zone stays pure #070807 so hero copy never fights flowers.
 * - Canvas 1: ultra-thin transparent pappus (white / pink / gold), rising + drifting.
 * - Canvas 2: fallen seeds sliding sideways along the bottom band.
 * - Canvas 3: tiny natural fireflies (warm yellow / gold / pale green / soft pink),
 *   slow wander + soft breathing glow. No trails, no blinks, no balls.
 * - Stage shadow: soft darkening right behind the character so he stands
 *   grounded on rocky soil, never on top of blossoms.
 * All layers are fixed, pointer-events-none, z-0 (below hero z-20).
 */
export function DandelionBottomBedBackground() {
  const airRef = useRef<HTMLCanvasElement>(null);
  const groundRef = useRef<HTMLCanvasElement>(null);
  const flyRef = useRef<HTMLCanvasElement>(null);
  // Meadow photo group: visible only while the hero is on screen, so the
  // character always stands IN the meadow and the bed never floats over
  // lower sections like a sticker. Seeds + fireflies stay fixed full-page.
  const bedRef = useRef<HTMLDivElement>(null);
  // Section echoes: faint meadow behind About ponds, rocky return at Contact.
  const echoRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const air = airRef.current, gnd = groundRef.current, fly = flyRef.current;
    if (!air || !gnd || !fly) return;
    const ax = air.getContext("2d"), gx = gnd.getContext("2d"), fx = fly.getContext("2d");
    if (!ax || !gx || !fx) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const airCtx = ax as CanvasRenderingContext2D;
    const gndCtx = gx as CanvasRenderingContext2D;
    const flyCtx = fx as CanvasRenderingContext2D;
    let W = 0, H = 0, mx = 0.5, raf = 0, running = true;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const AIR_N = small ? 22 : 38;
    const GND_N = small ? 14 : 22;
    const FLY_N = small ? 10 : 18;

    function rs() {
      W = window.innerWidth; H = window.innerHeight;
      const canvases: HTMLCanvasElement[] = [air as HTMLCanvasElement, gnd as HTMLCanvasElement, fly as HTMLCanvasElement];
      for (const c of canvases) { c.width = W * dpr; c.height = H * dpr; }
      for (const ctx of [airCtx, gndCtx, flyCtx]) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    rs();
    window.addEventListener("resize", rs, { passive: true });
    const onMove = (e: MouseEvent) => { mx = e.clientX / W; };
    window.addEventListener("mousemove", onMove, { passive: true });
    const onVis = () => { running = !document.hidden; if (running) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", onVis);
    // Hero-locked meadow: full opacity while hero fills the viewport,
    // fading out as it scrolls away. Direct DOM write, no re-render.
    // Applied both on scroll events and inside the RAF loop (covers
    // smooth-scroll libraries that move scroll position without events).
    let lastBedO = "";
    const applyBedO = () => {
      const bed = bedRef.current;
      if (!bed) return;
      const y = window.scrollY, vh = window.innerHeight;
      const o = y < vh * 0.45 ? 1 : Math.max(0, 1 - (y - vh * 0.45) / (vh * 0.45));
      const s = o.toFixed(3);
      if (s !== lastBedO) {
        lastBedO = s;
        bed.style.opacity = s;
        bed.style.visibility = o <= 0 ? "hidden" : "visible";
      }
    };
    const onScroll = () => applyBedO();
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    // Per-section behavior, observed not edited: About gets a faint meadow
    // echo, Projects dims seeds to protect banner contrast, Contact brings
    // back the rocky ground. Everything else: seeds + fireflies only.
    let dimTarget = 1, dimCur = 1;
    const echoEl = echoRef.current, returnEl = returnRef.current;
    const setEcho = (v: number) => {
      if (!echoEl) return;
      echoEl.style.opacity = v.toFixed(2);
      echoEl.style.visibility = v <= 0 ? "hidden" : "visible";
    };
    const setReturn = (v: number) => {
      if (!returnEl) return;
      returnEl.style.opacity = v.toFixed(2);
      returnEl.style.visibility = v <= 0 ? "hidden" : "visible";
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).id;
        if (id === "about") setEcho(e.isIntersecting ? 0.22 : 0);
        else if (id === "contact") setReturn(e.isIntersecting ? 0.55 : 0);
        else if (id === "projects") dimTarget = e.isIntersecting ? 0.6 : 1;
      }
    }, { threshold: 0.15 });
    for (const id of ["about", "projects", "contact"]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }

    // Thin-hair pappus: 17 filaments, fork tips, light-brown tail + seed, backlit core.
    function hairSeed(
      c: CanvasRenderingContext2D, px: number, py: number, r: number,
      rot: number, col: string, alpha: number, tumble: number
    ) {
      c.save(); c.globalAlpha = Math.max(0, Math.min(1, alpha));
      c.translate(px, py); c.rotate(rot); c.scale(Math.cos(tumble) * 0.4 + 0.6, 1);
      c.lineWidth = 0.8; c.lineCap = "round";
      for (let k = 0; k < 17; k++) {
        const a = (k / 16 - 0.5) * 2.35;
        const len = r * (2.1 + Math.sin(k * 2.3) * 0.35);
        c.strokeStyle = col.replace("A", (0.45 + 0.5 * Math.abs(Math.sin(k * 1.7 + rot))).toFixed(2) + ")");
        c.beginPath(); c.moveTo(0, 0);
        c.quadraticCurveTo(Math.sin(a) * len * 0.55, -len * 0.6, Math.sin(a) * len, -len);
        c.stroke();
        c.strokeStyle = col.replace("A", "0.5)");
        c.beginPath();
        c.moveTo(Math.sin(a) * len, -len); c.lineTo(Math.sin(a) * len - 1.4, -len - 1.6);
        c.moveTo(Math.sin(a) * len, -len); c.lineTo(Math.sin(a) * len + 1.4, -len - 1.6);
        c.stroke();
      }
      c.strokeStyle = "rgba(196,158,108,0.95)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(1.5, r * 2.6); c.stroke();
      c.fillStyle = "rgba(150,110,70,0.95)";
      c.beginPath(); c.ellipse(1.5, r * 2.9, 1.2, 2.6, 0, 0, Math.PI * 2); c.fill();
      // backlit core glint so the umbrella reads luminous, not dusty
      c.fillStyle = col.replace("A", "0.85)");
      c.beginPath(); c.arc(0, 0, 1, 0, Math.PI * 2); c.fill();
      c.restore();
    }

    const COLS = ["rgba(255,255,255,A)", "rgba(243,183,205,A)", "rgba(214,178,106,A)"];
    const pick = () => { const r = Math.random(); return r < 0.45 ? COLS[0] : r < 0.72 ? COLS[1] : COLS[2]; };
    // Keep the center text/character corridor clearer: spawn mostly on side thirds.
    const sideX = () => { const x = Math.random(); if (x > 0.26 && x < 0.74) return x < 0.5 ? 0.04 + Math.random() * 0.18 : 0.78 + Math.random() * 0.18; return x; };

    interface AirS { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; ph: number; col: string; dep: number }
    const airS: AirS[] = Array.from({ length: AIR_N }, () => ({
      x: sideX(), y: 0.3 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.0004, vy: -0.0004 - Math.random() * 0.001,
      r: 4 + Math.random() * 7, rot: Math.random() * 7, vr: (Math.random() - 0.5) * 0.03,
      ph: Math.random() * 7, col: pick(), dep: 0.35 + Math.random() * 0.65,
    }));
    interface GndS { x: number; y: number; vx: number; r: number; rot: number; ph: number; col: string }
    const gndS: GndS[] = Array.from({ length: GND_N }, () => ({
      x: Math.random(), y: 0.72 + Math.random() * 0.27,
      vx: (0.0002 + Math.random() * 0.0006) * (Math.random() < 0.5 ? -1 : 1),
      r: 3 + Math.random() * 5, rot: Math.random() * 7, ph: Math.random() * 7, col: pick(),
    }));
    // Fireflies: tiny natural glimmer points, multicolor, slow wander + soft breathing
    // glow. No trails, no sharp blinks, no balls — reads as real minuguru purugulu.
    interface Fly { x: number; y: number; d: number; ph: number; sp: number; r: number; g: number; b: number; wx: number; wy: number }
    const FCOLS = [[255, 240, 170], [255, 200, 120], [210, 255, 160], [255, 190, 210]];
    const flies: Fly[] = Array.from({ length: FLY_N }, () => {
      const c = FCOLS[Math.floor(Math.random() * FCOLS.length)];
      return {
        x: Math.random(), y: 0.45 + Math.random() * 0.5, d: 0.3 + Math.random() * 0.6,
        ph: Math.random() * 10, sp: 0.4 + Math.random() * 0.8,
        r: c[0], g: c[1], b: c[2], wx: 0, wy: 0,
      };
    });

    let t = 0;
    function loop() {
      if (!running) return;
      t += 0.016;
      applyBedO();
      dimCur += (dimTarget - dimCur) * 0.05;
      airCtx.clearRect(0, 0, W, H); gndCtx.clearRect(0, 0, W, H); flyCtx.clearRect(0, 0, W, H);
      const br = coarse ? 0 : (mx - 0.5) * 110;
      for (const s of airS) {
        s.x += s.vx + (coarse ? 0 : (mx - 0.5) * 0.001); s.y += s.vy; s.rot += s.vr * 0.016;
        if (s.y < -0.06) { s.y = 1.04; s.x = sideX(); }
        const px = s.x * W + Math.sin(t * 0.9 + s.ph) * 44 * s.dep + br * s.y * s.dep;
        const py = s.y * H + Math.cos(t * 0.7 + s.ph) * 12;
        const tw = 0.45 + 0.4 * Math.sin(t * 1.2 + s.ph);
        hairSeed(airCtx, px, py, s.r, s.rot, s.col, (0.42 + 0.45 * tw) * (0.5 + 0.5 * s.dep) * dimCur, t * 0.7 + s.ph);
      }
      for (const s of gndS) {
        s.x += s.vx + Math.sin(t * 0.5 + s.ph) * 0.0002;
        if (s.x < -0.02) s.x = 1.02; if (s.x > 1.02) s.x = -0.02;
        hairSeed(gndCtx, s.x * W, s.y * H + Math.sin(t * 0.8 + s.ph) * 3, s.r,
          s.rot + Math.sin(t * 0.4 + s.ph) * 0.2, s.col, (0.6 + 0.3 * Math.sin(t + s.ph)) * dimCur, s.ph);
      }
      for (const f of flies) {
        f.wx += (Math.random() - 0.5) * 0.02; f.wy += (Math.random() - 0.5) * 0.02;
        f.wx *= 0.994; f.wy *= 0.994;
        f.x += f.wx * 0.0015 * f.d; f.y += f.wy * 0.0011 * f.d;
        if (f.x < 0 || f.x > 1) f.wx *= -1; if (f.y < 0.4 || f.y > 1) f.wy *= -1;
        const px = f.x * W + Math.sin(t * 0.45 + f.ph) * 22;
        const py = f.y * H + Math.cos(t * 0.4 + f.ph) * 18;
        const glow = (0.3 + 0.32 * (0.5 + 0.5 * Math.sin(t * f.sp + f.ph))) * dimCur;
        const R = 1 + f.d * 1.6;
        const halo = flyCtx.createRadialGradient(px, py, 0, px, py, R * 5);
        halo.addColorStop(0, `rgba(${f.r},${f.g},${f.b},${(0.75 * glow).toFixed(3)})`);
        halo.addColorStop(1, `rgba(${f.r},${f.g},${f.b},0)`);
        flyCtx.fillStyle = halo; flyCtx.beginPath(); flyCtx.arc(px, py, R * 5, 0, Math.PI * 2); flyCtx.fill();
        flyCtx.fillStyle = `rgba(255,255,250,${(0.45 + 0.5 * glow).toFixed(3)})`;
        flyCtx.beginPath(); flyCtx.arc(px, py, 0.9, 0, Math.PI * 2); flyCtx.fill();
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", rs);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 select-none">
      {/* Meadow photo group — hero-locked (fades out on scroll, see onScroll) */}
      <div ref={bedRef} className="absolute inset-0">
      {/* Top light rays, like soft sun through dark — hero scene only */}
      <div
        className="absolute inset-x-0 top-0 h-[72vh]"
        style={{
          background: "conic-gradient(from 180deg at 52% -8%, transparent 44%, rgba(244,245,239,0.06) 47%, transparent 50%, rgba(244,245,239,0.045) 53%, transparent 56%)",
          filter: "blur(7px)",
        }}
      />
      {/* Bottom meadow bed: real photo, crystal clear, framed on fluffy heads */}
      <div
        className="absolute inset-x-[-4%] bottom-[14vh] h-[38vh]"
        style={{ animation: "dandi-bed-sway 9s ease-in-out infinite alternate", transformOrigin: "50% 100%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/dandelion-bottom-bed.webp"
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={{ objectPosition: "center 12%", filter: "saturate(1.04) brightness(1.02)" }}
        />
      </div>
      {/* Rocky ground strip: same photo framed on the mossy-rock band, so the
          character's feet land on stone like the reference, not on blossoms */}
      <div
        className="absolute inset-x-[-4%] bottom-0 h-[16vh]"
        style={{ animation: "dandi-bed-sway 9s ease-in-out infinite alternate-reverse", transformOrigin: "50% 100%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/dandelion-bottom-bed.webp"
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={{ objectPosition: "center 88%", filter: "saturate(0.95) brightness(0.92)" }}
        />
      </div>
      {/* Feather-light top-edge fade only — meadow heads stay crystal clear */}
      <div
        className="absolute inset-x-0 bottom-[14vh] h-[38vh]"
        style={{ background: "linear-gradient(180deg, #070807 0%, rgba(7,8,7,0.25) 35%, transparent 75%)" }}
      />
      {/* Seam blend between flower band and rock strip */}
      <div
        className="absolute inset-x-0 bottom-[10vh] h-[10vh]"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(7,8,7,0.35) 50%, transparent 100%)" }}
      />
      {/* Character stage shadow: darkens flower heads right behind the figure
          so he stands grounded on rocky soil, not on top of blossoms */}
      <div
        className="absolute inset-x-0 bottom-0 h-[52vh]"
        style={{ background: "radial-gradient(460px 320px at 76% 84%, rgba(7,8,7,0.5), transparent 70%)" }}
      />
      {/* Tunnel mouth: dark opening among the flowers. Hidden in the bed's
          natural dark gap at rest; on scroll the bed melts and the next
          section is revealed through it, as if emerging from the tunnel. */}
      <div
        className="absolute"
        style={{
          left: "46%", bottom: "11vh", transform: "translateX(-50%)",
          width: "min(300px, 40vw)", height: "130px", borderRadius: "50%",
          background: "radial-gradient(ellipse at center, #000 0%, rgba(0,0,0,0.88) 55%, transparent 75%)",
        }}
      />
      </div>
      {/* Section echoes: faint meadow behind About ponds, rocky return at Contact.
          Opacity driven by IntersectionObserver; CSS transition smooths it. */}
      <div
        ref={echoRef}
        className="absolute inset-x-[-4%] bottom-0 h-[14vh]"
        style={{ opacity: 0, visibility: "hidden", transition: "opacity 1s cubic-bezier(0.165,0.84,0.44,1)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/dandelion-bottom-bed.webp"
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={{ objectPosition: "center 55%", filter: "saturate(0.9) brightness(0.8) blur(2px)" }}
        />
      </div>
      <div
        ref={returnRef}
        className="absolute inset-x-[-4%] bottom-0 h-[18vh]"
        style={{ opacity: 0, visibility: "hidden", transition: "opacity 1s cubic-bezier(0.165,0.84,0.44,1)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/dandelion-bottom-bed.webp"
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={{ objectPosition: "center 88%", filter: "saturate(0.95) brightness(0.9)" }}
        />
      </div>
      <canvas ref={airRef} className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "screen" }} />
      <canvas ref={groundRef} className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "screen" }} />
      <canvas ref={flyRef} className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "screen" }} />
      <style>{`@keyframes dandi-bed-sway { from { transform: rotate(-0.5deg) translateX(-6px); } to { transform: rotate(0.5deg) translateX(6px); } }`}</style>
    </div>
  );
}
