"use client";

/**
 * Capability index line. Single static row, slash-separated mono —
 * no icons, no scroll-linked motion, no feather gradients.
 * The disciplines already carry the detail; this is a signpost.
 */
const CAPABILITIES = [
  "SAP BODS 4.3",
  "SQL",
  "Multi-Agent DAGs",
  "Python",
  "Next.js 15",
  "Ollama",
  "S/4HANA",
  "SQLite WAL",
];

export function MarqueeSection() {
  return (
    <section
      className="relative w-full bg-transparent py-5 border-y border-[rgba(245,242,235,0.06)] select-none"
      aria-label="Technologies and platforms"
    >
      <p className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-[2] tracking-[0.14em] text-[#6A6A66]">
        <span className="mr-3 text-[#C5AA7A]">Capabilities</span>
        {CAPABILITIES.map((c, i) => (
          <span key={c}>
            <span className="hover:text-[#B6B9B0] transition-colors duration-200">{c}</span>
            {i < CAPABILITIES.length - 1 && <span className="mx-2 text-[#35353A]">/</span>}
          </span>
        ))}
      </p>
    </section>
  );
}
