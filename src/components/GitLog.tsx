"use client";

import { motion } from "motion/react";
import { trajectory, type TrajectoryItem } from "@/data/content";
import { Section } from "./term";

const TYPE: Record<TrajectoryItem["kind"], string> = {
  research: "research",
  work: "feat",
  education: "edu",
  award: "award",
};

/** Stable fake commit hash from a string. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

export function GitLog() {
  const items = [...trajectory, null];
  return (
    <Section id="log" cmd="git log --graph --decorate">
      <ol className="text-[13px] sm:text-sm">
        {items.map((t, i) => {
          const last = t === null;
          return (
            <motion.li
              key={i}
              className="grid grid-cols-[2rem_1fr]"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.18, duration: 0.35 }}
            >
              <div className="relative flex justify-center">
                <span className="relative z-10 leading-6 text-hot glow-strong">*</span>
                {!last && (
                  <motion.span
                    className="absolute bottom-0 left-1/2 top-6 w-px origin-top bg-fg-dim"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.18 + 0.15, duration: 0.4 }}
                  />
                )}
              </div>
              <div className="pb-7">
                {t ? (
                  <>
                    <p className="leading-6">
                      <span className="text-hot">{hash(t.title + t.org)}</span>{" "}
                      {i === 0 && <span className="text-cool">(HEAD -&gt; main) </span>}
                      <span className="text-fg-dim">{t.period}</span>
                    </p>
                    <p className="mt-0.5">
                      <span className="text-cool">{TYPE[t.kind]}:</span> <span className="font-bold">{t.title}</span>{" "}
                      <span className="text-fg-dim">@</span> {t.org}
                    </p>
                    {t.note && <p className="mt-0.5 text-fg-dim">    {t.note}</p>}
                  </>
                ) : (
                  <p className="leading-6">
                    <span className="text-hot">0000000</span> <span className="text-fg-dim">initial commit —</span> hello, world
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Section>
  );
}
