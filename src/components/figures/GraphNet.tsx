"use client";

import { clamp, label, rng, useCanvas } from "./useCanvas";

type Node = { x: number; y: number; ph: number };

/* Build a deterministic clustered graph in normalised coords (aspect ~4:3). */
const ASPECT = 4 / 3;
const { nodes, edges, sources, hops, maxHop } = (() => {
  const rand = rng(7);
  const centers = [
    [0.25, 0.33],
    [0.72, 0.3],
    [0.5, 0.72],
  ];
  const nodes: Node[] = [];
  centers.forEach(([cx, cy], k) => {
    const n = k === 2 ? 13 : 11;
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * 0.17;
      nodes.push({
        x: clamp(cx + Math.cos(a) * d, 0.07, 0.93),
        y: clamp(cy + Math.sin(a) * d * 1.05, 0.1, 0.88),
        ph: rand() * Math.PI * 2,
      });
    }
  });
  const dist = (a: Node, b: Node) => Math.hypot((a.x - b.x) * ASPECT, a.y - b.y);
  const set = new Set<string>();
  const edges: [number, number][] = [];
  const add = (i: number, j: number) => {
    const k = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (i !== j && !set.has(k)) {
      set.add(k);
      edges.push([i, j]);
    }
  };
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => [dist(a, b), j] as const)
      .filter(([, j]) => j !== i)
      .sort((p, q) => p[0] - q[0]);
    add(i, near[0][1]);
    add(i, near[1][1]);
    if (near[2][0] < 0.14) add(i, near[2][1]);
  });
  // bridges between clusters
  add(3, 14);
  add(8, 27);
  add(19, 30);

  const adj: number[][] = nodes.map(() => []);
  edges.forEach(([i, j]) => {
    adj[i].push(j);
    adj[j].push(i);
  });
  const bfs = (s: number) => {
    const d = nodes.map(() => Infinity);
    d[s] = 0;
    const q = [s];
    while (q.length) {
      const u = q.shift()!;
      for (const v of adj[u]) if (d[v] === Infinity) {
        d[v] = d[u] + 1;
        q.push(v);
      }
    }
    return d.map((x) => (x === Infinity ? 99 : x));
  };
  const sources = [0, 15, 26];
  const hops = sources.map(bfs);
  const maxHop = Math.max(...hops.flat().filter((x) => x < 99));
  return { nodes, edges, sources, hops, maxHop };
})();

/** Message passing: a signal spreads hop by hop from a source node. */
export default function GraphNet() {
  const ref = useCanvas(
    (ctx, { w, h, t, c }) => {
      const cycleLen = maxHop + 3.2;
      const raw = t * 1.05;
      const cycle = Math.floor(raw / cycleLen);
      const wave = raw - cycle * cycleLen;
      const sIdx = cycle % sources.length;
      const hop = hops[sIdx];
      const fadeOut = clamp((cycleLen - wave) / 1.4);

      const P = nodes.map((n) => [
        (n.x + Math.sin(t * 0.5 + n.ph) * 0.006) * w,
        (n.y + Math.cos(t * 0.43 + n.ph) * 0.008) * h,
      ]);
      const r = Math.max(3, Math.min(w, h) * 0.017);

      for (const [i, j] of edges) {
        const [x1, y1] = P[i];
        const [x2, y2] = P[j];
        ctx.globalAlpha = 0.28;
        ctx.strokeStyle = c.inkFaint;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // message travelling along edges from hop k to k+1
        const [a, b, ax, ay, bx, by] =
          hop[i] <= hop[j] ? [hop[i], hop[j], x1, y1, x2, y2] : [hop[j], hop[i], x2, y2, x1, y1];
        if (b === a + 1) {
          const p = clamp(wave - a);
          if (p > 0) {
            ctx.globalAlpha = 0.75 * fadeOut;
            ctx.strokeStyle = c.accent;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax + (bx - ax) * p, ay + (by - ay) * p);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((_, i) => {
        const [x, y] = P[i];
        const reached = wave - hop[i];
        ctx.globalAlpha = 1;
        ctx.fillStyle = c.paper2;
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (reached > 0) {
          const strength = (1 - (hop[i] / (maxHop + 1)) * 0.75) * fadeOut;
          ctx.globalAlpha = strength * clamp(reached * 3);
          ctx.fillStyle = c.accent;
          ctx.beginPath();
          ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
          ctx.fill();
          if (reached < 0.8) {
            ctx.globalAlpha = (0.8 - reached) * 0.8 * fadeOut;
            ctx.strokeStyle = c.accent;
            ctx.beginPath();
            ctx.arc(x, y, r + reached * 16, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      const [sx, sy] = P[sources[sIdx]];
      ctx.globalAlpha = 1;
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, r + 4, 0, Math.PI * 2);
      ctx.stroke();
      label(ctx, "v₀", sx + r + 8, sy - r - 4, c.accent, "left", 11);

      ctx.globalAlpha = 0.85;
      label(ctx, `hop ${Math.min(maxHop, Math.max(0, Math.floor(wave)))} / ${maxHop}`, w - 10, h - 12, c.inkSoft, "right", 10);
      ctx.globalAlpha = 1;
    },
    3.4,
  );

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
