"use client";

import { FadeIn } from "./FadeIn";
import { Parallax } from "@/components/motion/Parallax";
import { Database, Bot, MonitorSmartphone } from "lucide-react";
import { ZenKoiPondCard, type CapabilityArea } from "./ZenKoiPondCard";

/**
 * Three capability ponds. All three cards share the same lemon accent so the
 * row reads as one coherent system rather than three unrelated materials.
 */
const capabilityAreas: CapabilityArea[] = [
  {
    num: "01",
    title: "Enterprise ETL and SAP ecosystems",
    subtitle: "SAP BODS 4.3 and cloud migration",
    desc: "Architecting enterprise ETL pipelines on SAP BODS 4.3, secure AWS S3 target loading, and automated S/4HANA migration routines.",
    points: [
      "SAP BODS 4.3 pipelines with AWS S3 target loading over IDoc and BAPI",
      "SAP BW process chains and S/4HANA migration via LTMOM, LSMW, LTMC",
      "SCD Type 1 and 2 dimensions reconciled against SQL Server",
    ],
    accent: "#CDFD02",
    borderColor: "rgba(205,253,2,0.34)",
    icon: Database,
    systemTag: "SAP BODS 4.3 // S/4HANA",
    fishCount: 1,
  },
  {
    num: "02",
    title: "Autonomous agent systems",
    subtitle: "Deterministic DAG frameworks",
    desc: "Building production Python multi-agent orchestrators with dynamic skill routing, persistent ChromaDB vector memory, and local LLM execution.",
    points: [
      "AnsiQ multi-agent DAG framework carrying 787 verified unit tests",
      "Local inference through Ollama (Llama 3, Mistral) alongside cloud APIs",
      "Persistent memory via SQLite FTS5 indexing and ChromaDB vector search",
    ],
    accent: "#CDFD02",
    borderColor: "rgba(205,253,2,0.34)",
    icon: Bot,
    systemTag: "MULTI-AGENT // DAG NODES",
    fishCount: 2,
  },
  {
    num: "03",
    title: "Full-stack applications",
    subtitle: "Zero-latency software engineering",
    desc: "Engineering reliable software from offline-first healthcare desktop ERPs to real-time AI resume platforms on the web.",
    points: [
      "AnPharmacy: Electron and SQLite WAL distribution ERP with FEFO logic",
      "Anasify: AI resume optimiser with strict truth verification",
      "Next.js 15, React 19, TypeScript, Prisma and Tailwind CSS architectures",
    ],
    accent: "#CDFD02",
    borderColor: "rgba(205,253,2,0.34)",
    icon: MonitorSmartphone,
    systemTag: "ERP",
    fishCount: 3,
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full bg-transparent py-16 sm:py-20 md:py-22 text-[#F5F2EB] z-20 select-none border-t border-[rgba(245,242,235,0.06)] font-[family-name:var(--font-geist-sans)]"
    >
      {/* Two low, cool light sources. Lemon on one side, bone on the other,
          both held far below the threshold where they read as a glow. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Parallax speed={46} className="absolute top-[22%] left-[28%] w-[680px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,242,235,0.05)_0%,transparent_70%)] blur-[90px]" />
        <Parallax speed={28} className="absolute top-[34%] right-[20%] w-[600px] h-[360px] bg-[radial-gradient(ellipse_at_center,rgba(245,242,235,0.04)_0%,transparent_70%)] blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 space-y-12 sm:space-y-14 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col items-start space-y-4 max-w-3xl">
            <FadeIn y={18} delay={0.1} duration={0.8} depth={6}>
              <div className="flex items-center gap-2.5 eyebrow">
                <span className="h-[5px] w-[5px] rounded-full bg-[#C5AA7A] animate-pulse" />
                // ABOUT ME · ARCHITECTURAL FOUNDATION
              </div>
              <h2 className="stylish-header text-[2rem] sm:text-[2.6rem] md:text-[3.15rem] lg:text-[3.6rem] text-[#F5F2EB] mt-3">
                Engineering & Vision
              </h2>
            </FadeIn>

            <FadeIn y={14} delay={0.2} duration={0.8}>
              <p className="stylish-sub text-[#B0B2A8] text-sm sm:text-[16px] max-w-2xl">
                A bridge between enterprise data architecture and autonomous agent systems. Grounded
                in mission-critical reliability, deterministic logic, and systems that stay fast under
                load.
              </p>
            </FadeIn>
          </div>
        </div>

        {/* Three capability ponds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {capabilityAreas.map((area, i) => (
            <FadeIn key={area.num} y={20} delay={0.2 + i * 0.12} duration={0.8} className="h-full">
              <ZenKoiPondCard area={area} index={i} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
