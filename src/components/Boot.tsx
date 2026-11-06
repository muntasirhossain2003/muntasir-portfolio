"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { papers, profile } from "@/data/content";
import { boot } from "@/lib/boot";

const MODULES = Array.from(new Set(papers.map((p) => p.figure)));

const LINES = [
  `MHBIOS v26.11  (c) ${new Date().getFullYear()} ${profile.name}`,
  "CPU0: curiosity-core x8 @ 4.20GHz ............ [ OK ]",
  `MEM : ${papers.length * 16384}K papers / 32768K projects ........ [ OK ]`,
  `kmod: loading ${MODULES.map((m) => `[${m}]`).join(" ")}`,
  "fs  : mounting /home/muntasir/research ........ [ OK ]",
  "net : linking github, linkedin ................ [ OK ]",
  "init: starting portfolio daemon ...............",
];

/** BIOS-style boot screen. Plays once per session; any key / click skips. */
export function Boot() {
  const [show, setShow] = useState(true);
  const [n, setN] = useState(0);
  const [pct, setPct] = useState(0);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("booted") === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setShow(false);
      boot.finish();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const timers: number[] = [];
    const end = () => {
      timers.forEach(clearTimeout);
      try {
        sessionStorage.setItem("booted", "1");
      } catch {}
      document.documentElement.style.overflow = "";
      setShow(false);
      boot.finish();
    };
    LINES.forEach((_, i) => timers.push(window.setTimeout(() => setN(i + 1), 140 + i * 190)));
    const barStart = 140 + LINES.length * 190;
    for (let k = 1; k <= 20; k++) timers.push(window.setTimeout(() => setPct(k * 5), barStart + k * 38));
    timers.push(window.setTimeout(() => setGranted(true), barStart + 21 * 38 + 80));
    timers.push(window.setTimeout(end, barStart + 21 * 38 + 900));

    const skip = () => end();
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.documentElement.style.overflow = "";
    };
  }, []);

  const bar = Math.round(pct / 5);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-bg p-5 text-[13px] leading-relaxed sm:p-10 sm:text-sm"
          exit={{ scaleY: [1, 0.004, 0.004], scaleX: [1, 1, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.55, times: [0, 0.6, 1], ease: "easeIn" }}
          role="status"
          aria-label="Booting"
        >
          <div className="space-y-0.5">
            {LINES.slice(0, n).map((l, i) => (
              <p key={i} className={i === 0 ? "mb-3 text-hot" : ""}>
                {l.includes("[ OK ]") ? (
                  <>
                    {l.replace("[ OK ]", "")}
                    <span className="text-fg glow-strong">[ OK ]</span>
                  </>
                ) : (
                  l
                )}
              </p>
            ))}
            {n >= LINES.length && (
              <p className="pt-2">
                [{"█".repeat(bar)}
                <span className="text-fg-faint">{"░".repeat(20 - bar)}</span>] {pct}%
              </p>
            )}
            {granted && <p className="pt-4 font-vt text-4xl text-hot glow-strong sm:text-6xl">ACCESS GRANTED</p>}
            {!granted && <span className="caret" />}
          </div>
          <p className="mt-auto text-xs text-fg-dim">press any key to skip</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
