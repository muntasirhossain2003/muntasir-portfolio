"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { AsciiView } from "@/ascii/AsciiView";
import { bannerSource } from "@/ascii/sources";
import { profile } from "@/data/content";
import { Section } from "./term";

export function Contact() {
  const eof = useMemo(() => bannerSource(["SAY HI"], 64), []);
  const rows = [
    { k: "github", href: profile.links.github },
    { k: "linkedin", href: profile.links.linkedin },
    { k: "scholar", href: profile.links.scholar },
    { k: "email", href: profile.links.email && `mailto:${profile.links.email}`, text: profile.links.email },
    { k: "cv", href: profile.links.cv },
  ].filter((r) => r.href);

  const steps = ["resolving muntasir@portfolio", "handshake ............", "channel encrypted ...."];

  return (
    <Section id="contact" cmd="./contact.sh --open">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr]">
        <div className="term-window p-5 text-[13px] sm:text-sm">
          {steps.map((s, i) => (
            <motion.p key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.3 }}>
              <span className="text-fg-dim">{s}</span> <span className="text-fg glow-strong">ok</span>
            </motion.p>
          ))}
          <motion.dl className="mt-4 space-y-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            {rows.map((r) => (
              <div key={r.k} className="grid grid-cols-[5.5rem_1fr] gap-2">
                <dt className="text-hot">{r.k}</dt>
                <dd className="min-w-0">
                  <a
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="glitch break-all underline decoration-dotted"
                    data-text={r.text ?? r.href.replace(/^https?:\/\/(www\.)?/, "")}
                  >
                    {r.text ?? r.href.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </dd>
              </div>
            ))}
          </motion.dl>
          <motion.p className="mt-5 text-hot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            &gt; let&apos;s build something that runs.<span className="caret" />
          </motion.p>
        </div>
        <AsciiView source={eof} label="Say hi" />
      </div>
    </Section>
  );
}
