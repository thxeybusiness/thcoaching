"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Magnetic from "./Magnetic";
import { DUREE_VOYAGE } from "./Deck";
import { INTRO_FIN } from "../lib/intro";

/**
 * Premier écran du deck, joué comme un plan de film.
 *
 * La séquence complète dure un peu plus de deux secondes et se rejoue à chaque
 * retour sur l'écran (le deck pose `data-active` sur l'écran courant) : le
 * chapitre ne s'affiche jamais, il entre.
 *
 * L'ordre est celui d'un regard : le cadre se pose, la mention se tire, le
 * balayage de lumière traverse, le titre se relève caractère par caractère en
 * perspective, une vague de lumière court dans les lettres, la phrase arrive
 * mot à mot, les boutons apparaissent et une onde part du premier.
 *
 * Rien de tout cela n'est nécessaire à la lecture : sans JavaScript, ou en
 * mouvement réduit, tout le contenu est déjà en place et lisible.
 */

/** Vitesse d'ensemble de la séquence. Un seul nombre règle tout le plan. */
const VITESSE = 1;
const d = (secondes: number) => secondes / VITESSE;

/** L'ombre portée du titre, telle que la feuille de style la pose, et sa
 *  version éclairée — la vague de lumière fait l'aller-retour entre les deux. */
const OMBRE = "0 2px 26px rgba(0, 0, 0, 0.85)";
const OMBRE_LUMIERE = "0 0 18px rgba(255, 216, 176, 0.6)";

