"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { sampleRamp } from "@/lib/reference-kit";

/* ─────────────────────────────────────────────────────────────
   REFERENCE SCULPTURE

   The extracted palette, drawn as a solid rather than listed as swatches.

   A (2,3) torus knot carries the points: a closed curve with a twist, so the
   palette is read once around the loop and again through the twist, which is
   exactly how a limited palette behaves when it is laid on a form. Every point
   holds two colours — where it sits on the ramp, and where the ramp is a fifth
   of the way further on — and the shader mixes between them on a slow sine, so
   the whole surface drifts through the reference's own colours instead of
   wearing them like a decal.

   Nothing here talks to Context.dev. It takes a ramp and paints it, which
   keeps the one place that spends credits (`/api/studio/reference`) away from
   the render path.
   ───────────────────────────────────────────────────────────── */

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uScale;

attribute vec3 aColorA;
attribute vec3 aColorB;
attribute float aSeed;
attribute float aSize;
attribute float aRank;

varying vec3 vColor;
varying float vSeed;
varying float vRank;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float dist = max(-mv.z, 0.001);

  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aSize * uScale / dist;

  // The palette flows: each point reads between two places on the ramp, and
  // the phase is seeded per point so the surface stirs rather than pulsing as
  // one sheet.
  float m = 0.5 + 0.5 * sin(uTime * 0.34 + aSeed * 6.2831);
  vColor = mix(aColorA, aColorB, m);
  vSeed = aSeed;
  vRank = aRank;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uAlpha;
uniform float uTime;
uniform float uGlow;

