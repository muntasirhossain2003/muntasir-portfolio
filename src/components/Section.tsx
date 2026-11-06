"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Section({
  id,
  n,
  title,
  kicker,
  children,
}: {
  id: string;
  n?: string;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-20 sm:py-28">
      <header className="mb-10 sm:mb-14">
        <motion.h2
          className="flex items-baseline gap-4 text-3xl font-medium tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {n && <span className="font-mono text-xl text-accent sm:text-2xl">{n}</span>}
          <span>{title}</span>
        </motion.h2>
        <motion.div
          className="mt-4 h-px origin-left bg-ink"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1], delay: 0.15 }}
        />
        {kicker && (
          <motion.p
            className="mt-4 max-w-2xl italic text-ink-soft"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {kicker}
          </motion.p>
        )}
      </header>
      {children}
    </section>
  );
}
