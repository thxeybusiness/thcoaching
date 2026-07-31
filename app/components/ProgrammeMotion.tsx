"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Mise en mouvement de la page programme : barre de progression, révélations
 * au défilement, tracé de l'orbite et de la ligne de méthode, parallaxe des
 * mots géants. Aucun filtre de flou : uniquement transform et opacity.
 */
export default function ProgrammeMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Tout reste visible, simplement sans animation
      gsap.set("[data-anim], .pg-carte, .orbite-point, .competence", {
        opacity: 1,
        clearProps: "transform",
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Barre de progression de lecture
      gsap.to(".pg-progression i", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { scrub: 0.3, start: 0, end: "max" },
      });

      // Titre : mot à mot
      gsap.from(".pg-titre .mot", {
        yPercent: 115,
        rotateZ: 5,
        duration: 0.9,
        stagger: 0.07,
        ease: "power4.out",
        delay: 0.15,
      });
      gsap.from(".pg-tete [data-anim]", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.35,
      });

      // Révélations génériques
      gsap.utils.toArray<HTMLElement>("[data-anim]").forEach((el) => {
        if (el.closest(".pg-tete")) return;
        gsap.from(el, {
          opacity: 0,
          y: 26,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // Cartes en cascade
      gsap.utils.toArray<HTMLElement>("[data-cascade]").forEach((zone) => {
        gsap.from(zone.querySelectorAll(".pg-carte"), {
          opacity: 0,
          y: 34,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: zone, start: "top 82%", once: true },
        });
      });

      // Les murs de compétences : les tuiles se posent, puis chaque
      // pictogramme se dessine d'un trait.
      gsap.utils.toArray<HTMLElement>("[data-grille]").forEach((grille) => {
        const declencheur = {
          trigger: grille,
          start: "top 84%",
          once: true,
        } as const;

        gsap.from(grille.querySelectorAll(".competence"), {
          opacity: 0,
          y: 28,
          scale: 0.95,
          duration: 0.62,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: declencheur,
        });

        const traits = grille.querySelectorAll<SVGGeometryElement>(
          ".comp-icone path, .comp-icone circle, .comp-icone rect"
        );
        const traçables: SVGGeometryElement[] = [];
        traits.forEach((t) => {
          // getTotalLength lève sur les formes dégénérées : on les ignore
          let l = 0;
          try {
            l = t.getTotalLength();
          } catch {
            return;
          }
          if (!l) return;
          gsap.set(t, { strokeDasharray: l, strokeDashoffset: l });
          traçables.push(t);
        });
        if (traçables.length) {
          gsap.to(traçables, {
            strokeDashoffset: 0,
            duration: 0.9,
            stagger: 0.025,
            ease: "power2.inOut",
            scrollTrigger: declencheur,
          });
        }
      });

      // L'orbite se trace, puis les quatre piliers se posent un par un
      const trace = document.querySelector<SVGCircleElement>(".orbite-trace");
      if (trace) {
        const l = trace.getTotalLength();
        gsap.set(trace, { strokeDasharray: l, strokeDashoffset: l });
        gsap.to(trace, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: "power2.inOut",
          scrollTrigger: { trigger: ".orbite", start: "top 78%", once: true },
        });
      }
      gsap.from(".orbite-point", {
        opacity: 0,
        scale: 0.4,
        duration: 0.55,
        stagger: 0.09,
        ease: "back.out(1.7)",
        scrollTrigger: { trigger: ".orbite", start: "top 72%", once: true },
      });
      gsap.from(".orbite-noyau", {
        opacity: 0,
        scale: 0.7,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".orbite", start: "top 78%", once: true },
      });

      // Parallaxe des mots géants
      gsap.utils.toArray<HTMLElement>(".pg-fantome").forEach((el) => {
        gsap.to(el, {
          yPercent: -22,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
