"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { Parallax } from "@/components/motion/Parallax";
import { PremiumNightBackdrop } from "./PremiumNightBackdrop";
import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { ShaderIgnitionButton, IgnitionColorVariant } from "@/components/ui/ShaderIgnitionButton";

interface ProjectItem {
  no: string;
  name: string;
  category: string;
  flow: string;
  simpleMeaning: string;
  whatItDoes: string[];
  repo: string;
  version: string;
  tags: string[];
  bannerImg: string;
  telemetry: string;
  stat1: string;
  stat2: string;
  accent: string;
}

const projectList: ProjectItem[] = [
  {
    no: "01",
    name: "AnPharmacy",
    category: "Healthcare distribution ERP / offline first",
    flow: "Medicine / Purchase / Inventory / Batch / Expiry / Sales / Stock / Reports",
    simpleMeaning:
      "A distribution ERP for pharmacies that keeps managing medicine inventory, batch allocation, and sales compliance with the network switched off.",
    whatItDoes: [
      "FEFO batch allocation during every sale so expired stock is never dispensed.",
      "Near-expiry alerts raised before stock crosses the compliance window.",
      "Invoice and bill capture through an embedded Tesseract.js OCR pass.",
      "Offline first ACID persistence in SQLite running in WAL mode.",
      "Hardware bound licensing with AES-256 automated backups and Excel interchange.",
    ],
    repo: "https://github.com/anas116-ai/AnPharmacy",
    version: "v3.2.0-stable",
    tags: ["Electron", "React 19", "better-sqlite3 WAL", "Tesseract.js OCR", "FEFO engine", "TypeScript", "Tailwind CSS"],
    bannerImg: "/images/projects/anpharmacy_v2.jpg",
    telemetry: "ACID WAL / zero read latency",
    stat1: "FEFO enforced",
    stat2: "Offline SQLite",
    accent: "#D9FF00",
  },
  {
    no: "02",
    name: "Anasify",
    category: "ATS resume builder and job description matcher",
    flow: "Job opening / Requirement matching / ATS compatibility score / Resume / PDF and DOCX export",
    simpleMeaning:
      "A career platform that reads a real job opening, matches it against the resume you actually wrote, and reports how an applicant tracking system will score the result.",
    whatItDoes: [
      "Twelve executive resume templates engineered to stay readable through ATS parsing.",
      "Requirement matcher that aligns stated qualifications against a target job description.",
      "Live ATS compatibility score covering formatting, structure, and keyword density.",
      "Truth verification step that blocks any claim the candidate has not confirmed.",
      "High resolution PDF and DOCX export with OAuth backed version history.",
    ],
    repo: "https://github.com/anas116-ai/anasify",
    version: "v2.1.0-prod",
    tags: ["Next.js 15", "React 19", "TypeScript", "Prisma", "PostgreSQL", "ATS score engine", "Tailwind CSS"],
    bannerImg: "/images/projects/anasify_v2.jpg",
    telemetry: "ATS match engine",
    stat1: "ATS target score",
    stat2: "No invented claims",
    accent: "#D9FF00",
  },
  {
    no: "03",
    name: "AnsiQ",
    category: "Multi-agent task orchestration with persistent memory",
    flow: "User goal / Task decomposition / Frontend, Backend, Database agents / ChromaDB recall / Verification gate",
    simpleMeaning:
      "An autonomous agent framework that splits a goal across specialised frontend, backend, and database workers, then remembers every bug it has already solved.",
    whatItDoes: [
      "Goal decomposition into isolated frontend, backend, and database task streams.",
      "Persistent solution memory in ChromaDB so the same defect is never debugged twice.",
      "Local inference through Ollama on Llama 3 with no cloud telemetry or recurring cost.",
      "Dynamic DAG state management with parallel execution and error isolation.",
      "Automated unit and integration tests covering deterministic coordination.",
    ],
    repo: "https://github.com/anas116-ai/AnsiQ",
    version: "v1.8.4-core",
    tags: ["Python 3.12", "FastAPI", "Ollama", "Multi-agent DAG", "ChromaDB", "Task splitting", "Persistent memory"],
    bannerImg: "/images/projects/ansiq_v3.jpg",
    telemetry: "Persistent memory DAG",
    stat1: "Deterministic DAG",
    stat2: "Ollama Llama 3",
    accent: "#D9FF00",
  },
  {
    no: "04",
    name: "CodeSync",
    category: "Multi-repository upstream sync and fork automation",
    flow: "Forked repositories / Upstream change detection / One click sync / Commit diff inspection / Webhook telemetry",
    simpleMeaning:
      "A developer tool that watches every fork you own, tells you the moment it drifts behind its upstream, and brings the whole set current in a single action.",
    whatItDoes: [
      "Continuous upstream scanning that reports exactly when a fork falls behind.",
      "One click sync that fetches, rebases, and reconciles every fork together.",
      "Commit diff inspector showing incoming additions, deletions, and mergeability.",
      "Webhook stream tracking pushes, releases, and repository sync health live.",
      "Unified console managing open-source and internal team forks from one place.",
    ],
    repo: "https://github.com/anas116-ai/Qode-Sync",
    version: "v2.4.0-stable",
    tags: ["Next.js", "TypeScript", "GitHub REST and GraphQL", "One click fork sync", "Webhook triggers", "Tailwind CSS"],
    bannerImg: "/images/projects/qodesync_v2.jpg",
    telemetry: "One click upstream sync",
    stat1: "One click sync",
    stat2: "Zero drift",
    accent: "#D9FF00",
  },
];

