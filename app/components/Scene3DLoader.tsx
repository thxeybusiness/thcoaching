"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Charge la scène 3D (Three.js, ~90 kB) après le premier rendu et seulement
 * quand le navigateur est disponible : le texte et les boutons s'affichent
 * sans attendre le moteur 3D. Ignorée si l'utilisateur préfère moins
 * d'animations.
 */
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

export default function Scene3DLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;
    const start = () => setShow(true);

    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 700 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(start, 250);
    return () => window.clearTimeout(id);
  }, []);

  return show ? <Scene3D /> : null;
}
