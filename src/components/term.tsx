"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NOISE } from "@/ascii/engine";

export const USER = "muntasir@portfolio";

export function PromptLabel({ path = "~" }: { path?: string }) {
  return (
    <>
      <span className="text-hot">{USER}</span>
      <span className="text-fg-dim">:</span>
      <span className="text-cool">{path}</span>
      <span className="text-fg-dim">$ </span>
    </>
  );
}

/** Types a command once it scrolls into view, then calls onDone. */
export function TypedCommand({ cmd, onDone, speed = 38 }: { cmd: string; onDone?: () => void; speed?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const done = n >= cmd.length;

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setN(cmd.length);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setN(i);
      if (i >= cmd.length) window.clearInterval(id);
    }, speed + Math.random() * 20);
    return () => window.clearInterval(id);
  }, [inView, reduce, cmd, speed]);

  useEffect(() => {
    if (done && onDone) {
      const id = window.setTimeout(onDone, 220);
      return () => window.clearTimeout(id);
    }
  }, [done, onDone]);

  return (
    <p ref={ref} className="break-words">
      <PromptLabel />
      <span className="text-fg">{cmd.slice(0, n)}</span>
      {!done && <span className="caret" />}
    </p>
  );
}

/** A section that starts with a typed shell command; content "prints" after it. */
export function Section({ id, cmd, children, className = "" }: { id: string; cmd: string; children: ReactNode; className?: string }) {
  const [ready, setReady] = useState(false);
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <TypedCommand cmd={cmd} onDone={() => setReady(true)} />
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {ready && children}
      </motion.div>
    </section>
  );
}

/** Text that decrypts from noise, left to right, when it enters view. */
export function Scramble({ text, className = "", duration = 0.9 }: { text: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = (now - t0) / 1000 / duration;
      const fixed = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        s += i < fixed || ch === " " ? ch : NOISE[(Math.random() * NOISE.length) | 0];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, text, duration]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

/** Tiny animated CPU sparkline for window footers. */
export function Sparkline({ seed = 1, width = 14 }: { seed?: number; width?: number }) {
  const bars = "▁▂▃▄▅▆▇█";
  const reduce = useReducedMotion();
  const [s, setS] = useState(() => Array.from({ length: width }, (_, i) => bars[(i * 7 + seed * 3) % bars.length]).join(""));
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setS((prev) => prev.slice(1) + bars[Math.floor(Math.random() * Math.random() * bars.length)]);
    }, 260 + seed * 30);
    return () => window.clearInterval(id);
  }, [reduce, seed]);
  return <span className="text-fg-dim">{s}</span>;
}
