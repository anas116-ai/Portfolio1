"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { buildDigitalHuman, CLOUD_HEIGHT, type DigitalHumanCloud } from "@/lib/digitalHuman";

/* ─────────────────────────────────────────────────────────────
   The point form is drawn in two passes over one geometry:
   a soft additive aura, then the body itself composited far to
   near. Both share the time, resolve, sweep and fit uniforms, so
   the form reads as one object rather than two effects.
   ───────────────────────────────────────────────────────────── */

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uAssemble;
uniform float uBurst;
uniform float uPointSize;
uniform float uScale;
uniform vec3 uTouch;
uniform vec3 uKeyDir;
uniform vec3 uKeyColor;
uniform vec3 uFillColor;
uniform vec3 uSpecColor;
uniform vec3 uRimColor;
uniform float uKeyBias;
uniform float uKeyGain;
uniform float uFillGain;
uniform float uSpecPower;
uniform float uSpecGain;
uniform float uRimGain;
uniform float uAOGain;
uniform float uFogNear;
uniform float uFogFar;
uniform float uFogAmount;
uniform vec2 uTurn;
uniform vec3 uSpot;
uniform vec3 uSpotColor;
uniform float uSpotGain;

attribute vec3 aColor;
attribute vec3 aScatter;
attribute vec3 aNormal;
attribute vec3 aShade;
attribute float aSize;
attribute float aSeed;
attribute float aDelay;

varying vec3 vColor;
varying float vAlpha;
varying float vY;
varying vec2 vPos;
varying float vSeed;
varying float vFog;

