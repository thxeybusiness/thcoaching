"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Intro motion design : les 3 vagues du logo se dessinent trait par trait,
 * se remplissent d'orange, battement de cœur, wordmark, puis rideau vers
 * le haut qui révèle le site. ~2,4 s, jouée à chaque chargement.
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
      const paths = gsap.utils.toArray<SVGPathElement>(".intro-wave");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => setDone(true),
      });
      tl.timeScale(1.4);

      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 0.75,
        stagger: 0.15,
        ease: "power2.inOut",
      })
        .to(
          paths,
          { fill: "rgba(255, 140, 46, 1)", duration: 0.45, stagger: 0.1 },
          "-=0.3"
        )
        .to(paths, { stroke: "rgba(255, 140, 46, 0)", duration: 0.35 }, "<")
        .fromTo(
          ".intro-logo-svg",
          { scale: 1 },
          {
            scale: 1.07,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          },
          "-=0.05"
        )
        .from(
          ".intro-name",
          { opacity: 0, y: 12, duration: 0.5 },
          "-=0.25"
        )
        .to(
          ".intro-inner",
          { opacity: 0, scale: 0.94, duration: 0.35, ease: "power2.in" },
          "+=0.3"
        )
        .to(
          root.current,
          { yPercent: -100, duration: 0.75, ease: "power4.inOut" },
          "-=0.1"
        );
    }, root);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-inner">
        <svg className="intro-logo-svg" viewBox="0 0 120 120">
          {WAVE_PATHS.map((d) => (
            <path
              key={d}
              className="intro-wave"
              d={d}
              fill="rgba(255, 140, 46, 0)"
              stroke="#ff8c2e"
              strokeWidth="2"
            />
          ))}
        </svg>
        <span className="intro-name">TH Coaching</span>
      </div>
    </div>
  );
}
