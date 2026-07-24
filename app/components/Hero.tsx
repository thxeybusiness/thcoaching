"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene3D from "./Scene3D";
import Magnetic from "./Magnetic";

/**
 * Hero immersif : scène 3D en fond, halos lumineux, typographie kinetic,
 * mot géant en outline avec parallax au scroll, indicateur de scroll.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay: 0.75,
        defaults: { ease: "power4.out" },
      });

      tl.from(".hero-line-inner", {
        yPercent: 115,
        duration: 1.05,
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
      <div className="hero-glow hero-glow--a" aria-hidden="true" />
      <div className="hero-glow hero-glow--b" aria-hidden="true" />
      <Scene3D />
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