void main() {
  vColor = aColor;

  vec3 p = position;

  // breath: shoulders and chest carry it, the head is nearly still
  float low = smoothstep(1.30, -0.40, position.y);
  p.y += sin(uTime * 1.15 + aSeed * 39.4) * 0.011 * low;
  p.x += cos(uTime * 0.70 + aSeed * 21.7) * 0.006 * low;
  p.z += sin(uTime * 0.85 + aSeed * 27.1) * 0.016;

  // One schedule for every staged move this point ever makes, so the face
  // always leads: it lets go first, and it is the first thing to come back.
  float sched = aSeed * 0.3 + aDelay * 0.6;

  // ── the dissolve ─────────────────────────────────────────────────────
  // Pixel by pixel the body lets go, drifts, and then returns and locks.
  // The offset is a direction and never a new shape — at rest its length is
  // exactly zero — so what comes back is the photograph again rather than an
  // approximation of it. Every point travels along its own outward ray, so
  // the cloud keeps the density the face gave it and the silhouette reads
  // even while it is apart.
  // The wave is stretched across the whole ramp on purpose: with a narrow
  // window the body lets go all at once and reads as fog, while a wide
  // window leaves the surface visibly peeling, one band of pixels at a
  // time, which is the thing that makes it read as pixels rather than dust.
  float go = smoothstep(sched * 0.5, sched * 0.5 + 0.5, uBurst);
  // Spread in the picture plane, not towards the lens: a point that travels
  // down the camera axis only grows, and a body that grows reads as a smudge
  // while a body that spreads reads as a body coming apart. Each point takes
  // its own ray — outward from the chest, plus its own turbulence — so the
  // surface shatters into grains instead of inflating like a balloon, and the
  // colour and size it carries never change, only its distance.
  vec2 rad = normalize(position.xy - vec2(0.0, 0.85) + vec2(0.0001));
  float r1 = fract(sin(aSeed * 127.1) * 43758.5453) - 0.5;
  float r2 = fract(sin(aSeed * 311.7) * 24634.6345) - 0.5;
  vec3 away = normalize(vec3(rad.x * 1.25 + r1 * 0.9, rad.y * 1.25 + r2 * 0.9, r2 * 0.45));
  p += away * (0.14 + 0.26 * aSeed) * go;
  // a slow counter-drift while it is apart, so the hold is a cloud rather
  // than a freeze and the return is a convergence rather than a snap
  p.xy += vec2(sin(uTime * 0.5 + aSeed * 41.0), cos(uTime * 0.43 + aSeed * 33.0)) * 0.05 * go;

  // the resolve: the face arrives first, then the crown, then the
  // shoulders — one directed entrance instead of uniform static
  float a = clamp((uAssemble * 1.2 - sched) / 0.35, 0.0, 1.0);
  a = a * a * (3.0 - 2.0 * a);
  p = mix(aScatter, p, a);

  // touch: a press stirs the field around the fingertip. Local on purpose —
  // a fingertip is small against a bust, so the disturbance stays the width
  // of a fingertip instead of denting the whole face. Strength is eased
  // toward its target on the CPU side, so the release settles the points
  // straight back instead of snapping them.
  vec2 td = p.xy - uTouch.xy;
  float tdist = length(td);
  float push = exp(-tdist * tdist * 5.0) * uTouch.z;
  p.xy += (td / max(tdist, 0.001)) * push * 0.26;
  p.z += push * 0.2;

  // ── the head leads the body ──────────────────────────────────────────
  // Turning the whole group swings the bust like a mannequin. Life is in the
  // lag instead: the head carries the motion and the shoulders follow a
  // little, so the neck takes up the difference. Weighted by height, which
  // also means nothing below the collar moves at all — the chest stays
  // planted while the face answers.
  float headW = smoothstep(0.80, 1.55, position.y);
  float yaw = uTurn.x * (0.30 + 0.70 * headW);
  float pitch = uTurn.y * headW;
  float roll = uTurn.x * headW * 0.16;

  float cyw = cos(yaw);
  float syw = sin(yaw);
  p.xz = mat2(cyw, syw, -syw, cyw) * p.xz;

  float cpt = cos(pitch);
  float spt = sin(pitch);
  vec2 q = p.yz - vec2(0.95, 0.0);
  p.yz = vec2(q.x * cpt - q.y * spt, q.x * spt + q.y * cpt) + vec2(0.95, 0.0);

  if (abs(roll) > 0.0001) {
    float crl = cos(roll);
    float srl = sin(roll);
    p.xy = mat2(crl, srl, -srl, crl) * p.xy;
  }

  // ── the light you carry ──────────────────────────────────────────────
  // Measured against the rest position rather than the turned one, so the
  // pool stays in the room and the head moves underneath it. This is the
  // whole reveal: no second picture, no mask over an image — the light
  // simply lands somewhere and that part of the body is what you see.
  vec2 sd2 = position.xy - uSpot.xy;
  float spot = exp(-dot(sd2, sd2) * 1.45) * uSpot.z;

  vec4 world = modelMatrix * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;
  float dist = max(-mv.z, 0.001);

  gl_Position = projectionMatrix * mv;
  // points caught in the pool swell a little: focus reads as weight, and it
  // keeps the lit patch from looking like a brightness slider laid on top
  gl_PointSize = uPointSize * aSize * uScale * (1.0 + spot * 0.22) / dist;

  vec3 V = normalize(cameraPosition - world.xyz);

  // The lamp lives in the room, not on the head, so the normal is taken out of
  // the model transform before it is lit — turn the figure and the light stays
  // where it was. Uniform scale, so the rotation part of the matrix is enough.
  // The head turn happens inside the model, so it has to be applied here too:
  // without it the key would keep lighting a face that has moved out from
  // under it, and the turn would read as a smear rather than as a rotation.
  vec3 n = aNormal;
  n.xz = mat2(cyw, syw, -syw, cyw) * n.xz;
  n.yz = vec2(n.y * cpt - n.z * spt, n.y * spt + n.z * cpt);
  vec3 N = normalize(mat3(modelMatrix) * n);

  float ndl = dot(N, uKeyDir);
  // A portrait key has no hard terminator. The wrap is what keeps the shadow
  // side readable as skin instead of letting it die into the ground, and the
  // square is what puts the falloff back on the cheek.
  float diff = 0.5 + 0.5 * ndl;
  diff = diff * diff;

  float ao = mix(1.0, aShade.x, uAOGain);

  vec3 lit = aColor * uKeyColor * (uKeyBias + diff * uKeyGain) * ao;
  // bounce: the shadow side of a face is lit by the chest below it, not by the
  // void behind it, so it carries colour even where the key cannot reach
  lit += aColor * uFillColor * (1.0 - diff) * uFillGain;

  // The sheen skin actually has, and the catchlight that makes an eye read.
  // Narrow, so it lands as a bead on the brow, the bridge of the nose and the
  // bow of the lip instead of washing the whole cheek, and gated three ways:
  // by the crease map so it can never light the inside of a socket, by the
  // occlusion so a shadowed plane stays matte, and by the point's own albedo —
  // only a bright material has sheen, which is what keeps it on the skin and
  // off the hair, the beard and the knit where the relief is textured enough
  // that half the points would otherwise read as a ridge.
  float albedoLum = dot(aColor, vec3(0.2126, 0.7152, 0.0722));
  float sheen = smoothstep(0.3, 0.62, albedoLum) * aShade.y * ao;
  vec3 H = normalize(uKeyDir + V);
  float spec = pow(max(dot(N, H), 0.0), uSpecPower);
  lit += uSpecColor * spec * sheen * uSpecGain;

  // Rim: the light that comes round the back of the head and draws the
  // silhouette. Driven by the view angle so it travels as the figure turns,
  // and gated by the sampled edge so it stays on the edge — read off the
  // view alone it lights the whole shadow side of the face, which is a haze,
  // not a rim.
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  lit += uRimColor * fres * uRimGain * aShade.z;

  // The pool lands last, as light rather than paint: it multiplies the skin's
  // own colour and is occluded by the crease map, so it can brighten a cheek
  // without flattening an eye socket.
  lit += aColor * uSpotColor * spot * uSpotGain * ao;

  vColor = lit;
  vAlpha = a;
  vY = position.y;
  vPos = position.xy;
  vSeed = aSeed;
  vFog = smoothstep(uFogNear, uFogFar, dist) * uFogAmount;
}
`;

const FRAGMENT = /* glsl */ `
uniform float uSweep;
uniform float uAlpha;
uniform float uAmbient;
uniform float uTime;
uniform float uPaint;
uniform float uCoreLift;
uniform float uExposure;
uniform float uSat;
uniform float uGlow;
uniform float uBloomLo;
uniform float uBloomHi;
uniform vec3 uFogColor;

