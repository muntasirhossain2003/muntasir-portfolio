"use client";

import { motion } from "motion/react";
import { introduction, skills } from "@/data/content";
import { InkText } from "./Typography";

export function Introduction() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_17rem] lg:gap-16">
      <div className="max-w-2xl space-y-5 text-[1.08rem] leading-[1.75]">
        {introduction.map((p, i) => (
          <InkText key={i} text={p} className={`hyphenate sm:text-justify ${i === 0 ? "dropcap" : ""}`} step={0.008} />
        ))}
      </div>

      <motion.aside
        className="sheet relative self-start rotate-[1.5deg] px-5 py-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <span className="tape -top-3 left-6 rotate-[-6deg]" aria-hidden />
        <span className="tape -bottom-3 right-6 rotate-[4deg]" aria-hidden />
        <p className="smallcaps mb-3 border-b border-ink pb-2 text-sm font-semibold">Notation</p>
        <dl className="space-y-3">
          {skills.map((s, i) => (
            <motion.div
              key={s.label}
              className="grid grid-cols-[1.75rem_1fr] gap-x-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12 }}
            >
              <dt className="text-xl leading-6 text-accent">{s.symbol}</dt>
              <dd className="text-sm leading-snug">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{s.label}</span>
                <br />
                <span className="text-ink-soft">{"{ "}{s.items.join(", ")}{" }"}</span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </motion.aside>
    </div>
  );
}
