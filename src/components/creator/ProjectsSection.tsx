"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { Maximize2, X, ArrowUpRight } from "lucide-react";
import Image from "next/image";

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

export function ProjectsSection() {
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
      className="relative w-full bg-transparent pt-16 sm:pt-20 md:pt-22 pb-20 sm:pb-24 text-[#F5F2EB] z-20 select-none border-t border-[rgba(245,242,235,0.07)]"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16 relative z-20">
        {/* Section heading — editorial index, quiet */}
        <div className="flex flex-col gap-6 mb-10 sm:mb-12">
          <FadeIn y={20} delay={0.1} duration={0.8}>
            <div className="flex items-center gap-2.5 eyebrow">
              <span className="h-[5px] w-[5px] rounded-full bg-[#C5AA7A]" />
              // Selected work
            </div>
            <h2 className="stylish-header text-[2.1rem] sm:text-[2.6rem] lg:text-[3.1rem] text-[#F5F2EB] mt-3">
              My Projects
            </h2>
            <p className="stylish-sub text-xs sm:text-[13.5px] text-[#B0B2A8] max-w-2xl mt-4">
              Four working systems, each one built to a production bar and published to GitHub.
            </p>
          </FadeIn>
        </div>

        {/* Editorial index — hairline rows, no sticky hijack */}
        <div className="relative flex flex-col border-t border-[rgba(244,245,239,0.09)]">
          {projectList.map((project, index) => (
            <ProjectRow
              key={project.no}
              project={project}
              index={index}
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

function ProjectRow({
  project,
  index,
  onOpenModal,
}: {
  project: ProjectItem;
  index: number;
  onOpenModal: (src: string, title: string) => void;
}) {
  return (
    <article className="group grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 py-8 sm:py-10 border-b border-[rgba(244,245,239,0.09)]">
      {/* Left: index + identity */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-[family-name:var(--font-geist-mono)] tracking-[0.2em] text-[#C5AA7A]">
            {project.no}
          </span>
          <span className="text-[#43433F] font-mono text-xs">/</span>
          <span className="text-[11px] font-[family-name:var(--font-geist-mono)] uppercase tracking-[0.18em] text-[#7D8178]">
            {project.category}
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-[family-name:var(--font-outfit)] font-semibold tracking-[-0.02em] text-[#F4F5EF]">
          {project.name}
        </h3>

        <p className="text-[11px] font-[family-name:var(--font-geist-mono)] leading-[1.7] tracking-[0.04em] text-[#8C8C86]">
          {project.flow}
        </p>

        <p className="stylish-sub text-xs sm:text-[13.5px] text-[#B6B9B0] max-w-xl">
          {project.simpleMeaning}
        </p>

        <ul className="flex flex-col border-t border-[rgba(244,245,239,0.09)] pt-4">
          {project.whatItDoes.slice(0, 3).map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 py-2">
              <span
                aria-hidden
                className="shrink-0 mt-[9px] block h-px w-3.5 bg-[#C5AA7A]"
              />
              <span className="text-[12.5px] leading-[1.7] text-[#B6B9B0]">{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-[family-name:var(--font-geist-mono)] text-[#7D8178]">
          {project.tags.map((tag, i) => (
            <span key={tag} className="flex items-center gap-2">
              <span>{tag}</span>
              {i < project.tags.length - 1 && <span className="text-[#43433F]">/</span>}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View repository, ${project.name} on GitHub`}
            className="inline-flex items-center gap-1.5 text-[12px] font-[family-name:var(--font-geist-mono)] tracking-[0.08em] uppercase text-[#E8FF45] underline decoration-[rgba(232,255,69,0.35)] underline-offset-4 hover:decoration-[#E8FF45] transition-colors duration-300"
          >
            View repository
            <ArrowUpRight size={14} />
          </a>
          <span className="text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.1em] uppercase text-[#6A6A66]">
            {project.stat1} / {project.stat2}
          </span>
        </div>
      </div>

      {/* Right: single still thumbnail */}
      <div className="lg:col-span-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onOpenModal(project.bannerImg, project.name)}
          aria-label={`View full interface, ${project.name}`}
          className="relative w-full aspect-[4/3] overflow-hidden border border-[rgba(244,245,239,0.12)] hover:border-[rgba(232,255,69,0.4)] bg-[rgba(255,255,255,0.015)] rounded-[8px] cursor-zoom-in transition-colors duration-300"
        >
          <Image
            src={project.bannerImg}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-top"
          />
        </button>
        <div className="flex items-center justify-between text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.12em] uppercase">
          <span className="text-[#6A6A66]">{String(index + 1).padStart(2, "0")} / 04</span>
          <span className="text-[#7D8178]">{project.telemetry}</span>
        </div>
      </div>
    </article>
  );
}
