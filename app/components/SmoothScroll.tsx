"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Active le smooth scroll (Lenis) sur toute l'app et le synchronise
 * avec GSAP ScrollTrigger. Rendu invisible : effet global uniquement.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    // Vélocité du scroll → déformation cinétique des sections (var CSS --skew)
    let skewTarget = 0;
    let skewCur = 0;
    lenis.on("scroll", (e: { velocity: number }) => {
      ScrollTrigger.update();
      skewTarget = Math.max(-5, Math.min(5, e.velocity * 0.35));
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
      skewTarget *= 0.9;
      skewCur += (skewTarget - skewCur) * 0.1;
      document.documentElement.style.setProperty(
        "--skew",
        skewCur.toFixed(3)
      );
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
