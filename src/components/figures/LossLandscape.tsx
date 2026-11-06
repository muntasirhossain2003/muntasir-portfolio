"use client";

import { clamp, label, useCanvas } from "./useCanvas";

const g = (x: number, y: number, cx: number, cy: number, s: number) =>
  Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * s * s));

/** Non-convex loss on [0,1]²: a wide basin, a narrow sharp one, and ripples. */
const f = (x: number, y: number) =>
  0.9 * ((x - 0.52) ** 2 + (y - 0.5) ** 2) -
  0.7 * g(x, y, 0.66, 0.6, 0.15) -
  0.42 * g(x, y, 0.28, 0.32, 0.07) +
  0.035 * Math.sin(10 * x) * Math.cos(8 * y);

const { lo, hi, paths } = (() => {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= 60; i++)
    for (let j = 0; j <= 60; j++) {
      const v = f(i / 60, j / 60);
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  const e = 1e-3;
  const grad = (x: number, y: number) => [
    (f(x + e, y) - f(x - e, y)) / (2 * e),
    (f(x, y + e) - f(x, y - e)) / (2 * e),
  ];
  const starts = [
    [0.06, 0.1],
    [0.95, 0.12],
    [0.08, 0.92],
    [0.94, 0.9],
  ];
  const paths = starts.map(([x0, y0]) => {
    let x = x0;
    let y = y0;
    let vx = 0;
    let vy = 0;
    const pts: [number, number][] = [[x, y]];
    for (let k = 0; k < 160; k++) {
      const [gx, gy] = grad(x, y);
      vx = 0.86 * vx - 0.006 * gx;
      vy = 0.86 * vy - 0.006 * gy;
      x = clamp(x + vx, 0.01, 0.99);
      y = clamp(y + vy, 0.01, 0.99);
      pts.push([x, y]);
    }
    return pts;
  });
  return { lo, hi, paths };
})();

const norm = (v: number) => (v - lo) / (hi - lo);

/** Gradient descent with momentum on a loss surface drawn as a dot field. */
export default function LossLandscape() {
  const ref = useCanvas(
    (ctx, { w, h, t, c }) => {
      // dot field
      const step = Math.max(10, w / 44);
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const v = norm(f(x / w, y / h));
          const band = (v * 10) % 1;
          if (band < 0.1) {
            ctx.globalAlpha = 0.55;
            ctx.fillStyle = c.accent2;
          } else {
            ctx.globalAlpha = 0.1 + 0.55 * (1 - v);
            ctx.fillStyle = c.ink;
          }
          ctx.beginPath();
          ctx.arc(x, y, 0.6 + 1.7 * (1 - v), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const period = 6;
      const idx = Math.floor(t / period) % paths.length;
      const prog = clamp((t % period) / 4.6);
      const path = paths[idx];
      const n = Math.max(1, Math.floor(prog * (path.length - 1)));
      const X = (p: [number, number]) => p[0] * w;
      const Y = (p: [number, number]) => p[1] * h;

      // ghost of previous run
      const prev = paths[(idx + paths.length - 1) % paths.length];
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      prev.forEach((p, i) => (i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p))));
      ctx.stroke();
      ctx.setLineDash([]);

      // current run
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const p = path[i];
        if (i) ctx.lineTo(X(p), Y(p));
        else ctx.moveTo(X(p), Y(p));
      }
      ctx.stroke();

      const s = path[0];
      ctx.globalAlpha = 1;
      ctx.fillStyle = c.paper2;
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(X(s), Y(s), 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      label(ctx, "θ₀", X(s) + (s[0] < 0.5 ? 10 : -10), Y(s) + (s[1] < 0.5 ? 10 : -10), c.accent, s[0] < 0.5 ? "left" : "right", 11);

      const cur = path[n];
      const pulse = 1 + Math.sin(t * 6) * 0.25;
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(X(cur), Y(cur), 9 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(X(cur), Y(cur), 4, 0, Math.PI * 2);
      ctx.fill();
      if (prog >= 1) label(ctx, "θ*", X(cur) + 10, Y(cur) - 10, c.accent, "left", 11);

      // readout
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = c.paper2;
      ctx.fillRect(6, h - 24, 124, 18);
      label(ctx, `step ${String(n).padStart(3, "0")}  L=${f(cur[0], cur[1]).toFixed(3)}`, 12, h - 15, c.inkSoft, "left", 10);
      ctx.globalAlpha = 1;
    },
    4.2,
  );

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
