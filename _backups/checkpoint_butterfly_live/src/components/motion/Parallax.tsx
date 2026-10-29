"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ParallaxProps {
  children?: ReactNode;
  className?: string;
  /**
   * Total vertical travel in px across the element's full pass through the
   * viewport. Positive means the element trails the scroll (reads as far
   * back); negative means it leads (reads as near). Keep it small: this is
   * depth, not a slide.
   */
  speed?: number;
}

/**
 * Parallax — one scroll-linked plane. As the element crosses the viewport it
 * drifts against the scroll by `speed`, so two planes at different speeds
 * separate and the page gains real depth. Transform only, so the rasterizer
 * never re-lays-out. Reduced motion holds the plane still.
 */
export function Parallax({ children, className, speed = 60 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}
