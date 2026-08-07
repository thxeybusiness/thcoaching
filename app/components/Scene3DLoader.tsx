"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { INTRO_FIN } from "../lib/intro";

/**
 * Charge la scène 3D (Three.js, ~90 kB) après le premier rendu et seulement
 * quand le navigateur est disponible : le texte et les boutons s'affichent
 * sans attendre le moteur 3D. Ignorée si l'utilisateur préfère moins
 * d'animations — le fond en dégradés du document reste alors seul.
 */
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

/**
 * Quand monter la pièce.
 *
 * Deux contraintes se croisent. Bâtir le décor coûte une image entière : il
 * faut que quelque chose la couvre. Et le rendu de l'intro tourne dans son
 * propre contexte WebGL : deux pièces en même temps, c'est le double du
 * travail pour rien.
 *
 * On monte donc pendant l'éclat qui termine l'intro : l'écran est blanc à cet
 * instant, la saccade ne se voit pas, et le recouvrement avec l'intro se
 * compte en dixièmes de seconde.
 */
const MONTAGE = Math.max(0, INTRO_FIN - 0.12) * 1000;

export default function Scene3DLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setShow(true), MONTAGE);
    return () => window.clearTimeout(id);
  }, []);

  return show ? <Scene3D /> : null;
}
