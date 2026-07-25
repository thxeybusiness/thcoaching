"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Intro motion design « le logo devient la transition » :
 * 1. Les 3 vagues glissent depuis les côtés en alternance et s'empilent
 * 2. Wordmark + battement de cœur
 * 3. Les vagues s'étirent en 3 bandes orange plein écran
 * 4. Les bandes coulissent en alternance et révèlent le site
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
      tl.timeScale(1.4);

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
        // 3. Les vagues s'étirent en bandes plein écran
        .to(".intro-inner", { opacity: 0, duration: 0.26, ease: "power2.in" })
        .set(".intro-bands", { visibility: "visible" })
        .fromTo(
          ".intro-band",
          { scaleY: 0, transformOrigin: "center center" },
          { scaleY: 1, duration: 0.42, stagger: 0.07, ease: "power3.inOut" },
          "-=0.12"
        )
        // Le fond noir s'efface : seules les bandes couvrent le site,
        // qui se dévoile donc progressivement pendant leur sortie.
        // (root.current : « .intro » est la racine du contexte, hors sélecteurs)
        .set(root.current, { background: "transparent" })
        // 4. Les bandes coulissent en alternance
        .to(".intro-band", {
          xPercent: (i: number) => (i % 2 === 0 ? -105 : 105),
          duration: 0.78,
          stagger: 0.09,
          ease: "power4.inOut",
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

      <div className="intro-bands">
        <span className="intro-band" />
        <span className="intro-band" />
        <span className="intro-band" />
      </div>
    </div>
  );
}
