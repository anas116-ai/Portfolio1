import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/* ─────────────────────────────────────────────────────────────
   TYPE SYSTEM — "Precision Instrument"
   Display  → Cabinet Grotesk (section headers: simple luxury grotesk)
   Support  → Outfit (numbers, sub-titles, large technical display)
   UI/Body  → Geist  (self-hosted, SF-Pro-grade neo-grotesque)
   Mono     → Geist Mono (technical metadata, eyebrows, tags)
   Hero     → Warpaint (display wordmark, custom face)
   ───────────────────────────────────────────────────────────── */

/* Cabinet Grotesk — the premium grotesk reserved for headers. Medium carries
   the section headings, Bold only where a header needs the extra weight. */
const cabinetGrotesk = localFont({
  src: [
    { path: "./fonts/CabinetGrotesk-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cabinet",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["200", "300", "400", "500", "600"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mastan Vali — Enterprise Data Engineer & LLM Agent Architect",
  description:
    "Software engineer building mission-critical enterprise data systems (SAP BODS 4.3, ETL, AWS S3) and autonomous LLM agent architectures. Currently at VHS Consulting India.",
  keywords: [
    "Shaik Mastan Vali",
    "Mastan Vali",
    "Enterprise Data Engineer",
    "SAP BODS 4.3 Developer",
    "ETL Developer",
    "LLM Agent Architect",
    "Multi-Agent Systems",
    "Portfolio",
  ],
  authors: [{ name: "Shaik Mastan Vali" }],
  creator: "Shaik Mastan Vali",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark scroll-smooth ${GeistSans.variable} ${GeistMono.variable} ${outfit.variable} ${plusJakarta.variable} ${cabinetGrotesk.variable}`}
    >
      <head>
        <link
          rel="preload"
          href="/fonts/Warpaint.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#0A0908] text-[#F5F1EA] antialiased overflow-x-clip selection:bg-[#C9A227]/25 selection:text-[#F5F1EA]">
        {children}
      </body>
    </html>
  );
}