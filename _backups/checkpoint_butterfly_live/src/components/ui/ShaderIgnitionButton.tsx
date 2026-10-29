"use client";

import React, { useRef, useEffect, useState, memo } from "react";

/* Named for lightness stops inside one hue, not for four metals. The old
   names (amber / gold / platinum) survived a palette change and were
   actively misleading, since every value inside them is lemon or bone. */
export type IgnitionColorVariant = "lemonDeep" | "bone" | "lemon" | "lemonHi" | "cobalt";

interface ColorConfig {
  dustRgb: [number, number, number];
  starLow: [number, number, number];
  starHigh: [number, number, number];
  glowRgb: [number, number, number];
  flashRgb: [number, number, number];
  borderIdle: string;
  borderHover: string;
  textGlow: string;
}

const COLOR_VARIANTS: Record<IgnitionColorVariant, ColorConfig> = {
  // Fallback alias for clean lemon aesthetic (strictly no blue)
  cobalt: {
    dustRgb: [0.09, 0.09, 0.02],
    starLow: [1.0, 1.0, 0.82],
    starHigh: [0.89, 0.89, 0.29],
    glowRgb: [0.89, 0.89, 0.29],
    flashRgb: [1.0, 1.0, 0.94],
    borderIdle: "border-[#D9FF00]/60",
    borderHover: "group-hover:border-[#E8FF45]",
    textGlow: "rgba(232,255,69,0.65)",
  },

  // 01. Lemon core (primary accent)
  lemon: {
    dustRgb: [0.09, 0.09, 0.02],
    starLow: [1.0, 1.0, 0.82],
    starHigh: [0.89, 0.89, 0.29],
    glowRgb: [0.89, 0.89, 0.29],
    flashRgb: [1.0, 1.0, 0.94],
    borderIdle: "border-[#D9FF00]/60",
    borderHover: "group-hover:border-[#E8FF45]",
    textGlow: "rgba(232,255,69,0.65)",
  },
  // 02. Lemon hi, held back
  lemonHi: {
    dustRgb: [0.07, 0.07, 0.02],
    starLow: [1.0, 1.0, 0.84],
    starHigh: [0.79, 0.79, 0.24],
    glowRgb: [0.79, 0.79, 0.24],
    flashRgb: [1.0, 1.0, 0.95],
    borderIdle: "border-[#E8FF45]/55",
    borderHover: "group-hover:border-[#E8FF45]",
    textGlow: "rgba(232,255,69,0.60)",
  },
  // 03. Bone (neutral, not blue-tinted white). The idle border carries a
  // lemon tint like every other variant so the full button set reads as
  // one family with one highlight, top of the page to bottom.
  bone: {
    dustRgb: [0.06, 0.06, 0.058],
    starLow: [0.96, 0.96, 0.94],
    starHigh: [0.82, 0.82, 0.79],
    glowRgb: [0.92, 0.92, 0.89],
    flashRgb: [1.0, 1.0, 0.98],
    borderIdle: "border-[#D9FF00]/45",
    borderHover: "group-hover:border-[#E8FF45]",
    textGlow: "rgba(244,245,239,0.55)",
  },
  // 04. Lemon deep, the darkest lemon stop
  lemonDeep: {
    dustRgb: [0.07, 0.07, 0.015],
    starLow: [1.0, 1.0, 0.79],
    starHigh: [0.79, 0.79, 0.22],
    glowRgb: [0.78, 0.78, 0.24],
    flashRgb: [1.0, 1.0, 0.93],
    borderIdle: "border-[#D9FF00]/50",
    borderHover: "group-hover:border-[#D9FF00]",
    textGlow: "rgba(217,255,0,0.55)",
  },
};

const VS_SOURCE = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

// Exact ThreeUI Ignition Core Physics — Calibrated to be light & pleasant (not overly heavy or blinding)
const FS_EXACT_WARP = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_warp;
uniform float u_flash;
uniform vec3 u_dust;
uniform vec3 u_star_low;
uniform vec3 u_star_high;
uniform vec3 u_glow;
uniform vec3 u_flash_col;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}