varying vec3 vColor;
varying float vSeed;
varying float vRank;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  float soft = smoothstep(0.5, 0.06, d);
  float core = smoothstep(0.3, 0.0, d);

  vec3 col = vColor + core * 0.06;
  col *= 0.9 + 0.1 * sin(uTime * 0.5 + vSeed * 12.566);

  float a = soft * uAlpha;

  // The second pass is a bloom, not an aura. Gated by where the point sits on
  // the ramp rather than by its brightness: a reference whose accent is
  // lemon is bright at the top *and* in the middle, and a luminance gate would
  // have bloomed half the field. Rank always means the same thing whatever
  // palette is loaded — the last quarter of it glows.
  if (uGlow > 0.5) {
    float hl = smoothstep(0.68, 0.94, vRank);
    if (hl < 0.02) discard;
    a *= hl;
  }

  if (a < 0.005) discard;
  gl_FragColor = vec4(col, a);
}
`;

/** Deterministic PRNG, so a remount paints the same knot. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** (2,3) torus knot, normalised to roughly a unit radius. */
function knot(t: number): [number, number, number] {
  const r = (2 + Math.cos(3 * t)) * 0.5;
  return [r * Math.cos(2 * t) * 0.5, Math.sin(3 * t) * 0.5, r * Math.sin(2 * t) * 0.5];
}

interface Field {
  geometry: THREE.BufferGeometry;
  count: number;
}

function buildField(ramp: string[], count: number, tube: number): Field {
  const rnd = mulberry32(0x5eed);
  const positions = new Float32Array(count * 3);
  const colorA = new Float32Array(count * 3);
  const colorB = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const ranks = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const t = rnd() * Math.PI * 2;
    const [kx, ky, kz] = knot(t);
    // fuzzy tube: a small spherical offset, denser toward the core
    const u = rnd();
    const phi = Math.acos(2 * rnd() - 1);
    const theta = rnd() * Math.PI * 2;
    const rad = tube * Math.cbrt(u);
    const i3 = i * 3;
    positions[i3] = kx + rad * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = ky + rad * Math.cos(phi);
    positions[i3 + 2] = kz + rad * Math.sin(phi) * Math.sin(theta);

    const a = rnd();
    const b = (a + 0.18) % 1;
    const ca = sampleRamp(ramp, a);
    const cb = sampleRamp(ramp, b);
    colorA[i3] = ca[0];
    colorA[i3 + 1] = ca[1];
    colorA[i3 + 2] = ca[2];
    colorB[i3] = cb[0];
    colorB[i3 + 1] = cb[1];
    colorB[i3 + 2] = cb[2];

    // Where the point sits on the ramp, kept as the *rank* rather than as a
    // brightness: rank survives a palette swap, so the bloom lands on the same
    // quarter of the form whether the reference is obsidian or lemon.
    ranks[i] = a;

    // Brighter places on the ramp read as slightly heavier points — the same
    // rule the hero's cloud uses, so the two pieces share a language. Kept
    // modest, because a strong weighting lets a single bright accent own the
    // whole sculpture.
    const lum = 0.2126 * ca[0] + 0.7152 * ca[1] + 0.0722 * ca[2];
    sizes[i] = 0.7 + 0.5 * lum;
    seeds[i] = rnd();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColorA", new THREE.BufferAttribute(colorA, 3));
  geometry.setAttribute("aColorB", new THREE.BufferAttribute(colorB, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aRank", new THREE.BufferAttribute(ranks, 1));
  return { geometry, count };
}

function makeMaterial(shared: Record<string, THREE.IUniform>, glow: boolean) {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      ...shared,
      uAlpha: { value: glow ? 0.13 : 1 },
      uGlow: { value: glow ? 1 : 0 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: glow ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

function Knot({ ramp, reduce }: { ramp: string[]; reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { size, gl } = useThree();
  const count = useMemo(() => (size.width < 640 ? 16000 : 42000), [size.width]);

  const field = useMemo(() => buildField(ramp, count, 0.062), [ramp, count]);

  const shared = useMemo<Record<string, THREE.IUniform>>(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 15 },
      uScale: { value: 1 },
    }),
    [],
  );

  const bodyMat = useMemo(() => makeMaterial(shared, false), [shared]);
  const glowMat = useMemo(() => makeMaterial(shared, true), [shared]);

  useEffect(() => {
    return () => {
      field.geometry.dispose();
      bodyMat.dispose();
      glowMat.dispose();
    };
  }, [field, bodyMat, glowMat]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    shared.uTime.value = t;
    shared.uScale.value = (size.height / 900) * Math.min(gl.getPixelRatio(), 2);
    shared.uSize.value = size.width < 640 ? 10 : 12.5;

    const g = group.current;
    if (!g) return;
    if (reduce) {
      g.rotation.set(0.3, 0.6, 0);
      g.scale.setScalar(1);
      return;
    }
    // frame-rate independent, because the extracted palette is the subject and
    // the turn should read the same on any machine
    g.rotation.y += delta * 0.17;
    g.rotation.x = 0.26 + Math.sin(t * 0.11) * 0.2;
    g.scale.setScalar(1 + Math.sin(t * 0.5) * 0.012);
  });

  return (
    <group ref={group} rotation={[0.3, 0.6, 0]}>
      <points geometry={field.geometry} material={bodyMat} />
      <points geometry={field.geometry} material={glowMat} />
    </group>
  );
}

export interface ReferenceSculptureProps {
  /** Ramp stops as `#RRGGBB`, dark to light. */
  ramp: string[];
  className?: string;
}

export default function ReferenceSculpture({
  ramp,
  className,
}: ReferenceSculptureProps) {
  const reduce = useReducedMotion() ?? false;
  const [ready, setReady] = useState(false);

  // The canvas is mounted a beat late so the page paints first: this is a
  // decoration, and it should never be the reason the studio feels slow.
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  const signature = ramp.join(",");
  const stable = useMemo(() => ramp.filter(Boolean), [signature]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className}>
      {ready ? (
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 2.9], fov: 42 }}
        >
          <Knot ramp={stable} reduce={reduce} />
        </Canvas>
      ) : null}
    </div>
  );
}
