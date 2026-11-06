"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { projects } from "@/data/content";
import { Section } from "./term";

const dir = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function Projects() {
  const [open, setOpen] = useState<number | null>(null);
  const cols = "grid grid-cols-[1fr_auto] md:grid-cols-[7.5rem_5.5rem_3.5rem_15rem_1fr] gap-x-4";

  return (
    <Section id="projects" cmd="ls -la ~/projects">
      <div className="text-[13px] sm:text-sm">
        <p className="text-fg-dim">total {projects.length}</p>
        <div className="mt-1">
          {projects.map((p, i) => {
            const isOpen = open === i;
            const d = dir(p.name);
            const links = [
              { label: "source", href: p.links.code },
              { label: "live", href: p.links.demo },
            ].filter((l) => l.href);
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className={`${cols} group w-full px-1 py-1 text-left transition-colors hover:bg-fg hover:text-bg hover:[text-shadow:none] ${isOpen ? "bg-bg-3" : ""}`}
                >
                  <span className="hidden text-fg-dim group-hover:text-bg md:inline">drwxr-xr-x</span>
                  <span className="hidden text-fg-dim group-hover:text-bg md:inline">muntasir</span>
                  <span className="hidden text-fg-dim group-hover:text-bg md:inline">{p.year}</span>
                  <span className="font-bold text-hot group-hover:text-bg">
                    {isOpen ? "▾ " : "▸ "}
                    {d}/
                  </span>
                  <span className="truncate text-fg-dim group-hover:text-bg">
                    <span className="md:hidden">{p.year}</span>
                    <span className="hidden md:inline">{p.summary}</span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="term-window my-3 ml-1 p-4 sm:ml-6">
                        <p>
                          <span className="text-fg-dim">$</span> cat {d}/README.md
                        </p>
                        <p className="mt-3 font-bold text-hot"># {p.name}</p>
                        <p className="mt-1 italic text-fg-dim">{p.summary}</p>
                        <p className="mt-3 max-w-3xl leading-relaxed">{p.description}</p>
                        <p className="mt-3 text-fg-dim">
                          deps: [{p.stack.map((s, k) => (
                            <span key={s}>
                              <span className="text-cool">{s}</span>
                              {k < p.stack.length - 1 && ", "}
                            </span>
                          ))}]
                        </p>
                        {links.length > 0 && (
                          <div className="mt-4 flex gap-2 text-xs">
                            {links.map((l) => (
                              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="btn">
                                {l.label} ↗
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-fg-dim">click a directory to cat its README</p>
      </div>
    </Section>
  );
}
