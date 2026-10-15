"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function webglAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const BONE = "#F4F5EF";
const LEMON = "#D9FF00";
const BRASS = "#C5AA7A";

/** Procedural starfield — bone/brass dust on a shell, slow counter-rotation. */
function Dust({ count = 260 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // ponytail: rejection-free shell sampling via normalized gaussian-ish spread
      const r = 2.6 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color={BONE} transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** The signal core — wireframe shell, lemon heart, brass orbit. Pointer-reactive. */
function Core({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const heart = useRef<THREE.Mesh>(null);
  const orbit = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    // Base spin + breathe float.
    g.rotation.y += dt * 0.12;
    g.position.y = Math.sin(t * 0.8) * 0.09;
    // Pointer parallax — clamped, eased toward target.
    const px = Math.max(-1, Math.min(1, pointer.current.x));
    const py = Math.max(-1, Math.min(1, pointer.current.y));
    g.rotation.x += (py * 0.28 - g.rotation.x) * 0.06;
    if (shell.current) shell.current.rotation.z -= dt * 0.05;
    if (heart.current) {
      heart.current.rotation.y -= dt * 0.5;
      const s = 1 + Math.sin(t * 1.6) * 0.06;
      heart.current.scale.setScalar(s);
    }
    if (orbit.current) orbit.current.rotation.z += dt * 0.18;
  });

  return (
    <group ref={group}>
      {/* Bone wireframe shell */}
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial color={BONE} wireframe transparent opacity={0.42} />
      </mesh>
      {/* Lemon heart */}
      <mesh ref={heart}>
        <octahedronGeometry args={[0.52, 0]} />
        <meshStandardMaterial color={LEMON} emissive={LEMON} emissiveIntensity={1.4} roughness={0.35} />
      </mesh>
      {/* Brass orbit */}
      <mesh ref={orbit} rotation={[1.25, 0, 0.3]}>
        <torusGeometry args={[2.15, 0.012, 8, 160]} />
        <meshBasicMaterial color={BRASS} transparent opacity={0.85} />
      </mesh>
      <Dust />
    </group>
  );
}

/** Static CSS emblem when WebGL is unavailable or motion is reduced. */
function StillEmblem() {
  return (
    <div className="flex aspect-square w-full items-center justify-center">
      <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-[rgba(244,245,239,0.25)]">
        <div className="absolute inset-4 rounded-full border border-[rgba(197,170,122,0.5)]" />
        <div className="h-10 w-10 rounded-full bg-[#D9FF00]" />
      </div>
    </div>
  );
}

/**
 * HeroSculpture — an original live 3D signal core for the hero stage.
 * Procedural geometry only (no images, no AI avatar): bone wireframe,
 * lemon heart, brass orbit, pointer parallax. Transform-driven motion.
 */
export function HeroSculpture({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [supported, setSupported] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!webglAvailable()) setSupported(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setReduced(true);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const still = !supported || reduced;

  return (
    <figure className={`relative w-full select-none ${className}`}>
      <div
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden rounded-[8px] border border-[rgba(244,245,239,0.14)] bg-[#0A0C0A]"
      >
        {/* Rotating conic halo — studio light orbiting the core */}
        {!still && <span aria-hidden className="sculpt-halo pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%]" />}
        {still ? (
          <StillEmblem />
        ) : (
          <Canvas
            camera={{ position: [0, 0, 6], fov: 42 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            className="!absolute !inset-0"
          >
            <ambientLight intensity={1.0} />
            <directionalLight position={[4, 3, 4]} intensity={1.1} color="#FFFFFF" />
            <Core pointer={pointer} />
          </Canvas>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[8px] border border-[rgba(255,255,255,0.06)]"
        />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between font-[family-name:var(--font-geist-mono)] text-[10.5px] uppercase tracking-[0.22em] text-[#6A6A66]">
        <span>01 — Signal core</span>
        <span>{still ? "Still" : "Live 3D"}</span>
      </figcaption>
    </figure>
  );
}
