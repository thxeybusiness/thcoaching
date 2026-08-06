"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import Magnetic from "./Magnetic";
import IconeCompetence from "./IconeCompetence";
import { INTRO_FIN } from "../lib/intro";
import {
  DELAI_RETOUR,
  VIVACITE_RETOUR,
  decouperTout,
  vague,
} from "../lib/anime";
import { APPUIS, CENTRE, MAILLAGE, RAYON, SCENE } from "../lib/ecosysteme";

/**
 * Premier écran du deck, joué comme un plan de film.
 *
 * L'écran est une composition en deux temps : à gauche l'accroche, réduite au
 * strict nécessaire ; à droite l'écosystème lui-même, dessiné — un noyau
 * (toi), un anneau, et les cinq appuis qui t'entourent, chacun relié au
 * centre. Ce que la page disait en un paragraphe, elle le montre.
 *
 * La séquence dure environ deux secondes et demie et se rejoue à chaque
 * retour sur l'écran (le deck pose `data-active` sur l'écran courant) : le
 * chapitre ne s'affiche jamais, il entre.
 *
 * Rien de tout cela n'est nécessaire à la lecture : sans JavaScript, ou en
 * mouvement réduit, tout le contenu est déjà en place et lisible.
 */

/** Vitesse d'ensemble de la séquence. Un seul nombre règle tout le plan. */
const VITESSE = 1;
const d = (secondes: number) => secondes / VITESSE;

/** Longueurs des deux tracés de la scène, pour les dessiner au lancement.
 *  L'anneau est un cercle ; le maillage, cinq cordes d'angle 144°. */
