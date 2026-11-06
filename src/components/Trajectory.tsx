"use client";

import { motion } from "motion/react";
import { profile, trajectory, type TrajectoryItem } from "@/data/content";

const VERB: Record<TrajectoryItem["kind"], string> = {
  education: "study",
  research: "research",
  work: "build",
  award: "receive",
};

type Line = { indent: number; code: React.ReactNode; comment?: string };

const kw = (s: string) => <span className="font-semibold text-accent-2">{s}</span>;
const fn = (s: string) => <span className="font-serif text-[1.08em] italic">{s}</span>;

/** Career history rendered as an "Algorithm 1" pseudocode block. */
export function Trajectory() {
  const handle = profile.name.split(" ")[0].toLowerCase();
  const lines: Line[] = [
    { indent: 0, code: <>{kw("Require:")} curiosity &gt; 0, coffee ≥ 1</> },
    { indent: 0, code: <>{kw("procedure")} {fn("Trajectory")}({handle})</> },
    ...trajectory.flatMap<Line>((t) => [
      {
        indent: 1,
        code: (
          <>
            {handle}.{fn(VERB[t.kind])}(<span className="text-ink">{t.title}</span>, <span className="text-ink-soft">{t.org}</span>)
          </>
        ),
        comment: t.period,
      },
      ...(t.note ? [{ indent: 2, code: <span className="text-ink-faint">▷ {t.note}</span> } as Line] : []),
    ]),
    { indent: 1, code: <>{kw("return")} {handle}</>, comment: "still iterating" },
    { indent: 0, code: <>{kw("end procedure")}</> },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="border-y-2 border-ink font-mono text-[12.5px] sm:text-sm">
        <div className="border-b border-ink py-2.5">
          <span className="font-semibold">Algorithm 1</span> <span className="font-serif text-base italic">Trajectory</span>
          <span className="text-ink-soft"> — a greedy walk through the search space</span>
        </div>
        <ol className="py-3">
          {lines.map((l, i) => (
            <motion.li
              key={i}
              className="grid grid-cols-[2rem_1fr] items-baseline gap-x-2 py-[3px]"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -5% 0px" }}
              transition={{ duration: 0.4, delay: i * 0.09 }}
            >
              <span className="select-none text-right text-ink-faint">{i + 1}:</span>
              <span className="flex flex-wrap items-baseline justify-between gap-x-6" style={{ paddingLeft: `${l.indent * 1.5}rem` }}>
                <span>
                  {l.code}
                  {i === lines.length - 1 && <span className="caret ml-1 inline-block h-[1em] w-[0.55em] translate-y-[2px] bg-accent" />}
                </span>
                {l.comment && <span className="text-ink-faint">▷ {l.comment}</span>}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
