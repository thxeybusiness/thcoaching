"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import IconeCompetence from "./IconeCompetence";
import type { Competence } from "../lib/programme";

/**
 * Cadence de l'entrée des tuiles. Les durées restent écrites à leur valeur
 * d'origine et sont divisées ici : le rapport reste lisible et un seul
 * nombre règle la vitesse d'ensemble.
 */
const VITESSE = 1.8;
const t = (secondes: number) => secondes / VITESSE;

/** Écarts laissés par le fil, de part et d'autre, en pixels. Serrés : sur les
 *  rayons du haut et du bas, la couronne passe au plus près de l'orbite et il
 *  ne reste qu'une quinzaine de pixels à tenir. */
const ECART_ORBITE = 13;
const ECART_TUILE = 10;
/** En deçà, le fil n'est plus qu'un point : mieux vaut ne pas le tracer. */
const LONGUEUR_MINI = 6;

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
  const fils = useRef<SVGSVGElement>(null);

  // On repart d'un mur fermé quand on quitte le pilier
  useEffect(() => {
    if (!actif) setOuvert(null);
  }, [actif]);

  useEffect(() => {
    const el = zone.current;
    if (!el || !actif) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let observateur: IntersectionObserver | null = null;

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

      // On attend que le mur soit réellement à l'écran. Un déclencheur lié au
      // défilement vertical ne conviendrait pas : les chapitres de l'accueil
      // se déplacent latéralement, celui du programme est déjà à la bonne
      // hauteur alors qu'il est encore hors champ.
      observateur = new IntersectionObserver(
        (entrees) => {
          if (!entrees.some((e) => e.isIntersecting)) return;
          observateur?.disconnect();
          jouer();
        },
        { threshold: 0.15 }
      );
      observateur.observe(el);
    }, zone);

    return () => {
      observateur?.disconnect();
      ctx.revert();
    };
  }, [actif, cle]);

  /**
   * Les fils qui relient le centre à chaque compétence.
   *
   * Ils sont posés d'après la géométrie réellement mesurée, pas d'après des
   * proportions écrites à l'avance : la couronne est une ellipse et l'orbite un
   * cercle, si bien qu'une même fraction du rayon dégage l'orbite sur les côtés
   * mais la traverse en haut et en bas. On lit donc la position de l'orbite et
   * de chaque tuile, et on tend le fil entre les deux.
   */
  useEffect(() => {
    const grille = zone.current;
    const svg = fils.current;
    if (!grille || !svg || !actif) return;

    const tracer = () => {
      // Hors constellation, le mur est une grille : les fils n'ont pas de sens
      // et la feuille de style les masque déjà.
      if (getComputedStyle(svg).display === "none") return;

      const cadre = grille.getBoundingClientRect();
      const orbite = grille
        .closest(".piliers-vue")
        ?.querySelector(".orbite")
        ?.getBoundingClientRect();
      if (!cadre.width || !orbite) return;

      svg.setAttribute("viewBox", `0 0 ${cadre.width} ${cadre.height}`);
      const cx = cadre.width / 2;
      const cy = cadre.height / 2;
      const rOrbite = orbite.width / 2;

      const tuiles = grille.querySelectorAll<HTMLElement>(".competence");
      svg.querySelectorAll<SVGLineElement>(".comp-fil").forEach((fil, i) => {
        const t = tuiles[i]?.getBoundingClientRect();
        if (!t) return;
        const dx = t.left + t.width / 2 - cadre.left - cx;
        const dy = t.top + t.height / 2 - cadre.top - cy;
        const distance = Math.hypot(dx, dy);
        if (!distance) return;
        const ux = dx / distance;
        const uy = dy / distance;

        // Où le rayon entre dans la tuile : intersection avec son rectangle.
        const versBord = Math.min(
          Math.abs(ux) > 1e-3 ? t.width / 2 / Math.abs(ux) : Infinity,
          Math.abs(uy) > 1e-3 ? t.height / 2 / Math.abs(uy) : Infinity
        );

        const depart = rOrbite + ECART_ORBITE;
        const arrivee = distance - versBord - ECART_TUILE;
        // Trop à l'étroit pour un fil lisible : on l'efface plutôt que de
        // laisser un trait qui mord sur l'orbite ou sur la tuile.
        const visible = arrivee - depart > LONGUEUR_MINI;
        fil.style.display = visible ? "" : "none";
        if (!visible) return;

        fil.setAttribute("x1", String(cx + ux * depart));
        fil.setAttribute("y1", String(cy + uy * depart));
        fil.setAttribute("x2", String(cx + ux * arrivee));
        fil.setAttribute("y2", String(cy + uy * arrivee));
      });
    };

    tracer();
    const observateur = new ResizeObserver(tracer);
    observateur.observe(grille);
    return () => observateur.disconnect();
  }, [actif, competences.length]);

  return (
    <div className="comp-grille" ref={zone}>
      {/* Les fils qui relient le centre à chaque compétence. Leurs
          coordonnées sont posées à la mesure (voir l'effet plus haut) : le
          repère est celui de la scène, en pixels, donc sans déformation. */}
      <svg className="comp-fils" ref={fils} aria-hidden="true">
        {competences.map((c, i) => (
          <line
            key={c.titre}
            className="comp-fil"
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </svg>

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
