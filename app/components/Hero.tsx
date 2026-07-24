"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Scene3D from "./Scene3D";

/**
 * Hero animé : la typographie se révèle ligne par ligne (kinetic type),
 * l'entrée est calée pour suivre la levée du rideau de l'intro.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay: 0.85,
        defaults: { ease: "power4.out" },
      });

      tl.from(".hero-line-inner", {
        yPercent: 115,
        duration: 1,
        stagger: 0.12,
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
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={root}>
      <Scene3D />
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
          <a href="#contact" className="btn btn-orange">
            Réserver un appel découverte
          </a>
          <a href="#offre" className="btn btn-outline-light">
            Voir le programme
          </a>
        </div>
      </div>
    </section>
  );
}
