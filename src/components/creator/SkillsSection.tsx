"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "./FadeIn";

interface Discipline {
  id: string;
  code: string;
  watermark: string;
  title: string;
  /** Complete cover caption. One full sentence, no truncation. */
  caption: string;
  accent: string;
  work: string[];
  stack: string[];
  record: string;
  thesis: string;
  scope: string;
}

/**
 * Three disciplines rendered as bound volumes: a spine at the left edge, a
 * visible page block at the right edge, and a cover that opens into a two page
 * spread. No icon set and no accent stripe, so the object reads as a book
 * rather than as a card with decoration on it.
 */
const disciplines: Discipline[] = [
  {
    id: "data",
    code: "SYS / DATA",
    watermark: "SAP BODS",
    title: "SAP BODS and enterprise data systems",
    caption:
      "High throughput ETL on SAP BODS 4.3, S/4HANA and ECC migration, SQL reconciliation, and SLA governance for data that cannot be wrong.",
    accent: "#D9FF00",
    scope:
      "Batch and real time extraction, transformation and loading across an ECC estate, a BW process chain, and an S/4HANA target, reconciled row for row after every run.",
    work: [
      "SAP BODS 4.3 production batch and real time jobs, workflows, and data stores.",
      "SAP ECC and S/4HANA master and transaction extraction through IDoc, BAPI, and direct table reads.",
      "Slowly changing dimensions, type 1 and type 2, reconciled against SQL Server.",
      "SAP BW process chain monitoring, deadlock prevention, and ServiceNow incident triage.",
    ],
    stack: ["SAP BODS 4.3", "SAP ECC", "SAP BW", "S/4HANA", "SQL Server", "ServiceNow", "SCD 1 and 2"],
    record: "Enterprise production uptime",
    thesis:
      "Mission critical data flows demand zero loss reconciliation, deterministic audit trails, and an on call rotation that never sleeps. Built to carry a legacy ECC estate into S/4HANA without a single unaccounted row.",
  },
  {
    id: "agent",
    code: "SYS / AGENT",
    watermark: "Autonomous Multi-Agent",
    title: "Autonomous multi-agent architecture",
    caption:
      "Directed acyclic graph agent frameworks, local open source LLM inference, and persistent semantic memory that survives a process restart.",
    accent: "#D9FF00",
    scope:
      "Task routing decided by the shape of the graph rather than by a single prompt chain, with memory that is written to disk and read back without re priming the model.",
    work: [
      "Directed acyclic graph coordination with deterministic task routing and failure isolation.",
      "Local inference execution through Ollama on Llama 3 and Mistral, with multi provider fallback.",
      "Episodic semantic memory in ChromaDB, retrieved without re prompting the model.",
      "Modular tool dispatch layer with bounded retries and autonomous recovery paths.",
    ],
    stack: ["Python 3.12", "FastAPI", "DAG engine", "Ollama", "ChromaDB", "Vector RAG", "Prompt architecture"],
    record: "Verified autonomous agent DAG",
    thesis:
      "Autonomy is a scheduling problem before it is a prompting problem. Nodes get narrow contracts, edges carry typed state, and the graph heals itself where a single prompt chain would simply stall.",
  },
  {
    id: "stack",
    code: "SYS / STACK",
    watermark: "Full-Stack",
    title: "Full-stack and desktop systems",
    caption:
      "Next.js 15 production web platforms, offline capable Electron desktop software on SQLite WAL, and automated delivery pipelines.",
    accent: "#D9FF00",
    scope:
      "Typed interfaces over storage that keeps working when the network does not, with delivery automated end to end so a release is a tag rather than a checklist.",
    work: [
      "Next.js 15 App Router and React 19 platforms backed by Prisma and PostgreSQL.",
      "Electron and React 19 desktop ERP on SQLite WAL, reading locally with sub millisecond latency.",
      "First expired first out inventory engine with Tesseract.js invoice capture.",
      "GitHub REST and GraphQL telemetry, webhook listeners, and one click multi fork sync.",
    ],
    stack: ["Next.js 15", "React 19", "TypeScript", "Electron", "SQLite WAL", "Prisma", "GitHub APIs"],
    record: "Sub millisecond local reads",
    thesis:
      "Software earns trust at the edges, not in the demo. Strict types, offline first storage, and a network boundary that assumes it will drop are what keep an interface honest after launch day.",
  },
];

/* Chevron and cross drawn here rather than pulled from an icon set. */
const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={dir === "left" ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
    />
  </svg>
);

const Cross = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
  </svg>
);

const ArrowOut = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 17 L17 7 M8 7 H17 V16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" />
  </svg>
);

