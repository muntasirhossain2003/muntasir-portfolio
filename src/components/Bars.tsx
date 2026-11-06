"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { profile } from "@/data/content";
import { PromptLabel } from "./term";

export const TABS = [
  { id: "top", label: "home" },
  { id: "about", label: "about" },
  { id: "papers", label: "papers" },
  { id: "projects", label: "projects" },
  { id: "log", label: "log" },
  { id: "contact", label: "contact" },
];

const PHOSPHORS = ["green", "amber", "ice"] as const;
type Phos = (typeof PHOSPHORS)[number];

function setPhosphor(p: Phos) {
  document.documentElement.setAttribute("data-phosphor", p);
  try {
    localStorage.setItem("phosphor", p);
  } catch {}
}

function go(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function useActive() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const els = TABS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return active;
}

/** tmux-style status bar. */
export function StatusBar() {
  const active = useActive();
  const [clock, setClock] = useState("");
  const [pct, setPct] = useState(0);
  const [phos, setPhos] = useState<Phos>("green");

  useEffect(() => {
    const p = document.documentElement.getAttribute("data-phosphor") as Phos | null;
    if (p && PHOSPHORS.includes(p)) setPhos(p);
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearInterval(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const mo = new MutationObserver(() => {
      const p = document.documentElement.getAttribute("data-phosphor") as Phos | null;
      if (p) setPhos(p);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-phosphor"] });
    return () => mo.disconnect();
  }, []);

  const cycle = () => {
    const next = PHOSPHORS[(PHOSPHORS.indexOf(phos) + 1) % PHOSPHORS.length];
    setPhosphor(next);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/90 text-xs backdrop-blur-sm">
      <div className="mx-auto flex h-8 max-w-6xl items-center gap-3 px-3 sm:px-5">
        <span className="no-glow shrink-0 bg-fg px-1.5 text-bg">[0] mh</span>
        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((t, i) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={`shrink-0 px-1.5 no-underline ${active === t.id ? "no-glow bg-fg-faint text-fg" : "text-fg-dim hover:text-fg"}`}
            >
              {i}:{t.label}
              {active === t.id ? "*" : ""}
            </a>
          ))}
        </nav>
        <button onClick={cycle} className="shrink-0 text-fg-dim hover:text-hot" aria-label={`Phosphor colour: ${phos}. Click to change.`}>
          ◐ {phos}
        </button>
        <span className="hidden shrink-0 text-fg-dim sm:inline">{pct}%</span>
        <span className="hidden shrink-0 text-fg-dim sm:inline" suppressHydrationWarning>
          {clock}
        </span>
      </div>
    </header>
  );
}

type Out = { id: number; lines: string[]; tone?: "err" | "hot" };

const HELP = [
  "commands:",
  "  about | papers | projects | log | contact   jump to section",
  "  github | linkedin                           open profile",
  "  theme green|amber|ice                       phosphor colour",
  "  whoami · ls · clear · sudo hire-me",
];

/** Working shell prompt fixed at the bottom of the screen. */
export function CommandBar() {
  const [value, setValue] = useState("");
  const [out, setOut] = useState<Out | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef(0);

  const print = (lines: string[], tone?: Out["tone"], ms = 4500) => {
    setOut({ id: Date.now(), lines, tone });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOut(null), ms);
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    setHistory((h) => [raw, ...h].slice(0, 30));
    setHIdx(-1);
    const [head, ...args] = cmd.split(/\s+/);
    const section = TABS.find((t) => t.label === head || t.id === head);
    if (section) {
      go(section.id);
      print([`→ cd ~/${section.label}`]);
      return;
    }
    switch (head) {
      case "help":
      case "?":
      case "man":
        print(HELP, undefined, 9000);
        break;
      case "experience":
      case "git":
        go("log");
        print(["→ git log --graph"]);
        break;
      case "clear":
      case "home":
      case "cd":
        go("top");
        setOut(null);
        break;
      case "github":
      case "linkedin": {
        const href = profile.links[head as "github" | "linkedin"];
        if (href) {
          window.open(href, "_blank", "noopener,noreferrer");
          print([`→ opening ${href.replace(/^https?:\/\//, "")}`]);
        }
        break;
      }
      case "theme": {
        const p = args[0] as Phos;
        if (PHOSPHORS.includes(p)) {
          setPhosphor(p);
          print([`phosphor set to ${p}`]);
        } else print(["usage: theme green|amber|ice"], "err");
        break;
      }
      case "whoami":
        print([profile.name.toLowerCase().replace(" ", "_"), profile.role]);
        break;
      case "ls":
        print([TABS.filter((t) => t.id !== "top").map((t) => `${t.label}/`).join("  ")]);
        break;
      case "sudo":
        if (args.join(" ").startsWith("hire")) {
          print(["[sudo] password for recruiter: ********", "permission granted ✓  → opening contact"], "hot", 6000);
          window.setTimeout(() => go("contact"), 900);
        } else print([`sudo: ${args.join(" ") || "?"}: nice try`], "err");
        break;
      case "exit":
      case "logout":
        print(["there is no escape. try `contact` instead."], "hot");
        break;
      case "rm":
        print(["rm: permission denied (this portfolio is read-only)"], "err");
        break;
      default:
        print([`command not found: ${head}. type \`help\``], "err");
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(value);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = Math.min(history.length - 1, hIdx + 1);
      setHIdx(i);
      setValue(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIdx - 1;
      setHIdx(Math.max(-1, i));
      setValue(i >= 0 ? history[i] : "");
    } else if (e.key === "Tab") {
      const all = [...TABS.map((t) => t.label), "help", "github", "linkedin", "theme", "whoami", "sudo hire-me"];
      const m = all.find((c) => value && c.startsWith(value.toLowerCase()));
      if (m) {
        e.preventDefault();
        setValue(m);
      }
    } else if (e.key === "Escape") {
      setOut(null);
      input.current?.blur();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <AnimatePresence>
        {out && (
          <motion.div
            key={out.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mx-auto max-w-6xl px-3 sm:px-5"
          >
            <div
              className={`term-window mb-2 whitespace-pre-wrap px-3 py-2 text-xs sm:text-[13px] ${
                out.tone === "err" ? "text-err" : out.tone === "hot" ? "text-hot" : "text-fg"
              }`}
              role="status"
            >
              {out.lines.join("\n")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="border-t border-line bg-bg/92 backdrop-blur-sm">
        <form onSubmit={submit} className="mx-auto flex h-10 max-w-6xl items-center gap-0 px-3 text-[13px] sm:px-5">
          <label htmlFor="cmd" className="hidden shrink-0 sm:inline">
            <PromptLabel />
          </label>
          <span className="shrink-0 text-fg-dim sm:hidden">$&nbsp;</span>
          <input
            id="cmd"
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="type help  (press / to focus)"
            className="min-w-0 flex-1 bg-transparent text-fg caret-[var(--fg)] outline-none placeholder:text-fg-faint"
            aria-label="Terminal command"
          />
          <div className="hidden shrink-0 gap-1.5 md:flex">
            {["papers", "projects", "contact"].map((c) => (
              <button key={c} type="button" onClick={() => run(c)} className="text-xs text-fg-dim hover:text-hot">
                [{c}]
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
