"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { profile } from "@/data/content";

export function References() {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const year = new Date().getFullYear();
  const last = profile.name.split(" ").slice(-1)[0];
  const first = profile.name.split(" ").slice(0, -1).join(" ");
  const bib = `@misc{${last.toLowerCase()}${year}portfolio,
  author = {${last}, ${first}},
  title  = {${profile.name}: Research Portfolio},
  year   = {${year}},
  url    = {${origin}}
}`;

  const refs = [
    { what: "Code & open source", where: "GitHub", href: profile.links.github },
    { what: "Publications & citations", where: "Google Scholar", href: profile.links.scholar },
    { what: "Professional profile", where: "LinkedIn", href: profile.links.linkedin },
    { what: "Curriculum vitae", where: "PDF", href: profile.links.cv },
    { what: "Correspondence", where: "Email", href: profile.links.email && `mailto:${profile.links.email}`, text: profile.links.email },
  ].filter((r) => r.href);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bib);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="sheet relative grid grid-cols-1 gap-12 p-6 sm:p-10 lg:grid-cols-2">
      <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-3deg]" aria-hidden />
      <ol className="space-y-4">
        {refs.map((r, i) => (
          <motion.li
            key={r.where}
            className="grid grid-cols-[2.5rem_1fr] text-[0.98rem]"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <span className="font-mono text-sm text-accent">[{i + 1}]</span>
            <span>
              {profile.citeName}. <em>{r.what}</em>. {r.where},{" "}
              <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="font-mono text-sm text-accent-2 [overflow-wrap:anywhere] hover:text-accent">
                {r.text ?? r.href.replace(/^https?:\/\//, "")}
              </a>
              .
            </span>
          </motion.li>
        ))}
      </ol>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
        <div className="flex items-center justify-between">
          <p className="smallcaps text-sm font-semibold">Cite this portfolio</p>
          <button onClick={copy} className="font-mono text-xs text-ink-soft hover:text-accent">
            {copied ? "copied ✓" : "copy"}
          </button>
        </div>
        <pre className="mt-3 overflow-x-auto border border-rule bg-paper-2 p-4 [overflow-wrap:anywhere] whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-soft" suppressHydrationWarning>
          {bib}
        </pre>
      </motion.div>
    </div>
  );
}
