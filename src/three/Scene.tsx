"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { papers, type FigureKind } from "@/data/content";
import type { Draw } from "@/components/figures/kit";
import { drawNeural } from "@/components/figures/NeuralFlow";
import { drawGraph } from "@/components/figures/GraphNet";
import { drawLandscape } from "@/components/figures/LossLandscape";
import { drawWave } from "@/components/figures/SignalWave";
import { ensureFonts, fillerPage, PAGE_H, PAGE_W, paperPage, PRINT, titlePage, type PaperPage } from "./pages";
import { makeSheetMaterial, shadowTexture, sheetGeometry, SHEET_H, SHEET_W } from "./sheet";
import { clamp01, easeInOut, easeOut, sectionMetrics, smooth, store } from "./store";

const DRAW: Record<FigureKind, Draw> = { neural: drawNeural, graph: drawGraph, landscape: drawLandscape, wave: drawWave };
const damp = THREE.MathUtils.damp;

type Textures = {
  title: THREE.Texture;
  fillers: THREE.Texture[];
  papers: { tex: THREE.Texture; fig: PaperPage["fig"] }[];
};

function useTextures() {
  const gl = useThree((s) => s.gl);
  const [tx, setTx] = useState<Textures | null>(null);
  useEffect(() => {
    let alive = true;
    const make = (c: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      return t;
    };
    ensureFonts().then(() => {
      if (!alive) return;
      setTx({
        title: make(titlePage()),
        fillers: Array.from({ length: 6 }, (_, i) => make(fillerPage(i + 1))),
        papers: papers.map((p, i) => {
          const pg = paperPage(p, i);
          return { tex: make(pg.canvas), fig: pg.fig };
        }),
      });
      store.introStart = store.reduced ? -100 : performance.now() / 1000;
    });
    return () => {
      alive = false;
    };
  }, [gl]);
  return tx;
}

function useShadowMaterial() {
  return useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: shadowTexture(),
        color: new THREE.Color("#000000"),
        transparent: true,
        depthWrite: false,
        opacity: 0.3,
      }),
    [],
  );
}

const SHADOW_SCALE: [number, number, number] = [SHEET_W * 1.6, SHEET_H * 1.39, 1];
const now = () => performance.now() / 1000;

/* ── Layout helper: same breakpoint the DOM uses (`wide:` variant) ── */
function isWide(size: { width: number; height: number }) {
  return size.width >= 700 && size.width / size.height > 1.05;
}

