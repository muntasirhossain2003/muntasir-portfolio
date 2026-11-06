"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { AsciiView } from "@/ascii/AsciiView";
import { bannerSource, morphSource } from "@/ascii/sources";
import { profile } from "@/data/content";
import { boot } from "@/lib/boot";

function useBooted() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (boot.doneAt >= 0) setOk(true);
    const off = boot.subscribe(() => setOk(true));
    return () => {
      off();
    };
  }, []);
  return ok;
}

/** Prints lines one character at a time, line after line. */
function TypeLines({ lines, start }: { lines: { k: string; v: string }[]; start: boolean }) {
  const [n, setN] = useState(0);
  const total = lines.reduce((a, l) => a + l.k.length + l.v.length + 1, 0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(total);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setN(i);
      if (i >= total) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [start, total]);

  let left = n;
  return (
    <div className="space-y-1.5 text-[13px] sm:text-[15px]">
      {lines.map((l, i) => {
        const len = l.k.length + l.v.length + 1;
        const shown = Math.max(0, Math.min(len, left));
        left -= len;
        if (shown === 0) return null;
        const text = `${l.k} ${l.v}`.slice(0, shown);
        const typing = shown < len;
        return (
          <p key={i}>
            <span className="text-fg-dim">&gt; </span>
            <span className="text-hot">{text.slice(0, l.k.length)}</span>
            <span>{text.slice(l.k.length)}</span>
            {typing && <span className="caret" />}
          </p>
        );
      })}
    </div>
  );
}

export function Hero() {
  const booted = useBooted();
  const [wide, setWide] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const set = () => setWide(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const name = profile.name.toUpperCase();
  const banner = useMemo(() => (wide === null ? null : wide ? bannerSource([name], 132) : bannerSource(name.split(" "), 60)), [wide, name]);
  const morph = useMemo(() => morphSource(70, 40), []);

  const links = [
    { label: "github", href: profile.links.github },
    { label: "linkedin", href: profile.links.linkedin },
    { label: "scholar", href: profile.links.scholar },
    { label: "cv.pdf", href: profile.links.cv },
  ].filter((l) => l.href);

  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-center pb-20 pt-14">
      <h1 className="sr-only">
        {profile.name} — {profile.role}
      </h1>
      <motion.p
        className="text-[11px] text-fg-dim sm:text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        suppressHydrationWarning
      >
        MUNTASIR_OS v26.11 · tty1 · last login: {new Date().toDateString()} from 127.0.0.1
      </motion.p>

      <div className="mt-4 min-h-[14vw]">{banner && <AsciiView source={banner} label={profile.name} />}</div>

      <div className="mt-8 grid items-start gap-10 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <TypeLines
            start={booted}
            lines={[
              { k: "role:", v: profile.role },
              { k: "focus:", v: profile.keywords.join(" · ") },
              { k: "papers:", v: "rendered below as live ASCII processes" },
              { k: "status:", v: "open to research & engineering roles" },
            ]}
          />
          <motion.div
            className="mt-8 flex flex-wrap gap-2 text-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.6 }}
          >
            <a href="#papers" className="btn btn-hot">
              ./read_papers ↓
            </a>
            {links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="btn">
                {l.label} ↗
              </a>
            ))}
          </motion.div>
          <motion.p
            className="mt-6 text-xs text-fg-dim"
            initial={{ opacity: 0 }}
            animate={booted ? { opacity: 1 } : {}}
            transition={{ delay: 2.2 }}
          >
            tip: the prompt at the bottom works — type <span className="text-hot">help</span> or press <kbd className="text-hot">/</kbd>
          </motion.p>
        </div>

        <motion.figure initial={{ opacity: 0 }} animate={booted ? { opacity: 1 } : {}} transition={{ delay: 0.6, duration: 1 }}>
          <AsciiView source={morph} label="Rotating ASCII torus that morphs into a sphere" className="mx-auto max-w-[460px] md:-mt-6" />
          <figcaption className="mt-2 text-center text-[11px] text-fg-dim">fig.0 — torus ⇄ sphere · steer it with your mouse</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
