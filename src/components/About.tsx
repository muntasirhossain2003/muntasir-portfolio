"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { AsciiView } from "@/ascii/AsciiView";
import { bannerSource } from "@/ascii/sources";
import { introduction, papers, profile, projects, skills, trajectory } from "@/data/content";
import { Section } from "./term";

export function About() {
  const logo = useMemo(() => bannerSource(["MH"], 30), []);
  const since = Math.min(...trajectory.map((t) => Number(t.period.match(/\d{4}/)?.[0] ?? 9999)));

  const rows: [string, string][] = [
    ["OS", "MUNTASIR_OS v26.11 x86_64"],
    ["Role", profile.role],
    ["Host", `${profile.institution} · ${profile.location}`],
    ["Kernel", profile.affiliation],
    ["Uptime", Number.isFinite(since) && since < 9999 ? `building since ${since}` : "always on"],
    ...skills.map((s) => [s.label[0].toUpperCase() + s.label.slice(1), s.items.join(", ")] as [string, string]),
    ["Papers", `${papers.length} processes`],
    ["Projects", `${projects.length} repos`],
  ];

  return (
    <Section id="about" cmd="neofetch && cat about.md">
      <div className="grid items-start gap-8 md:grid-cols-[240px_1fr] md:gap-12">
        <AsciiView source={logo} label="MH logo" className="w-[200px] md:w-[240px]" />
        <div className="text-[13px] sm:text-sm">
          <p>
            <span className="text-hot">muntasir</span>
            <span className="text-fg-dim">@</span>
            <span className="text-hot">portfolio</span>
          </p>
          <p className="text-fg-dim">{"─".repeat(22)}</p>
          <dl className="mt-1 space-y-0.5">
            {rows.map(([k, v], i) => (
              <motion.div
                key={k}
                className="grid grid-cols-[6.5rem_1fr] gap-2"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <dt className="text-hot">{k}:</dt>
                <dd className="text-fg">{v}</dd>
              </motion.div>
            ))}
          </dl>
          <div className="mt-4 flex gap-0" aria-hidden>
            {["bg-fg", "bg-fg-dim", "bg-fg-faint", "bg-hot", "bg-cool", "bg-err", "bg-bg-3"].map((c) => (
              <span key={c} className={`h-4 w-7 ${c}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-3xl space-y-4 text-[14px] leading-7 sm:text-[15px]">
        <p className="text-fg-dim"># about.md</p>
        {introduction.map((p, i) => (
          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.2 }}>
            {p}
          </motion.p>
        ))}
      </div>
    </Section>
  );
}
