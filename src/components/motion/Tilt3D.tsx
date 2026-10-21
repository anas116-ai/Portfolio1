"use client";

import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. Luxury restraint: keep 3 to 6. */
  max?: number;
  /** Perspective distance. Lower is more dramatic. */
  perspective?: number;
  /** Extra scale while the pointer is over the surface. */
  lift?: number;
  /** Applied to the inner plane so children can sit above the plate. */
  style?: CSSProperties;
}

/**
 * Tilt3D — a single-element pointer tilt that gives a flat surface the weight
 * of a physical object. Fine pointers only: touch stays flat because a tilt
 * the finger cannot steer reads as jitter, not depth. Reduced motion is a
 * settled frame. No glow, no shadow, no scale beyond a whisper.
 */
export function Tilt3D({
  children,
  className = "",
  max = 5,
  perspective = 1000,
  lift = 0,
  style,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, on: false });
  const reduce = useReducedMotion();

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setTilt({ rx: -py * max, ry: px * max, on: true });
      }}
      onPointerLeave={() => setTilt({ rx: 0, ry: 0, on: false })}
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(${perspective}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${
          tilt.on && lift ? lift : 1
        })`,
        transition: "transform 0.6s cubic-bezier(0.165,0.84,0.44,1)",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
