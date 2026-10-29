"use client";

import React, { useState, useEffect } from "react";
import { OrganicRootsEngine, type RootConceptMode } from "@/components/studio/OrganicRootsEngine";
import { HeroSection } from "@/components/creator/HeroSection";
import { SiteHeader } from "@/components/navigation/SiteHeader";

const ROOT_CONCEPTS: { id: RootConceptMode; title: string; tag: string; desc: string }[] = [
  {
    id: "dense_lichen",
    title: "01. Dense Lichen Root Sanctuary",
    tag: "Closest to Reference",
    desc: "Weathered dark roots creeping along floor & left flank with lemon lichen; clean obsidian space behind character (no smoke)",
  },
  {
    id: "slender_bonsai",
    title: "02. Slender Bonsai Creepers",
    tag: "Minimalist Bio-Tech",
    desc: "Delicate ancient bonsai vines weaving subtly beneath the typography; spacious matte black character backdrop",
  },
  {
    id: "corner_buttress",
    title: "03. Corner Buttress Grounding",
    tag: "Architectural Organic",
    desc: "Strong anchored root trunk in the bottom-left corner with moss pads; pure studio spotlighting on 3D character",
  },
  {
    id: "moss_arch",
    title: "04. Flowing Moss Arch Floor",
    tag: "Curved Horizon",
    desc: "Low sinuous root arch grounding the bottom margin with vibrant lichen crests; zero haze, zero floating symbols",
  },
];

export default function RootConceptsPage() {
  const [activeConcept, setActiveConcept] = useState<RootConceptMode>("dense_lichen");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("concept") as RootConceptMode;
      if (p && ROOT_CONCEPTS.some((c) => c.id === p)) {
        setActiveConcept(p);
      }
    }
  }, []);

  const selectConcept = (cId: RootConceptMode) => {
    setActiveConcept(cId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("concept", cId);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070807] text-[#F4F5EF] overflow-x-hidden selection:bg-white/20 select-none">
      {/* 1. Procedural Botanical Roots Background Engine (Zero Smoke, Pure Obsidian Ground) */}
      <OrganicRootsEngine mode={activeConcept} />

      {/* 2. Site Header */}
      <SiteHeader />

      {/* 3. Hero Section (Mastan Vali Wordmark, Bio, Action Buttons, 3D Character) */}
      <main id="main-content" className="relative z-10 pb-28">
        <HeroSection />
      </main>

      {/* 4. Concept Switcher Dock */}
      <div className="fixed bottom-6 inset-x-0 z-50 flex flex-col items-center pointer-events-none px-4">
        <div className="pointer-events-auto bg-[rgba(10,13,10,0.88)] backdrop-blur-[24px] border border-[rgba(244,245,239,0.18)] rounded-2xl p-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.85)] max-w-3xl w-full flex flex-col gap-2">
          <div className="flex items-center justify-between px-2 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D9FF00] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#C5AA7A] font-semibold">
                Organic Roots Background Gallery · Real Website Layout
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#8C8C86] hidden sm:inline">
              {ROOT_CONCEPTS.find((c) => c.id === activeConcept)?.desc}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {ROOT_CONCEPTS.map((c) => {
              const active = activeConcept === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => selectConcept(c.id)}
                  type="button"
                  className={`text-left px-3 py-2 rounded-xl transition-all duration-300 border ${
                    active
                      ? "bg-[#D9FF00]/15 border-[#D9FF00] text-[#D9FF00] shadow-[0_0_15px_rgba(217,255,0,0.2)]"
                      : "bg-white/[0.03] border-white/[0.06] text-[#A2A49B] hover:text-[#FFFFFF] hover:border-white/[0.18]"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider opacity-75">{c.tag}</div>
                  <div className="text-[12px] font-semibold truncate mt-0.5">{c.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
