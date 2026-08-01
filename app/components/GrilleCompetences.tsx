"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IconeCompetence from "./IconeCompetence";
import type { Competence } from "../lib/programme";

/**
 * Cadence de l'entrée des tuiles. Les durées restent écrites à leur valeur
 * d'origine et sont divisées ici : le rapport reste lisible et un seul
 * nombre règle la vitesse d'ensemble.
 */
const VITESSE = 1.8;
const t = (secondes: number) => secondes / VITESSE;

/**
 * Le mur de compétences d'un pilier.
 *
 * Par défaut on ne voit que le pictogramme et le nom : la page se lit d'un
 * coup d'œil. Le détail se dévoile au survol (souris) ou au clic (tactile),
 * mais le texte reste toujours dans le document — il est donc lu par les
 * moteurs de recherche et les lecteurs d'écran.
 *
 * Les tuiles se posent et les pictogrammes se dessinent à chaque fois que le
 * pilier devient actif : à la première apparition on attend l'entrée à
 * l'écran, ensuite le changement d'onglet suffit.
 */
export default function GrilleCompetences({
  cle,
  num,
  competences,
  actif,
}: {
  cle: string;
  num: string;
  competences: Competence[];
  actif: boolean;
}) {
  const [ouvert, setOuvert] = useState<number | null>(null);
  const zone = useRef<HTMLDivElement>(null);

  // On repart d'un mur fermé quand on quitte le pilier
  useEffect(() => {
    if (!actif) setOuvert(null);
  }, [actif]);

  useEffect(() => {
    const el = zone.current;
    if (!el || !actif) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const jouer = () => {
        gsap.fromTo(
          el.querySelectorAll(".competence"),
          { opacity: 0, y: 24, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: t(0.55),
            stagger: t(0.05),
            ease: "power2.out",
            clearProps: "all",
          }
        );

        // L'aplat se révèle en fondu pendant que le contour se dessine
        gsap.fromTo(
          el.querySelectorAll(".ico-fond"),
          { opacity: 0 },
          {
            opacity: 0.26,
            duration: t(0.7),
            delay: t(0.25),
            stagger: t(0.02),
            ease: "power2.out",
            clearProps: "opacity",
          }
        );

        const traits: SVGGeometryElement[] = [];
        el.querySelectorAll<SVGGeometryElement>(".ico-trait > *").forEach((forme) => {
          // getTotalLength lève sur les formes dégénérées : on les ignore
          let l = 0;
          try {
            l = forme.getTotalLength();
          } catch {
            return;
          }
          if (!l) return;
          gsap.set(forme, { strokeDasharray: l, strokeDashoffset: l });
          traits.push(forme);
        });

        if (traits.length) {
          gsap.to(traits, {
            strokeDashoffset: 0,
            duration: t(0.85),
            stagger: t(0.02),
            ease: "power2.inOut",
            clearProps: "strokeDasharray,strokeDashoffset",
          });
        }
      };

      if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
        jouer();
      } else {
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: jouer,
        });
      }
    }, zone);

    return () => ctx.revert();
  }, [actif, cle]);

  return (
    <div className="comp-grille" ref={zone}>
      {competences.map((c, i) => (
        // En grand écran, ces deux enveloppes posent la tuile sur la couronne
        // autour du 360° : la première pivote de son angle, la seconde la
        // redresse. En dessous elles sont en « display: contents » et la tuile
        // redevient une simple case de grille.
        <span
          key={c.titre}
          className="comp-point"
          style={
            { "--a": `${(i * 360) / competences.length}deg` } as CSSProperties
          }
        >
          <span className="comp-redresse">
            <button
              type="button"
              className="competence"
              data-ouvert={ouvert === i}
              aria-expanded={ouvert === i}
              aria-controls={`${cle}-${i}-detail`}
              onClick={() => setOuvert(ouvert === i ? null : i)}
            >
              <span className="comp-index" aria-hidden="true">
                {num}.{i + 1}
              </span>

              <span className="comp-face">
                <IconeCompetence nom={c.icone} />
                <span className="comp-nom">{c.titre}</span>
              </span>

              <span className="comp-dos" id={`${cle}-${i}-detail`}>
                {c.texte}
              </span>

              <span className="comp-signe" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </span>
        </span>
      ))}
    </div>
  );
}
