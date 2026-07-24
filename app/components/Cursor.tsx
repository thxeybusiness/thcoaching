"use client";

import { useEffect } from "react";

/**
 * Curseur custom premium : point orange + anneau traînant (lerp),
 * qui s'agrandit au survol des liens/boutons. Désactivé sur tactile.
 */
export default function Cursor() {
  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.append(dot, ring);
    document.documentElement.classList.add("has-cursor");

    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
    };
    const over = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button, [data-hover]"))
        ring.classList.add("cursor-ring--active");
    };
    const out = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button, [data-hover]"))
        ring.classList.remove("cursor-ring--active");
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over);
    addEventListener("pointerout", out);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
      removeEventListener("pointerout", out);
      dot.remove();
      ring.remove();
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return null;
}
