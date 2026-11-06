import { introduction, profile, type Paper } from "@/data/content";
import { rng } from "@/components/figures/kit";

/** Printed pages are always light paper — physical sheets under a lamp. */
export const PRINT = {
  paper: "#faf7f0",
  paper2: "#f2ece0",
  ink: "#1c1a16",
  inkSoft: "#4f4a41",
  inkFaint: "#8c8576",
  rule: "#d6ccb8",
  accent: "#b42b1f",
  accent2: "#1f4c8a",
};

export const PAGE_W = 1024;
export const PAGE_H = 1448;
const M = 92;
const BOTTOM = PAGE_H - 120;

let SERIF = "Georgia, serif";
let MONO = "monospace";

export async function ensureFonts() {
  const s = getComputedStyle(document.documentElement);
  SERIF = s.getPropertyValue("--font-newsreader").trim() || SERIF;
  MONO = s.getPropertyValue("--font-jetbrains").trim() || MONO;
  try {
    await Promise.all([
      document.fonts.load(`500 40px ${SERIF}`),
      document.fonts.load(`600 40px ${SERIF}`),
      document.fonts.load(`italic 400 40px ${SERIF}`),
      document.fonts.load(`400 20px ${MONO}`),
    ]);
    await document.fonts.ready;
  } catch {}
}

type Ctx = CanvasRenderingContext2D;

const font = (ctx: Ctx, f: string) => {
  ctx.font = f;
};
const serif = (size: number, weight = 400, italic = false) => `${italic ? "italic " : ""}${weight} ${size}px ${SERIF}`;
const mono = (size: number) => `400 ${size}px ${MONO}`;

function wrap(ctx: Ctx, text: string, maxW: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    const test = [...cur, w].join(" ");
    if (ctx.measureText(test).width > maxW && cur.length) {
      lines.push(cur);
      cur = [w];
    } else cur.push(w);
  }
  if (cur.length) lines.push(cur);
  return lines;
}

/** Draw a paragraph; justified except the last line. Returns next y. */
function para(ctx: Ctx, text: string, x: number, y: number, maxW: number, lh: number, opts: { justify?: boolean; align?: "left" | "center"; maxY?: number; color?: string } = {}) {
  const { justify = true, align = "left", maxY = BOTTOM, color = PRINT.ink } = opts;
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";
  const lines = wrap(ctx, text, maxW);
  for (let i = 0; i < lines.length; i++) {
    if (y > maxY) break;
    const words = lines[i];
    const last = i === lines.length - 1 || y + lh > maxY;
    let line = words.join(" ");
    if (y + lh > maxY && i < lines.length - 1) line = line.replace(/[,.;:]?$/, " …");
    if (justify && !last && words.length > 1) {
      const total = words.reduce((a, w) => a + ctx.measureText(w).width, 0);
      const gap = (maxW - total) / (words.length - 1);
      let cx = x;
      for (const w of words) {
        ctx.textAlign = "left";
        ctx.fillText(w, cx, y);
        cx += ctx.measureText(w).width + gap;
      }
    } else if (align === "center") {
      ctx.textAlign = "center";
      ctx.fillText(line, x + maxW / 2, y);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(line, x, y);
    }
    y += lh;
  }
  return y;
}

function base(seed: number, header: [string, string], pageNo?: number) {
  const c = document.createElement("canvas");
  c.width = PAGE_W;
  c.height = PAGE_H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = PRINT.paper;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  // fibre grain
  const r = rng(seed);
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = r() > 0.5 ? "rgba(120,100,70,0.05)" : "rgba(255,255,255,0.35)";
    ctx.fillRect(r() * PAGE_W, r() * PAGE_H, 1 + r() * 2, 1);
  }
  // gentle vignette
  const g = ctx.createRadialGradient(PAGE_W / 2, PAGE_H / 2, PAGE_H * 0.3, PAGE_W / 2, PAGE_H / 2, PAGE_H * 0.8);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(90,70,40,0.08)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  font(ctx, mono(15));
  ctx.fillStyle = PRINT.inkFaint;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(header[0], M, 62);
  ctx.textAlign = "right";
  ctx.fillText(header[1], PAGE_W - M, 62);
  ctx.fillStyle = PRINT.rule;
  ctx.fillRect(M, 76, PAGE_W - 2 * M, 1.5);

  if (pageNo !== undefined) {
    font(ctx, serif(22));
    ctx.fillStyle = PRINT.inkSoft;
    ctx.textAlign = "center";
    ctx.fillText(String(pageNo), PAGE_W / 2, PAGE_H - 56);
  }
  return { c, ctx };
}

function smallcaps(ctx: Ctx, text: string, x: number, y: number, size = 22) {
  font(ctx, serif(size, 600));
  (ctx as Ctx & { letterSpacing?: string }).letterSpacing = "3px";
  ctx.textAlign = "center";
  ctx.fillStyle = PRINT.ink;
  ctx.fillText(text.toUpperCase(), x, y);
  (ctx as Ctx & { letterSpacing?: string }).letterSpacing = "0px";
}

