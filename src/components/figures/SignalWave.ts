import { clamp, easeInOut, label, lerp, type Draw } from "./kit";

const COMPONENTS = [
  { f: 1, a: 1, ph: 0, name: "c₁" },
  { f: 2.6, a: 0.55, ph: 1.1, name: "c₂" },
  { f: 5.4, a: 0.32, ph: 2.3, name: "c₃" },
];

/** A composite signal separates into learned components, then recombines. */
export const drawWave: Draw = (ctx, { w, h, t, c }) => {
      const left = Math.max(44, w * 0.12);
      const right = w - w * 0.05;
      const span = right - left;
      const compY = h * 0.2;
      const rows = [0.48, 0.66, 0.84].map((k) => k * h);
      const ampTop = h * 0.11;
      const ampRow = h * 0.065;
      const colors = [c.accent, c.accent2, c.inkSoft];

      // separation timeline (8s): split 0–2.6, hold, merge 6–8
      const period = 8;
      const tc = t % period;
      const split = tc < 6 ? clamp(tc / 2.6) : 1 - clamp((tc - 6) / 2);
      const shift = t * 1.3;

      const val = (k: number, u: number) => {
        const s = COMPONENTS[k];
        return s.a * Math.sin(s.f * u - shift * (0.6 + s.f * 0.15) + s.ph);
      };
      const U = (x: number) => ((x - left) / span) * Math.PI * 4;

      // baselines
      ctx.strokeStyle = c.rule;
      ctx.lineWidth = 1;
      [compY, ...rows].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
      });

      // composite
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = left; x <= right; x += 2) {
        const u = U(x);
        const v = COMPONENTS.reduce((acc, _, k) => acc + val(k, u), 0) / 1.6;
        const y = compY - v * ampTop;
        if (x === left) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      label(ctx, "x(t)", left - 10, compY, c.ink, "right", 11);

      // components peel off the composite
      COMPONENTS.forEach((s, k) => {
        const e = easeInOut(clamp(split * 1.4 - k * 0.2));
        const cy = lerp(compY, rows[k], e);
        const amp = lerp(ampTop / 1.6, ampRow, e);
        ctx.globalAlpha = 0.25 + 0.75 * e;
        ctx.strokeStyle = colors[k];
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let x = left; x <= right; x += 2) {
          const y = cy - val(k, U(x)) * amp;
          if (x === left) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = e;
        label(ctx, s.name, left - 10, rows[k], colors[k], "right", 11);
      });
      ctx.globalAlpha = 1;

      // scan line
      const sx = left + ((t * 0.12) % 1) * span;
      ctx.strokeStyle = c.inkFaint;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, h * 0.06);
      ctx.lineTo(sx, h * 0.94);
      ctx.stroke();
      ctx.setLineDash([]);
      const su = U(sx);
      const top = COMPONENTS.reduce((acc, _, k) => acc + val(k, su), 0) / 1.6;
      ctx.fillStyle = c.ink;
      ctx.beginPath();
      ctx.arc(sx, compY - top * ampTop, 3.2, 0, Math.PI * 2);
      ctx.fill();
      COMPONENTS.forEach((_, k) => {
        const e = easeInOut(clamp(split * 1.4 - k * 0.2));
        const cy = lerp(compY, rows[k], e);
        const amp = lerp(ampTop / 1.6, ampRow, e);
        ctx.globalAlpha = 0.3 + 0.7 * e;
        ctx.fillStyle = colors[k];
        ctx.beginPath();
        ctx.arc(sx, cy - val(k, su) * amp, 2.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
};
