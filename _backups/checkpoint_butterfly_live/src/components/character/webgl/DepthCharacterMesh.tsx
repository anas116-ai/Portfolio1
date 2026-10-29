"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { createCharacterShaderMaterial } from "./CharacterShaderMaterial";

interface DepthCharacterMeshProps {
  diffuseSrc: string;
  depthSrc: string;
  normalSrc: string;
  mousePosition: React.MutableRefObject<{ x: number; y: number }>;
}

export function DepthCharacterMesh({
  diffuseSrc,
  depthSrc,
  normalSrc,
  mousePosition,
}: DepthCharacterMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load textures
  const [diffuseTex, depthTex, normalTex] = useLoader(
    THREE.TextureLoader,
    [diffuseSrc, depthSrc, normalSrc]
  );

  // Configure texture parameters
  useEffect(() => {
    [diffuseTex, depthTex, normalTex].forEach((tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
    });
  }, [diffuseTex, depthTex, normalTex]);

  // Create Shader Material
  const shaderMat = useMemo(() => {
    return createCharacterShaderMaterial(diffuseTex, depthTex, normalTex);
  }, [diffuseTex, depthTex, normalTex]);

  // Smooth rotation & position interpolation references
  const currentRotY = useRef(0);
  const currentRotX = useRef(0);
  const currentRotZ = useRef(0);
  const smoothedMouse = useRef(new THREE.Vector2(0, 0));

  useFrame(({ clock }) => {
    if (!meshRef.current || !shaderMat) return;

    const time = clock.getElapsedTime();
    shaderMat.uniforms.uTime.value = time;

    // Smooth mouse coordinates with physical damping
    const targetX = mousePosition.current.x;
    const targetY = mousePosition.current.y;
    smoothedMouse.current.x += (targetX - smoothedMouse.current.x) * 0.06;
    smoothedMouse.current.y += (targetY - smoothedMouse.current.y) * 0.06;

    shaderMat.uniforms.uMouse.value.copy(smoothedMouse.current);

    // Dynamic key light responds subtly to cursor
    shaderMat.uniforms.uLightPosition.value.set(
      smoothedMouse.current.x * 2.0 + 1.2,
      smoothedMouse.current.y * 1.5 + 2.2,
      3.0
    );

    // Natural 2.5D Parallax Angular Rotation (calm, subtle, dignified):
    // Yaw: subtle ~7 degree rotation towards cursor
    const targetRotY = smoothedMouse.current.x * 0.13;
    // Pitch: gentle ~3.5 degree nod
    const targetRotX = -smoothedMouse.current.y * 0.07;
    // Roll: very slight cervical ease
    const targetRotZ = -smoothedMouse.current.x * 0.02;

    currentRotY.current += (targetRotY - currentRotY.current) * 0.05;
    currentRotX.current += (targetRotX - currentRotX.current) * 0.05;
    currentRotZ.current += (targetRotZ - currentRotZ.current) * 0.05;

    meshRef.current.rotation.y = currentRotY.current;
    meshRef.current.rotation.x = currentRotX.current;
    meshRef.current.rotation.z = currentRotZ.current;

    // Organic Respiration Baseline (gentle, calm)
    const BASE_Y = -0.05;
    meshRef.current.position.y = BASE_Y + Math.sin(time * 1.1) * 0.007;
    meshRef.current.position.x = smoothedMouse.current.x * 0.008;
  });

  return (
    <mesh ref={meshRef} position={[0, -0.05, 0]} scale={[0.81, 0.81, 0.81]} castShadow receiveShadow>
      <planeGeometry args={[3.2, 4.28, 128, 128]} />
      <primitive object={shaderMat} attach="material" />
    </mesh>
  );
}
