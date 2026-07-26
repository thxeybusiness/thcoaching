"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Compteur animé : 0 → valeur cible quand l'écran qui le contient arrive
 * à l'image. Les écrans hors champ du deck sont translatés hors du viewport,
 * un IntersectionObserver suffit donc à détecter leur arrivée.
 */
export default function CountUp({
  to,
  suffix = "",
  duration = 1.8,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = `${to}${suffix}`;
      return;
    }

    const obj = { v: 0 };
    let tween: gsap.core.Tween | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        tween = gsap.to(obj, {
          v: to,
          duration,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${Math.round(obj.v)}${suffix}`;
          },
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [to, suffix, duration]);

  return <span ref={ref}>0{suffix}</span>;
}
