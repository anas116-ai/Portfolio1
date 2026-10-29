"use client";

import { HeroSection } from "@/components/creator/HeroSection";
import { MarqueeSection } from "@/components/creator/MarqueeSection";
import { AboutSection } from "@/components/creator/AboutSection";
import { ExperienceSection } from "@/components/creator/ExperienceSection";
import { SkillsSection } from "@/components/creator/SkillsSection";
import { ProjectsSection } from "@/components/creator/ProjectsSection";
import { FinalSection } from "@/components/creator/FinalSection";
import { AmbientBackgroundLayers } from "@/components/creator/AmbientBackgroundLayers";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { LuxuryMagneticCursor } from "@/components/motion/LuxuryMagneticCursor";
import { PointerSpotlight } from "@/components/motion/PointerSpotlight";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <div
        className="relative bg-[#070807] min-h-screen text-[#F4F5EF] antialiased selection:bg-white/20 selection:text-[#F4F5EF]"
        id="top"
      >
        {/* Luxury Fluid Magnetic Cursor */}
        <LuxuryMagneticCursor />

        {/* Pointer light pool + touch ring (drives spotlight CSS) */}
        <PointerSpotlight />

        {/* Top Scroll Progress Indicator */}
        <ScrollProgressBar />

        {/* Skip to content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#F4F5EF] focus:text-[#070807] focus:text-xs focus:font-medium focus:tracking-[0.16em] focus:uppercase focus:outline-none"
        >
          Skip to content
        </a>

        {/* Ambient background architecture */}
        <AmbientBackgroundLayers />

        {/* Corner vignette framing the composition */}
        <div
          className="fixed inset-0 pointer-events-none z-[50]"
          style={{
            background:
              "radial-gradient(150% 118% at 50% 38%, transparent 66%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* 01. Masthead */}
        <SiteHeader />

        {/* The single main landmark every reader navigates by */}
        <main id="main-content">
          {/* 02. Hero Section */}
          <HeroSection />

          {/* 03. Scroll-synchronised technology marquee */}
          <MarqueeSection />

          {/* 04. About: three live capability ponds */}
          <AboutSection />

          {/* 05. Verified enterprise experience */}
          <ExperienceSection />

          {/* 06. Core engineering disciplines */}
          <SkillsSection />

          {/* 07. Selected engineering work */}
          <ProjectsSection />
        </main>

        {/* 08. Contact and site footer */}
        <FinalSection />
      </div>
    </SmoothScrollProvider>
  );
}
