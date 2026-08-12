"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import {
  DELAI_RETOUR,
  VIVACITE_RETOUR,
  decouperTout,
  dessinerIcones,
  releverTitre,
} from "../lib/anime";
import { INTRO_FIN } from "../lib/intro";

/**
 * Les séquences d'entrée des chapitres, sauf le premier — qui a la sienne,
 * dans `Hero`, parce qu'elle pilote aussi la scène de l'écosystème.
 *
 * Chaque chapitre entre comme un plan de film et rejoue à chaque retour. Le
 * découpage est propre à chacun : un chapitre qui présente trois étapes ne
 * s'anime pas comme un mur de quarante-trois compétences.
 *
 * Le composant ne rend rien. Il s'accroche aux chapitres déjà présents dans
 * le document et écoute `data-active`, posé par le deck. Écrire les
 * séquences ici plutôt que dans la page garde le contenu en composant
 * serveur : le HTML reste complet, lisible et indexable sans JavaScript.
 */

/** Une séquence : elle remplit la ligne de temps du chapitre. */
type Plan = (el: HTMLElement, tl: gsap.core.Timeline) => void;

/** Les éléments révélés par la feuille de style, repris ici par la séquence. */
const REVELES = "[data-r]";

/** Découpe commune : les titres en caractères, les textes courants en mots. */
function preparer(el: HTMLElement) {
  decouperTout(el, ".section-title, .contact-title", true);
  decouperTout(
    el,
    ".section-label, .section-intro, .contact-sub, .deroule-titre",
    false
  );
}

/** L'ouverture partagée : la mention, puis le titre qui se relève. */
function ouverture(el: HTMLElement, tl: gsap.core.Timeline, depart = 0) {
  tl.fromTo(
    el.querySelectorAll(".section-label .mot-anim"),
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.55, stagger: 0.04, ease: "power3.out" },
    depart
  );
  releverTitre(tl, el.querySelectorAll(".section-title .char"), depart + 0.16);
}

