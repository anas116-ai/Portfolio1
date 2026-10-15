"use client";

import { FadeIn } from "./FadeIn";
import { ArrowUpRight } from "lucide-react";
import { GithubMark, LinkedinMark } from "@/components/ui/BrandIcons";

const EMAIL = "sk.mastanvali0116@gmail.com";

export function FinalSection() {
  return (
    <footer
      id="contact"
      className="relative w-full bg-transparent text-[#F4F5EF] border-t border-[rgba(244,245,239,0.07)] pt-14 sm:pt-16 pb-10 px-5 sm:px-8 md:px-12 lg:px-16 select-none"
    >
      <div className="mx-auto max-w-7xl relative z-10">
        <FadeIn y={16} duration={0.7}>
          <div className="flex items-center gap-2.5 eyebrow">
            <span className="h-[5px] w-[5px] rounded-full bg-[#C5AA7A]" />
            // Contact
          </div>
          <h2 className="stylish-header text-[2rem] sm:text-[2.5rem] text-[#F4F5EF] mt-3">
            Contact
          </h2>
        </FadeIn>

        {/* Colophon grid — left aligned, no slogan, no glow, no shader button */}
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <FadeIn y={12} delay={0.1} duration={0.6}>
            <div className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#6A6A66]">
              Email
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] text-[#F4F5EF] underline decoration-[rgba(232,255,69,0.35)] underline-offset-4 hover:decoration-[#E8FF45] transition-colors duration-300"
            >
              {EMAIL}
              <ArrowUpRight size={14} />
            </a>
            <p className="mt-3 max-w-[32ch] text-[12.5px] leading-[1.7] text-[#7D8178]">
              Enterprise data, agent systems, full-stack work. Replies within two days.
            </p>
          </FadeIn>

          <FadeIn y={12} delay={0.18} duration={0.6}>
            <div className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#6A6A66]">
              Elsewhere
            </div>
            <div className="mt-2 flex flex-col gap-2 text-[13px]">
              <a
                href="https://github.com/anas116-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-[#B6B9B0] hover:text-[#F4F5EF] transition-colors duration-200"
              >
                <GithubMark size={15} /> GitHub <ArrowUpRight size={13} />
              </a>
              <a
                href="https://www.linkedin.com/in/mastan-vali-shaik-86952725a/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-[#B6B9B0] hover:text-[#F4F5EF] transition-colors duration-200"
              >
                <LinkedinMark size={15} /> LinkedIn <ArrowUpRight size={13} />
              </a>
              <a
                href="/shaik-mastan-vali-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-[#B6B9B0] hover:text-[#F4F5EF] transition-colors duration-200"
              >
                Resume <ArrowUpRight size={13} />
              </a>
            </div>
          </FadeIn>

          <FadeIn y={12} delay={0.26} duration={0.6}>
            <div className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#6A6A66]">
              Base
            </div>
            <p className="mt-2 text-[13px] leading-[1.7] text-[#B6B9B0]">
              Hyderabad, India
              <br />
              Immediate joiner / open to relocation
            </p>
          </FadeIn>
        </div>

        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-2 border-t border-[rgba(244,245,239,0.07)] pt-6 text-[11px] font-[family-name:var(--font-geist-mono)] tracking-[0.14em] uppercase text-[#43433F]">
          <span>&copy; {new Date().getFullYear()} Shaik Mastan Vali</span>
          <span>Data / Agents / Web</span>
        </div>
      </div>
    </footer>
  );
}
