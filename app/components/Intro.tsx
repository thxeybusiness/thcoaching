"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Intro : les trois piliers allument le logo.
 *
 * 1. Le logo apparaît en grand, ses trois vagues éteintes
 * 2. « Compréhension », « Optimisation », « Lancement » entrent l'un après
 *    l'autre — chaque mot allume la vague correspondante
 * 3. Au troisième mot, les vagues elles-mêmes deviennent le rideau : elles
 *    s'étirent au plein écran (toujours en courbes, aucun angle droit) et
 *    ouvrent le site.
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

      // Éclat au moment où le rideau part
      tl.fromTo(
        ".intro-flash",
        { opacity: 0 },
        { opacity: 0.22, duration: 0.14, ease: "power2.out" },
        1.5
      ).to(".intro-flash", { opacity: 0, duration: 0.4 }, 1.64);

      // 3. Le logo devient le rideau : le SVG de révélation se pose
      //    exactement dessus, puis s'étire au plein écran.
      tl.call(
        () => {
          const logo = root.current?.querySelector(".intro-logo-svg");
          if (!logo) return;
          const r = logo.getBoundingClientRect();
          gsap.set(".intro-reveal", {
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
            visibility: "visible",
          });
          gsap.set(".intro-inner", { opacity: 0 });
        },
        undefined,
        1.62
      )
        // Les tracés occupent 10%→90% du viewBox : le SVG est dimensionné à
        // 1,25× la largeur pour que les vagues touchent pile les bords.
        .to(
          ".intro-reveal",
          {
            left: () => -window.innerWidth * 0.125,
            top: () => -window.innerHeight * 0.2,
            width: () => window.innerWidth * 1.25,
            height: () => window.innerHeight * 1.4,
            duration: 0.44,
            ease: "power2.inOut",
          },
          1.62
        )
        // … en s'épaississant pour couvrir toute la page. Dès la fin du zoom,
        // l'intro est démontée : coupure nette sur le site.
        .to(
          ".intro-reveal-wave",
          {
            scaleY: 2.1,
            duration: 0.44,
            ease: "power2.inOut",
            transformOrigin: "50% 50%",
          },
          1.62
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

      {/* Les mêmes vagues, devenues le rideau de révélation */}
      <svg
        className="intro-reveal"
        viewBox="0 0 120 120"
        preserveAspectRatio="none"
      >
        {WAVE_PATHS.map((d) => (
          <path key={d} className="intro-reveal-wave" d={d} fill="#ff8c2e" />
        ))}
      </svg>
    </div>
  );
}
