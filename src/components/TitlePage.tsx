"use client";

import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/data/content";
import { Typeset } from "./Typography";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] as const },
});

export function TitlePage() {
  const reduce = useReducedMotion();
  const [first, ...rest] = profile.name.split(" ");
  const nameDone = 0.3 + profile.name.length * 0.05 + 0.3;

  const links = [
    { label: "GitHub", href: profile.links.github },
    { label: "LinkedIn", href: profile.links.linkedin },
    { label: "Scholar", href: profile.links.scholar },
    { label: "CV", href: profile.links.cv },
    { label: "Email", href: profile.links.email && `mailto:${profile.links.email}` },
  ].filter((l) => l.href);

  return (
    <header id="abstract" className="relative min-h-svh">
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-5 pb-14 pt-[50svh] wide:justify-center wide:pb-20 wide:pt-24">
        <div className="wide:max-w-[48%]">
          <motion.p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink-faint" {...fade(0.1)}>
            Preprint · Research Portfolio · {new Date().getFullYear()}
          </motion.p>

          <h1 className="mt-5 font-medium leading-[0.88] tracking-[-0.02em] text-[clamp(3.2rem,9.5vw,7.8rem)]">
            <Typeset text={first} delay={0.3} className="block" />
            <span className="block italic text-accent">
              <Typeset text={rest.join(" ")} delay={0.3 + first.length * 0.05} />
            </span>
          </h1>

          <motion.p className="mt-6 max-w-md text-xl text-ink-soft sm:text-2xl" {...fade(nameDone)}>
            {profile.role}. <span className="italic">Turning papers into things that move.</span>
          </motion.p>

          <motion.div className="mt-8 flex flex-wrap gap-3 font-mono text-xs" {...fade(nameDone + 0.2)}>
            <a
              href="#publications"
              className="sheet group relative inline-flex items-center gap-2 px-4 py-2.5 text-ink no-underline transition-transform hover:-translate-y-0.5"
            >
              Read the papers
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="inline-flex items-center border border-ink/30 px-4 py-2.5 text-ink-soft no-underline transition-colors hover:border-accent hover:text-accent"
              >
                {l.label} ↗
              </a>
            ))}
          </motion.div>

          <motion.p className="mt-10 hidden max-w-sm text-sm leading-relaxed text-ink-faint wide:block" {...fade(nameDone + 0.4)}>
            <span className="smallcaps font-semibold text-ink-soft">Abstract — </span>
            {profile.abstract.split(". ").slice(0, 2).join(". ")}.
          </motion.p>
        </div>
      </div>

      <motion.a
        href="#introduction"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[11px] text-ink-faint no-underline hover:text-accent wide:flex"
        {...fade(nameDone + 1.2)}
      >
        scroll — the pages scatter
        <span className="relative block h-10 w-px overflow-hidden bg-ink/15">
          {!reduce && (
            <motion.span
              className="absolute left-0 top-0 block h-4 w-px bg-accent"
              animate={{ y: [-16, 40] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </span>
      </motion.a>
    </header>
  );
}