varying vec3 vColor;
varying float vAlpha;
varying float vY;
varying vec2 vPos;
varying float vSeed;
varying float vFog;

/* The Academy curve, in one line. It is here for the two ends of the range:
   a lit plane reaches the shoulder and rolls off instead of clipping, and the
   floor comes up with it, which is what keeps the knit and the beard a colour
   where a linear ramp had them at black. */
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 c = gl_PointCoord - 0.5;
  vec2 ac = abs(c);
  // Chebyshev distance is the cell: it isolates a square from the same sprite
  // that used to isolate a disc, at no extra cost and with the corners as
  // hard as the sides.
  float sq = max(ac.x, ac.y);
  float disc = length(c);

  // uGlow doubles as the shape switch. The body draws as an LED cell; the
  // bloom stays a round falloff, because halation is round and a square halo
  // reads as a box drawn around every highlight.
  float m = mix(sq, disc, uGlow);
  if (m > 0.5) discard;

  float soft = uGlow > 0.5 ? smoothstep(0.5, 0.08, disc) : smoothstep(0.5, 0.44, sq);
  // An LED cell is lit flat across its face and you read the edge; a bead is
  // bright at the centre and you read the point. Keep a shallow centre lift
  // so a sparse patch still has depth, but leave most of the cell even.
  float core = smoothstep(0.5, 0.36, m);

  // A bright core so each point reads as a bead of light rather than a flat
  // disc. This is what carries the particle read: with the field thinned out
  // for air, a dot needs a bright centre to register at all, and a centre is
  // cheap where size is not — it sharpens the dot without widening it into
  // its neighbour.
  vec3 col = vColor + core * uCoreLift + uAmbient;

  // ── wet pigment ──────────────────────────────────────────────────────
  // The paint is never still. Two slow waves, one climbing the body and one
  // crossing it, drift the pigment between champagne ochre and alizarin rose
  // without ever leaving the one family the palette sets. Per-point seeds
  // stagger the phase, so the surface stirs like wet paint rather than
  // pulsing like a filter laid over a photograph. Slow on purpose: this is
  // meant to be caught by the eye, not read off a clock.
  vec3 gold = vec3(1.08, 1.0, 0.76);
  vec3 rose = vec3(1.08, 0.84, 0.9);
  float w1 = sin(vPos.y * 1.15 - uTime * 0.26 + vSeed * 1.4);
  float w2 = sin(vPos.x * 1.9 + vPos.y * 0.5 + uTime * 0.17);
  float wash = 0.5 + 0.5 * (w1 * 0.62 + w2 * 0.38);
  col *= mix(vec3(1.0), mix(gold, rose, wash), 0.6 * uPaint);

  // One raking studio band travelling up the body, tinted by the same wash.
  // Kept lower than it was: the form now carries a real key off its own
  // normals, and a second strong light from a second direction is what
  // flattens a face rather than what shapes it.
  float band = exp(-pow((vY - uSweep) * 1.5, 2.0));
  col += band * 0.08 * mix(vec3(1.0, 0.94, 0.78), vec3(1.0, 0.84, 0.66), wash);

  // Aerial perspective. Distance goes to a warm haze rather than to nothing,
  // so the figure keeps a colour where it turns away and the cloud gains a
  // volume a flat additive field can never have.
  col = mix(col, uFogColor, vFog);

  col = aces(col * uExposure);

  // No black, anywhere. The palette has none in it, and a point that lands
  // there stops being a shadow and becomes a hole — an eye socket you can
  // see the page through. The floor is a dark warm brown: low enough that a
  // socket still reads as the deepest note on the face, high enough that it
  // is a note at all.
  col = max(col, vec3(0.16, 0.108, 0.078));

  // The filmic curve takes saturation out of the mid-tones on its way through.
  // That is right for film and wrong for a palette this narrow: it turns earth
  // into plaster. Put back what it took, about the same luminance, so the hue
  // is restored without the value moving.
  float grey = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(grey), col, uSat), 0.0, 1.0);

  float a = soft * vAlpha * uAlpha;

  // The second pass is a bloom, not an aura. Only points already lit to a
  // highlight are allowed to bleed, so the glow gathers on the catchlight,
  // the brow and the rim of the hair instead of hazing the whole silhouette.
  if (uGlow > 0.5) {
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float hl = smoothstep(uBloomLo, uBloomHi, lum);
    if (hl < 0.02) discard;
    a *= hl;
  }

  if (a < 0.006) discard;
  gl_FragColor = vec4(col, a);
}
`;

function makeMaterial(
  shared: Record<string, THREE.IUniform>,
  opts: { pointSize: number; alpha: number; ambient: number; coreLift: number; glow: boolean },
) {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      ...shared,
      uPointSize: { value: opts.pointSize },
      uAlpha: { value: opts.alpha },
      uAmbient: { value: opts.ambient },
      uCoreLift: { value: opts.coreLift },
      uGlow: { value: opts.glow ? 1 : 0 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: opts.glow ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

function Cloud({ cloud, reduce }: { cloud: DigitalHumanCloud; reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);

  const assemble = useRef(reduce ? 1 : 0);
  const raw = useRef({ x: 0, y: 0 });
  const lean = useRef({ x: 0, y: 0 });
  // this frame's screen-to-figure mapping, so a fingertip lands on the body
  const view = useRef({ ready: false, worldW: 1, worldH: 1, px: 0, py: 0, s: 1 });
  const touch = useRef({ x: 0, y: 0, str: 0, target: 0, down: false });
  // the pool that follows the pointer, and the head turn it drives
  const spot = useRef({ x: 0.16, y: 1.32, tx: 0.16, ty: 1.32, w: 0, str: 0, on: false, last: 0 });
  const turn = useRef({ x: 0, y: 0 });
  // when the dissolve cycle's clock starts, i.e. once the entrance is done
  const cycleStart = useRef(-1);
  const wide = size.width >= 900;

  const shared = useMemo<Record<string, THREE.IUniform>>(
    () => ({
      uTime: { value: 0 },
      uAssemble: { value: reduce ? 1 : 0 },
      uBurst: { value: 0 },
      uSweep: { value: -8 },
      uScale: { value: 1 },
      uPaint: { value: reduce ? 0 : 1 },
      uTouch: { value: new THREE.Vector3(0, 0, 0) },

      /* The pool. A warm, slightly under-key colour so it reads as the same
         lamp family as the key rather than as a cool flashlight, and a gain
         low enough that it reveals a plane instead of bleaching it. */
      uSpot: { value: new THREE.Vector3(0.16, 1.32, 0) },
      uSpotColor: { value: new THREE.Color(1.0, 0.86, 0.66) },
      uSpotGain: { value: 0.3 },
      uTurn: { value: new THREE.Vector2(0, 0) },

      /* The light rig. A portrait is one key, one bounce and one rim, and the
         three are fixed in the room: turn the figure and the light stays put,
         which is what makes the form read as an object rather than as a
         picture that follows the camera. Dir is the direction a surface has
         to face to receive the key — upper left, in front, close to the axis
         the copy column sits on, so the lit plane and the reading plane agree.
         Colour is warm because the palette is; the fill is the chest's bounce
         and the rim is the same lamp seen round the back of the head. */
      uKeyDir: { value: new THREE.Vector3(-0.46, 0.52, 0.72).normalize() },
      uKeyColor: { value: new THREE.Color(1.06, 1.0, 0.94) },
      uFillColor: { value: new THREE.Color(0.56, 0.42, 0.34) },
      uSpecColor: { value: new THREE.Color(1.0, 0.93, 0.82) },
      uRimColor: { value: new THREE.Color(1.0, 0.84, 0.62) },
      uKeyBias: { value: 0.65 },
      uKeyGain: { value: 0.44 },
      uFillGain: { value: 0.4 },
      uSpecPower: { value: 58 },
      uSpecGain: { value: 0.44 },
      uRimGain: { value: 0.58 },
      uAOGain: { value: 1.0 },
      uFogNear: { value: 5.7 },
      uFogFar: { value: 7.4 },
      uFogAmount: { value: 0.44 },
      uFogColor: { value: new THREE.Color(0.115, 0.082, 0.066) },
      uExposure: { value: 0.7 },
      uSat: { value: 1.25 },
      uBloomLo: { value: 0.62 },
      uBloomHi: { value: 0.95 },
    }),
    [reduce],
  );

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cloud.positions, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(cloud.colors, 3));
    g.setAttribute("aScatter", new THREE.BufferAttribute(cloud.scatter, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(cloud.sizes, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(cloud.seeds, 1));
    g.setAttribute("aDelay", new THREE.BufferAttribute(cloud.delays, 1));
    g.setAttribute("aNormal", new THREE.BufferAttribute(cloud.normals, 3));
    g.setAttribute("aShade", new THREE.BufferAttribute(cloud.shade, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }, [cloud]);

  const bodyMat = useMemo(
    () =>
      makeMaterial(shared, {
        pointSize: 19,
        alpha: 1,
        ambient: 0.006,
        coreLift: 0.05,
        glow: false,
      }),
    [shared],
  );
  // Bright-pass bloom: a wide, faint pass that only the points already lit to
  // a highlight are allowed to contribute to.
  const glowMat = useMemo(
    () =>
      makeMaterial(shared, {
        pointSize: 27,
        alpha: 0.14,
        ambient: 0,
        coreLift: 0.05,
        glow: true,
      }),
    [shared],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      bodyMat.dispose();
      glowMat.dispose();
    },
    [geometry, bodyMat, glowMat],
  );

  useEffect(() => {
    if (reduce) return;
    const toLocal = (cx: number, cy: number) => {
      const v = view.current;
      if (!v.ready) return null;
      const wx = ((cx / Math.max(1, window.innerWidth)) * 2 - 1) * (v.worldW / 2);
      const wy = (1 - (cy / Math.max(1, window.innerHeight)) * 2) * (v.worldH / 2);
      return { x: (wx - v.px) / v.s, y: (wy - v.py) / v.s };
    };
    const place = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      if (p) {
        touch.current.x = p.x;
        touch.current.y = p.y;
        // Clamped to the body's own bounds. Pointing at the wall has to still
        // light the figure, or the effect reads as broken rather than as a
        // light: the pool slides to the nearest part of the form and stops.
        spot.current.tx = Math.max(-1.45, Math.min(1.45, p.x));
        spot.current.ty = Math.max(-1.70, Math.min(1.95, p.y));
        spot.current.on = true;
        spot.current.last = performance.now();
      }
    };
    const onMove = (e: PointerEvent) => {
      raw.current.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      raw.current.y = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      place(e);
      // a passing hover only breathes on the field; the press stirs it
      if (!touch.current.down) touch.current.target = 0.3;
    };
    const onDown = (e: PointerEvent) => {
      touch.current.down = true;
      touch.current.target = 1;
      place(e);
    };
    const onUp = () => {
      touch.current.down = false;
      touch.current.target = 0;
    };
    // Hand the light back to its own drift when the pointer leaves the page.
    // Without this it would stay parked wherever the cursor last crossed.
    const onLeave = () => {
      spot.current.on = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;

    if (!reduce && assemble.current < 1) {
      assemble.current = Math.min(1, assemble.current + delta / 2.6);
    }

    shared.uTime.value = t;
    shared.uAssemble.value = assemble.current;
    shared.uScale.value = (size.height / 900) * Math.min(state.gl.getPixelRatio(), 2);
    shared.uSweep.value = reduce ? -8 : -3.0 + 6.0 * ((t % 7) / 7);

    // ── the dissolve cycle ───────────────────────────────────────────────
    // Hold, let go, hover, lock. The rest is deliberately the long part: the
    // face is what you are meant to be looking at, and the dissolve is what
    // happens to it — a portrait that spends most of its time apart is not a
    // portrait. Timed off the frame clock rather than an interval so it stays
    // in step with the light and the breathing.
    if (!reduce && assemble.current >= 1) {
      if (cycleStart.current < 0) cycleStart.current = t;
      const c = (t - cycleStart.current) % 10.4;
      let burst =
        c < 6.6 ? 0 : c < 7.9 ? (c - 6.6) / 1.3 : c < 8.4 ? 1 : c < 10.4 ? 1 - (c - 8.4) / 2.0 : 0;
      burst = burst * burst * (3 - 2 * burst);
      // Capped below one on purpose. At a full burst every point is gone and
      // the head reads as a brown nebula for a second and a half; held short
      // the wave sweeps through, most of the lattice lets go, and enough
      // pixels stay home that the face is still the face the whole time.
      shared.uBurst.value = burst * 0.52;
    } else {
      shared.uBurst.value = 0;
    }

    // The key drifts a few degrees on a slow cycle, so the sheen travels across
    // the brow and the cheek. The figure is nearly still; the light is not, and
    // it is the travel rather than the highlight that reads as a live object.
    if (!reduce) {
      const ka = Math.sin(t * 0.083) * 0.08;
      const ke = Math.sin(t * 0.061 + 1.7) * 0.055;
      (shared.uKeyDir.value as THREE.Vector3).set(-0.46 + ka, 0.52 + ke, 0.72).normalize();
    }

    // fit the sampled body to the frame, measured off the live camera so the
    // figure fills the same share of the hero on every screen
    const cam = state.camera as THREE.PerspectiveCamera;
    // one slow dolly on entrance: the figure starts a breath further away
    // and settles in. After that the camera never moves again.
    if (!reduce) {
      const k = Math.min(1, t / 3.2);
      const e = 1 - Math.pow(1 - k, 3);
      cam.position.z = 6 + 0.9 * (1 - e);
    }
    const worldH =
      2 * Math.abs(cam.position.z) * Math.tan(((cam.fov * Math.PI) / 180) / 2);
    const worldW = worldH * (size.width / Math.max(1, size.height));

    // Slightly larger than it was: the pool makes the face readable on
    // demand, so the figure can afford to sit closer and carry the hero
    // instead of being a texture at the edge of it.
    const fill = wide ? 0.84 : 0.62;
    g.scale.setScalar((worldH * fill) / CLOUD_HEIGHT);

    // composition: on wide screens the form holds the right half and rises
    // out of the floor; on a phone it stands under the copy and bleeds off
    // the bottom, so the face is never behind a paragraph.
    g.position.x = wide ? worldW * 0.235 : 0;
    g.position.y = wide ? -worldH * 0.12 : -worldH * 0.38;
    // a slow levitation over the composed position, so the entrance is not
    // the last time the figure ever moves vertically
    if (!reduce) g.position.y += Math.sin(t * 0.5) * 0.035;

    // touch: press to stir the field, release and it settles straight back.
    // Fast attack so the poke answers at once, slow release so the return
    // glides instead of snapping.
    const tc = touch.current;
    tc.str += (tc.target - tc.str) * (tc.target > tc.str ? 0.4 : 0.12);
    if (Math.abs(tc.str) < 0.001) tc.str = 0;
    (shared.uTouch.value as THREE.Vector3).set(tc.x, tc.y, reduce ? 0 : tc.str);

    // remember this frame's mapping so the next fingertip lands on the body
    view.current.ready = true;
    view.current.worldW = worldW;
    view.current.worldH = worldH;
    view.current.px = g.position.x;
    view.current.py = g.position.y;
    view.current.s = g.scale.x;

    // ── the pool ─────────────────────────────────────────────────────────
    // Two behaviours on one light. Before the pointer is used it drifts
    // slowly across the face, so the form is lit on arrival rather than
    // waiting to be discovered; once the pointer moves it hands over, and
    // when the pointer leaves the page it drifts again. The handover is
    // eased in both directions, so the light never jumps.
    const sp = spot.current;
    // Attention decays. He glances at the cursor while it is moving and then
    // returns to the lens, so a mouse parked on the right of the screen does
    // not leave the portrait permanently looking off-axis.
    const idleFor = (performance.now() - sp.last) / 1000;
    const engaged = reduce ? 0 : Math.max(0, Math.min(1, (4.2 - idleFor) / 1.1));
    sp.w += ((sp.on ? engaged : 0) - sp.w) * 0.055;
    const it = reduce ? 0 : t;
    const idleX = 0.16 + Math.sin(it * 0.23) * 0.24;
    const idleY = 1.32 + Math.cos(it * 0.19) * 0.15;
    const gx = sp.tx * sp.w + idleX * (1 - sp.w);
    const gy = sp.ty * sp.w + idleY * (1 - sp.w);
    sp.x += (gx - sp.x) * 0.085;
    sp.y += (gy - sp.y) * 0.085;
    sp.str += (0.34 + 0.66 * sp.w - sp.str) * 0.1;
    (shared.uSpot.value as THREE.Vector3).set(sp.x, sp.y, reduce ? 0.42 : sp.str);

    // The head answers first and further than the shoulders. Eased slower
    // than the lean so the neck, not the cursor, appears to drive it.
    const turnX = reduce ? 0 : raw.current.x * 0.18 * engaged;
    const turnY = reduce ? 0 : -raw.current.y * 0.075 * engaged;
    turn.current.x += (turnX - turn.current.x) * 0.06;
    turn.current.y += (turnY - turn.current.y) * 0.06;
    (shared.uTurn.value as THREE.Vector2).set(turn.current.x, turn.current.y);

    // Pointer lean, eased, over a slow idle sway. Lower than it was: the head
    // now carries most of the turn, and swinging the whole bust as well made
    // the figure look dragged rather than attentive. It decays with the same
    // attention clock, so the whole figure returns to pose, not just the head.
    const tx = reduce ? 0 : raw.current.x * engaged;
    const ty = reduce ? 0 : raw.current.y * engaged;
    lean.current.x += (tx - lean.current.x) * 0.05;
    lean.current.y += (ty - lean.current.y) * 0.05;

    g.rotation.y = lean.current.x * 0.24 + (reduce ? 0 : Math.sin(t * 0.21) * 0.05);
    g.rotation.x = -lean.current.y * 0.1;
    g.rotation.z = -lean.current.x * 0.028;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={glowMat} frustumCulled={false} renderOrder={0} />
      <points geometry={geometry} material={bodyMat} frustumCulled={false} renderOrder={1} />
    </group>
  );
}

/* Air around the form. Deterministic, so nothing shifts between renders. */
function Dust({ reduce }: { reduce: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 72;

  const { geometry, sprite } = useMemo(() => {
    const r = (i: number, k: number) => {
      const v = Math.sin((i + 1) * (k + 1) * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };

    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r(i, 1) - 0.5) * 10;
      pos[i * 3 + 1] = (r(i, 2) - 0.5) * 10;
      pos[i * 3 + 2] = (r(i, 3) - 0.5) * 6;
      const lemon = r(i, 4) > 0.72;
      col[i * 3] = lemon ? 0.85 : 0.96;
      col[i * 3 + 1] = lemon ? 1.0 : 0.95;
      col[i * 3 + 2] = lemon ? 0.35 : 0.9;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));

    // one soft round sprite, drawn once
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (ctx) {
      const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.35, "rgba(255,255,255,0.55)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;

    return { geometry: g, sprite: tex };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      sprite.dispose();
    },
    [geometry, sprite],
  );

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts || reduce) return;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const iy = i * 3 + 1;
      arr[iy] += delta * (0.08 + ((i % 7) * 0.03));
      if (arr[iy] > 5) arr[iy] = -5;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={sprite}
        size={0.052}
        sizeAttenuation
        transparent
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
        opacity={0.55}
      />
    </points>
  );
}

export interface DigitalHumanProps {
  /** A studio photograph on a bright neutral plate. */
  src: string;
  className?: string;
}

/**
 * DigitalHuman — the photograph, sampled into three dimensions.
 *
 * Not a model, not a render, not an effect over a picture: the body is
 * rebuilt from its own pixels with real depth, so it turns, breathes and
 * holds parallax like an object in the room. See `src/lib/digitalHuman.ts`
 * for how the points are measured.
 */
export function DigitalHuman({ src, className = "" }: DigitalHumanProps) {
  const reduce = !!useReducedMotion();
  const [cloud, setCloud] = useState<DigitalHumanCloud | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let webgl = false;
    try {
      const probe = document.createElement("canvas");
      webgl = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      webgl = false;
    }
    if (!webgl) return;

    let dead = false;
    buildDigitalHuman(src)
      .then((c) => {
        if (!dead) setCloud(c);
      })
      .catch(() => {
        /* hold the ambient glow if the plates cannot be keyed */
      });
    return () => {
      dead = true;
    };
  }, [src]);

  useEffect(() => {
    if (!cloud) return;
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, [cloud]);

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ opacity: shown ? 1 : 0, transition: "opacity 1.4s ease" }}
    >
      {/* The room the form stands in: a warm pool behind the head so the
          silhouette has something to be read against, a low bounce under the
          shoulders so the bust has ground rather than floating, and a vignette
          to close the frame onto the figure. Deliberately kept in the
          palette's own two tones — no lemon down here. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(36% 36% at 70% 32%, rgba(212,184,132,0.22) 0%, rgba(212,184,132,0.07) 44%, transparent 74%), radial-gradient(58% 32% at 66% 92%, rgba(158,122,86,0.16) 0%, transparent 74%), radial-gradient(122% 100% at 52% 46%, transparent 44%, rgba(5,5,6,0.5) 100%)",
        }}
      />

      {cloud && (
        <Canvas
          className="pointer-events-none"
          flat
          dpr={[1, 1.75]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 6], fov: 40, near: 0.1, far: 80 }}
        >
          <Cloud cloud={cloud} reduce={reduce} />
          <Dust reduce={reduce} />
        </Canvas>
      )}
    </div>
  );
}
