"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { profile } from "@/data/content";

export const SECTIONS = [
  { id: "abstract", n: "", label: "Abstract" },
  { id: "introduction", n: "1", label: "Introduction" },
  { id: "publications", n: "2", label: "Publications" },
  { id: "projects", n: "3", label: "Projects" },
  { id: "trajectory", n: "4", label: "Trajectory" },
  { id: "references", n: "", label: "References" },
];

function useActiveSection() {
  const [active, setActive] = useState("abstract");
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") setTheme(attr);
    else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      className="font-mono text-xs text-ink-soft transition-colors hover:text-accent"
      aria-label={theme ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Toggle theme"}
    >
      <span className="text-ink-faint">\theme{"{"}</span>
      <span className="inline-block min-w-[2.6rem] text-center">{theme ?? "…"}</span>
      <span className="text-ink-faint">{"}"}</span>
    </button>
  );
}

/** Top running header, reading progress bar and margin table of contents. */
export function Chrome() {
  const active = useActiveSection();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-accent" style={{ scaleX: progress }} />

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-300 ${
          scrolled ? "border-b border-rule bg-paper/85 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#abstract"
            className={`smallcaps text-sm text-ink no-underline transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
            tabIndex={scrolled ? 0 : -1}
          >
            {profile.citeName} · {new Date().getFullYear()}
          </a>
          <nav className="flex items-center gap-4 sm:gap-6">
            <ul className="hidden items-center gap-5 font-mono text-xs sm:flex">
              {SECTIONS.filter((s) => s.n).map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`no-underline transition-colors hover:text-accent ${active === s.id ? "text-accent" : "text-ink-soft"}`}
                  >
                    §{s.n} {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <aside className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 2xl:block" aria-label="Contents">
        <p className="smallcaps mb-3 text-xs text-ink-faint">Contents</p>
        <ol className="space-y-2 font-mono text-xs">
          {SECTIONS.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`} className={`group flex items-center gap-2 no-underline ${on ? "text-accent" : "text-ink-faint hover:text-ink"}`}>
                  <span className={`h-px bg-current transition-all duration-500 ${on ? "w-6" : "w-2 group-hover:w-4"}`} />
                  <span>{s.n ? `${s.n}  ${s.label}` : s.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </aside>
    </>
  );
}