/** Découpe un texte en mots — et, si demandé, chaque mot en caractères. */
function decouper(el: HTMLElement, enCaracteres: boolean) {
  if (el.dataset.decoupe) return;
  el.dataset.decoupe = "1";
  const mots = (el.textContent ?? "").split(" ");
  el.textContent = "";
  mots.forEach((mot, i) => {
    const m = document.createElement("span");
    m.className = "mot-anim";
    if (enCaracteres) {
      Array.from(mot).forEach((c) => {
        const s = document.createElement("span");
        s.className = "char";
        s.textContent = c;
        m.appendChild(s);
      });
    } else {
      m.textContent = mot;
    }
    el.appendChild(m);
    if (i < mots.length - 1) el.appendChild(document.createTextNode(" "));
  });
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.querySelectorAll<HTMLElement>(".hero-line-inner").forEach((l) =>
      decouper(l, true)
    );
    el.querySelectorAll<HTMLElement>(".hero-eyebrow-texte, .hero-sub").forEach(
      (l) => decouper(l, false)
    );

    let obs: MutationObserver | undefined;

    const ctx = gsap.context(() => {
      let premier = true;

      /* La vague : chaque caractère s'éclaire un court instant, l'un après
         l'autre, et retombe. C'est un éclat qui suit la forme des lettres —
         là où une bande de lumière posée par-dessus dessinerait un rectangle. */
      const vague = (tl: gsap.core.Timeline, depart: number, entreLignes: number) => {
        el.querySelectorAll<HTMLElement>(".hero-line-inner").forEach((l, i) => {
          tl.fromTo(
            l.querySelectorAll(".char"),
            { textShadow: OMBRE },
            {
              textShadow: OMBRE_LUMIERE,
              duration: d(0.2),
              stagger: d(0.016),
              ease: "sine.inOut",
              yoyo: true,
              repeat: 1,
            },
            depart + i * entreLignes
          );
        });
      };

      const jouer = () => {
        const tl = gsap.timeline({
          /* Au chargement, on attend la levée du rideau de l'intro.
             Au retour sur le chapitre, le plan démarre pendant le dernier
             tiers du voyage : lancé au clic, la moitié se jouerait hors de
             l'écran ; lancé à l'arrivée, l'écran resterait vide une seconde.
             Il est aussi joué plus vif — on revient, on ne découvre plus. */
          delay: premier ? INTRO_FIN : DUREE_VOYAGE - 0.34,
          defaults: { ease: "power4.out" },
        });
        if (!premier) tl.timeScale(1.35);

        // Le cadre se pose — un très léger recadrage, comme une caméra
        tl.fromTo(
          ".hero-inner",
          { scale: 1.035, y: 16, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: d(1.15), ease: "power3.out" },
          0
        );

        // Le mot fantôme dérive vers sa place, en fond
        tl.fromTo(
          ".hero-ghost",
          { opacity: 0, xPercent: 7, scale: 1.05 },
          {
            opacity: 1,
            xPercent: 0,
            scale: 1,
            duration: d(2),
            ease: "power3.out",
          },
          d(0.05)
        );

        // Le trait de la mention se tire, puis la mention arrive mot à mot
        tl.fromTo(
          ".hero-trait",
          { scaleX: 0 },
          { scaleX: 1, duration: d(0.7), ease: "power3.inOut" },
          d(0.1)
        );
        tl.fromTo(
          ".hero-eyebrow-texte .mot-anim",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: d(0.6), stagger: d(0.04) },
          d(0.3)
        );

        // Un balayage de lumière traverse l'écran
        tl.fromTo(
          ".hero-balayage",
          { xPercent: -130, opacity: 0 },
          {
            xPercent: 130,
            opacity: 1,
            duration: d(1.25),
            ease: "power2.inOut",
          },
          d(0.28)
        );

        // Le titre se relève : chaque caractère bascule depuis le sol. La
        // perspective est portée par le caractère lui-même — les lignes sont
        // en `overflow: hidden`, ce qui aplatirait toute perspective héritée.
        tl.fromTo(
          ".hero-line-inner .char",
          { yPercent: 125, rotateX: -82, opacity: 0 },
          {
            yPercent: 0,
            rotateX: 0,
            opacity: 1,
            transformPerspective: 620,
            duration: d(1.05),
            stagger: d(0.022),
          },
          d(0.42)
        );

        // Une vague de lumière court dans les lettres, ligne après ligne
        vague(tl, d(0.95), d(0.2));

        // La phrase arrive mot à mot
        tl.fromTo(
          ".hero-sub .mot-anim",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: d(0.7), stagger: d(0.014) },
          d(1.2)
        );

        // Les boutons se posent, puis une onde part du premier
        tl.fromTo(
          ".hero-actions > *",
          { opacity: 0, y: 22, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: d(0.8),
            stagger: d(0.12),
            ease: "back.out(1.6)",
          },
          d(1.55)
        );
        tl.fromTo(
          ".hero-onde",
          { scale: 0.75, opacity: 0.5 },
          { scale: 1.6, opacity: 0, duration: d(1.2), ease: "power2.out" },
          d(1.85)
        );

        return tl;
      };

      jouer();
      premier = false;

      /* Le plan une fois joué, l'écran continue de respirer : le mot fantôme
         dérive sans fin et un éclat repasse sur le titre de temps à autre. On
         les lance à part de la séquence, pour qu'ils survivent à ses rejeux. */
      gsap.to(".hero-ghost", {
        xPercent: -1.6,
        yPercent: -2.2,
        duration: 9,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: INTRO_FIN + 2,
      });
      const respiration = gsap.timeline({
        repeat: -1,
        repeatDelay: 7,
        delay: INTRO_FIN + 7,
      });
      vague(respiration, 0, 0.22);

      // Rejoue quand l'écran redevient actif (et non à chaque écriture de
      // l'attribut : le deck le repose à l'identique à chaque changement)
      let etaitActif = true;
      obs = new MutationObserver(() => {
        const actif = el.dataset.active === "true";
        if (actif && !etaitActif) jouer();
        etaitActif = actif;
      });
      obs.observe(el, { attributes: true, attributeFilter: ["data-active"] });
    }, root);

    return () => {
      obs?.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="slide slide--hero" id="accueil" ref={root}>
      <span className="hero-ghost" aria-hidden="true">
        Écosystème
      </span>
      <span className="hero-balayage" aria-hidden="true" />

      <div className="slide-inner">
        <div className="container hero-inner">
          <span className="eyebrow hero-eyebrow">
            <i className="hero-trait" aria-hidden="true" />
            <span className="hero-eyebrow-texte">
              Coaching Business &amp; Performance
            </span>
          </span>
          <h1 className="hero-title">
            <span className="hero-line">
              <span className="hero-line-inner">Tout un écosystème</span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner accent">
                pour t&apos;aider à bâtir
              </span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner accent">ton business.</span>
            </span>
          </h1>
          <p className="hero-sub">
            D&apos;abord le socle : 43 compétences qui servent n&apos;importe
            quel projet. Ton business se monte ensuite dessus — et tu n&apos;es
            pas seul : coach, formations, outils et groupe d&apos;entrepreneurs.
          </p>
          <div className="hero-actions">
            <Magnetic>
              <a href="#contact" className="btn btn-orange hero-cta">
                <i className="hero-onde" aria-hidden="true" />
                Réserver un appel découverte
              </a>
            </Magnetic>
            <Magnetic strength={0.22}>
              <a href="#offre" className="btn btn-outline-light">
                Voir le programme
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