const PLANS: Record<string, Plan> = {
  /* Le déroulé : trois étapes qui se posent l'une après l'autre, chacune
     annoncée par son filet de progression qui se remplit. */
  methode(el, tl) {
    ouverture(el, tl);

    tl.fromTo(
      el.querySelectorAll(".section-intro .mot-anim"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.016, ease: "power3.out" },
      0.62
    );

    const etapes = Array.from(
      el.querySelectorAll<HTMLElement>(".deroule-etape")
    );

    // Chaque carte arrive de sa droite, très légèrement inclinée
    tl.fromTo(
      etapes,
      { opacity: 0, y: 34, rotateZ: 1.4, transformOrigin: "50% 100%" },
      {
        opacity: 1,
        y: 0,
        rotateZ: 0,
        duration: 0.85,
        stagger: 0.13,
        ease: "back.out(1.5)",
      },
      0.85
    );

    // Le filet du haut se remplit d'une étape à l'autre
    tl.fromTo(
      etapes,
      { "--trait": 0 },
      {
        "--trait": 1,
        duration: 0.7,
        stagger: 0.13,
        ease: "power2.inOut",
      },
      1.0
    );

    // Le numéro se relève derrière son logo
    tl.fromTo(
      el.querySelectorAll(".deroule-num"),
      { opacity: 0, yPercent: 60 },
      {
        opacity: 1,
        yPercent: 0,
        duration: 0.6,
        stagger: 0.13,
        ease: "power3.out",
      },
      1.08
    );

    tl.fromTo(
      el.querySelectorAll(".deroule-titre .mot-anim"),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.03, ease: "power3.out" },
      1.2
    );
    tl.fromTo(
      el.querySelectorAll(".deroule-court"),
      { opacity: 0 },
      { opacity: 1, duration: 0.6, stagger: 0.13, ease: "power2.out" },
      1.35
    );
  },

  /* Le programme : l'en-tête, puis la constellation prend le relais — elle a
     sa propre entrée, réglée dans « Poles » et « GrilleCompetences ». */
  offre(el, tl) {
    tl.fromTo(
      el.querySelectorAll(".programme-tete .section-label"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      0
    );
    tl.fromTo(
      el.querySelectorAll(".programme-cles > *"),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: "power3.out" },
      0.14
    );
    // Le compte de compétences respire une fois posé
    tl.fromTo(
      el.querySelectorAll(".programme-cles strong"),
      { scale: 0.86 },
      { scale: 1, duration: 0.7, stagger: 0.06, ease: "back.out(2.2)" },
      0.2
    );
  },

  /* L'écosystème : quatre cartes qui basculent vers le lecteur, chacune avec
     son pictogramme qui se dessine. */
  bonus(el, tl) {
    ouverture(el, tl);

    const cartes = Array.from(
      el.querySelectorAll<HTMLElement>(".bonus-carte-accueil")
    );
    tl.fromTo(
      cartes,
      { opacity: 0, y: 40, rotateX: -14, transformPerspective: 900 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.9,
        stagger: 0.11,
        ease: "back.out(1.4)",
      },
      0.7
    );
    dessinerIcones(
      tl,
      cartes.map((c) => c.querySelector<HTMLElement>(".comp-icone")!).filter(Boolean),
      0.85,
      0.11
    );
  },

  /* Le contact : tout converge vers un seul bouton. */
  contact(el, tl) {
    tl.fromTo(
      el.querySelectorAll(".section-label .mot-anim"),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.04, ease: "power3.out" },
      0
    );
    releverTitre(tl, el.querySelectorAll(".contact-title .char"), 0.16);

    tl.fromTo(
      el.querySelectorAll(".contact-sub .mot-anim"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.018, ease: "power3.out" },
      0.72
    );
    tl.fromTo(
      el.querySelector(".contact-cta"),
      { opacity: 0, y: 24, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
      },
      1.05
    );
    tl.fromTo(
      el.querySelectorAll(".contact-note, .contact-legal"),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" },
      1.3
    );

    // La lueur du fond s'ouvre, et le wordmark monte du bas
    tl.fromTo(
      el.querySelector(".contact-glow"),
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" },
      0
    );
    tl.fromTo(
      el.querySelector(".footer-word"),
      { opacity: 0, yPercent: 24 },
      { opacity: 1, yPercent: 0, duration: 1.3, ease: "power3.out" },
      0.5
    );
  },
};

export default function Sequences() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observateurs: MutationObserver[] = [];
    const contextes: gsap.Context[] = [];

    Object.entries(PLANS).forEach(([id, plan]) => {
      const el = document.getElementById(id);
      if (!el) return;

      preparer(el);

      const ctx = gsap.context(() => {
        let premier = true;

        const jouer = () => {
          /* La feuille de style masque les éléments marqués jusqu'à ce que le
             chapitre ait été traversé, et les révèle par une transition. La
             séquence prend le relais : on coupe la transition pour qu'elle ne
             se superpose pas aux images écrites par GSAP. */
          el.setAttribute("data-anime", "true");
          gsap.set(el.querySelectorAll(REVELES), { clearProps: "opacity" });

          const tl = gsap.timeline({
            delay: premier ? INTRO_FIN : DELAI_RETOUR,
            defaults: { ease: "power3.out" },
          });
          if (!premier) tl.timeScale(VIVACITE_RETOUR);
          plan(el, tl);
          return tl;
        };

        /* Le premier chapitre rendu actif joue tout de suite ; les autres
           attendent qu'on arrive dessus. */
        let etaitActif = el.dataset.active === "true";
        if (etaitActif) jouer();

        const obs = new MutationObserver(() => {
          const actif = el.dataset.active === "true";
          if (actif && !etaitActif) {
            jouer();
            premier = false;
          }
          etaitActif = actif;
        });
        obs.observe(el, { attributes: true, attributeFilter: ["data-active"] });
        observateurs.push(obs);
        premier = false;
      }, el);

      contextes.push(ctx);
    });

    return () => {
      observateurs.forEach((o) => o.disconnect());
      contextes.forEach((c) => c.revert());
    };
  }, []);

  return null;
}
