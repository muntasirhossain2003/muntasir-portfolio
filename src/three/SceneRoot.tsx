"use client";

import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { store } from "./store";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Wires pointer / theme / reduced-motion into the store, runs smooth scroll, mounts the WebGL scene. */
export function SceneRoot() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    store.reduced = reduce.matches;

    const readTheme = () => {
      const a = document.documentElement.getAttribute("data-theme");
      store.dark = a === "dark" || (a !== "light" && scheme.matches);
    };
    readTheme();
    const mo = new MutationObserver(readTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    scheme.addEventListener("change", readTheme);

    const onPointer = (e: PointerEvent) => {
      store.px = (e.clientX / window.innerWidth) * 2 - 1;
      store.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    if (!reduce.matches) {
      const lenis = new Lenis({ lerp: 0.09, anchors: true });
      store.lenis = lenis;
      const loop = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      mo.disconnect();
      scheme.removeEventListener("change", readTheme);
      window.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(raf);
      store.lenis?.destroy();
      store.lenis = null;
    };
  }, []);

  return <Scene />;
}
