"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Intro : les trois piliers allument le logo.
 *
 * 1. Le logo apparaît en grand, ses trois vagues éteintes
 * 2. « Compréhension », « Optimisation », « Lancement » entrent l'un après
 *    l'autre — chaque mot allume la vague correspondante
 * 3. Au troisième mot, un éclat couvre l'écran ; le décor s'efface derrière
 *    lui et le site apparaît pendant que l'éclat retombe.
 */

const WAVE_PATHS = [
  "M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z",
  "M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z",
  "M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z",
];

/** Chaque pilier est posé en face de sa vague (centre du tracé dans le viewBox). */
const PILIERS = [
  { mot: "Compréhension", y: "25%" },
  { mot: "Optimisation", y: "49%" },
  { mot: "Lancement", y: "73%" },
];

/** Départ de l'éclat, puis instant où le site apparaît derrière lui. */
const ECLAT = 1.46;
const OUVERTURE = 1.66;

const ETEINT = "rgba(255, 150, 70, 0.09)";
const ALLUME = "#ff8c2e";

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setDone(true),
      });

      // 1. Le logo, vagues éteintes, dans un décor qui s'éveille
      tl.from(".intro-logo-svg", {
        opacity: 0,
        scale: 0.92,
        duration: 0.5,
        transformOrigin: "50% 50%",
      })
        .from(".intro-fond", { opacity: 0, duration: 1.1 }, 0)
        .fromTo(
          ".intro-rayons",
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
          0.1
        );

      // 2. Un mot = une vague qui s'allume
      PILIERS.forEach((_, i) => {
        const t = 0.34 + i * 0.44;

        tl.to(
          `.intro-wave-${i}`,
          { fill: ALLUME, duration: 0.3, ease: "power2.out" },
          t
        )
          // léger sursaut de la vague au moment où elle s'allume
          .fromTo(
            `.intro-wave-${i}`,
            { scale: 1 },
            {
              scale: 1.07,
              duration: 0.15,
              yoyo: true,
              repeat: 1,
              ease: "power1.inOut",
              transformOrigin: "50% 50%",
            },
            t
          )
          // halo (transition CSS, plus léger qu'un filtre animé)
          .call(
            () => {
              root.current
                ?.querySelector(`.intro-wave-${i}`)
                ?.setAttribute("data-on", "true");
            },
            undefined,
            t
          )
          .fromTo(
            `.intro-word-${i} .intro-word-texte`,
            { opacity: 0, x: 14, filter: "blur(4px)" },
            { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.42 },
            t + 0.04
          )
          // La lumière ambiante monte d'un cran à chaque pilier
          .to(
            ".intro-halo",
            {
              opacity: 0.42 + i * 0.29,
              scale: 0.82 + i * 0.09,
              duration: 0.55,
              ease: "power2.out",
            },
            t
          );
      });

      // 3. Transition : un éclat couvre l'écran, le décor s'efface derrière
      //    lui, et le site apparaît pendant que l'éclat retombe.
      tl.call(
        () => {
          // L'éclat part du logo, où qu'il soit à l'écran
          const logo = root.current?.querySelector(".intro-logo-svg");
          const el = root.current;
          if (!logo || !el) return;
          const r = logo.getBoundingClientRect();
          el.style.setProperty(
            "--fx",
            `${((r.left + r.width / 2) / window.innerWidth) * 100}%`
          );
          el.style.setProperty(
            "--fy",
            `${((r.top + r.height / 2) / window.innerHeight) * 100}%`
          );
        },
        undefined,
        ECLAT
      )
        .fromTo(
          ".intro-flash",
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1.15, duration: 0.2, ease: "power2.in" },
          ECLAT
        )
        // Au sommet de l'éclat, tout le décor disparaît d'un coup : le site
        // est déjà là derrière, on ne voit jamais la coupure.
        .call(
          () => {
            gsap.set([".intro-inner", ".intro-fond", ".intro-vignette"], {
              opacity: 0,
            });
            if (root.current) root.current.style.background = "transparent";
          },
          undefined,
          OUVERTURE
        )
        .to(
          ".intro-flash",
          { opacity: 0, scale: 1.6, duration: 0.42, ease: "power2.out" },
          OUVERTURE
        );
    }, root);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="intro" aria-hidden="true">
      {/* Décor : vagues sombres en écho du logo, lueur chaude, vignette */}
      <div className="intro-fond" />
      <div className="intro-vignette" />
      <div className="intro-flash" />

      <div className="intro-inner">
        <span className="intro-logo-zone">
          <span className="intro-rayons" />
          <span className="intro-halo" />
          <svg className="intro-logo-svg" viewBox="0 0 120 120">
            {WAVE_PATHS.map((d, i) => (
              <path
                key={d}
                className={`intro-wave intro-wave-${i}`}
                d={d}
                fill={ETEINT}
              />
            ))}
          </svg>
        </span>

        <p className="intro-piliers">
          {/* Copie invisible : les mots sont en absolu et ne donnent donc
              aucune largeur au bloc, qui serait décentré sans elle. */}
          <span className="intro-piliers-gabarit" aria-hidden="true">
            {PILIERS[0].mot}
          </span>
          {PILIERS.map(({ mot, y }, i) => (
            <span
              key={mot}
              className={`intro-word intro-word-${i}`}
              style={{ "--y": y } as React.CSSProperties}
            >
              <span className="intro-word-texte">{mot}</span>
            </span>
          ))}
        </p>
      </div>

    </div>
  );
}
