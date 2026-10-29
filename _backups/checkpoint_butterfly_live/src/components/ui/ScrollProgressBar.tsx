"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-px bg-[rgba(244,245,239,0.07)] pointer-events-none">
      <motion.div
        className="h-full origin-left bg-[linear-gradient(90deg,rgba(217,255,0,0.85)_0%,#E8FF45_55%,rgba(217,255,0,0.85)_100%)]"
        style={{ scaleX }}
      />
    </div>
  );
}
