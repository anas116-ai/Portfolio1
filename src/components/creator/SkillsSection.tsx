"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "./FadeIn";

interface Discipline {
  id: string;
  code: string;
  title: string;
  /** Complete cover caption. One full sentence, no truncation. */
  caption: string;
  work: string[];
  stack: string[];
  record: string;
  thesis: string;
  scope: string;
}

/**
 * Three disciplines as flat folio chapters: hairline top rule,
 * brass numeral, ink title, slash-separated stack. No spine,
 * no fore-edge, no watermark, no spring book physics.
 */
const disciplines: Discipline[] = [
  {
    id: "data",
    code: "SYS / DATA",
    title: "SAP BODS and enterprise data systems",
    caption:
      "High throughput ETL on SAP BODS 4.3, S/4HANA and ECC migration, SQL reconciliation, and SLA governance for data that cannot be wrong.",
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
    title: "Autonomous multi-agent architecture",
    caption:
      "Directed acyclic graph agent frameworks, local open source LLM inference, and persistent semantic memory that survives a process restart.",
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
    title: "Full-stack and desktop systems",
    caption:
      "Next.js 15 production web platforms, offline capable Electron desktop software on SQLite WAL, and automated delivery pipelines.",
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
      className="relative w-full bg-transparent py-16 sm:py-20 text-[#F4F5EF] z-20 select-none border-t border-[rgba(244,245,239,0.07)]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 relative z-20">
        <div className="flex flex-col gap-6 mb-10">
          <FadeIn y={15} delay={0.1} duration={0.7}>
            <div className="flex items-center gap-2.5 eyebrow">
              <span className="h-[5px] w-[5px] rounded-full bg-[#C5AA7A]" />
              // Core disciplines
            </div>
            <h2 className="stylish-header text-[2.1rem] sm:text-[2.6rem] lg:text-[3.1rem] text-[#F4F5EF] mt-3">
              Technical Capabilities
            </h2>
            <p className="stylish-sub text-[13px] sm:text-[14.5px] text-[#B6B9B0] max-w-2xl mt-4">
              Each discipline below has run in production. Open a chapter to read the full record.
            </p>
          </FadeIn>
        </div>

        {/* Flat folio chapters — hairline rules, no book object */}
        <div className="border-t border-[rgba(244,245,239,0.12)]">
          {disciplines.map((d, idx) => (
            <button
              type="button"
              key={d.id}
              onClick={() => setOpenIdx(idx)}
              aria-label={`Open ${d.title}`}
              className="group grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-baseline gap-4 sm:gap-6 border-b border-[rgba(244,245,239,0.09)] py-6 text-left transition-colors duration-300 hover:bg-[rgba(255,255,255,0.015)] sm:py-7"
            >
              <span className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.18em] text-[#C5AA7A]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#7D8178]">
                  {d.code}
                </span>
                <span className="font-[family-name:var(--font-outfit)] text-[1.25rem] font-medium leading-[1.2] tracking-[-0.015em] text-[#F4F5EF] sm:text-[1.45rem]">
                  {d.title}
                </span>
                <span className="max-w-2xl text-[12.5px] leading-[1.7] text-[#7D8178]">
                  {d.caption}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.06em] text-[#6A6A66]">
                  {d.stack.slice(0, 4).join(" / ")}
                  {d.stack.length > 4 ? ` / +${d.stack.length - 4}` : ""}
                </span>
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#7D8178] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#E8FF45]">
                Open →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel — quiet fade, no book spread */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpenIdx(null)}
              className="absolute inset-0 bg-[rgba(6,6,8,0.72)] backdrop-blur-[8px]"
            />

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[8px] border border-[rgba(244,245,239,0.14)] bg-[#0C0E0C]"
            >
              <div className="flex items-center justify-between gap-4 border-b border-[rgba(244,245,239,0.09)] px-5 py-4 sm:px-7">
                <div className="flex items-baseline gap-3">
                  <span className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.18em] text-[#C5AA7A]">
                    {active.code}
                  </span>
                  <span className="hidden font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#6A6A66] sm:block">
                    Chapter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); go(-1); }}
                    aria-label="Previous chapter"
                    className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[rgba(244,245,239,0.11)] text-[#7D8178] transition-colors duration-300 hover:border-[rgba(232,255,69,0.42)] hover:text-[#F4F5EF]"
                  >
                    <Chevron dir="left" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); go(1); }}
                    aria-label="Next chapter"
                    className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[rgba(244,245,239,0.11)] text-[#7D8178] transition-colors duration-300 hover:border-[rgba(232,255,69,0.42)] hover:text-[#F4F5EF]"
                  >
                    <Chevron dir="right" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(null)}
                    aria-label="Close"
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-[4px] border border-[rgba(244,245,239,0.11)] text-[#7D8178] transition-colors duration-300 hover:text-[#F4F5EF]"
                  >
                    <Cross />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
                <h3 className="font-[family-name:var(--font-outfit)] text-[1.5rem] font-medium leading-[1.2] tracking-[-0.02em] text-[#F4F5EF]">
                  {active.title}
                </h3>
                <p className="stylish-sub mt-3 text-[13px] leading-[1.75] text-[#B6B9B0]">{active.scope}</p>
                <p className="mt-4 border-l-2 border-[#C5AA7A] pl-4 text-[13px] leading-[1.75] text-[#B6B9B0]">
                  {active.thesis}
                </p>

                <div className="mt-6 border-t border-[rgba(244,245,239,0.09)] pt-5">
                  <span className="eyebrow">What was done</span>
                  <ol className="mt-3 flex flex-col">
                    {active.work.map((w, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4 border-t border-[rgba(244,245,239,0.07)] py-3 last:border-b"
                      >
                        <span className="mt-[5px] shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums text-[#C5AA7A]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[12.5px] leading-[1.72] text-[#B6B9B0]">{w}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6 border-t border-[rgba(244,245,239,0.09)] pt-5">
                  <span className="eyebrow">Environment</span>
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 font-[family-name:var(--font-geist-mono)] text-[12px] text-[#7D8178]">
                    {active.stack.map((s, i) => (
                      <span key={s} className="flex items-center gap-2">
                        <span>{s}</span>
                        {i < active.stack.length - 1 && <span className="text-[#43433F]">/</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-[rgba(244,245,239,0.09)] pt-5">
                  <span className="h-px w-6 bg-[#C5AA7A]" />
                  <span className="font-[family-name:var(--font-geist-mono)] text-[11.5px] uppercase tracking-[0.14em] text-[#B6B9B0]">
                    {active.record}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
