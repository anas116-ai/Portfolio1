"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { LightPortrait } from "@/components/character/LightPortrait";

/**
 * HeroCharacterStage — the portfolio's lead portrait.
 *
 * Not a render and not a rig: a real studio photograph with its background
 * keyed away, standing on obsidian. It is never still. The plate drifts on a
 * slow dolly, sways on its axis and breathes; a studio light crosses the face
 * once per cycle; a halftone wave travels over the figure; light motes lift
 * in front of it; and the whole frame leans against the pointer. Scroll adds
 * a slow settle as it leaves the viewport.
 */
export function HeroCharacterStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const driftY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const driftO = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.82]);

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { y: driftY, opacity: driftO }}
      className="relative w-full select-none"
    >
      {/* Plate mark — a hairline column carrying the figure's own reference,
          the way a print room labels a proof. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[14%] hidden lg:flex flex-col items-center gap-4"
      >
        <span className="h-14 w-px bg-[rgba(244,245,239,0.16)]" />
        <span
          className="font-[family-name:var(--font-geist-mono)] text-[9.5px] uppercase tracking-[0.34em] text-[#6A6A66]"
          style={{ writingMode: "vertical-rl" }}
        >
          Fig. 01 · Mastan Vali
        </span>
        <span className="h-14 w-px bg-[rgba(244,245,239,0.16)]" />
      </div>

      <FadeIn y={26} delay={0.3} duration={1.1} className="relative z-10 w-full">
        <div className="relative mx-auto w-full max-w-[720px] lg:translate-x-[8%] xl:translate-x-[12%]">
          <LightPortrait
            src="/images/me/me-4.png"
            alt="Mastan Vali, photographed in half-light with a warm key across the face and a cool rim behind"
            className="mx-auto h-[clamp(460px,84vh,820px)] max-w-full"
            parallax={22}
            eager
          />
        </div>
      </FadeIn>
    </motion.div>
  );
}
