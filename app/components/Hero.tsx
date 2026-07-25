"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "./Magnetic";

/**
 * Hero immersif : typographie cinétique (révélation caractère par caractère),
 * halos lumineux, mot géant en outline avec parallax, indicateur de scroll.
 * La scène 3D vit dans le canvas fixe global (Scene3D monté au niveau page).
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // Typo cinétique : découpe en mots (insécables) puis en caractères
    root.current
      ?.querySelectorAll<HTMLElement>(".hero-line-inner")
      .forEach((el) => {
        if (el.dataset.split) return;
        el.dataset.split = "1";
        const words = (el.textContent ?? "").split(" ");
        el.textContent = "";
        words.forEach((word, wi) => {
          const w = document.createElement("span");
          w.className = "word";
          Array.from(word).forEach((ch) => {
            const s = document.createElement("span");
            s.className = "char";
            s.textContent = ch;
            w.appendChild(s);
          });
          el.appendChild(w);
          if (wi < words.length - 1)
            el.appendChild(document.createTextNode(" "));
        });
      });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay: 1.7, // calé sur la fin du rideau de l'intro (×1.4)
        defaults: { ease: "power4.out" },
      });

      tl.from(".hero-line-inner .char", {
        yPercent: 130,
        rotateZ: 7,
        duration: 0.95,
        stagger: 0.02,
      })
        .from(
          ".hero-eyebrow",
          { opacity: 0, y: 16, duration: 0.7, ease: "power2.out" },
          0.2
        )
        .from(
          ".hero-sub",
          { opacity: 0, y: 20, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        )
        .from(
          ".hero-actions > *",
          { opacity: 0, y: 18, duration: 0.7, stagger: 0.1, ease: "power2.out" },
          "-=0.5"
        )
        .from(
          ".hero-scroll",
          { opacity: 0, duration: 0.8, ease: "power2.out" },
          "-=0.3"
        );

      // Parallax du mot géant + fondu du contenu au scroll
      gsap.to(".hero-ghost", {
        xPercent: -14,
        yPercent: 26,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".hero-inner", {
        opacity: 0.15,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "88% top",
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={root}>
      <span className="hero-ghost" aria-hidden="true">
        Performance
      </span>

      <div className="container hero-inner">
        <span className="eyebrow hero-eyebrow">
          Coaching Business &amp; Performance
        </span>
        <h1 className="hero-title">
          <span className="hero-line">
            <span className="hero-line-inner">Développez votre business.</span>
          </span>
          <span className="hero-line">
            <span className="hero-line-inner accent">
              Sans négliger votre santé.
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Un accompagnement à 360° : stratégie, argent, temps, clients — mais
          aussi alimentation, sommeil et sport. Parce qu&apos;un business solide
          repose sur un corps et un esprit en pleine forme.
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

      <div className="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
