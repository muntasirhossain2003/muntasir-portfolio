"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { AsciiView } from "@/ascii/AsciiView";
import { figureSource } from "@/ascii/sources";
import type { Draw } from "@/components/figures/kit";
import { drawGraph } from "@/components/figures/GraphNet";
import { drawLandscape } from "@/components/figures/LossLandscape";
import { drawNeural } from "@/components/figures/NeuralFlow";
import { drawWave } from "@/components/figures/SignalWave";
import { papers, profile, type FigureKind, type Paper, type PaperStatus } from "@/data/content";
import { Scramble, Section, Sparkline } from "./term";

const DRAW: Record<FigureKind, Draw> = { neural: drawNeural, graph: drawGraph, landscape: drawLandscape, wave: drawWave };

const STATUS: Record<PaperStatus, { label: string; cls: string }> = {
  Published: { label: "PUBLISHED", cls: "text-fg" },
  Accepted: { label: "ACCEPTED", cls: "text-fg" },
  "Under Review": { label: "UNDER_REVIEW", cls: "text-hot" },
  Preprint: { label: "PREPRINT", cls: "text-cool" },
  "In Progress": { label: "RUNNING", cls: "text-fg-dim" },
};

const slug = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 3)
    .join("_");

function PaperWindow({ p, i }: { p: Paper; i: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const source = useMemo(() => figureSource(DRAW[p.figure], 76), [p.figure]);
  const st = STATUS[p.status];
  const links = [
    { label: "pdf", href: p.links.pdf },
    { label: "code", href: p.links.code },
    { label: "doi", href: p.links.doi },
  ].filter((l) => l.href);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <motion.article
      className="term-window overflow-hidden"
      initial={{ scaleY: 0.01, opacity: 0 }}
      whileInView={{ scaleY: 1, opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
    >
      <header className="no-glow flex items-center justify-between gap-3 bg-fg px-3 py-0.5 text-[12px] text-bg">
        <span className="truncate">
          [{String(i + 1).padStart(2, "0")}] {slug(p.title)}.py
        </span>
        <span className="shrink-0">pid {1024 + i * 337}</span>
      </header>

      <div className="grid md:grid-cols-[1.2fr_1fr]">
        <figure className="border-b border-line p-3 md:border-b-0 md:border-r">
          <AsciiView source={source} label={`Figure ${i + 1}: ${p.figureCaption}`} />
          <figcaption className="mt-2 text-[11px] leading-snug text-fg-dim">
            <span className="text-hot">fig.{i + 1}</span> — {p.figureCaption}
          </figcaption>
        </figure>

        <div className="flex flex-col p-4 sm:p-5">
          <p className="text-[11px] text-fg-dim">
            # {p.venue} · {p.year} · status: <span className={st.cls}>{st.label}</span>
          </p>
          <h3 className="mt-3 text-lg font-bold leading-snug sm:text-xl">
            <Scramble text={p.title} />
          </h3>
          <p className="mt-2 text-[13px] text-fg-dim">
            {p.authors.map((a, k) => (
              <span key={a}>
                {a === profile.citeName ? <span className="text-hot underline decoration-dotted underline-offset-4">{a}</span> : a}
                {k < p.authors.length - 1 && ", "}
              </span>
            ))}
          </p>
          <p className="mt-4 border-l-2 border-hot pl-3 text-[14px] leading-relaxed">{p.keyIdea}</p>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <p className="mt-4 text-[13px] leading-relaxed text-fg-dim">
                  <span className="text-fg">$ cat abstract.txt</span>
                  <br />
                  {p.abstract}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto flex flex-wrap gap-2 pt-5 text-[12px]">
            <button onClick={() => setOpen((o) => !o)} className="btn" aria-expanded={open}>
              {open ? "[-] abstract" : "[+] abstract"}
            </button>
            {links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="btn">
                {l.label} ↗
              </a>
            ))}
            <button onClick={copy} className="btn">
              {copied ? "copied ✓" : "bibtex"}
            </button>
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-1 text-[11px] text-fg-dim">
        <span>
          cpu <Sparkline seed={i + 1} /> · mem {32 + i * 11}M
        </span>
        <span>{p.figure}.kmod loaded</span>
      </footer>
    </motion.article>
  );
}

export function Papers() {
  return (
    <Section id="papers" cmd="./papers --visualize --all">
      <p className="text-[13px] text-fg-dim">
        spawned {papers.length} processes · each figure is the paper&apos;s core idea, simulated live and rendered as ASCII · hover a figure to disturb it
      </p>
      <div className="mt-8 space-y-10">
        {papers.map((p, i) => (
          <PaperWindow key={p.id} p={p} i={i} />
        ))}
      </div>
    </Section>
  );
}
