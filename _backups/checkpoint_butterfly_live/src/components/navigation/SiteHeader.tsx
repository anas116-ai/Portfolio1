"use client";

import { useEffect, useState } from "react";
import { GithubMark, LinkedinMark } from "@/components/ui/BrandIcons";
import { ProximityCommandDock, MobileNav } from "@/components/creator/ProximityCommandDock";

const SECTIONS = ["about", "experience", "skills", "projects", "contact"];

export function SiteHeader() {
  const [pastHero, setPastHero] = useState(false);
  const [section, setSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>("#main-content > section");
      const threshold = hero
        ? hero.offsetTop + hero.offsetHeight - 96
        : window.innerHeight * 0.9;
      setPastHero(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const line = window.scrollY + window.innerHeight * 0.34;
      let current = "";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= line) current = id;
      }
      setSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const social = {
    className:
      "h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-200 hover:text-[#F4F5EF] text-[#7D8178] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8FF45]",
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 pointer-events-none ${
        pastHero
          ? "bg-[rgba(7,8,7,0.72)] backdrop-blur-[12px] border-b border-[rgba(244,245,239,0.08)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="px-5 sm:px-8 md:px-12 lg:px-16 pointer-events-auto">
        <div className="max-w-7xl mx-auto h-16 sm:h-[72px] flex items-center justify-between">
          <a
            href="#top"
            className="group inline-flex items-center cursor-pointer"
            aria-label="Mastan Vali, back to top"
          >
            <span className="font-header-dynamic text-[15px] sm:text-[16px] font-semibold uppercase tracking-[0.16em] text-white select-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF45]" />
              MASTAN VALI
            </span>
          </a>

          <ProximityCommandDock activeId={section} />

          <div className="flex items-center gap-2 sm:gap-3">
            <MobileNav />
            <a
              href="https://github.com/anas116-ai"
              target="_blank"
              rel="noopener noreferrer"
              className={social.className}
              title="GitHub (anas116-ai)"
              aria-label="GitHub Profile"
            >
              <GithubMark size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/mastan-vali-shaik-86952725a/"
              target="_blank"
              rel="noopener noreferrer"
              className={social.className}
              title="LinkedIn (Mastan Vali Shaik)"
              aria-label="LinkedIn Profile"
            >
              <LinkedinMark size={20} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
