"use client";

import { useEffect, useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  strong: boolean;
}

export function LuxuryMagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);
  const lastRippleRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animationFrameId: number;

    const pushRipple = (x: number, y: number, strong: boolean) => {
      const now = performance.now();
      if (!strong && now - lastRippleRef.current < 110) return;
      // ponytail: throttle trail ripples, clicks always pass
      if (!strong && Math.hypot(x - mouseX, y - mouseY) < 2) return;
      lastRippleRef.current = now;
      const id = ++idRef.current;
      setRipples((prev) => [...prev.slice(-11), { id, x, y, strong }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 950);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const prevX = mouseX;
      const prevY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          "button, a, input, select, textarea, [data-interactive], [role='button'], .cursor-pointer"
        );
        setIsHovering(!!interactive);
      }

      // Water trail — crystal ripple every ~110ms while moving
      if (Math.hypot(mouseX - prevX, mouseY - prevY) > 6) {
        pushRipple(mouseX, mouseY, false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      pushRipple(e.clientX, e.clientY, true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleClick, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Smooth inertia lerp locked right at the cursor position (no offset drift)
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleClick);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999] overflow-hidden transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Water ripples — finger-on-water rings, crystal hairlines */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="cursor-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: r.strong ? 56 : 34,
            height: r.strong ? 56 : 34,
            borderColor: r.strong
              ? "rgba(232,255,69,0.55)"
              : "rgba(244,245,239,0.38)",
          }}
        />
      ))}

      {/* Precision Micro Dot — flat, no glow */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#E8FF45] will-change-transform"
      />

      {/* Hairline Inertia Ring — crystal, no blur/glow */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 will-change-transform rounded-full transition-all duration-200 ease-out ${
          isHovering
            ? "-ml-5 -mt-5 h-10 w-10 border border-[#E8FF45]/50 bg-transparent"
            : "-ml-3.5 -mt-3.5 h-7 w-7 border border-white/30 bg-transparent"
        }`}
      />
    </div>
  );
}
