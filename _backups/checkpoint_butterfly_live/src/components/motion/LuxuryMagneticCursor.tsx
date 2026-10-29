"use client";

import { useEffect, useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  strong: boolean;
  delay: number;
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

    const spawn = (x: number, y: number, strong: boolean) => {
      // Click bursts two staggered rings; trail emits single rings.
      const parts = strong ? [0, 1] : [0];
      for (const d of parts) {
        const id = ++idRef.current;
        const delay = d * 130;
        window.setTimeout(() => {
          setRipples((prev) => [...prev.slice(-13), { id, x, y, strong, delay: 0 }]);
          window.setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
          }, 1050);
        }, delay);
      }
    };

    const pushTrail = (x: number, y: number) => {
      const now = performance.now();
      if (now - lastRippleRef.current < 90) return;
      lastRippleRef.current = now;
      spawn(x, y, false);
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

      if (Math.hypot(mouseX - prevX, mouseY - prevY) > 5) {
        pushTrail(mouseX, mouseY);
      }
    };

    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      mouseX = t.clientX;
      mouseY = t.clientY;
      if (!isVisible) setIsVisible(true);
      pushTrail(mouseX, mouseY);
    };

    const handleClick = (e: MouseEvent) => {
      spawn(e.clientX, e.clientY, true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("mousedown", handleClick, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Smooth inertia lerp locked right at the cursor position (no offset drift)
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouch);
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
          key={`${r.id}-${r.delay}`}
          className="cursor-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: r.strong ? 72 : 44,
            height: r.strong ? 72 : 44,
            borderWidth: r.strong ? 1.5 : 1,
            borderColor: r.strong
              ? "rgba(232,255,69,0.6)"
              : "rgba(244,245,239,0.5)",
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
            ? "-ml-6 -mt-6 h-12 w-12 border border-[#E8FF45]/60 bg-transparent"
            : "-ml-4 -mt-4 h-8 w-8 border border-white/35 bg-transparent"
        }`}
      />
    </div>
  );
}
