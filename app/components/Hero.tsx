"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Magnetic from "./Magnetic";
import { INTRO_FIN } from "../lib/intro";

/**
 * Premier écran du deck : typographie cinétique révélée caractère par
 * caractère. L'animation se rejoue à chaque fois que l'on revient sur cet
 * écran (le deck pose data-active sur l'écran courant).
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Découpe en mots (insécables) puis en caractères
    el.querySelectorAll<HTMLElement>(".hero-line-inner").forEach((line) => {
      if (line.dataset.split) return;
      line.dataset.split = "1";
      const words = (line.textContent ?? "").split(" ");
      line.textContent = "";
      words.forEach((word, wi) => {
        const w = document.createElement("span");
        w.className = "word";
        Array.from(word).forEach((ch) => {
          const s = document.createElement("span");
          s.className = "char";
          s.textContent = ch;
          w.appendChild(s);
        });
        line.appendChild(w);
        if (wi < words.length - 1) {
          line.appendChild(document.createTextNode(" "));
        }
      });
    });

    let obs: MutationObserver | undefined;

    const ctx = gsap.context(() => {
      let premier = true;
      const play = () => {
        gsap
          .timeline({
            // Au chargement, on attend la levée du rideau de l'intro
            delay: premier ? INTRO_FIN : 0,
            defaults: { ease: "power4.out" },
          })
          .fromTo(
            ".hero-line-inner .char",
            { yPercent: 130, rotateZ: 7 },
            { yPercent: 0, rotateZ: 0, duration: 0.95, stagger: 0.02 }
          )
          .fromTo(
            ".hero-eyebrow",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
            0.15
          )
          .fromTo(
            ".hero-sub",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
            "-=0.6"
          )
          .fromTo(
            ".hero-actions > *",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out" },
            "-=0.5"
          );
      };

      play();
      premier = false;

      // Rejoue quand l'écran redevient actif (et non à chaque écriture de
      // l'attribut : le deck le repose à l'identique à chaque changement)
      let wasActive = true;
      obs = new MutationObserver(() => {
        const active = el.dataset.active === "true";
        if (active && !wasActive) play();
        wasActive = active;
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
        Performance
      </span>

      <div className="slide-inner">
        <div className="container hero-inner">
          <span className="eyebrow hero-eyebrow">
            Coaching Business &amp; Performance
          </span>
          <h1 className="hero-title">
            <span className="hero-line">
              <span className="hero-line-inner">Bâtir le business</span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner accent">qui te correspond</span>
            </span>
            <span className="hero-line">
              <span className="hero-line-inner accent">vraiment.</span>
            </span>
          </h1>
          <p className="hero-sub">
            On acquiert les fondamentaux, on les perfectionne jusqu&apos;au
            réflexe, puis une étude approfondie détermine le business
            réellement fait pour toi — avant de le construire.
          </p>
          <div className="hero-actions">
            <Magnetic>
              <a href="#contact" className="btn btn-orange">
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