function heading(ctx: Ctx, n: string, text: string, y: number) {
  font(ctx, serif(34, 600));
  ctx.textAlign = "left";
  ctx.fillStyle = PRINT.accent;
  ctx.fillText(n, M, y);
  const w = ctx.measureText(n + "  ").width;
  ctx.fillStyle = PRINT.ink;
  ctx.fillText(text, M + w, y);
  return y + 50;
}

function fitFont(ctx: Ctx, text: string, maxW: number, start: number, weight: number) {
  let size = start;
  font(ctx, serif(size, weight));
  while (ctx.measureText(text).width > maxW && size > 30) {
    size -= 2;
    font(ctx, serif(size, weight));
  }
  return size;
}

/* ── Title page ─────────────────────────────────────────────── */
export function titlePage() {
  const now = new Date();
  const id = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}.00001v1`;
  const { c, ctx } = base(11, ["PREPRINT · RESEARCH PORTFOLIO", `portfolio:${id}`], 1);
  const cx = PAGE_W / 2;

  let y = 250;
  fitFont(ctx, profile.name, PAGE_W - 2 * M, 104, 500);
  ctx.fillStyle = PRINT.ink;
  ctx.textAlign = "center";
  ctx.fillText(profile.name, cx, y);

  y += 70;
  font(ctx, serif(36, 400, true));
  ctx.fillStyle = PRINT.inkSoft;
  ctx.fillText(profile.role, cx, y);

  y += 78;
  font(ctx, serif(30));
  ctx.fillStyle = PRINT.ink;
  ctx.fillText(profile.name, cx - 8, y);
  const nw = ctx.measureText(profile.name).width;
  font(ctx, serif(18));
  ctx.fillStyle = PRINT.accent;
  ctx.textAlign = "left";
  ctx.fillText("1", cx - 8 + nw / 2 + 4, y - 14);

  y += 40;
  font(ctx, serif(21));
  ctx.textAlign = "center";
  ctx.fillStyle = PRINT.inkSoft;
  ctx.fillText(`${profile.affiliation}, ${profile.institution}`, cx, y);

  y += 96;
  smallcaps(ctx, "Abstract", cx, y);
  y += 46;
  font(ctx, serif(25));
  y = para(ctx, profile.abstract, M + 46, y, PAGE_W - 2 * M - 92, 37);

  y += 14;
  font(ctx, serif(22, 400, true));
  ctx.fillStyle = PRINT.inkSoft;
  ctx.textAlign = "left";
  ctx.fillText(`Keywords — ${profile.keywords.join(" · ")}`, M + 46, y);

  y += 84;
  y = heading(ctx, "1", "Introduction", y);
  font(ctx, serif(24));
  for (const p of introduction) {
    y = para(ctx, p, M, y, PAGE_W - 2 * M, 36);
    y += 14;
    if (y > BOTTOM) break;
  }
  return c;
}

/* ── Publication page ───────────────────────────────────────── */
export type PaperPage = { canvas: HTMLCanvasElement; fig: { x: number; y: number; w: number; h: number } };

export function paperPage(paper: Paper, i: number): PaperPage {
  const { c, ctx } = base(100 + i, [`§2.${i + 1}  ·  ${paper.venue}`, `${paper.status.toUpperCase()}  ·  ${paper.year}`], i + 2);
  const maxW = PAGE_W - 2 * M;

  let y = 160;
  font(ctx, serif(46, 600));
  const tl = wrap(ctx, paper.title, maxW - 40);
  ctx.fillStyle = PRINT.ink;
  ctx.textAlign = "center";
  for (const l of tl) {
    ctx.fillText(l.join(" "), PAGE_W / 2, y);
    y += 56;
  }

  // authors, own name emphasised
  y += 4;
  font(ctx, serif(25));
  const sep = ", ";
  const widths = paper.authors.map((a) => {
    font(ctx, serif(25, a === profile.citeName ? 600 : 400));
    return ctx.measureText(a).width;
  });
  font(ctx, serif(25));
  const sepW = ctx.measureText(sep).width;
  let ax = PAGE_W / 2 - (widths.reduce((a, b) => a + b, 0) + sepW * (paper.authors.length - 1)) / 2;
  ctx.textAlign = "left";
  paper.authors.forEach((a, k) => {
    const me = a === profile.citeName;
    font(ctx, serif(25, me ? 600 : 400));
    ctx.fillStyle = me ? PRINT.ink : PRINT.inkSoft;
    ctx.fillText(a, ax, y);
    if (me) {
      ctx.fillStyle = PRINT.accent;
      ctx.fillRect(ax, y + 7, widths[k], 2.5);
    }
    ax += widths[k];
    if (k < paper.authors.length - 1) {
      font(ctx, serif(25));
      ctx.fillStyle = PRINT.inkSoft;
      ctx.fillText(sep, ax, y);
      ax += sepW;
    }
  });

  // figure well (the live figure lifts out of here)
  y += 44;
  const fig = { x: M, y, w: maxW, h: Math.round((maxW * 3) / 4) };
  ctx.fillStyle = PRINT.paper2;
  ctx.fillRect(fig.x, fig.y, fig.w, fig.h);
  ctx.strokeStyle = "rgba(28,26,22,0.18)";
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  ctx.strokeRect(fig.x + 1, fig.y + 1, fig.w - 2, fig.h - 2);
  ctx.setLineDash([]);

  y = fig.y + fig.h + 40;
  font(ctx, serif(21, 600));
  ctx.fillStyle = PRINT.ink;
  ctx.textAlign = "left";
  const label = `Figure ${i + 1}: `;
  ctx.fillText(label, M, y);
  const lw = ctx.measureText(label).width;
  font(ctx, serif(21));
  ctx.fillStyle = PRINT.inkSoft;
  const cap = wrap(ctx, paper.figureCaption, maxW - lw);
  ctx.fillText(cap[0]?.join(" ") ?? "", M + lw, y);
  if (cap.length > 1) {
    y += 30;
    y = para(ctx, cap.slice(1).flat().join(" "), M, y, maxW, 30, { justify: false, color: PRINT.inkSoft }) - 30;
  }

  y += 64;
  smallcaps(ctx, "Abstract", PAGE_W / 2, y, 20);
  y += 40;
  font(ctx, serif(23));
  para(ctx, paper.abstract, M + 30, y, maxW - 60, 34);

  return { canvas: c, fig };
}

/* ── Filler pages (stack + drifting sheets) ─────────────────── */
const EQUATIONS = [
  "ℒ(θ) = 𝔼₍ₓ,ᵧ₎[ ℓ(f_θ(x), y) ] + λ‖θ‖²",
  "h⁽ˡ⁺¹⁾ = σ( Σⱼ αᵢⱼ W h⁽ˡ⁾ⱼ )",
  "θₜ₊₁ = θₜ − η ∇ℒ(θₜ) + β (θₜ − θₜ₋₁)",
  "x(t) = Σₖ aₖ sin(ωₖ t + φₖ)",
  "p(y | x) = softmax(Wx + b)",
];

export function fillerPage(seed: number) {
  const r = rng(seed * 7919 + 3);
  const { c, ctx } = base(seed, [`portfolio · notes`, `p. ${2 + Math.floor(r() * 30)}`], 3 + Math.floor(r() * 20));
  const maxW = PAGE_W - 2 * M;
  let y = 140;

  const bars = (lines: number) => {
    for (let l = 0; l < lines && y < BOTTOM; l++) {
      let x = M;
      const end = l === lines - 1 ? M + maxW * (0.3 + r() * 0.5) : M + maxW;
      while (x < end - 30) {
        const w = Math.min(30 + r() * 90, end - x);
        ctx.fillStyle = "rgba(28,26,22,0.16)";
        ctx.fillRect(x, y - 12, w, 12);
        x += w + 12;
      }
      y += 32;
    }
    y += 20;
  };

  // a heading
  ctx.fillStyle = PRINT.accent;
  ctx.fillRect(M, y - 22, 28, 22);
  ctx.fillStyle = "rgba(28,26,22,0.55)";
  ctx.fillRect(M + 44, y - 22, 220 + r() * 160, 22);
  y += 46;
  bars(5 + Math.floor(r() * 4));

  if (r() > 0.35) {
    font(ctx, serif(34, 400, true));
    ctx.fillStyle = PRINT.ink;
    ctx.textAlign = "center";
    ctx.fillText(EQUATIONS[Math.floor(r() * EQUATIONS.length)], PAGE_W / 2, y + 20);
    font(ctx, serif(24));
    ctx.textAlign = "right";
    ctx.fillStyle = PRINT.inkSoft;
    ctx.fillText(`(${1 + Math.floor(r() * 9)})`, PAGE_W - M, y + 20);
    y += 90;
  }
  bars(4 + Math.floor(r() * 4));

  if (r() > 0.4) {
    // a small plot
    const h = 300;
    ctx.strokeStyle = PRINT.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(M + 80, y, maxW - 160, h);
    ctx.strokeStyle = PRINT.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const k = 1 + r() * 3;
    for (let i = 0; i <= 100; i++) {
      const px = M + 80 + ((maxW - 160) * i) / 100;
      const py = y + h * 0.15 + h * 0.7 * Math.exp(-i / (12 * k)) + Math.sin(i * 0.5) * 4 * r();
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
    y += h + 50;
  }
  bars(14);
  return c;
}
