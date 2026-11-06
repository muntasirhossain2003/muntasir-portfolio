"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { profile, type FigureKind, type Paper, type PaperStatus } from "@/data/content";
import { Marker } from "./Typography";

const FIGURES: Record<FigureKind, React.ComponentType> = {
  neural: dynamic(() => import("./figures/NeuralFlow"), { ssr: false }),
  graph: dynamic(() => import("./figures/GraphNet"), { ssr: false }),
  landscape: dynamic(() => import("./figures/LossLandscape"), { ssr: false }),
  wave: dynamic(() => import("./figures/SignalWave"), { ssr: false }),
};

const STATUS_STYLE: Record<PaperStatus, string> = {
  Published: "border-accent-2 text-accent-2",
  Accepted: "border-accent-2 text-accent-2",
  "Under Review": "border-accent text-accent",
  Preprint: "border-ink-soft text-ink-soft",
  "In Progress": "border-ink-faint text-ink-faint border-dashed",
};

function Authors({ list }: { list: string[] }) {
  return (
    <>
      {list.map((a, i) => (
        <span key={a}>
          {a === profile.citeName ? <span className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">{a}</span> : a}
          {i < list.length - 1 && ", "}
        </span>
      ))}
    </>
  );
}

export function PaperFigure({ paper, index }: { paper: Paper; index: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const Fig = FIGURES[paper.figure];
  const flip = index % 2 === 1;

  const copyBib = async () => {
    try {
      await navigator.clipboard.writeText(paper.bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const links = [
    { label: "PDF", href: paper.links.pdf },
    { label: "Code", href: paper.links.code },
    { label: "DOI", href: paper.links.doi },
  ].filter((l) => l.href);

  return (
    <motion.article
      className="grid items-start gap-8 md:grid-cols-2 md:gap-12"
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <figure className={flip ? "md:order-2" : ""}>
        <motion.div
          className="relative aspect-[4/3] overflow-hidden border border-ink bg-paper-2"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ clipPath: "inset(0 0% 0 0)" }}
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
          role="img"
          aria-label={`Figure ${index + 1}: ${paper.figureCaption}`}
        >
          <Fig />
          <span className="absolute left-2 top-1.5 font-mono text-[10px] text-ink-faint">({String.fromCharCode(97 + index)})</span>
        </motion.div>
        <figcaption className="mt-3 text-sm leading-snug text-ink-soft">
          <span className="font-semibold text-ink">Figure {index + 1}:</span> {paper.figureCaption}
        </figcaption>
      </figure>

      <div className={flip ? "md:order-1" : ""}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          <span className={`border px-2 py-0.5 ${STATUS_STYLE[paper.status]}`}>{paper.status}</span>
          <span>{paper.venue}</span>
          <span>·</span>
          <span>{paper.year}</span>
        </div>

        <h3 className="mt-4 text-2xl font-medium leading-tight tracking-tight sm:text-[1.75rem]">{paper.title}</h3>
        <p className="mt-2 text-[0.95rem] text-ink-soft">
          <Authors list={paper.authors} />
        </p>

        <p className="mt-6 text-lg leading-relaxed">
          <Marker>{paper.keyIdea}</Marker>
        </p>

        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-6 flex items-center gap-2 font-mono text-xs text-ink-soft hover:text-accent"
          aria-expanded={open}
        >
          <motion.span animate={{ rotate: open ? 45 : 0 }} className="inline-block text-base leading-none">
            +
          </motion.span>
          {open ? "Hide abstract" : "Read abstract"}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="abs"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              className="overflow-hidden"
            >
              <p className="hyphenate border-l-2 border-rule pl-4 pt-3 text-justify text-[0.98rem] leading-relaxed text-ink-soft">{paper.abstract}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="border border-ink px-3 py-1.5 text-ink no-underline transition-colors hover:bg-ink hover:text-paper">
              {l.label} ↗
            </a>
          ))}
          <button onClick={copyBib} className="border border-ink px-3 py-1.5 transition-colors hover:bg-ink hover:text-paper">
            {copied ? "Copied ✓" : "BibTeX"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