/* ── Hero: a stack of pages; the title page turns onto it ─────────── */
function HeroStack({ tx }: { tx: Textures }) {
  const group = useRef<THREE.Group>(null!);
  const items = useRef<(THREE.Mesh | null)[]>([]);
  const shadow = useRef<THREE.Mesh>(null!);
  const shadowMat = useShadowMaterial();
  const mats = useMemo(() => [tx.title, ...tx.fillers.slice(0, 4)].map((t) => makeSheetMaterial(t)), [tx]);
  const rest = [0, 0.045, -0.035, 0.07, -0.06];
  const scatter = useMemo(
    () => [
      [0, 0, 0],
      [-1.3, 0.5, 0.9],
      [1.1, 0.9, -0.7],
      [-0.9, -0.9, 0.5],
      [1.3, -0.6, -1.1],
    ],
    [],
  );

  useFrame((state, dt) => {
    const { viewport, size } = state;
    const vw = viewport.width;
    const vh = viewport.height;
    const wide = isWide(size);
    const m = sectionMetrics("abstract");
    const hp = clamp01(m.y / (m.vh * 0.85));
    const t = now();
    const intro = store.introStart < 0 ? 0 : t - store.introStart;

    const sheetH = wide ? vh * 0.76 : Math.min(vh * 0.4, (vw * 0.78) * 1.414);
    const g = group.current;
    g.visible = hp < 0.999;
    if (!g.visible) return;
    g.scale.setScalar(sheetH / SHEET_H);
    const bx = wide ? vw * 0.21 : 0;
    const by = wide ? -vh * 0.01 : vh * 0.2;
    g.position.x = damp(g.position.x, bx + store.px * 0.06, 4, dt);
    g.position.y = by + easeInOut(hp) * vh * 0.45;
    g.position.z = -easeInOut(hp) * 4;
    g.rotation.x = damp(g.rotation.x, -0.2 - store.py * 0.14 - hp * 0.7, 4, dt);
    g.rotation.y = damp(g.rotation.y, (wide ? -0.38 : 0) + store.px * 0.24, 4, dt);
    g.rotation.z = hp * 0.25;

    const fade = 1 - smooth(0.15, 0.6, hp);
    mats.forEach((mat, k) => {
      const mesh = items.current[k];
      if (!mesh) return;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uWave.value = store.reduced ? 0 : 0.005;
      if (k === 0) {
        const turn = easeInOut((intro - 0.75) / 1.5);
        mat.uniforms.uCurl.value = 1 - turn;
        mat.uniforms.uOpacity.value = smooth(0, 0.25, turn) * fade;
        mesh.position.set(0, 0, 0.02 + hp * 0.5);
        mesh.rotation.set(-hp * 0.3, 0, rest[0]);
      } else {
        const drop = easeOut((intro - (k - 1) * 0.13) / 0.9);
        const [sx, sy, sr] = scatter[k];
        const sp = easeInOut(hp);
        mesh.position.set(sx * sp * 2.2, sy * sp * 2 + (1 - drop) * 1.6, -k * 0.022 - sp * 1.2);
        mesh.rotation.set(sp * sr * 0.6, sp * sr * 0.5, rest[k] + (1 - drop) * 0.5 * (k % 2 ? 1 : -1) + sp * sr);
        mat.uniforms.uOpacity.value = smooth(0, 0.4, drop) * fade;
        mat.uniforms.uCurl.value = 0;
      }
    });
    shadow.current.position.set(0.07, -0.1, -0.2);
    shadowMat.opacity = (store.dark ? 0.75 : 0.32) * smooth(0, 1, intro) * fade;
  });

  return (
    <group ref={group}>
      <mesh ref={shadow} scale={SHADOW_SCALE} material={shadowMat} renderOrder={0}>
        <planeGeometry />
      </mesh>
      {mats.map((mat, k) => (
        <mesh
          key={k}
          ref={(el) => {
            items.current[k] = el;
          }}
          geometry={sheetGeometry()}
          material={mat}
          renderOrder={10 - k}
        />
      ))}
    </group>
  );
}