float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),
             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
}

float fbm(vec2 p){
  float v=0.0; float a=0.5;
  for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.07+vec2(13.1,5.7); a*=0.5; }
  return v;
}

void main(){
  vec2 sc = gl_FragCoord.xy / u_res;
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float r = length(uv);
  float rr = max(r, 0.08);
  float a = atan(uv.y, uv.x);
  float t = u_time;

  // 1. Deep graphite chamber interior, cool and neutral
  vec3 col = vec3(0.016, 0.016, 0.021);

  // 2. Cosmic Ambient FBM Dust (Soft & Gentle)
  float hz = fbm(uv * 2.6 + vec2(t * 0.35, 1.7));
  col += u_dust * hz * (0.6 + 0.5 * u_warp);

  // 3. True ThreeUI High-Energy Warp Core Rays (Calibrated Lightness)
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float ringN = 26.0 + fi * 9.0;
    vec2 sp = vec2((a / 6.28318 + 0.5) * ringN,
                   (0.3 + fi * 0.22) / rr + t * (2.0 + fi * 1.2));
    vec2 cell = floor(sp);
    vec2 f = fract(sp);
    float h = hash(cell + fi * 17.31);
    float on = step(0.68, h);
    vec2 c = vec2(0.2 + 0.6 * hash(cell + 4.7), 0.5);
    vec2 dlt = f - c;

    // Authentic elongation during hover warp acceleration
    float sy = mix(130.0, 8.0, u_warp);
    float star = on * exp(-(dlt.x * dlt.x * 150.0 + dlt.y * dlt.y * sy));
    float tw = 0.7 + 0.3 * sin(h * 81.0 + t * 9.0);
    tw = mix(tw, 1.0, u_warp);

    // Dynamic Star Colors (Core vs Edge)
    vec3 sCol = mix(u_star_low, u_star_high, step(0.9, h));
    float fade = smoothstep(0.02, 0.25, r);

    // Balanced intensity (so it stays light and refined, not blindingly heavy)
    col += sCol * star * tw * fade * (0.85 + 0.55 * u_warp);
  }

  // 4. No central core glow: the chamber stays an even glass panel, so the
  //    button never reads as an oval light sitting behind a rectangle. Light
  //    comes only from the star field and the glass edge.

  // 5. Clean Edge Vignette
  vec2 e = sc * (1.0 - sc);
  col *= 0.3 + 0.7 * pow(clamp(e.x * e.y * 16.0, 0.0, 1.0), 0.3);

  // 6. Crisp Click Ignition Flash
  col = mix(col, u_flash_col, clamp(u_flash, 0.0, 1.0));

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface ShaderIgnitionButtonProps {
  children: React.ReactNode;
  variant?: IgnitionColorVariant;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
}

