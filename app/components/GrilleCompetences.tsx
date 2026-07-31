"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IconeCompetence from "./IconeCompetence";
import type { Competence } from "../lib/programme";

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
            duration: 0.55,
            stagger: 0.05,
            ease: "power2.out",
            clearProps: "all",
          }
        );

        const traits: SVGGeometryElement[] = [];
        el.querySelectorAll<SVGGeometryElement>(
          ".comp-icone path, .comp-icone circle, .comp-icone rect"
        ).forEach((t) => {
          // getTotalLength lève sur les formes dégénérées : on les ignore
          let l = 0;
          try {
            l = t.getTotalLength();
          } catch {
            return;
          }
          if (!l) return;
          gsap.set(t, { strokeDasharray: l, strokeDashoffset: l });
          traits.push(t);
        });

        if (traits.length) {
          gsap.to(traits, {
            strokeDashoffset: 0,
            duration: 0.85,
            stagger: 0.02,
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
        <button
          key={c.titre}
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
      ))}
    </div>
  );
}
