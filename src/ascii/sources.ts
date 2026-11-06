import type { Draw, Palette } from "@/components/figures/kit";
import { boot } from "@/lib/boot";
import { BLOCKS, RAMP, randGlyph, rasterToField, type AsciiSource } from "./engine";

/** Palette used when drawing figures for ASCII sampling: black paper, white ink, pure R/B accents. */
const SCAN: Palette = {
  paper: "#000000",
  paper2: "#000000",
  ink: "#ffffff",
  inkSoft: "#c8c8c8",
  inkFaint: "#7a7a7a",
  rule: "#3a3a3a",
  accent: "#ff1010",
  accent2: "#1010ff",
};

/** Cell aspect (width / height) of the rendered art. */
const CELL = 0.6;

/* ── A figure (canvas draw fn) rendered as live ASCII ─────────── */
export function figureSource(draw: Draw, cols: number, aspect = 4 / 3): AsciiSource {
  const rows = Math.round((cols * CELL) / aspect);
  const W = cols * 5;
  const H = Math.round(W / aspect);
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let local = 0;
  return {
    cols,
    rows,
    ramp: RAMP,
    step(f, s) {
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        ctx = canvas.getContext("2d", { willReadFrequently: true });
      }
      if (!ctx) return;
      local = s.still ? s.t : local + s.dt;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      draw(ctx, { w: W, h: H, t: local, dt: s.dt, c: SCAN, still: s.still });
      ctx.restore();
      rasterToField(ctx.getImageData(0, 0, W, H), f);
      // pointer: a little "lens" of noise glyphs
      if (s.px > -100) {
        for (let y = Math.floor(s.py - 2); y <= s.py + 2; y++)
          for (let x = Math.floor(s.px - 4); x <= s.px + 4; x++) {
            if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
            const d = Math.hypot((x - s.px) * CELL, y - s.py);
            if (d < 2.2 && Math.random() < 0.5) {
              const k = y * cols + x;
              f.glyph[k] = randGlyph();
              f.tone[k] = 1;
              f.lum[k] = Math.max(f.lum[k], 0.7);
            }
          }
      }
    },
  };
}

/* ── Rotating torus ⇄ sphere (a nod to donut.c) ──────────────── */
export function morphSource(cols: number, rows: number): AsciiSource {
  let A = 0.6;
  let B = 0.2;
  let ax = 0;
  let ay = 0;
  const zbuf = new Float32Array(cols * rows);
  return {
    cols,
    rows,
    ramp: ".,-~:;=!*#$@",
    step(f, s) {
      const dt = s.still ? 0 : s.dt;
      // pointer steers the spin
      const tx = s.px > -100 ? (s.px / cols - 0.5) * 2 : 0;
      const ty = s.py > -100 ? (s.py / rows - 0.5) * 2 : 0;
      ax += (tx - ax) * Math.min(1, dt * 3);
      ay += (ty - ay) * Math.min(1, dt * 3);
      A += dt * (0.9 + ay * 1.5);
      B += dt * (0.45 + ax * 1.8);

      const m = 0.5 + 0.5 * Math.sin(s.t * 0.45); // 0 = sphere, 1 = torus
      const R1 = 1;
      const R2 = 0.05 + 1.65 * m;
      const K2 = 6;
      const K1 = (cols * K2 * 0.8) / (2 * (R1 + R2 + 0.3));

      zbuf.fill(0);
      const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
      for (let th = 0; th < 6.283; th += 0.06) {
        const ct = Math.cos(th), st = Math.sin(th);
        for (let ph = 0; ph < 6.283; ph += 0.018) {
          const cp = Math.cos(ph), sp = Math.sin(ph);
          const cx = R2 + R1 * ct;
          const cy = R1 * st;
          const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
          const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
          const z = K2 + cA * cx * sp + cy * sA;
          const ooz = 1 / z;
          const xp = Math.floor(cols / 2 + K1 * ooz * x);
          const yp = Math.floor(rows / 2 - K1 * ooz * y * CELL);
          if (xp < 0 || yp < 0 || xp >= cols || yp >= rows) continue;
          const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
          const k = yp * cols + xp;
          if (ooz > zbuf[k]) {
            zbuf[k] = ooz;
            const l = Math.max(0.08, L / 1.42);
            f.lum[k] = l;
            f.tone[k] = l > 0.975 ? 1 : 0;
          }
        }
      }
    },
  };
}

