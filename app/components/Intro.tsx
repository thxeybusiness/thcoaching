"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Intro motion design « le logo devient la transition », tout en courbes :
 * 1. Les 3 vagues glissent depuis les côtés en alternance et s'empilent
 * 2. Wordmark + battement de cœur
 * 3. Les vagues elles-mêmes s'étirent jusqu'au plein écran et s'épaississent
 *    pour couvrir la page (elles gardent leurs courbes : aucun angle droit)
 * 4. Elles ondulent hors du cadre en alternance et révèlent le site
 */

const WAVE_PATHS = [
  "M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z",
  "M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z",
  "M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z",
];

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setDone(true),
      });
      tl.timeScale(1.25);

      // 1. Les vagues glissent depuis les côtés, en alternance
      tl.from(".intro-wave", {
        xPercent: (i: number) => (i % 2 === 0 ? -140 : 140),
        opacity: 0,
        duration: 0.62,
        stagger: 0.11,
        ease: "power4.out",
      })
        // 2. Wordmark
        .from(".intro-name", { opacity: 0, y: 14, duration: 0.45 }, "-=0.24")
        // Battement de cœur : logo + wordmark ensemble
        .fromTo(
          [".intro-logo-svg", ".intro-name"],
          { scale: 1 },
          {
            scale: 1.07,
            duration: 0.19,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
            transformOrigin: "center center",
          },
          "-=0.06"
        )
        // 3. Bascule invisible : le SVG de révélation se place EXACTEMENT
        //    sur le logo (mêmes vagues, même taille), puis prend le relais.
        .call(() => {
          const logo = document.querySelector(".intro-logo-svg");
          if (!logo) return;
          const r = logo.getBoundingClientRect();
          gsap.set(".intro-reveal", {
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
            visibility: "visible",
          });
          gsap.set(".intro-inner", { opacity: 0 });
        })
        // Les vagues s'étirent au plein écran.
        // Les tracés occupent 10%→90% du viewBox : on dimensionne le SVG
        // (1.25×) pour que les vagues touchent exactement les bords de
        // l'écran — leurs bords verticaux restent hors champ.
        .to(".intro-reveal", {
          left: () => -window.innerWidth * 0.125,
          top: () => -window.innerHeight * 0.2,
          width: () => window.innerWidth * 1.25,
          height: () => window.innerHeight * 1.4,
          duration: 0.425,
          ease: "power2.inOut",
        })
        // … et s'épaississent en même temps pour couvrir toute la page
        .to(
          ".intro-reveal-wave",
          {
            scaleY: 2.1,
            duration: 0.425,
            ease: "power2.inOut",
            transformOrigin: "50% 50%",
          },
          "<"
        )
        // Le fond noir s'efface : le site se dévoile derrière les vagues
        .set(root.current, { background: "transparent" })
        // 4. Les vagues se retirent vers le haut, comme une marée qui
        //    reflue : seules leurs courbes traversent l'écran.
        .to(".intro-reveal-wave", {
          y: -210,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.inOut",
        });
    }, root);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-inner">
        <svg className="intro-logo-svg" viewBox="0 0 120 120">
          {WAVE_PATHS.map((d) => (
            <path key={d} className="intro-wave" d={d} fill="#ff8c2e" />
          ))}
        </svg>
        <span className="intro-name">TH Coaching</span>
      </div>

      {/* Les mêmes vagues, qui deviennent le rideau de révélation */}
      <svg
        className="intro-reveal"
        viewBox="0 0 120 120"
        preserveAspectRatio="none"
      >
        {WAVE_PATHS.map((d) => (
          <path key={d} className="intro-reveal-wave" d={d} fill="#ff8c2e" />
        ))}
      </svg>
    </div>
  );
}