/* Button pairings so each card's action carries its own accent. */
const buttonVariants: IgnitionColorVariant[] = ["lemon", "lemonHi", "lemon", "lemonHi"];

const cutCorner = {
  backgroundImage:
    "linear-gradient(225deg, transparent 18px, rgba(10,10,11,0.96) 18px), linear-gradient(180deg, rgba(10,10,11,0.96) 0%, rgba(10,10,11,0.96) 100%)",
};

export function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalImage, setModalImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full bg-transparent pt-16 sm:pt-20 md:pt-22 pb-20 sm:pb-24 text-[#F5F2EB] z-20 select-none border-t border-[rgba(245,242,235,0.07)]"
    >
      {/* Clean neutral atmosphere — zero heavy yellow blotches */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Parallax speed={54} className="absolute top-1/3 -left-28 w-[720px] h-[720px] blur-[170px] opacity-[0.04] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        <Parallax speed={34} className="absolute top-1/2 -right-40 w-[600px] h-[600px] blur-[170px] opacity-[0.05] bg-[radial-gradient(circle,rgba(244,245,239,0.12)_0%,transparent_70%)]" />
        {/* Premium night beams over the stacking cards */}
        <PremiumNightBackdrop side="right" mood="calm" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16 relative z-20">
        {/* Section heading. The caption is held on the left with the title, not
            floated to the far right of the row. */}
        <div className="flex flex-col gap-6 mb-14 sm:mb-16">
          <FadeIn y={20} delay={0.1} duration={0.8} depth={6}>
            <div className="flex items-center gap-2.5 eyebrow">
              <span className="h-[5px] w-[5px] rounded-full bg-[#C5AA7A] animate-pulse" />
              // Production systems and products
            </div>
            <h2 className="stylish-header text-[2.1rem] sm:text-[2.6rem] lg:text-[3.1rem] text-[#F5F2EB] mt-3">
              My Projects
            </h2>
            <p className="stylish-sub text-xs sm:text-[13.5px] text-[#B0B2A8] max-w-2xl mt-4">
              Four working systems, each one built to a production bar and published to GitHub.
              Every claim below is backed by a repository you can open.
            </p>
          </FadeIn>
        </div>

        {/* Stacking cards, each settling behind the next */}
        <div className="relative flex flex-col pb-16 sm:pb-24">
          {projectList.map((project, index) => (
            <ProjectCard
              key={project.no}
              project={project}
              index={index}
              total={projectList.length}
              onOpenModal={(src, title) => setModalImage({ src, title })}
            />
          ))}
        </div>
      </div>

      {/* Full resolution lightbox */}
      <AnimatePresence>
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26 }}
            onClick={() => setModalImage(null)}
            className="fixed inset-0 z-50 bg-[rgba(6,6,8,0.94)] backdrop-blur-[3px] flex flex-col items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          >
            <div
              className="relative max-w-6xl w-full aspect-[16/9] overflow-hidden border border-[rgba(245,242,235,0.14)] bg-[rgba(12,12,15,0.70)] backdrop-blur-[14px] rounded-[3px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModalImage(null)}
                aria-label="Close full screen"
                className="absolute top-3 right-3 z-50 w-9 h-9 flex items-center justify-center bg-[rgba(12,12,15,0.64)] backdrop-blur-[10px] border border-[rgba(245,242,235,0.16)] text-[#C9C8C3] hover:text-[#0A0A0B] hover:bg-[#DCFD3C] hover:border-[#DCFD3C] transition-colors duration-300"
              >
                <X size={16} />
              </button>

              <div className="absolute top-3 left-3 z-50 px-3 py-1.5 bg-[rgba(12,12,15,0.64)] backdrop-blur-[10px] border border-[rgba(245,242,235,0.16)] text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.14em] uppercase text-[#8C8C86]">
                {modalImage.title}
              </div>

              <Image
                src={modalImage.src}
                alt={modalImage.title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="text-[#6A6A66] text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.18em] uppercase mt-3">
              Press esc or click outside to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  total,
  onOpenModal,
}: {
  project: ProjectItem;
  index: number;
  total: number;
  onOpenModal: (src: string, title: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.955]);
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.92, 0.7]);
  const isLast = index === total - 1;

  return (
    <div
      ref={cardRef}
      className="min-h-[85vh] h-auto lg:h-[90vh] flex items-start w-full sticky top-16 sm:top-20 md:top-24 mb-10 lg:mb-0"
      style={{ zIndex: index + 10 }}
    >
      <motion.div
        style={{
          scale: isLast ? 1 : scale,
          opacity: isLast ? 1 : opacity,
          backgroundColor: "rgba(255, 255, 255, 0.012)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 35%, transparent 100%)",
        }}
        className="w-full rounded-[22px] border border-[rgba(244,245,239,0.12)] p-6 sm:p-9 md:p-11 relative overflow-hidden group transition-all duration-500 hover:border-[rgba(217,255,0,0.45)] shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
      >
        {/* Accent cap, subtle cut plate marker */}
        <span
          aria-hidden
          className="absolute top-0 left-0 h-[2px] w-16 transition-[width] duration-500 group-hover:w-28 z-20"
          style={{ backgroundColor: "#D9FF00" }}
        />
        {/* Top edge specular bevel highlight */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10"
        />
        {/* The milled recess the card sits in, one hairline in from the trim */}
        <span
          aria-hidden
          className="absolute inset-[7px] rounded-[16px] border border-[rgba(244,245,239,0.05)] pointer-events-none"
        />

        {/* Liquid-glass top specular sheen - crisp and crystal clear */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.025] to-transparent"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          {/* Left column: identity, flow, meaning, implementation */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className="text-[12px] font-[family-name:var(--font-geist-mono)] tracking-[0.2em] font-medium"
                  style={{ color: "#C5AA7A" }}
                >
                  {project.no}
                </span>
                <span className="text-[#777] font-mono text-xs">/</span>
                <span
                  className="text-[11px] font-[family-name:var(--font-geist-mono)] uppercase tracking-[0.22em] font-medium"
                  style={{ color: "#C5AA7A" }}
                >
                  {project.category}
                </span>
              </div>

              {/* Project Title highlighted strictly in clean crisp Lemon Yellow with NO glow and NO version box */}
              <h3 className="text-2xl sm:text-3xl md:text-[2.2rem] font-[family-name:var(--font-outfit)] font-bold tracking-[-0.03em]">
                <span className="text-[#D9FF00] selection:bg-[#D9FF00] selection:text-black">
                  {project.name}
                </span>
              </h3>
            </div>

            {/* Flow, set as a ruled technical line in Eyebrow color (#C5AA7A) */}
            <div
              className="text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.22em] uppercase font-medium"
              style={{ color: "#C5AA7A" }}
            >
              End to end flow
            </div>
            <div className="-mt-2 pb-4 border-b border-[rgba(244,245,239,0.09)] text-[12.5px] sm:text-[13.5px] text-[#F4F5EF] font-[family-name:var(--font-geist-mono)] leading-[1.6]">
              {project.flow}
            </div>

            <p className="stylish-sub text-xs sm:text-[13.5px] text-[#E4E6DF]">
              {project.simpleMeaning}
            </p>

            <div className="space-y-3 pt-4 border-t border-[rgba(244,245,239,0.09)]">
              <span className="eyebrow">What it implements</span>
              <ul className="space-y-2.5">
                {project.whatItDoes.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="shrink-0 mt-[7px] block h-px w-3.5"
                      style={{ backgroundColor: "#C5AA7A", opacity: 0.9 }}
                    />
                    <span className="text-[12.5px] leading-[1.7] text-[#E0E2DA]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-x-2 gap-y-1.5 pt-1 text-[11px] font-[family-name:var(--font-geist-mono)] text-[#A2A49B]">
              {project.tags.map((tag) => (
                <span key={tag} className="hover:text-[#FFFFFF] transition-colors duration-300">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <ShaderIgnitionButton
                variant={buttonVariants[index % buttonVariants.length]}
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                ariaLabel={`View repository, ${project.name} on GitHub`}
                size="sm"
              >
                View repository
              </ShaderIgnitionButton>

              <div className="flex items-center gap-3 text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.14em] uppercase">
                <span style={{ color: project.accent }}>{project.stat1}</span>
                <span className="text-[#7A7A74]">/</span>
                <span className="text-[#B4B6AC]">{project.stat2}</span>
              </div>
            </div>
          </div>

          {/* Right column: the interface itself. Fine pointers get a slow 3D tilt, max 5deg. Touch stays flat. */}
          <div className="lg:col-span-5 relative w-full flex flex-col items-center justify-center space-y-3" style={{ perspective: 1000 }}>
            <button
              type="button"
              onClick={() => onOpenModal(project.bannerImg, project.name)}
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return;
                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
                const r = e.currentTarget.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                setTilt({ rx: -py * 5, ry: px * 5 });
              }}
              onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
              aria-label={`View full interface, ${project.name}`}
              className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[3/4] overflow-hidden border border-[rgba(244,245,239,0.12)] hover:border-[rgba(217,255,0,0.45)] bg-white/[0.015] backdrop-blur-[6px] rounded-[14px] group/img cursor-zoom-in p-3.5 flex items-center justify-center transition-[border-color,box-shadow] duration-500 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] will-change-transform"
              style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: "transform 0.5s cubic-bezier(0.165,0.84,0.44,1)" }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={project.bannerImg}
                  alt={project.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-contain object-center transition-transform duration-700 ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover/img:scale-[1.03]"
                  priority
                />
              </div>

              <div className="absolute inset-0 bg-[rgba(6,6,8,0.55)] opacity-0 group-hover/img:opacity-100 transition-opacity duration-400 flex items-center justify-center pointer-events-none">
                <span className="px-3.5 py-2 bg-[rgba(12,12,15,0.70)] backdrop-blur-[10px] border border-[rgba(245,242,235,0.2)] text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.16em] uppercase text-[#F5F2EB] flex items-center gap-2">
                  <Maximize2 size={13} />
                  View full interface
                </span>
              </div>
            </button>

            <div className="w-full max-w-[380px] sm:max-w-[420px] flex items-center justify-between px-1 text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.16em] uppercase">
              <span className="flex items-center gap-2 text-[#8C8C86]">
                <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: "#C5AA7A" }} />
                Verified build
              </span>
              <span style={{ color: "#C5AA7A" }}>{project.telemetry}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}