export const ShaderIgnitionButton = memo(function ShaderIgnitionButton({
  children,
  variant = "lemon",
  onClick,
  href,
  target,
  rel,
  className = "",
  icon,
  iconPosition = "left",
  ariaLabel,
  type = "button",
  size = "md",
}: ShaderIgnitionButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Runtime animation state
  const stateRef = useRef({
    warp: 0,
    warpTarget: 0,
    flash: 0,
    z: 0,
    last: 0,
    isVisible: true,
  });

  const config = COLOR_VARIANTS[variant] || COLOR_VARIANTS.lemon;

  useEffect(() => {
    stateRef.current.warpTarget = isHovered ? 1 : 0;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    function createShader(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_EXACT_WARP);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const locP = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(locP);
    gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uWarp = gl.getUniformLocation(prog, "u_warp");
    const uFlash = gl.getUniformLocation(prog, "u_flash");

    const uDust = gl.getUniformLocation(prog, "u_dust");
    const uStarLow = gl.getUniformLocation(prog, "u_star_low");
    const uStarHigh = gl.getUniformLocation(prog, "u_star_high");
    const uGlow = gl.getUniformLocation(prog, "u_glow");
    const uFlashCol = gl.getUniformLocation(prog, "u_flash_col");

    gl.uniform3fv(uDust, config.dustRgb);
    gl.uniform3fv(uStarLow, config.starLow);
    gl.uniform3fv(uStarHigh, config.starHigh);
    gl.uniform3fv(uGlow, config.glowRgb);
    gl.uniform3fv(uFlashCol, config.flashRgb);

    let animId: number;

    const resize = () => {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resize();

    // Auto-pause when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        stateRef.current.isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    stateRef.current.last = performance.now();

    const render = (now: number) => {
      if (!stateRef.current.isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(0.05, (now - stateRef.current.last) / 1000);
      stateRef.current.last = now;

      // Smooth ThreeUI warp acceleration
      stateRef.current.warp +=
        (stateRef.current.warpTarget - stateRef.current.warp) *
        Math.min(1, dt * 2.8);

      // Exponential flash decay
      stateRef.current.flash *= Math.exp(-4.5 * dt);

      // Warp progression
      stateRef.current.z += dt * (0.05 + stateRef.current.warp * 1.35);

      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, stateRef.current.z);
      gl.uniform1f(uWarp, stateRef.current.warp);
      gl.uniform1f(uFlash, stateRef.current.flash);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      if (gl) {
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(buf);
      }
    };
  }, [config]);

  const triggerIgnition = () => {
    stateRef.current.flash = 1.0;
    stateRef.current.warp = 0;
    stateRef.current.z = 0;
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    triggerIgnition();
    if (onClick) onClick(e);
  };

  // Sleek, slim luxury dimensions
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-[11px]",
    md: "px-4 py-2 sm:px-5 sm:py-2 text-xs sm:text-xs",
    lg: "px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-[13px]",
  }[size];

  /* One shape, no stacked backgrounds.
     The control used to read as two objects on top of each other: an outer
     bezel gradient with its own border, and a rectangular glass chamber
     sitting inside it, which read as an oval behind a box. There is now a
     single machined glass panel, one lemon border, and one arc, so every
     button on the page (hero, experience, projects, footer) is the same
     object. The ignition shader, its star field, and the click flash are
     unchanged. */
  const BUTTON_RADIUS = 6;

  const content = (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      style={{ borderRadius: BUTTON_RADIUS }}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden glass border ${config.borderIdle} ${config.borderHover} transition-all duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(217,255,0,0.24)] active:translate-y-0 active:scale-[0.985] cursor-pointer select-none ${sizeStyles} ${className}`}
    >
      {/* Full-bleed WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full hidden md:block pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Top Micro-Edge Specular Glass Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Icon (Left) */}
      {icon && iconPosition === "left" && (
        <span className="relative z-10 flex items-center text-white/90 group-hover:text-white transition-colors duration-200">
          {icon}
        </span>
      )}

      {/* Crisp button typography */}
      <span
        className="relative z-10 font-[family-name:var(--font-geist-sans)] font-medium text-[0.95em] tracking-[0.005em] text-[#F4F5EF] group-hover:text-white transition-colors duration-200"
        style={{
          textShadow: isHovered
            ? `0 0 12px ${config.textGlow}, 0 1px 3px rgba(0,0,0,0.9)`
            : "0 1px 3px rgba(0,0,0,0.8)",
        }}
      >
        {children}
      </span>

      {/* Icon (Right) */}
      {icon && iconPosition === "right" && (
        <span className="relative z-10 flex items-center text-white/90 group-hover:text-white transition-transform duration-200 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={handleClick}
        aria-label={ariaLabel}
        className="inline-block outline-none"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      aria-label={ariaLabel}
      className="inline-block outline-none bg-transparent border-0 p-0"
    >
      {content}
    </button>
  );
});
