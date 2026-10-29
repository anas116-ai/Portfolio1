"use client";

import React, { useState, useEffect } from "react";
import {
  VolumetricAuroraGlass,
  ThreeUISimplexCurl,
  ArchitecturalMatrixBeams,
  GenerativeAmbientTree,
  QuantumTensorFluid,
  CelestialGravityMotes,
  NeuralSynapseMesh,
  ObsidianIsometricHorizon,
  type BackgroundMode,
} from "@/components/studio/BackgroundEngines";
import { HeroSection } from "@/components/creator/HeroSection";
import { MarqueeSection } from "@/components/creator/MarqueeSection";
import { AboutSection } from "@/components/creator/AboutSection";
import { SiteHeader } from "@/components/navigation/SiteHeader";

const MODES: { id: BackgroundMode; name: string; tag: string; desc: string }[] = [
  {
    id: "aurora",
    name: "01. Volumetric Aurora Glass",
    tag: "Aura / Stripe",
    desc: "Ethereal translucent glass wave curtains with soft lemon crests",
  },
  {
    id: "flowfield",
    name: "02. ThreeUI Simplex Curl Rivers",
    tag: "3D Particle Dynamics",
    desc: "350+ golden amber & lemon celestial dust streams drifting through space",
  },
  {
    id: "matrix",
    name: "03. Architectural Matrix & Laser Beams",
    tag: "Linear / Coordinate",
    desc: "Milled dot-matrix coordinates with horizontal pulse beams",
  },
  {
    id: "tree",
    name: "04. Ambient Generative Data Tree",
    tag: "Botanical Synthesis",
    desc: "Subtle golden L-system tree swaying behind character shedding pollen motes",
  },
  {
    id: "caustics",
    name: "05. Quantum Tensor Fluid Waves",
    tag: "Deep Tech Agentic",
    desc: "Refractive tensor fluid echoing the Zen Koi Pond caustics",
  },
  {
    id: "celestial",
    name: "06. Celestial Gravity Motes",
    tag: "Cosmic Particles",
    desc: "240 twinkling starlight dust motes drifting across the viewport",
  },
  {
    id: "synapse",
    name: "07. Neural Synapse Mesh",
    tag: "LLM Agent Graph",
    desc: "Interconnected neural synapse nodes transmitting glowing data pulses",
  },
  {
    id: "isometric",
    name: "08. Obsidian Isometric Horizon",
    tag: "3D Spatial Grid",
    desc: "Deep 3D perspective grid receding into a glowing neon lemon horizon",
  },
];

export default function BackgroundStudioPage() {
  const [activeMode, setActiveMode] = useState<BackgroundMode>("aurora");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("mode") as BackgroundMode;
      if (p && MODES.some((m) => m.id === p)) {
        setActiveMode(p);
      }
    }
  }, []);

  const selectMode = (mId: BackgroundMode) => {
    setActiveMode(mId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", mId);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070807] text-[#F4F5EF] overflow-x-hidden selection:bg-white/20 select-none">
      {/* Active Atmospheric Background */}
      {activeMode === "aurora" && <VolumetricAuroraGlass />}
      {activeMode === "flowfield" && <ThreeUISimplexCurl />}
      {activeMode === "matrix" && <ArchitecturalMatrixBeams />}
      {activeMode === "tree" && <GenerativeAmbientTree />}
      {activeMode === "caustics" && <QuantumTensorFluid />}
      {activeMode === "celestial" && <CelestialGravityMotes />}
      {activeMode === "synapse" && <NeuralSynapseMesh />}
      {activeMode === "isometric" && <ObsidianIsometricHorizon />}

      {/* Actual Website Navigation & Sections */}
      <SiteHeader />
      <main id="main-content" className="relative z-10 pb-36">
        <HeroSection />
        <MarqueeSection />
        <AboutSection />
      </main>

      {/* Floating Studio Control Dock */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex flex-col items-center pointer-events-none px-4">
        <div className="pointer-events-auto bg-[rgba(10,13,10,0.85)] backdrop-blur-[24px] border border-[rgba(244,245,239,0.16)] rounded-2xl p-2 sm:p-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.8)] max-w-4xl w-full flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D9FF00] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#C5AA7A] font-semibold">
                Live Background Studio · Real Portfolio Layout
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#8C8C86]">
              {MODES.find((m) => m.id === activeMode)?.desc}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
            {MODES.map((m) => {
              const active = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => selectMode(m.id)}
                  type="button"
                  className={`text-left px-3 py-2 rounded-xl transition-all duration-300 border ${
                    active
                      ? "bg-[#D9FF00]/15 border-[#D9FF00] text-[#D9FF00]"
                      : "bg-white/[0.03] border-white/[0.06] text-[#A2A49B] hover:text-[#FFFFFF] hover:border-white/[0.18]"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider opacity-75">{m.tag}</div>
                  <div className="text-[12px] font-semibold truncate mt-0.5">{m.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
