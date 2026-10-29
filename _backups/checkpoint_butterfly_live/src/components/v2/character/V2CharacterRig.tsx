"use client";

import React, { useRef, Suspense, useState, useEffect, Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { DepthCharacterMesh } from "@/components/character/webgl/DepthCharacterMesh";
import { GroundShadow3D } from "@/components/character/webgl/GroundShadow3D";
import Image from "next/image";

function webglAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class RigBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

interface V2CharacterRigProps {
  className?: string;
}

export function V2CharacterRig({ className = "" }: V2CharacterRigProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const [webglSupported, setWebglSupported] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!webglAvailable()) setWebglSupported(false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Track normalized pointer coordinates (-1 to 1). Mouse + touch share one path
  // so the figure feels alive on phones as well as desktops.
  useEffect(() => {
    const setFromClient = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (clientX - centerX) / (rect.width / 2);
      const normY = -(clientY - centerY) / (rect.height / 2);

      mousePosition.current.x = Math.max(-1, Math.min(1, normX));
      mousePosition.current.y = Math.max(-1, Math.min(1, normY));
    };

    const handleMouseMove = (e: MouseEvent) => setFromClient(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setFromClient(t.clientX, t.clientY);
    };
    const handleTouchEnd = () => {
      mousePosition.current.x = 0;
      mousePosition.current.y = 0;
    };

    const handleMouseLeave = () => {
      mousePosition.current.x = 0;
      mousePosition.current.y = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[420px] sm:h-[460px] md:h-[490px] lg:h-[520px] flex items-end justify-center select-none ${className}`}
    >
      {/* 1. TRUE 3D WEBGL ENGINE */}
      {webglSupported && (
        <>
          <div
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
              sceneReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <RigBoundary>
              <Canvas
                camera={{ position: [0, -0.02, 5.35], fov: 38 }}
                dpr={isMobile ? 1 : [1, 2]}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: "high-performance",
                }}
                className="w-full h-full pointer-events-auto"
                onCreated={() => setSceneReady(true)}
              >
                {/* Clean Neutral Studio Lights */}
                <ambientLight intensity={1.05} />
                <directionalLight position={[0, 3.0, 4.0]} intensity={0.85} color="#FFFFFF" />

                <Suspense fallback={null}>
                  <DepthCharacterMesh
                    diffuseSrc="/images/avatar/style_01_4k_transparent.png"
                    depthSrc="/images/avatar/style_01_depth.png"
                    normalSrc="/images/avatar/style_01_normal.png"
                    mousePosition={mousePosition}
                  />

                  <GroundShadow3D mousePosition={mousePosition} />
                </Suspense>
              </Canvas>
            </RigBoundary>
          </div>
        </>
      )}

      {/* Static fallback when WebGL is unavailable or crashes */}
      {!webglSupported && (
        <Image
          src="/images/avatar/style_01_4k_transparent.png"
          alt="Mastan Vali - Haute-Tech Laptop & Code"
          fill
          priority
          className="absolute inset-0 object-contain object-bottom select-none pointer-events-none"
          draggable={false}
          sizes="520px"
        />
      )}
    </div>
  );
}
