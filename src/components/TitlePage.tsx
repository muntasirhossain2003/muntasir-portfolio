"use client";

import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/data/content";
import { InkText, Typeset } from "./Typography";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] as const },
});

export function TitlePage() {
  const reduce = useReducedMotion();
  const nameDone = 0.35 + profile.name.length * 0.05 + 0.4;
  const today = new Date();
  const stamp = `portfolio:${String(today.getFullYear()).slice(2)}${String(today.getMonth() + 1).padStart(2, "0")}.00001v1  [cs]  ${today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;

  const links = [
    { label: "GitHub", href: profile.links.github },
    { label: "Scholar", href: profile.links.scholar },
    { label: "LinkedIn", href: profile.links.linkedin },
    { label: "CV", href: profile.links.cv },
    { label: "Email", href: profile.links.email && `mailto:${profile.links.email}` },
  ].filter((l) => l.href);

  return (
    <header id="abstract" className="relative flex min-h-svh flex-col justify-center px-4 pb-10 pt-28 sm:px-6">
      {/* margin stamp, preprint-server style */}
      <div
        className="pointer-events-none absolute left-3 top-1/2 hidden select-none lg:block xl:left-8"
        style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
        aria-hidden
      >
        <motion.p className="font-mono text-sm tracking-wider text-ink-faint/70" suppressHydrationWarning {...fade(nameDone + 0.6)}>
          {stamp}
        </motion.p>
      </div>

      <div className="mx-auto w-full max-w-3xl text-center">
        <motion.p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-faint sm:text-xs" {...fade(0.1)}>
          Preprint · Research Portfolio · {today.getFullYear()}
        </motion.p>

        <h1 className="mt-8 text-[clamp(2.9rem,11vw,6.5rem)] font-medium leading-[0.95] tracking-tight">
          <Typeset text={profile.name} delay={0.35} />
        </h1>

        <motion.p className="mt-6 text-xl italic text-ink-soft sm:text-2xl" {...fade(nameDone)}>
          {profile.role}
        </motion.p>

        <motion.div className="mt-8 space-y-1 text-[0.95rem]" {...fade(nameDone + 0.2)}>
          <p>
            {profile.name}
            <sup className="text-accent">1</sup>
          </p>
          <p className="text-sm text-ink-soft">
            <sup className="text-accent">1</sup> {profile.affiliation}, {profile.institution}, {profile.location}
          </p>
        </motion.div>

        {links.length > 0 && (
          <motion.ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-xs" {...fade(nameDone + 0.35)}>
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-accent-2 hover:text-accent" target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  [{l.label}]
                </a>
              </li>
            ))}
          </motion.ul>
        )}

        <motion.div className="mx-auto mt-14 max-w-xl text-left" {...fade(nameDone + 0.5)}>
          <p className="smallcaps mb-3 text-center font-semibold">Abstract</p>
          <InkText text={profile.abstract} delay={reduce ? 0 : nameDone + 0.6} step={0.018} className="hyphenate text-[1.02rem] leading-relaxed sm:text-justify" />
          <p className="mt-5 text-sm text-ink-soft">
            <span className="font-semibold italic text-ink">Keywords — </span>
            {profile.keywords.join(" · ")}
          </p>
        </motion.div>
      </div>

      <motion.a
        href="#introduction"
        className="mx-auto mt-14 flex w-fit flex-col items-center gap-2 font-mono text-[11px] text-ink-faint no-underline hover:text-accent"
        {...fade(nameDone + 1.4)}
      >
        continue to §1
        <span className="relative block h-10 w-px overflow-hidden bg-rule">
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
