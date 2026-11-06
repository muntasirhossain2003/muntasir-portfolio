import { easeInOut, hash, label, type Draw } from "./kit";

const LAYERS = [4, 7, 7, 5, 2];
const NAMES = ["x", "h₁", "h₂", "h₃", "ŷ"];

/** Forward pass through a layered network; each pass lights a different sparse path. */
export const drawNeural: Draw = (ctx, { w, h, t, c }) => {
      const L = LAYERS.length;
      const padX = w * 0.1;
      const padTop = h * 0.12;
      const padBot = h * 0.18;
      const maxN = Math.max(...LAYERS);

      const pos = (l: number, i: number): [number, number] => {
        const n = LAYERS[l];
        const x = padX + (w - 2 * padX) * (l / (L - 1));
        const span = (h - padTop - padBot) * ((n - 1) / (maxN - 1));
        const cy = padTop + (h - padTop - padBot) / 2;
        const y = n === 1 ? cy : cy + (i / (n - 1) - 0.5) * span;
        return [x, y];
      };

      const cycleLen = L + 0.9;
      const raw = t * 0.75;
      const cycle = Math.floor(raw / cycleLen);
      const wave = raw - cycle * cycleLen;
      const r = Math.max(3.5, Math.min(w, h) * 0.02);

      // edges + pulses
      for (let l = 0; l < L - 1; l++) {
        for (let i = 0; i < LAYERS[l]; i++) {
          const [x1, y1] = pos(l, i);
          for (let j = 0; j < LAYERS[l + 1]; j++) {
            const [x2, y2] = pos(l + 1, j);
            const key = l * 1000 + i * 37 + j * 7.3;
            ctx.globalAlpha = 0.1 + hash(key) * 0.22;
            ctx.strokeStyle = c.inkFaint;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            const active = hash(cycle * 97.13 + key) > 0.66;
            const p = wave - l;
            if (active && p > 0 && p < 1) {
              const e = easeInOut(p);
              const e0 = easeInOut(Math.max(0, p - 0.22));
              const fade = Math.sin(Math.PI * p);
              ctx.globalAlpha = 0.85 * fade;
              ctx.strokeStyle = c.accent;
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.moveTo(x1 + (x2 - x1) * e0, y1 + (y2 - y1) * e0);
              ctx.lineTo(x1 + (x2 - x1) * e, y1 + (y2 - y1) * e);
              ctx.stroke();
              ctx.fillStyle = c.accent;
              ctx.beginPath();
              ctx.arc(x1 + (x2 - x1) * e, y1 + (y2 - y1) * e, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // nodes
      for (let l = 0; l < L; l++) {
        for (let i = 0; i < LAYERS[l]; i++) {
          const [x, y] = pos(l, i);
          const act = Math.max(0, 1 - Math.abs(wave - l) * 1.5) * (0.35 + 0.65 * hash(cycle * 13 + l * 31 + i));
          if (act > 0.04) {
            ctx.globalAlpha = act * 0.35;
            ctx.strokeStyle = c.accent;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, r + 7 * act, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.fillStyle = c.paper2;
          ctx.strokeStyle = c.ink;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (act > 0.02) {
            ctx.globalAlpha = Math.min(1, act * 1.2);
            ctx.fillStyle = c.accent;
            ctx.beginPath();
            ctx.arc(x, y, r * 0.62, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 0.9;
        label(ctx, NAMES[l], pos(l, 0)[0], h - padBot * 0.45, c.inkSoft, "center", 11);
      }
      ctx.globalAlpha = 1;
};
