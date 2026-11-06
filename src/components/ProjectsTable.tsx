"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { projects } from "@/data/content";

/** Projects as an academic "Table 1" with booktabs rules; rows unfold on click. */
export function ProjectsTable() {
  const [open, setOpen] = useState<number | null>(0);
  const cols = "grid grid-cols-[2rem_1fr_3.5rem] sm:grid-cols-[2.5rem_1.1fr_1.3fr_4rem] gap-x-4";

  return (
    <div>
      <p className="mb-3 text-center text-sm">
        <span className="font-semibold">Table 1:</span> <span className="text-ink-soft">Selected projects. Select a row to expand it.</span>
      </p>
      <div className="border-y-2 border-ink">
        <div className={`${cols} border-b border-ink py-2.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft`}>
          <span>#</span>
          <span>Project</span>
          <span className="hidden sm:block">Stack</span>
          <span className="text-right">Year</span>
        </div>

        {projects.map((p, i) => {
          const isOpen = open === i;
          const links = [
            { label: "Code", href: p.links.code },
            { label: "Live demo", href: p.links.demo },
          ].filter((l) => l.href);
          return (
            <motion.div
              key={p.name}
              className={i < projects.length - 1 ? "border-b border-rule" : ""}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className={`${cols} w-full items-baseline py-4 text-left transition-colors hover:bg-paper-2 ${isOpen ? "bg-paper-2" : ""}`}
              >
                <span className="pl-1 font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="text-lg font-medium">{p.name}</span>
                  <span className="mt-0.5 block text-sm italic text-ink-soft">{p.summary}</span>
                </span>
                <span className="hidden font-mono text-xs leading-relaxed text-ink-soft sm:block">{p.stack.join(" · ")}</span>
                <span className="pr-1 text-right font-mono text-xs text-ink-soft">{p.year}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                    className="overflow-hidden bg-paper-2"
                  >
                    <div className="grid grid-cols-[2rem_1fr] gap-x-4 pb-5 sm:grid-cols-[2.5rem_1fr]">
                      <span />
                      <div className="pr-4">
                        <p className="max-w-2xl leading-relaxed">{p.description}</p>
                        <p className="mt-3 font-mono text-xs text-ink-soft sm:hidden">{p.stack.join(" · ")}</p>
                        {links.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
                            {links.map((l) => (
                              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="border border-ink px-3 py-1.5 text-ink no-underline transition-colors hover:bg-ink hover:text-paper">
                                {l.label} ↗
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