/* ── Publications: a deck of papers; scroll turns the pages ──────── */
function Deck({ tx }: { tx: Textures }) {
  const group = useRef<THREE.Group>(null!);
  const items = useRef<(THREE.Mesh | null)[]>([]);
  const figGroup = useRef<THREE.Group>(null!);
  const figShadow = useRef<THREE.Mesh>(null!);
  const shadow = useRef<THREE.Mesh>(null!);
  const shadowMat = useShadowMaterial();
  const figShadowMat = useShadowMaterial();
  const mats = useMemo(() => tx.papers.map((p) => makeSheetMaterial(p.tex)), [tx]);
  const N = papers.length;

  const fig = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 720;
    const ctx = canvas.getContext("2d")!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false });
    return { canvas, ctx, tex, mat, t: 0, last: -1 };
  }, []);

  // world-space size/centre of each page's figure well
  const figGeom = useMemo(
    () =>
      tx.papers.map(({ fig: f }) => ({
        w: (f.w / PAGE_W) * SHEET_W,
        h: (f.h / PAGE_H) * SHEET_H,
        x: ((f.x + f.w / 2) / PAGE_W - 0.5) * SHEET_W,
        y: (0.5 - (f.y + f.h / 2) / PAGE_H) * SHEET_H,
      })),
    [tx],
  );

  useFrame((state, dt) => {
    const { viewport, size } = state;
    const vw = viewport.width;
    const vh = viewport.height;
    const wide = isWide(size);
    const m = sectionMetrics("publications");
    if (!m.found) return;
    const enter = clamp01((m.y - (m.top - m.vh)) / m.vh);
    const exit = clamp01((m.y - (m.top + m.height - m.vh)) / m.vh);
    const p = clamp01((m.y - m.top) / (m.height - m.vh));
    const g = group.current;
    g.visible = enter > 0.001 && exit < 0.999;
    if (!g.visible) return;
    const t = now();

    const sheetH = wide ? vh * 0.84 : Math.min(vh * 0.46, vw * 0.8 * 1.414);
    g.scale.setScalar(sheetH / SHEET_H);
    g.position.x = damp(g.position.x, (wide ? -vw * 0.2 : 0) + store.px * 0.05, 4, dt);
    g.position.y = (wide ? -vh * 0.01 : vh * 0.2) - (1 - easeOut(enter)) * vh * 1.15 + easeInOut(exit) * vh * 1.15;
    g.rotation.x = damp(g.rotation.x, -0.1 - store.py * 0.1 - (1 - enter) * 0.9 + exit * 0.5, 5, dt);
    g.rotation.y = damp(g.rotation.y, (wide ? 0.3 : 0) + store.px * 0.18, 4, dt);
    g.rotation.z = (1 - enter) * -0.25;

    const u = p * N;
    const top = Math.min(N - 1, Math.max(0, Math.floor(u + 0.45)));

    mats.forEach((mat, i) => {
      const mesh = items.current[i];
      if (!mesh) return;
      const curl = i < N - 1 ? clamp01((u - i - 0.55) / 0.45) : 0;
      mat.uniforms.uCurl.value = easeInOut(curl);
      mat.uniforms.uOpacity.value = 1 - smooth(0.82, 1, curl);
      mat.uniforms.uTime.value = t;
      mat.uniforms.uWave.value = store.reduced ? 0 : 0.004;
      mesh.visible = curl < 1;
      mesh.position.z = -(i - top) * 0.014;
      mesh.rotation.z = i > top ? (i % 2 ? 0.03 : -0.025) * Math.min(3, i - top) : 0;
    });
    shadowMat.opacity = store.dark ? 0.75 : 0.32;
    shadow.current.position.set(0.08, -0.1, -0.25);

    // live figure lifting off the top page
    const local = u - top;
    let lift = top === 0 ? 1 : smooth(0.0, 0.22, local);
    if (top < N - 1) lift *= 1 - smooth(0.38, 0.55, local);
    lift *= smooth(0.5, 1, enter);
    const fgm = figGeom[top];
    const fg = figGroup.current;
    fg.visible = lift > 0.01;
    if (fg.visible) {
      const hover = store.reduced ? 0 : Math.sin(t * 1.4) * 0.012;
      fg.position.set(fgm.x, fgm.y + lift * 0.02, 0.004 + lift * 0.16 + hover * lift);
      fg.rotation.set(lift * 0.06, -lift * 0.05, lift * -0.015);
      fg.scale.set(fgm.w * (1 + lift * 0.04), fgm.h * (1 + lift * 0.04), 1);
      fig.mat.opacity = smooth(0, 0.35, lift);
      figShadow.current.position.set(fgm.x + lift * 0.05, fgm.y - lift * 0.07, 0.002);
      figShadow.current.scale.set(fgm.w * 1.55, fgm.h * 1.5, 1);
      figShadowMat.opacity = (store.dark ? 0.55 : 0.3) * lift;

      // paint the figure
      fig.t = store.reduced ? 3 : fig.t + Math.min(dt, 1 / 20);
      const { ctx } = fig;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = PRINT.paper2;
      ctx.fillRect(0, 0, 480, 360);
      ctx.save();
      DRAW[papers[top].figure](ctx, { w: 480, h: 360, t: fig.t, dt, c: PRINT, still: store.reduced });
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = PRINT.ink;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0.75, 0.75, 478.5, 358.5);
      fig.tex.needsUpdate = true;
    } else {
      figShadowMat.opacity = 0;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={shadow} scale={SHADOW_SCALE} material={shadowMat} renderOrder={0}>
        <planeGeometry />
      </mesh>
      {mats.map((mat, i) => (
        <mesh
          key={i}
          ref={(el) => {
            items.current[i] = el;
          }}
          geometry={sheetGeometry()}
          material={mat}
          renderOrder={20 - i}
        />
      ))}
      <mesh ref={figShadow} material={figShadowMat} renderOrder={40}>
        <planeGeometry />
      </mesh>
      <group ref={figGroup}>
        <mesh material={fig.mat} renderOrder={50}>
          <planeGeometry />
        </mesh>
      </group>
    </group>
  );
}

