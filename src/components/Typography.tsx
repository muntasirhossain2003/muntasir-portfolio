"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const seeded = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.1) * 10000;
  return x - Math.floor(x);
};

/** Letters drop into place like hand-set metal type. */
export function Typeset({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  let idx = 0;
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {word.split("").map((ch, ci) => {
            const i = idx++;
            const r = seeded(i);
            return (
              <motion.span
                key={ci}
                className="inline-block"
                initial={reduce ? false : { opacity: 0, y: -60 - r * 60, rotate: (r - 0.5) * 50, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
                transition={{ delay: delay + i * 0.05, type: "spring", stiffness: 240, damping: 17, mass: 0.9 }}
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
      </span>
    </span>
  );
}

/** Words soak into the page like ink as they scroll into view. */
export function InkText({ text, className, delay = 0, step = 0.012 }: { text: string; className?: string; delay?: number; step?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <p className={className}>{text}</p>;
  return (
    <motion.p className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          className="inline"
          variants={{
            hidden: { opacity: 0.08, filter: "blur(5px)" },
            show: { opacity: 1, filter: "blur(0px)", transition: { delay: delay + i * step, duration: 0.6 } },
          }}
        >
          {w}{" "}
        </motion.span>
      ))}
    </motion.p>
  );
}

/** Highlighter stroke sweeps across the text when it enters view. */
export function Marker({ children, delay = 0.2 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="marker"
      initial={reduce ? false : { backgroundSize: "0% 42%" }}
      whileInView={{ backgroundSize: "100% 42%" }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] }}
      style={{ backgroundSize: reduce ? "100% 42%" : undefined }}
    >
      {children}
    </motion.span>
  );
}
