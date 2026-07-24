"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Intro cinématique : écran noir plein cadre, le logo « vague » apparaît,
 * une barre orange se remplit, puis le rideau se lève pour révéler le site.
 * Joué une fois par chargement complet de la page.
 */
export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDone(true);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setDone(true),
      });

      tl.set(".intro-logo", { opacity: 0, scale: 0.82, filter: "blur(6px)" })
        .set(".intro-bar-fill", { scaleX: 0, transformOrigin: "left center" })
        .set(".intro-word", { yPercent: 120 })
        .to(".intro-logo", {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.9,
        })
        .to(
          ".intro-word",
          { yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power4.out" },
          "-=0.5"
        )
        .to(
          ".intro-bar-fill",
          { scaleX: 1, duration: 1.15, ease: "power2.inOut" },
          "-=0.7"
        )
        .to(".intro-content", {
          opacity: 0,
          y: -18,
          duration: 0.45,
          ease: "power2.in",
        })
        .to(
          root.current,
          { yPercent: -100, duration: 0.95, ease: "power4.inOut" },
          "-=0.1"
        );
    }, root);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="intro-logo" />
        <div className="intro-label">
          <span className="intro-word-wrap">
            <span className="intro-word">TH</span>
          </span>
          <span className="intro-word-wrap">
            <span className="intro-word">Coaching</span>
          </span>
        </div>
        <div className="intro-bar">
          <div className="intro-bar-fill" />
        </div>
      </div>
    </div>
  );
}