/* ── Loose sheets drifting at depth with parallax ─────────────── */
function Drifters({ tx }: { tx: Textures }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const items = useRef<(THREE.Mesh | null)[]>([]);
  const specs = useMemo(() => {
    const r = (() => {
      let s = 42;
      return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    })();
    return Array.from({ length: 9 }, (_, i) => ({
      x: (i % 2 ? 1 : -1) * (0.62 + r() * 0.45),
      y: r(),
      z: -2.5 - r() * 6,
      s: 0.7 + r() * 0.6,
      ph: r() * 10,
      par: 0.25 + r() * 0.5,
      tex: tx.fillers[i % tx.fillers.length],
    }));
  }, [tx]);
  const mats = useMemo(() => specs.map((s) => makeSheetMaterial(s.tex)), [specs]);

  useFrame((state) => {
    const t = now();
    const scrollV = window.scrollY / window.innerHeight;
    const intro = store.introStart < 0 ? 0 : t - store.introStart;
    const appear = smooth(0.8, 2.6, intro);
    specs.forEach((sp, i) => {
      const mesh = items.current[i];
      if (!mesh) return;
      const dist = camera.position.z - sp.z;
      const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
      const visW = visH * state.viewport.aspect;
      const span = visH * 1.6;
      let y = (sp.y - 0.5) * span + scrollV * visH * sp.par;
      y = ((((y + span / 2) % span) + span) % span) - span / 2;
      mesh.position.set(sp.x * visW * 0.5, y, sp.z);
      mesh.scale.setScalar(sp.s * (visH / 4.2));
      const k = store.reduced ? 0 : t;
      mesh.rotation.set(Math.sin(k * 0.15 + sp.ph) * 0.5 - 0.3, Math.cos(k * 0.12 + sp.ph) * 0.6, sp.ph + k * 0.03);
      const mat = mats[i];
      mat.uniforms.uTime.value = t;
      mat.uniforms.uWave.value = store.reduced ? 0 : 0.015;
      mat.uniforms.uTint.value = store.dark ? 0.06 : 0.9;
      mat.uniforms.uOpacity.value = (store.dark ? 0.95 : 0.42) * appear;
    });
  });

  return (
    <>
      {mats.map((mat, i) => (
        <mesh
          key={i}
          ref={(el) => {
            items.current[i] = el;
          }}
          geometry={sheetGeometry()}
          material={mat}
          renderOrder={-10}
        />
      ))}
    </>
  );
}

function World() {
  const tx = useTextures();
  if (!tx) return null;
  return (
    <>
      <Drifters tx={tx} />
      <HeroStack tx={tx} />
      <Deck tx={tx} />
    </>
  );
}

export default function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        flat
        dpr={[1, 1.75]}
        camera={{ fov: 35, position: [0, 0, 6], near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <World />
      </Canvas>
    </div>
  );
}
