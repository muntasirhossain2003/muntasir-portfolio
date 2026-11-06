"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useRef, type PointerEvent } from "react";
import { projects, type Project } from "@/data/content";

const TILT = [-1.6, 1.2, 0.8, -1.1, 1.5, -0.7];

function Card({ p, i }: { p: Project; i: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 170, damping: 16 });
  const ry = useSpring(0, { stiffness: 170, damping: 16 });
  const rz = useSpring(TILT[i % TILT.length], { stiffness: 120, damping: 14 });
  const lift = useSpring(0, { stiffness: 170, damping: 18 });

  const onMove = (e: PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ry.set(x * 16);
    rx.set(-y * 12);
  };
  const onEnter = () => {
    rz.set(0);
    lift.set(-10);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    rz.set(TILT[i % TILT.length]);
    lift.set(0);
  };

  const links = [
    { label: "Code", href: p.links.code },
    { label: "Live", href: p.links.demo },
  ].filter((l) => l.href);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 90, rotateX: 55 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, delay: (i % 2) * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
      style={{ transformPerspective: 1100, transformOrigin: "50% 100%" }}
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        className="index-card sheet relative h-full p-6 sm:p-7"
        style={{ rotateX: rx, rotateY: ry, rotate: rz, y: lift, transformPerspective: 900, transformStyle: "preserve-3d" }}
      >
        <div className="-mx-6 -mt-6 border-b-2 border-accent/60 bg-paper px-6 pb-3 pt-6 sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7" style={{ transformStyle: "preserve-3d" }}>
          <div className="flex items-baseline justify-between font-mono text-[11px] text-ink-faint" style={{ transform: "translateZ(18px)" }}>
            <span>No. {String(i + 1).padStart(2, "0")}</span>
            <span>{p.year}</span>
          </div>
          <h3 className="mt-2 text-2xl font-medium leading-tight sm:text-[1.7rem]" style={{ transform: "translateZ(40px)" }}>
            {p.name}
          </h3>
        </div>
        <div className="mt-4 space-y-0 leading-8" style={{ transform: "translateZ(22px)" }}>
          <p className="italic text-ink-soft">{p.summary}</p>
          <p className="text-[0.98rem]">{p.description}</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2" style={{ transform: "translateZ(30px)" }}>
          {p.stack.map((s) => (
            <span key={s} className="border border-ink/20 bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-soft">
              {s}
            </span>
          ))}
          <span className="flex-1" />
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="font-mono text-xs text-accent-2 hover:text-accent">
              {l.label} ↗
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProjectCards() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
      {projects.map((p, i) => (
        <Card key={p.name} p={p} i={i} />
      ))}
    </div>
  );
}