/* ── Big block-letter banner that decrypts and glitches ───────── */
export function bannerSource(lines: string[], cols: number, opts: { weight?: number; family?: string } = {}): AsciiSource {
  const longest = Math.max(...lines.map((l) => l.length));
  // Monospace caps are ~0.73em tall and 0.6em wide; stretch them vertically (figlet-style).
  const STRETCH = 1.75;
  const lineRows = Math.round((0.73 * cols * STRETCH) / longest) + 2;
  const rows = lineRows * lines.length;
  let base: Float32Array | null = null;
  let settle: Float32Array | null = null;
  let glitchRow = -1;
  let glitchUntil = 0;
  let glitchShift = 0;
  let nextGlitch = 3;

  const bake = () => {
    if (document.fonts && document.fonts.status !== "loaded") return false;
    const family = opts.family ?? (getComputedStyle(document.documentElement).getPropertyValue("--font-jb").trim() || "monospace");
    const W = cols * 6;
    const H = Math.round((rows / CELL) * 6);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    const lineH = H / lines.length;
    let size = 100;
    ctx.font = `${opts.weight ?? 800} ${size}px ${family}`;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    size *= (W * 0.985) / widest;
    ctx.font = `${opts.weight ?? 800} ${size}px ${family}`;
    const cap = ctx.measureText("H").actualBoundingBoxAscent || size * 0.73;
    const stretch = Math.min(STRETCH * 1.1, (lineH * 0.86) / cap);
    lines.forEach((l, i) => {
      ctx.save();
      ctx.translate(0, lineH * i + (lineH + cap * stretch) / 2);
      ctx.scale(1, stretch);
      ctx.fillText(l, 0, 0);
      ctx.restore();
    });
    const img = ctx.getImageData(0, 0, W, H);
    base = new Float32Array(cols * rows);
    settle = new Float32Array(cols * rows);
    const cw = W / cols;
    const chh = H / rows;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        let sum = 0;
        let n = 0;
        for (let yy = Math.floor(y * chh); yy < Math.floor((y + 1) * chh); yy++)
          for (let xx = Math.floor(x * cw); xx < Math.floor((x + 1) * cw); xx++) {
            sum += img.data[(yy * W + xx) * 4] / 255;
            n++;
          }
        const k = y * cols + x;
        base[k] = n ? sum / n : 0;
        settle[k] = 0.15 + (x / cols) * 1.1 + Math.random() * 0.35;
      }
    return true;
  };

  return {
    cols,
    rows,
    ramp: BLOCKS,
    step(f, s) {
      if (!base && !bake()) return;
      const since = s.still ? 99 : boot.since();
      if (since < 0) return;
      // occasional horizontal tear
      if (!s.still && since > nextGlitch) {
        glitchRow = Math.floor(Math.random() * rows);
        glitchShift = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 3));
        glitchUntil = since + 0.12;
        nextGlitch = since + 2.5 + Math.random() * 3.5;
      }
      for (let y = 0; y < rows; y++) {
        const tear = since < glitchUntil && Math.abs(y - glitchRow) <= 1 ? glitchShift : 0;
        for (let x = 0; x < cols; x++) {
          const sx = x - tear;
          if (sx < 0 || sx >= cols) continue;
          const src = y * cols + sx;
          const b = base![src];
          if (b < 0.06) continue;
          const k = y * cols + x;
          if (since < settle![src]) {
            // decrypting
            if (since > settle![src] - 0.9) {
              f.glyph[k] = randGlyph();
              f.tone[k] = 1;
              f.lum[k] = 0.9;
            }
            continue;
          }
          f.lum[k] = Math.min(1, b * 1.15);
          f.tone[k] = tear ? 2 : 0;
          if (s.px > -100) {
            const d = Math.hypot((x - s.px) * CELL, y - s.py);
            if (d < 3.2 && Math.random() < 0.55) {
              f.glyph[k] = randGlyph();
              f.tone[k] = 1;
            }
          }
          if (!s.still && Math.random() < 0.002) {
            f.glyph[k] = randGlyph();
            f.tone[k] = 2;
          }
        }
      }
    },
  };
}
