"use client";

import { useEffect, useRef } from "react";
import { clearField, makeField, readPhosphor, type AsciiSource, type Phosphor } from "./engine";

/** Width of one monospace cell relative to the font size (JetBrains Mono ≈ 0.6em). */
const CELL_W = 0.6;
/** Line height of the art relative to the font size. */
const CELL_H = 1.0;

/**
 * Renders an AsciiSource to a canvas as glowing monospace characters.
 * Animates only while on screen; one still frame under reduced motion.
 */
export function AsciiView({
  source,
  fps = 30,
  className = "",
  label,
  stillTime = 2.5,
}: {
  source: AsciiSource;
  fps?: number;
  className?: string;
  label?: string;
  stillTime?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = wrap.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const field = makeField(source.cols, source.rows);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-jb").trim() || "monospace";
    let colors: Phosphor = readPhosphor();
    let fontSize = 10;
    let w = 0;
    let h = 0;
    let t = 0;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let visible = false;
    let px = -999;
    let py = -999;

    const paint = (dt: number) => {
      clearField(field);
      source.step(field, { t: reduce.matches ? stillTime : t, dt, px, py, still: reduce.matches });
      ctx.clearRect(0, 0, w, h);
      ctx.font = `500 ${fontSize}px ${family}`;
      ctx.textBaseline = "top";
      const ramp = source.ramp;
      const rl = ramp.length - 1;
      const cw = fontSize * CELL_W;
      const chh = fontSize * CELL_H;
      let curTone = -1;
      for (let y = 0; y < field.rows; y++) {
        for (let x = 0; x < field.cols; x++) {
          const k = y * field.cols + x;
          const l = field.lum[k];
          const g = field.glyph[k];
          if (l < 0.04 && !g) continue;
          const ch = g ?? ramp[Math.min(rl, Math.max(1, Math.round(l * rl)))];
          const tone = field.tone[k];
          if (tone !== curTone) {
            ctx.fillStyle = tone === 1 ? colors.hot : tone === 2 ? colors.cool : tone === 3 ? colors.dim : colors.fg;
            curTone = tone;
          }
          ctx.globalAlpha = tone === 0 ? 0.3 + 0.7 * l : 0.55 + 0.45 * l;
          ctx.fillText(ch, x * cw, y * chh);
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = 1 / fps;
    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      acc += dt;
      if (acc >= frame) {
        t += acc;
        paint(acc);
        acc = 0;
      }
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
        paint(0);
      }
    };

    const resize = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      fontSize = r.width / (source.cols * CELL_W);
      w = r.width;
      h = fontSize * CELL_H * source.rows;
      canvas.style.height = `${h}px`;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(0);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const cw = fontSize * CELL_W;
      const chh = fontSize * CELL_H;
      px = (e.clientX - r.left) / cw;
      py = (e.clientY - r.top) / chh;
      if (px < -4 || py < -4 || px > source.cols + 4 || py > source.rows + 4) px = py = -999;
    };
    const onLeave = () => {
      px = py = -999;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(box);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        sync();
      },
      { rootMargin: "80px" },
    );
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      colors = readPhosphor();
      if (!raf) paint(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-phosphor"] });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    resize();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      reduce.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [source, fps, stillTime]);

  return (
    <div ref={wrap} className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <canvas ref={canvasRef} className="ascii-canvas block w-full" />
    </div>
  );
}
