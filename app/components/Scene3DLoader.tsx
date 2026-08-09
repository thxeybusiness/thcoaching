"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ECLAT_INTRO, INTRO_FIN } from "../lib/intro";

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
 *
 * L'instant vient de l'intro elle-même, pas d'un compte à rebours. Cette
 * minuterie-ci calculait le sien à partir de `INTRO_FIN`, sur l'horloge du
 * navigateur — et cette horloge avance même quand la ligne de temps de GSAP,
 * elle, ralentit pour ne rien sauter. La pièce se montait alors par-dessus
 * une tresse qui tournait encore, et sa construction volait justement les
 * images qui manquaient à ce tour. C'est le début du cercle vicieux qu'on
 * coupe ici.
 */
const SECOURS = Math.max(0, INTRO_FIN + 10) * 1000;

export default function Scene3DLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* On charge le module tout de suite, on ne l'affiche que plus tard.
       Sans ça, le téléchargement ne commençait qu'à l'instant du montage —
       et il fallait l'attendre avant même de commencer à bâtir la pièce. Ici
       il se fait pendant que l'intro joue, sur un fil qui ne sert à rien
       d'autre. Quand l'éclat arrive, il n'y a plus rien à aller chercher. */
    void import("./Scene3D");

    const monter = () => setShow(true);
    window.addEventListener(ECLAT_INTRO, monter, { once: true });

    /* Filet, et rien de plus. L'intro donne le signal dans tous les cas de
       figure, y compris quand elle n'a pas lieu — sur une page intérieure,
       sans WebGL, en mouvement réduit. Il ne reste donc à couvrir que le cas
       où elle se serait cassée, et c'est pourquoi ce délai est si large : il
       ne doit jamais, jamais devancer une intro qui traîne. Le fond en
       dégradés du document tient la place en attendant. */
    const id = window.setTimeout(monter, SECOURS);

    return () => {
      window.removeEventListener(ECLAT_INTRO, monter);
      window.clearTimeout(id);
    };
  }, []);

  return show ? <Scene3D /> : null;
}
