"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { papers, profile, type PaperStatus } from "@/data/content";
import { store } from "@/three/store";
import { Marker } from "./Typography";

const STATUS_STYLE: Record<PaperStatus, string> = {
  Published: "border-accent-2 text-accent-2",
  Accepted: "border-accent-2 text-accent-2",
  "Under Review": "border-accent text-accent",
  Preprint: "border-ink-soft text-ink-soft",
  "In Progress": "border-ink-faint text-ink-faint border-dashed",
};

const N = papers.length;
/** Scroll distance per paper, in viewport heights. Must match the deck in three/Scene.tsx (it reads the section height). */
const PER = 95;

/**
 * Pinned section: the WebGL deck renders the physical pages; this layer shows details
 * for whichever page is on top and lets you jump between them.
 */
export function Publications() {
  const ref = useRef<HTMLElement>(null);
  const [top, setTop] = useState(0);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      setProgress(p);
      const idx = Math.min(N - 1, Math.max(0, Math.floor(p * N + 0.45)));
      setTop((cur) => {
        if (cur !== idx) setOpen(false);
        return idx;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const start = el.getBoundingClientRect().top + window.scrollY;
    const y = start + ((i + 0.1) / N) * (el.offsetHeight - window.innerHeight);
    if (store.lenis) store.lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y });
  };

  const paper = papers[top];
  const links = [
    { label: "PDF", href: paper.links.pdf },
    { label: "Code", href: paper.links.code },
    { label: "DOI", href: paper.links.doi },
  ].filter((l) => l.href);

  const copyBib = async () => {
    try {
      await navigator.clipboard.writeText(paper.bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <section id="publications" ref={ref} className="relative" style={{ height: `${N * PER + 100}vh` }}>
      {/* full list for screen readers and search engines */}
      <ol className="sr-only">
        {papers.map((p) => (
          <li key={p.id}>
            {p.title}. {p.authors.join(", ")}. {p.venue}, {p.year}. {p.abstract}
          </li>
        ))}
      </ol>

      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto flex h-full max-w-6xl flex-col px-5">
          <div className="sr-only wide:not-sr-only wide:ml-[52%] wide:flex wide:items-baseline wide:justify-between wide:gap-4 wide:pt-20">
            <h2 className="flex items-baseline gap-3 text-2xl font-medium sm:text-3xl">
              <span className="font-mono text-lg text-accent">2</span> Publications
            </h2>
            <p className="hidden font-mono text-[11px] text-ink-faint sm:block">scroll to turn the page</p>
          </div>

          <div className="relative mt-auto mb-6 wide:my-auto wide:ml-[52%]" aria-live="polite">
            <div className="-mx-5 bg-linear-to-t from-desk via-desk/95 to-transparent px-5 pb-2 pt-10 wide:mx-0 wide:bg-none wide:p-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={top}
                  initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint wide:hidden">§2 Publications</p>
                  <div className="flex items-end gap-3 font-mono">
                    <span className="text-5xl leading-none text-accent wide:text-7xl">{String(top + 1).padStart(2, "0")}</span>
                    <span className="pb-1 text-sm text-ink-faint">/ {String(N).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                    <span className={`border px-2 py-0.5 ${STATUS_STYLE[paper.status]}`}>{paper.status}</span>
                    <span>{paper.venue}</span>
                    <span>· {paper.year}</span>
                  </div>
                  <h3 className="mt-3 text-[1.6rem] font-medium leading-[1.1] tracking-tight wide:text-[2.4rem]">{paper.title}</h3>
                  <p className="mt-2 text-[0.95rem] text-ink-soft">
                    {paper.authors.map((a, i) => (
                      <span key={a}>
                        {a === profile.citeName ? <span className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">{a}</span> : a}
                        {i < paper.authors.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                  <p className="mt-4 text-[1.05rem] leading-relaxed wide:text-lg">
                    <Marker delay={0.25}>{paper.keyIdea}</Marker>
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">
                    <button
                      onClick={() => setOpen((o) => !o)}
                      aria-expanded={open}
                      className="border border-ink px-3 py-1.5 transition-colors hover:bg-ink hover:text-paper"
                    >
                      {open ? "− Abstract" : "+ Abstract"}
                    </button>
                    {links.map((l) => (
                      <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="border border-ink px-3 py-1.5 text-ink no-underline transition-colors hover:bg-ink hover:text-paper">
                        {l.label} ↗
                      </a>
                    ))}
                    <button onClick={copyBib} className="border border-ink px-3 py-1.5 transition-colors hover:bg-ink hover:text-paper">
                      {copied ? "Copied ✓" : "BibTeX"}
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="sheet mt-4 max-h-[28svh] overflow-y-auto p-4 text-[0.95rem] leading-relaxed text-ink-soft" data-lenis-prevent>
                          {paper.abstract}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* page index */}
        <nav className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 sm:flex" aria-label="Papers">
          {papers.map((p, i) => (
            <button key={p.id} onClick={() => goTo(i)} className="group flex items-center justify-end gap-2" aria-label={`Paper ${i + 1}: ${p.title}`}>
              <span className={`font-mono text-[10px] transition-opacity ${i === top ? "text-accent opacity-100" : "text-ink-faint opacity-0 group-hover:opacity-100"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`block h-px transition-all duration-500 ${i === top ? "w-8 bg-accent" : "w-4 bg-ink-faint group-hover:w-6"}`} />
            </button>
          ))}
        </nav>

        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-ink/10">
          <div className="h-full origin-left bg-accent/70" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </section>
  );
}
