/**
 * Tiny mutable store shared by the DOM and the WebGL scene.
 * Read inside useFrame — never triggers React renders.
 */
import type Lenis from "lenis";

export const store: {
  px: number;
  py: number;
  dark: boolean;
  reduced: boolean;
  introStart: number;
  lenis: Lenis | null;
} = {
  lenis: null,
  /** pointer in [-1, 1], y up */
  px: 0,
  py: 0,
  dark: false,
  reduced: false,
  /** seconds since the intro started (set when fonts + textures are ready) */
  introStart: -1,
};

/** Rect of a DOM section relative to the document, measured live. */
export function sectionMetrics(id: string) {
  const el = document.getElementById(id);
  const vh = window.innerHeight;
  const y = window.scrollY;
  if (!el) return { top: 0, height: vh, y, vh, found: false };
  const r = el.getBoundingClientRect();
  return { top: r.top + y, height: r.height, y, vh, found: true };
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