const TOUR = 2 * Math.PI * RAYON;
const ETOILE = 5 * 2 * RAYON * Math.sin((144 * Math.PI) / 360);

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    decouperTout(el, ".hero-line-inner", true);
    decouperTout(el, ".hero-eyebrow-texte, .hero-sub", false);

    let obs: MutationObserver | undefined;

    const ctx = gsap.context(() => {
      let premier = true;

      const lignes = Array.from(
        el.querySelectorAll<HTMLElement>(".hero-line-inner")
      );

      const jouer = () => {
        const tl = gsap.timeline({
          /* Au chargement, on attend la levée du rideau de l'intro.
             Au retour sur le chapitre, le plan démarre pendant le dernier
             tiers du voyage : lancé au clic, la moitié se jouerait hors de
             l'écran ; lancé à l'arrivée, l'écran resterait vide une seconde.
             Il est aussi joué plus vif — on revient, on ne découvre plus. */
          delay: premier ? INTRO_FIN : DELAI_RETOUR,
          defaults: { ease: "power4.out" },
        });
        if (!premier) tl.timeScale(VIVACITE_RETOUR);

        // ---- La moitié gauche : l'accroche ----

        // Le cadre se pose — un très léger recadrage, comme une caméra
        tl.fromTo(
          ".hero-inner",
          { scale: 1.03, y: 14, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: d(1.1), ease: "power3.out" },
          0
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
          { xPercent: 130, opacity: 1, duration: d(1.3), ease: "power2.inOut" },
          d(0.26)
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
        vague(tl, lignes, d(0.95), d(0.2));

        // La phrase — une seule ligne — arrive mot à mot
        tl.fromTo(
          ".hero-sub .mot-anim",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: d(0.6), stagger: d(0.03) },
          d(1.15)
        );

        // Les boutons se posent
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
          d(1.5)
        );
        tl.fromTo(
          ".hero-onde",
          { scale: 0.75, opacity: 0.5 },
          { scale: 1.6, opacity: 0, duration: d(1.2), ease: "power2.out" },
          d(1.8)
        );

        // ---- La moitié droite : l'écosystème se construit ----

        // L'anneau se trace, d'un seul tour
        tl.fromTo(
          ".hero-piste",
          { strokeDashoffset: TOUR },
          { strokeDashoffset: 0, duration: d(1.5), ease: "power2.inOut" },
          d(0.45)
        );

        // Le noyau se pose au centre
        tl.fromTo(
          ".hero-noyau",
          { scale: 0.4, opacity: 0 },
          { scale: 1, opacity: 1, duration: d(0.9), ease: "back.out(1.7)" },
          d(0.7)
        );

        // Puis chaque appui arrive à sa place sur l'anneau
        tl.fromTo(
          ".hero-appui",
          { scale: 0.4, opacity: 0, y: 18 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: d(0.9),
            stagger: d(0.1),
            ease: "back.out(1.7)",
          },
          d(1.0)
        );

        // Le maillage se tisse entre eux, une fois qu'ils sont tous là
        tl.fromTo(
          ".hero-maillage",
          { strokeDashoffset: ETOILE, opacity: 0 },
          {
            strokeDashoffset: 0,
            opacity: 1,
            duration: d(1.5),
            ease: "power2.inOut",
          },
          d(1.5)
        );

        // Le halo tournant prend enfin le relais
        tl.fromTo(
          ".hero-halo",
          { opacity: 0 },
          { opacity: 1, duration: d(1.2), ease: "power2.out" },
          d(1.7)
        );

        // Une onde part du noyau
        tl.fromTo(
          ".hero-onde-eco",
          { scale: 0.5, opacity: 0.6 },
          { scale: 2.4, opacity: 0, duration: d(1.6), ease: "power2.out" },
          d(1.85)
        );

        return tl;
      };

      jouer();
      premier = false;

      /* Le plan une fois joué, l'écran continue de respirer. On lance ces
         boucles à part de la séquence, pour qu'elles survivent à ses rejeux. */

      /* Le halo tourne tout seul (animation CSS, comme sur l'orbite du
         chapitre « Programme »). Restent les cartes, qui flottent en
         décalé, et l'onde qui repart du noyau de temps à autre. */
      gsap.to(".hero-carte", {
        y: -8,
        duration: 3.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: { each: 0.6, from: "start" },
        delay: INTRO_FIN + 3.4,
      });

      gsap.fromTo(
        ".hero-onde-eco",
        { scale: 0.5, opacity: 0.45 },
        {
          scale: 2.4,
          opacity: 0,
          duration: 2.6,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: 4.2,
          delay: INTRO_FIN + 5.5,
        }
      );

      const respiration = gsap.timeline({
        repeat: -1,
        repeatDelay: 7,
        delay: INTRO_FIN + 7,
      });
      vague(respiration, lignes, 0, 0.22);

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
      <span className="hero-balayage" aria-hidden="true" />

      <div className="slide-inner">
        <div className="container hero-inner">
          <div className="hero-compo">
            <div className="hero-texte">
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
                Le socle d&apos;abord, ton business ensuite. Jamais seul.
              </p>
              <div className="hero-actions">
                <Magnetic>
                  <a href="#contact" className="btn btn-orange hero-cta">
                    <i className="hero-onde" aria-hidden="true" />
                    Réserver un appel
                  </a>
                </Magnetic>
                <Magnetic strength={0.22}>
                  <a href="#offre" className="btn btn-outline-light">
                    Voir le programme
                  </a>
                </Magnetic>
              </div>
            </div>

            {/* L'écosystème, dessiné dans la langue du chapitre
                « Programme » : un anneau, un maillage en étoile entre les
                appuis, et des cartes. Au centre, la personne accompagnée. */}
            <div className="hero-eco">
              <span className="hero-halo" aria-hidden="true" />

              <svg
                className="hero-anneau"
                viewBox={`0 0 ${SCENE} ${SCENE}`}
                aria-hidden="true"
              >
                <circle
                  className="hero-piste"
                  cx={CENTRE}
                  cy={CENTRE}
                  r={RAYON}
                />
                <path className="hero-maillage" d={MAILLAGE} />
              </svg>

              <div className="hero-noyau">
                <span className="hero-onde-eco" aria-hidden="true" />
                <strong className="hero-noyau-valeur">Toi</strong>
                <span className="hero-noyau-texte">au centre</span>
              </div>

              <ul className="hero-appuis">
                {APPUIS.map((a) => (
                  <li
                    key={a.icone}
                    className="hero-appui"
                    style={{ "--a": `${a.angle}deg` } as CSSProperties}
                  >
                    <span className="hero-carte">
                      {/* Le rang de l'appui, et non sa place sur l'anneau :
                          les deux ne coïncident pas. */}
                      <span className="hero-carte-index" aria-hidden="true">
                        {a.num}
                      </span>
                      <IconeCompetence nom={a.icone} />
                      <strong className="hero-carte-nom">{a.nom}</strong>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
