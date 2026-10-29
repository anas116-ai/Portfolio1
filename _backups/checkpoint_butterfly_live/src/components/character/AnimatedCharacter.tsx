"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

export interface AnimatedCharacterProps {
  className?: string;
  posterSrc?: string;
  videoSrc?: string;
  videoWebm?: string;
  videoMobile?: string;
}

/**
 * AnimatedCharacter
 * 
 * Cinematic animated figure of Mastan Vali with monarch butterflies.
 * Blends into the obsidian (#070807) stage with soft radial vignette
 * masks, subtle interactive 3D pointer parallax, and battery-friendly
 * viewport observation.
 */
export function AnimatedCharacter({
  className = "",
  posterSrc = "/assets/character/butterfly-portrait-poster.webp",
  videoSrc = "/assets/character/butterfly-portrait.mp4",
  videoWebm = "/assets/character/butterfly-portrait.webm",
  videoMobile = "/assets/character/butterfly-portrait-720p.mp4",
}: AnimatedCharacterProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Mouse interactive tilt coordinates (smoothed via requestAnimationFrame)
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  // Ensure autoplay on mount with error handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const startPlayback = async () => {
      try {
        video.muted = true;
        await video.play();
        setIsPlaying(true);
      } catch {
        // Fallback: waiting for user interaction or low power mode
        setIsPlaying(false);
      }
    };

    startPlayback();
  }, [prefersReducedMotion]);

  // Pause when scrolled out of view to preserve GPU & CPU cycles
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (!video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        } else {
          if (!prefersReducedMotion) {
            video.play().catch(() => {});
            setIsPlaying(true);
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Subtle interactive parallax based on mouse position
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (prefersReducedMotion) return;
    const { innerWidth, innerHeight } = window;
    // Normalized [-1, 1] from center
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    const ny = (e.clientY / innerHeight - 0.5) * 2;
    mouseTarget.current = { x: nx, y: ny };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animateLoop = () => {
      // Smooth dampening
      mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, 0.05);
      mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, 0.05);

      const rotY = mouseCurrent.current.x * 2.8;   // degrees
      const rotX = -mouseCurrent.current.y * 2.0;  // degrees
      const transX = mouseCurrent.current.x * 9.0; // px
      const transY = mouseCurrent.current.y * 6.0; // px

      setTiltStyle({
        transform: `perspective(1200px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0)`,
        transition: "transform 0.1s ease-out",
      });

      rafId = requestAnimationFrame(animateLoop);
    };

    rafId = requestAnimationFrame(animateLoop);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [handleMouseMove, prefersReducedMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── 1. Ambient Warm Halo & Butterfly Light Wash behind the character ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Soft amber-brass aura focused around head and shoulders on the right */}
        <div
          className="absolute right-[8%] sm:right-[14%] top-[12%] sm:top-[16%] w-[420px] sm:w-[620px] h-[420px] sm:h-[620px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(217, 255, 0, 0.035) 0%, rgba(197, 170, 122, 0.03) 42%, transparent 74%)",
            filter: "blur(40px)",
          }}
        />
        {/* Floor bounce to ground the figure */}
        <div
          className="absolute right-[5%] sm:right-[12%] bottom-[-5%] w-[500px] sm:w-[700px] h-[320px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(197, 170, 122, 0.035) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── 2. The Figure Container with 3D Micro-Parallax & Feathered Radial Mask ── */}
      <div
        className="relative w-full h-full flex items-center justify-center lg:justify-end z-10"
        style={tiltStyle}
      >
        <div
          className="relative w-full h-full max-w-[1920px] mx-auto flex items-center justify-center lg:justify-end"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 72% at 58% 46%, black 42%, rgba(0,0,0,0.75) 64%, transparent 95%)",
            maskImage:
              "radial-gradient(ellipse 75% 72% at 58% 46%, black 42%, rgba(0,0,0,0.75) 64%, transparent 95%)",
          }}
        >
          {/* Static high-res poster (fades out as video streams in) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterSrc}
            alt="Mastan Vali with monarch butterflies"
            className={`absolute top-0 right-0 h-full w-full object-cover lg:object-contain translate-y-[8%] lg:translate-y-0 lg:translate-x-[16%] xl:translate-x-[20%] pointer-events-none transition-opacity duration-1000 ease-out ${
              isLoaded ? "opacity-0" : "opacity-90"
            }`}
            style={{
              objectPosition: "70% 38%",
            }}
          />

          {/* Cinematic Autoplay Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={posterSrc}
            onLoadedData={() => setIsLoaded(true)}
            onCanPlay={() => setIsLoaded(true)}
            className={`h-full w-full object-cover lg:object-contain translate-y-[8%] lg:translate-y-0 lg:translate-x-[16%] xl:translate-x-[20%] pointer-events-none transition-opacity duration-1000 ease-out ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              objectPosition: "70% 38%",
              filter: "contrast(1.03) brightness(0.98)",
            }}
          >
            <source src={videoWebm} type="video/webm" />
            <source src={videoSrc} type="video/mp4" media="(min-width: 768px)" />
            <source src={videoMobile} type="video/mp4" />
          </video>

          {/* ── 3. Edge Blending Fades into Obsidian (#070807) ── */}
          {/* Mobile top readability scrim: keeps typography completely pristine on phone screens */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to bottom, rgba(7, 8, 7, 0.88) 0%, rgba(7, 8, 7, 0.72) 35%, rgba(7, 8, 7, 0.25) 60%, rgba(7, 8, 7, 0.92) 100%)",
            }}
          />

          {/* Left edge fade: guarantees text copy on the left is 100% crisp and readable */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute inset-y-0 left-0 w-[42%] pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #070807 0%, rgba(7, 8, 7, 0.95) 40%, rgba(7, 8, 7, 0.5) 75%, transparent 100%)",
            }}
          />

          {/* Bottom fade: seamlessly grounds the torso into the floor */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-32 sm:h-44 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, #070807 0%, rgba(7, 8, 7, 0.85) 35%, transparent 100%)",
            }}
          />

          {/* Top fade: blends into masthead navigation */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 sm:h-32 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, #070807 0%, rgba(7, 8, 7, 0.5) 40%, transparent 100%)",
            }}
          />

          {/* Right edge fade: softens right frame edge */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-20 sm:w-36 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, #070807 0%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* ── 4. Elegant HUD Status Pill (matching portfolio design system) ── */}
      <div className="pointer-events-auto absolute bottom-6 right-6 sm:bottom-8 sm:right-10 z-20 hidden md:flex items-center gap-3">
        <button
          onClick={togglePlayback}
          type="button"
          aria-label={isPlaying ? "Pause figure animation" : "Play figure animation"}
          className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[rgba(244,245,239,0.12)] bg-[#070807]/75 backdrop-blur-md text-[11px] font-[family-name:var(--font-geist-mono)] text-[#C8CAC2] hover:text-[#F4F5EF] hover:border-[rgba(217,255,0,0.35)] transition-all duration-300"
        >
          <span className="relative flex h-2 w-2">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9FF00] opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPlaying ? "bg-[#D9FF00]" : "bg-[#6A6A66]"
              }`}
            />
          </span>
          <span className="tracking-[0.08em] uppercase text-[10px]">
            {isPlaying ? "Live Figure · 24fps" : "Paused"}
          </span>
        </button>
      </div>
    </div>
  );
}
