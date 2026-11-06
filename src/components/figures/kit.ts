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