export function SkillsSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const go = (delta: number) =>
    setOpenIdx((prev) => (prev === null ? null : (prev + delta + disciplines.length) % disciplines.length));

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openIdx === null) return;
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx]);

  const active = openIdx === null ? null : disciplines[openIdx];

  return (
    <section
      id="skills"
      className="relative w-full bg-transparent py-16 sm:py-20 md:py-22 text-[#F4F5EF] z-20 select-none"
    >
      {/* Calm wash behind the glass rectangles. The book volumes are frosted
          glass: without light behind them there is nothing to refract and the
          whole section reads as flat plates. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[38%] -left-32 w-[720px] h-[560px] blur-[130px] bg-[radial-gradient(circle,rgba(217,255,0,0.085)_0%,transparent_72%)]" />
        <div className="absolute top-[58%] -right-36 w-[680px] h-[540px] blur-[130px] bg-[radial-gradient(circle,rgba(244,245,239,0.07)_0%,transparent_74%)]" />
        <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-[900px] h-[380px] blur-[120px] bg-[radial-gradient(ellipse_at_center,rgba(232,255,69,0.055)_0%,transparent_74%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 space-y-14 relative z-20">
        {/* Section header. The eyebrow sits on the left, the title is set small
            so the section opens quietly, and the supporting line holds the left
            column with it. Nothing here is right aligned. */}
        <div className="flex flex-col gap-6">
          <FadeIn y={15} delay={0.1} duration={0.7}>
            <div className="flex items-center gap-2.5 eyebrow">
              <span className="h-[5px] w-[5px] rounded-full bg-[#C5AA7A] animate-pulse" />
              // Core disciplines
            </div>
            <h2 className="stylish-header text-[2.4rem] sm:text-[3rem] lg:text-[3.6rem] text-[#FFFFFF] mt-3.5">
              Technical Capabilities
            </h2>
            <p className="stylish-sub text-[13px] sm:text-[14.5px] text-[#F4F5EF] max-w-2xl mt-4">
              Each discipline below has run in production and is written down to the exact
              environment it ships in. Open a volume to read the full record.
            </p>
          </FadeIn>
        </div>

        {/* Three bound volumes, held to a narrower measure so each book reads
            slim rather than stretched. Hover is a quiet lift and a lemon
            hairline — no drop shadow, no scaling. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {disciplines.map((d, idx) => (
            <motion.button
              type="button"
              key={d.id}
              onClick={() => setOpenIdx(idx)}
              aria-label={`Open ${d.title}, opens the full spread`}
              className="group relative cursor-pointer text-left w-full min-h-[300px] sm:min-h-[320px] flex flex-col overflow-hidden rounded-[18px] glass border border-[rgba(217,255,0,0.22)] hover:border-[#D9FF00] shadow-[0_4px_24px_rgba(0,0,0,0.48)] hover:shadow-[0_8px_32px_rgba(217,255,0,0.15)] transition-all duration-700 ease-[cubic-bezier(0.165,0.84,0.44,1)] hover:-translate-y-1"
            >
              {/* Volume surface: board inset highlight */}
              <span
                aria-hidden
                className="absolute inset-[6px] left-[14px] right-[16px] border border-[rgba(217,255,0,0.16)] pointer-events-none"
                style={{ backgroundColor: d.accent, opacity: 0.045 }}
              />

              {/* Spine: highlighted crisp yellow-green rolled binding */}
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[11px] z-20 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, ${d.accent} 0%, ${d.accent} 48%, rgba(0,0,0,0.50) 100%)`,
                  opacity: 0.75,
                }}
              />
              <span
                aria-hidden
                className="absolute left-[11px] top-0 bottom-0 w-px z-20 pointer-events-none"
                style={{ backgroundColor: d.accent, opacity: 0.70 }}
              />

              {/* Fore edge: refined glass light rim */}
              <span
                aria-hidden
                className="absolute right-0 top-[6px] bottom-[6px] w-[14px] z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(244,245,239,0.02) 0%, rgba(217,255,0,0.22) 58%, rgba(0,0,0,0.50) 100%)",
                  opacity: 0.75,
                }}
              />
              <span
                aria-hidden
                className="absolute right-0 top-0 w-[14px] h-[7px] z-10 bg-[rgba(0,0,0,0.65)] pointer-events-none"
              />
              <span
                aria-hidden
                className="absolute right-0 bottom-0 w-[14px] h-[7px] z-10 bg-[rgba(0,0,0,0.65)] pointer-events-none"
              />

              {/* Clean single-line header watermark (SAP BODS / Autonomous Multi-Agent / Full-Stack) in one line without underlines */}
              <span
                aria-hidden
                className="absolute left-[26px] right-[30px] top-[24px] z-10 select-none overflow-hidden"
              >
                <span
                  className="block font-[family-name:var(--font-outfit)] font-semibold tracking-[0.02em] whitespace-nowrap text-[1.12rem] sm:text-[1.22rem]"
                  style={{
                    color: d.accent,
                    opacity: 0.38,
                  }}
                >
                  {d.watermark}
                </span>
              </span>

              <span className="relative z-20 pl-[26px] pr-[30px] pt-[74px] pb-6 flex flex-col gap-4 flex-1">
                {/* Cover head: Only line here beneath code */}
                <span className="flex items-center justify-between gap-3 pb-3 border-b border-[rgba(244,245,239,0.12)]">
                  <span className="text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.2em] uppercase text-[#D9FF00] font-medium">
                    {d.code}
                  </span>
                  <span className="relative flex h-[6px] w-[6px]" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D9FF00] opacity-60" />
                    <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-[#D9FF00]" />
                  </span>
                </span>

                <span className="flex flex-col gap-2.5 flex-1">
                  <span className="block text-[1.15rem] sm:text-[1.28rem] text-[#F4F5EF] font-[family-name:var(--font-outfit)] font-medium tracking-[-0.02em] leading-[1.16] group-hover:text-[#D9FF00] transition-colors duration-300">
                    {d.title}
                  </span>
                  <span className="block text-[12px] leading-[1.68] text-[#B6B9B0]">{d.caption}</span>
                </span>

                {/* Tail: the stack rule and the open affordance */}
                <span className="block pt-3.5 border-t border-[rgba(244,245,239,0.10)]">
                  <span className="block text-[10.5px] font-[family-name:var(--font-geist-mono)] tracking-[0.14em] uppercase text-[#A2A69C]">
                    {d.stack.slice(0, 3).join(" / ")}
                    {d.stack.length > 3 ? ` / +${d.stack.length - 3}` : ""}
                  </span>
                  <span
                    className="mt-3 flex items-center gap-1.5 text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.2em] uppercase font-semibold text-[#D9FF00] transition-transform duration-300 group-hover:translate-x-1"
                  >
                    Open volume
                    <ArrowOut />
                  </span>
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* The open spread */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={() => setOpenIdx(null)}
              className="absolute inset-0 bg-[rgba(6,6,8,0.55)] backdrop-blur-[10px]"
            />

            <motion.div
              initial={{ opacity: 0, scaleX: 0.62, scaleY: 0.94, rotateX: -7 }}
              animate={{ opacity: 1, scaleX: 1, scaleY: 1, rotateX: 0 }}
              exit={{ opacity: 0, scaleX: 0.7, scaleY: 0.96, rotateX: -5 }}
              transition={{ type: "spring", damping: 30, stiffness: 190, mass: 1.15 }}
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              style={{ transformOrigin: "50% 12%", perspective: 1600 }}
              className="relative w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-[3px] glass-strong border border-[rgba(244,245,239,0.14)] z-10"
            >
              {/* The two covers falling open. They widen the full distance and
                  stay behind the spread, so the book is seen opening rather
                  than a panel sliding into view. */}
              <motion.span
                aria-hidden
                initial={{ opacity: 0.85, scaleX: 1, rotateY: 0 }}
                animate={{ opacity: 0, scaleX: 1.06, rotateY: -34 }}
                exit={{ opacity: 0.85, scaleX: 1, rotateY: 0 }}
                transition={{ type: "spring", damping: 26, stiffness: 150, mass: 1.3 }}
                style={{ transformOrigin: "0% 50%", perspective: 1400 }}
                className="absolute inset-0 z-0 bg-[linear-gradient(100deg,#141418_0%,#1E1E24_48%,rgba(12,12,15,0.9)_100%)] border-r border-[rgba(244,245,239,0.10)]"
              />
              {/* Page head rail */}
              <div className="relative z-10 flex items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b border-[rgba(244,245,239,0.09)] glass shrink-0">
                <div className="flex items-baseline gap-3 min-w-0">
                  <span
                    className="text-[13px] font-[family-name:var(--font-geist-mono)] tracking-[0.18em] shrink-0"
                    style={{ color: active.accent }}
                  >
                    {active.code}
                  </span>
                  <span className="text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.2em] uppercase text-[#6A6A66] truncate hidden sm:block">
                    Open spread
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.16em] text-[#D9FF00] font-medium uppercase">
                    Discipline
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); go(-1); }}
                    aria-label="Previous volume"
                    className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(244,245,239,0.11)] text-[#7D8178] hover:text-[#F4F5EF] hover:border-[rgba(232,255,69,0.42)] transition-colors duration-300 cursor-pointer"
                  >
                    <Chevron dir="left" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); go(1); }}
                    aria-label="Next volume"
                    className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(244,245,239,0.11)] text-[#7D8178] hover:text-[#F4F5EF] hover:border-[rgba(232,255,69,0.42)] transition-colors duration-300 cursor-pointer"
                  >
                    <Chevron dir="right" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(null)}
                    aria-label="Close"
                    className="ml-1 w-8 h-8 flex items-center justify-center rounded-[3px] border border-[rgba(244,245,239,0.11)] text-[#7D8178] hover:text-[#F4F5EF] hover:border-[rgba(244,245,239,0.3)] transition-colors duration-300 cursor-pointer"
                  >
                    <Cross />
                  </button>
                </div>
              </div>

              {/* Two facing pages. Each is a real sheet: its own paper tint,
                  the ruled margin a printed volume carries, and a gutter that
                  darkens toward the binding so the spread reads as paper
                  meeting paper rather than two columns on a panel. */}
              <div className="relative z-10 w-full flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 bg-[rgba(16,16,20,0.70)] backdrop-blur-[12px]">
                {/* Left page */}
                <div className="relative py-7 pl-7 pr-6 sm:pl-12 sm:py-9 sm:pr-8 md:pl-16 md:py-11 md:pr-10 flex flex-col justify-between gap-8 border-b md:border-b-0 border-[rgba(244,245,239,0.09)] bg-[rgba(19,19,23,0.76)]">
                  {/* the ruled margin of a bound page */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-[18px] sm:left-[38px] md:left-[52px] w-px bg-[rgba(217,255,0,0.16)]"
                  />
                  {/* The gutter: paper curves away into the binding, so the two
                      sheets meet in shadow the way an open book does. */}
                  <span
                    aria-hidden
                    className="hidden md:block absolute right-0 top-0 bottom-0 w-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(270deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.22) 42%, transparent 100%)",
                    }}
                  />
                  {/* the sewn fold itself, right on the spine line */}
                  <span
                    aria-hidden
                    className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-[rgba(0,0,0,0.85)]"
                  />
                  <div className="relative flex flex-col gap-6">
                    <div>
                      <span
                        className="block text-[10.5px] font-[family-name:var(--font-geist-mono)] tracking-[0.24em] uppercase mb-2"
                        style={{ color: active.accent }}
                      >
                        {active.watermark}
                      </span>
                      <h3 className="text-[1.35rem] sm:text-[1.65rem] leading-[1.16] text-[#F4F5EF] font-[family-name:var(--font-outfit)] font-medium tracking-[-0.025em]">
                        {active.title}
                      </h3>
                    </div>

                    <div>
                      <span className="eyebrow">Scope</span>
                      <p className="stylish-sub mt-2.5 text-[13px] text-[#B6B9B0] leading-[1.75]">{active.scope}</p>
                    </div>

                    <div className="pt-6 border-t border-[rgba(244,245,239,0.09)]">
                      <span className="eyebrow">Approach</span>
                      <p className="stylish-sub mt-3 text-[13.5px] text-[#B6B9B0] leading-[1.78]">{active.thesis}</p>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-3 pt-6 border-t border-[rgba(244,245,239,0.09)]">
                    <span className="h-px w-6" style={{ backgroundColor: active.accent }} />
                    <span className="text-[11.5px] font-[family-name:var(--font-geist-mono)] tracking-[0.14em] uppercase text-[#B6B9B0]">
                      {active.record}
                    </span>
                  </div>
                </div>

                {/* Right page */}
                <div className="relative py-7 pl-7 pr-6 sm:pl-12 sm:py-9 sm:pr-8 md:py-11 md:pl-10 md:pr-16 flex flex-col gap-8 bg-[rgba(19,19,23,0.76)]">
                  {/* the gutter shadow, mirrored onto the recto */}
                  <span
                    aria-hidden
                    className="hidden md:block absolute left-0 top-0 bottom-0 w-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.22) 42%, transparent 100%)",
                    }}
                  />
                  <div>
                    <span className="eyebrow">Responsibilities</span>
                    <ol className="mt-4 flex flex-col">
                      {active.work.map((w, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-4 py-3.5 border-t border-[rgba(244,245,239,0.07)] last:border-b"
                        >
                          <span
                            className="shrink-0 mt-[7px] text-[10px] font-[family-name:var(--font-geist-mono)] tabular-nums"
                            style={{ color: active.accent }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[12.5px] leading-[1.72] text-[#B6B9B0]">{w}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-6 border-t border-[rgba(244,245,239,0.09)]">
                    <span className="eyebrow">Production environment</span>
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] font-[family-name:var(--font-geist-mono)] text-[#7D8178]">
                      {active.stack.map((s, i) => (
                        <span key={s} className="flex items-center gap-2">
                          <span className="hover:text-[#F4F5EF] transition-colors duration-300">{s}</span>
                          {i < active.stack.length - 1 && <span className="text-[#43433F]">/</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-[rgba(244,245,239,0.09)] flex items-center justify-between gap-4">
                    <span className="text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.18em] uppercase text-[#6A6A66]">
                      Arrow keys to turn / Esc to close
                    </span>
                    <span
                      className="text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.2em] uppercase"
                      style={{ color: active.accent }}
                    >
                      {active.code}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
