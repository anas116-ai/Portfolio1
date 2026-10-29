"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  /** Optional entrance depth in degrees: the subject tips forward out of the
   *  page plane and settles. Off by default so protected surfaces stay flat. */
  depth?: number;
  className?: string;
}

/**
 * The single reveal primitive used across every section.
 *
 * Travel is long and arrival is slow, which is what separates a considered
 * entrance from a slide. The easing is the front-loaded curve measured off
 * Linear's production timing: it covers most of the distance in the first
 * third and then settles without ever accelerating again. That last part is
 * the luxury signal. Nothing overshoots, nothing bounces, nothing is abrupt.
 */
const EASE = [0.165, 0.84, 0.44, 1] as const;

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  y = 40,
  x = 0,
  depth = 0,
  className,
}: FadeInProps) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={depth && !reduceMotion ? { transformPerspective: 1100 } : undefined}
      initial={reduceMotion ? false : { opacity: 0, y, x, rotateX: depth }}
      whileInView={{ opacity: 1, y: 0, x: 0, rotateX: 0 }}
      /* Fires slightly before the subject reaches the fold so the element is
         already settled by the time it is read, never mid arrival. */
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={reduceMotion ? { duration: 0 } : {
        type: "tween",
        duration,
        ease: EASE,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}