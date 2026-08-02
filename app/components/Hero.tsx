"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import Magnetic from "./Magnetic";
import IconeCompetence from "./IconeCompetence";
import { DUREE_VOYAGE } from "./Deck";
import { INTRO_FIN } from "../lib/intro";
import { APPUIS } from "../lib/ecosysteme";

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
      const vague = (
        tl: gsap.core.Timeline,
        depart: number,
        entreLignes: number
      ) => {
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
        if (!premier) tl.timeScale(1.4);

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
        vague(tl, d(0.95), d(0.2));

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

        // L'anneau s'ouvre
        tl.fromTo(
          ".hero-anneau",
          { scale: 0.72, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: d(1.3),
            stagger: d(0.1),
            ease: "power3.out",
          },
          d(0.5)
        );

        // Le noyau se pose au centre — c'est de lui que part tout le reste
        tl.fromTo(
          ".hero-noyau",
          { scale: 0.3, opacity: 0 },
          { scale: 1, opacity: 1, duration: d(0.9), ease: "back.out(1.7)" },
          d(0.72)
        );
        tl.fromTo(
          ".hero-noyau-texte",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: d(0.6) },
          d(1.0)
        );

        // Les liens se tendent du centre vers l'extérieur
        tl.fromTo(
          ".hero-fil",
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: d(0.75),
            stagger: d(0.09),
            ease: "power3.out",
          },
          d(1.0)
        );

        // Puis chaque appui apparaît au bout de son lien
        tl.fromTo(
          ".hero-appui",
          { scale: 0.35, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: d(0.85),
            stagger: d(0.09),
            ease: "back.out(1.8)",
          },
          d(1.22)
        );

        // Une onde part du noyau et traverse l'anneau
        tl.fromTo(
          ".hero-onde-eco",
          { scale: 0.34, opacity: 0.55 },
          { scale: 1.06, opacity: 0, duration: d(1.5), ease: "power2.out" },
          d(1.7)
        );

        return tl;
      };

      jouer();
      premier = false;

      /* Le plan une fois joué, l'écran continue de respirer. On lance ces
         boucles à part de la séquence, pour qu'elles survivent à ses rejeux. */

      // L'anneau tourne, très lentement, dans les deux sens
      gsap.to(".hero-anneau--exterieur", {
        rotate: 360,
        duration: 150,
        repeat: -1,
        ease: "none",
      });
      gsap.to(".hero-anneau--interieur", {
        rotate: -360,
        duration: 190,
        repeat: -1,
        ease: "none",
      });

      // Chaque appui flotte, décalé de son voisin
      gsap.to(".hero-appui-corps", {
        y: -7,
        duration: 3.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: { each: 0.55, from: "start" },
        delay: INTRO_FIN + 3,
      });

      // Et l'onde repart du noyau de temps à autre
      gsap.fromTo(
        ".hero-onde-eco",
        { scale: 0.34, opacity: 0.5 },
        {
          scale: 1.06,
          opacity: 0,
          duration: 2.4,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: 3.6,
          delay: INTRO_FIN + 5,
        }
      );

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

            {/* L'écosystème, dessiné. Le noyau, c'est la personne
                accompagnée ; les cinq appuis sont ce qui l'entoure. */}
            <div className="hero-eco">
              <i
                className="hero-anneau hero-anneau--exterieur"
                aria-hidden="true"
              />
              <i
                className="hero-anneau hero-anneau--interieur"
                aria-hidden="true"
              />
              <i className="hero-onde-eco" aria-hidden="true" />

              {APPUIS.map((a) => (
                <i
                  key={`fil-${a.icone}`}
                  className="hero-fil"
                  aria-hidden="true"
                  style={{ "--a": `${a.angle}deg` } as CSSProperties}
                />
              ))}

              <div className="hero-noyau">
                <span className="hero-noyau-texte">Toi</span>
              </div>

              <ul className="hero-appuis">
                {APPUIS.map((a) => (
                  <li
                    key={a.icone}
                    className="hero-appui"
                    style={{ "--a": `${a.angle}deg` } as CSSProperties}
                  >
                    <span className="hero-appui-corps">
                      <span className="hero-appui-pastille">
                        <IconeCompetence nom={a.icone} />
                      </span>
                      <span className="hero-appui-nom">{a.nom}</span>
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
