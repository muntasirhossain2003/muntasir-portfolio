"use client";

import { useEffect, useRef } from "react";

export type Palette = {
  paper: string;
  paper2: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  rule: string;
  accent: string;
  accent2: string;
};

export type Frame = {
  w: number;
  h: number;
  /** seconds since start (fixed when reduced motion is on) */
  t: number;
  dt: number;
  c: Palette;
  still: boolean;
};

export type Draw = (ctx: CanvasRenderingContext2D, f: Frame) => void;

function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return {
    paper: v("--paper"),
    paper2: v("--paper-2"),
    ink: v("--ink"),
    inkSoft: v("--ink-soft"),
    inkFaint: v("--ink-faint"),
    rule: v("--rule"),
    accent: v("--accent"),
    accent2: v("--accent-2"),
  };
}

/**
 * Runs a DPR-aware canvas render loop that:
 *  - only animates while on screen and the tab is visible
 *  - renders a single still frame (at `stillTime`) under prefers-reduced-motion
 *  - re-reads theme colours when the theme changes
 */
export function useCanvas(draw: Draw, stillTime = 3) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);

  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    let palette = readPalette();
    let w = 0;
    let h = 0;
    let t = 0;
    let raf = 0;
    let last = 0;
    let visible = false;

    const render = (dt: number) => {
      if (w === 0 || h === 0) return;
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      drawRef.current(ctx, { w, h, t: reduce.matches ? stillTime : t, dt, c: palette, still: reduce.matches });
      ctx.restore();
    };

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0;
      last = now;
      t += dt;
      render(dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (visible && !reduce.matches && !document.hidden) start();
      else {
        stop();
        render(0);
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(0);
    };

    const repaint = () => {
      palette = readPalette();
      if (!raf) render(0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px" },
    );
    io.observe(canvas);
    const mo = new MutationObserver(repaint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    scheme.addEventListener("change", repaint);
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    resize();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      scheme.removeEventListener("change", repaint);
      reduce.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [stillTime]);

  return ref;
}

/* ── small math helpers shared by figures ─────────────────── */

/** Deterministic pseudo-random in [0,1) from a number. */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Seeded PRNG (mulberry32). */
export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

let monoFamily: string | null = null;
function mono() {
  if (monoFamily === null) {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim();
    monoFamily = v ? `${v}, monospace` : "monospace";
  }
  return monoFamily;
}

export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, align: CanvasTextAlign = "left", size = 10) {
  ctx.font = `${size}px ${mono()}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}
