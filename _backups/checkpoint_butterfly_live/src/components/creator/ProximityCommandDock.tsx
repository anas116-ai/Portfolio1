"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "about", label: "About", href: "#about" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "skills", label: "Disciplines", href: "#skills" },
  { id: "projects", label: "Work", href: "#projects" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export function ProximityCommandDock({ activeId = "" }: { activeId?: string }) {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className="hidden md:flex items-center gap-6 lg:gap-8 select-none"
      aria-label="Portfolio Navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeId === item.id;

        return (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => handleScrollTo(e, item.href)}
            aria-current={isActive ? "true" : undefined}
            className={`relative py-1 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.18em] transition-colors duration-200 ${
              isActive ? "text-[#F4F5EF]" : "text-[#7D8178] hover:text-[#F4F5EF]"
            }`}
          >
            <span>{item.label}</span>
            {/* Active state: single 1px brass underline, no pill, no glow */}
            <span
              aria-hidden
              className={`absolute -bottom-0.5 left-0 h-px w-full bg-[#C5AA7A] transition-opacity duration-200 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const go = (item: NavItem) => {
    setOpen(false);
    const target = document.querySelector(item.href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="md:hidden relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className="h-11 w-11 flex items-center justify-center border-0 bg-transparent text-[#B6B9B0] hover:text-[#F4F5EF] transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9FF00]"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <div className="fixed inset-x-4 top-[64px] z-50 rounded-lg border border-[rgba(244,245,239,0.12)] bg-[#0A0D0A]/95 p-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                go(item);
              }}
              className="px-4 py-2.5 rounded-md font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.16em] text-[#B6B9B0] hover:text-[#F4F5EF] transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
