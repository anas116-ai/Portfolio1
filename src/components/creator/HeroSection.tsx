"use client";

import { useState } from "react";
import { FadeIn } from "./FadeIn";
import { ArrowDown } from "lucide-react";

import { ShaderIgnitionButton } from "@/components/ui/ShaderIgnitionButton";
import { TextAnimationCollection } from "./TextAnimationCollection";
import { EditorialPortrait } from "./EditorialPortrait";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] w-full bg-transparent"
    >
      <div className="relative flex min-h-[100dvh] w-full flex-col justify-center overflow-hidden px-5 pb-14 pt-20 sm:px-8 sm:pb-16 sm:pt-24 md:px-12 lg:px-16">
        {/* Stage lighting — key, fill, floor */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* Key — lemon, locked to the character side */}
          <div className="absolute right-[-10%] sm:right-[2%] lg:right-[6%] top-[14%] sm:top-[20%] w-[520px] sm:w-[660px] h-[520px] sm:h-[660px] bg-[radial-gradient(circle,rgba(217,255,0,0.075)_0%,transparent_70%)]" />
          {/* Fill — a bone wash behind the copy so the type sits in light, not on black */}
          <div className="absolute left-[-14%] sm:left-[-2%] top-[8%] sm:top-[14%] w-[480px] sm:w-[600px] h-[480px] sm:h-[600px] bg-[radial-gradient(circle,rgba(244,245,239,0.05)_0%,transparent_72%)]" />
          {/* Floor — a low lemon wash grounding the whole frame */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8%] w-[780px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(217,255,0,0.06)_0%,transparent_72%)]" />
        </div>

        {/* Hero composition */}
        <div className="relative z-20 my-auto w-full max-w-7xl mx-auto">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 lg:gap-10 items-center py-4 sm:py-6">
            <div className="lg:col-span-7 flex flex-col items-start justify-center space-y-3 sm:space-y-5 lg:space-y-7 z-20 py-2">
              {/* Top eyebrow — completely clean, unboxed text (NO boxes, NO pills) */}
              <FadeIn y={12} delay={0.1} duration={0.7} className="w-full">
                <div className="flex items-center gap-3 eyebrow" style={{ color: "#C5AA7A" }}>
                  <span aria-hidden="true" className="h-px w-7 shrink-0 bg-[rgba(197,170,122,0.55)]" />
                  <span>// PORTFOLIO · ENTERPRISE DATA · PRODUCTS</span>
                </div>
              </FadeIn>

              {/* Signature wordmark — clean, no background box */}
              <FadeIn y={22} delay={0.16} duration={0.8}>
                <div className="relative inline-block select-none group max-w-full">
                  <h1
                    className="font-warpaint inline-block max-w-full whitespace-nowrap text-[clamp(2.25rem,9.8vw,8.75rem)] tracking-[0.07em] uppercase select-none leading-[0.95]"
                    style={{
                      WebkitFontSmoothing: "antialiased",
                      textRendering: "geometricPrecision",
                    }}
                  >
                    <TextAnimationCollection variant="threeui-intro" mode="dark" text="MASTAN VALI" loop cycleMs={8000} />
                  </h1>
                </div>
              </FadeIn>

              {/* Discipline line — single clean lemon line */}
              <FadeIn y={16} delay={0.25} duration={0.7}>
                <div className="flex items-center gap-x-3 text-[13px] sm:text-[15px] md:text-[17px] font-[family-name:var(--font-geist-sans)] font-medium tracking-[-0.01em] text-[#F4F5EF]">
                  <span aria-hidden="true" className="h-px w-6 shrink-0 bg-[#D9FF00]" />
                  <span>Data & Technology Professional</span>
                </div>
              </FadeIn>

              {/* Narrative */}
              <FadeIn y={16} delay={0.35} duration={0.8}>
                <div className="max-w-2xl">
                  <p className="text-balance text-[#C8CAC2] text-[13px] sm:text-[15px] leading-[1.75] font-[family-name:var(--font-geist-sans)] font-normal">
                    Experienced in SAP BODS development, ETL processes, and enterprise production
                    support, with a portfolio of digital applications spanning pharmacy management,
                    workflow automation, and AI-powered document verification, built using LLMs and
                    AI coding agents.
                  </p>
                </div>
              </FadeIn>

              {/* Actions */}
              <FadeIn y={16} delay={0.45} duration={0.8} className="space-y-10 w-full">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 w-full">
                  <ShaderIgnitionButton
                    variant="lemon"
                    href="#projects"
                    ariaLabel="Explore Work, view projects"
                    icon={<ArrowDown size={14} className="stroke-[2.6]" />}
                    iconPosition="right"
                    size="md"
                  >
                    Explore Work
                  </ShaderIgnitionButton>

                  <ShaderIgnitionButton
                    variant="lemonHi"
                    href="#contact"
                    ariaLabel="Contact Me, send a note to Mastan Vali"
                    size="md"
                  >
                    Contact Me
                  </ShaderIgnitionButton>
                </div>

                {/* Availability sits directly beneath the primary actions */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-[family-name:var(--font-geist-sans)] text-[#F4F5EF]">
                  <span>Immediate joiner</span>
                  <span className="text-[#43433F] select-none">/</span>
                  <span>Open to relocation</span>
                  <span className="text-[#43433F] select-none">/</span>
                  <span className="inline-flex items-center gap-2 text-[#E8FF45]">
                    <span className="relative flex h-[7px] w-[7px]" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8FF45] opacity-60" />
                      <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#E8FF45]" />
                    </span>
                    Available for hire
                  </span>
                </div>
              </FadeIn>
            </div>

            {/* Portrait stage — editorial still + static ledger, no WebGL rig */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-end relative">
              <div className="relative z-10 w-full sm:w-[320px] md:w-[350px] lg:w-[380px] xl:w-[400px]">
                {/* Floor light — pure lemon pool grounding the frame */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 -bottom-5 z-0 h-[64px] w-[300px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(217,255,0,0.14)_0%,transparent_70%)] blur-[24px]"
                />
                <EditorialPortrait className="relative z-10" />
                {/* Static capability ledger — replaces floating skill pills */}
                <div className="relative z-10 mt-4 grid w-full grid-cols-2 gap-4 border-t border-[rgba(244,245,239,0.09)] pt-3 font-[family-name:var(--font-geist-mono)] text-[10.5px] leading-[1.8] tracking-[0.04em] text-[#7D8178]">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[#C5AA7A]">Enterprise</div>
                    SAP BODS / BW / SQL / S/4HANA
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[#C5AA7A]">Agentic</div>
                    LLMs / RAG / MCP / Python
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-30 flex justify-center">
          <a
            href="#about"
            aria-label="Scroll to the next section"
            className="group pointer-events-auto inline-flex select-none items-center gap-3 focus:outline-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-normal uppercase tracking-[0.42em] text-[#6A6A66] transition-colors duration-500 group-hover:text-[#7D8178]">
              Scroll
            </span>
            <span
              aria-hidden="true"
              className="relative block h-px w-16 overflow-hidden bg-[rgba(244,245,239,0.14)]"
            >
              <span
                className="absolute inset-y-0 left-0 w-full origin-left bg-[#D9FF00]"
                style={{ animation: "cue-hfill 3.4s cubic-bezier(0.165,0.84,0.44,1) infinite" }}
              />
              <span
                className="absolute inset-y-0 left-0 w-4 bg-[linear-gradient(to_right,transparent,rgba(217,255,0,0.9),transparent)]"
                style={{ animation: "cue-htravel 3.4s cubic-bezier(0.44,0,0.56,1) infinite" }}
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
