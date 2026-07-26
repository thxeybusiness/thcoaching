"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { setDeckProgress } from "../lib/deck";

export type SlideMeta = { id: string; label: string };

/**
 * Le site en format « deck » : chaque chapitre occupe un écran entier et on
 * passe de l'un à l'autre horizontalement — bouton Suivant, flèches du
 * clavier, molette / trackpad, ou balayage au doigt.
 *
 * Sans JavaScript (et avant l'hydratation), les écrans restent empilés
 * verticalement : tout le contenu est dans le HTML, lisible et indexable.
 */
export default function Deck({
  slides,
  children,
}: {
  slides: SlideMeta[];
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  const indexRef = useRef(0);
  const xRef = useRef(0); // position animée, en nombre d'écrans
  const animating = useRef(false);
  const count = slides.length;
  const last = count - 1;

  const goTo = useCallback(
    (next: number, instant = false) => {
      const target = Math.min(last, Math.max(0, next));
      if (target === indexRef.current || !track.current) return;

      indexRef.current = target;
      setIndex(target);

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const el = track.current;

      gsap.killTweensOf(xRef);
      animating.current = true;
      gsap.to(xRef, {
        current: target,
        duration: instant || reduce ? 0 : 0.9,
        ease: "power3.inOut",
        onUpdate: () => {
          el.style.setProperty("--deck-x", String(xRef.current));
          setDeckProgress(last > 0 ? xRef.current / last : 0);
        },
        onComplete: () => {
          animating.current = false;
        },
      });

      const id = slides[target]?.id;
      if (id) history.replaceState(null, "", `#${id}`);
    },
    [last, slides]
  );

  // Position de départ : respecte l'ancre de l'URL (#offre, #contact…)
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace("#", "");
      const i = slides.findIndex((s) => s.id === id);
      return i >= 0 ? i : null;
    };

    const start = fromHash();
    if (start !== null && start !== 0) {
      indexRef.current = start;
      xRef.current = start;
      setIndex(start);
      track.current?.style.setProperty("--deck-x", String(start));
      setDeckProgress(last > 0 ? start / last : 0);
    }
    setReady(true);

    const onHash = () => {
      const i = fromHash();
      if (i !== null) goTo(i);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [goTo, last, slides]);

  // Molette / trackpad — on laisse la main au contenu quand il déborde
  useEffect(() => {
    if (!ready) return;
    const el = root.current;
    if (!el) return;

    let locked = false;
    const onWheel = (e: WheelEvent) => {
      const inner = (e.target as HTMLElement)?.closest?.(
        ".slide-inner"
      ) as HTMLElement | null;
      if (inner && inner.scrollHeight > inner.clientHeight + 1) {
        const atTop = inner.scrollTop <= 0;
        const atBottom =
          inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
      }

      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 12) return;
      e.preventDefault();
      if (locked || animating.current) return;

      locked = true;
      window.setTimeout(() => {
        locked = false;
      }, 700);
      goTo(indexRef.current + (delta > 0 ? 1 : -1));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goTo, ready]);

  // Clavier
  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const forward = ["ArrowRight", "ArrowDown", "PageDown"];
      const back = ["ArrowLeft", "ArrowUp", "PageUp"];
      if (forward.includes(e.key)) {
        e.preventDefault();
        goTo(indexRef.current + 1);
      } else if (back.includes(e.key)) {
        e.preventDefault();
        goTo(indexRef.current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(last);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, last, ready]);

  // Balayage tactile
  useEffect(() => {
    if (!ready) return;
    const el = root.current;
    if (!el) return;

    let x0 = 0;
    let y0 = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      x0 = t.clientX;
      y0 = t.clientY;
      tracking = true;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;
      if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return;
      goTo(indexRef.current + (dx < 0 ? 1 : -1));
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [goTo, ready]);

  // Sur un écran très court, un chapitre peut dépasser : on le signale pour
  // que le visiteur sache qu'il reste du contenu sous la ligne de flottaison.
  useEffect(() => {
    if (!ready) return;
    const el = root.current;
    if (!el) return;

    const check = () => {
      const inner = el.querySelectorAll<HTMLElement>(".slide-inner")[index];
      const over = !!inner && inner.scrollHeight > inner.clientHeight + 4;
      el.dataset.overflow = String(over);
    };
    check();
    const id = window.setTimeout(check, 400); // après les révélations
    window.addEventListener("resize", check);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", check);
    };
  }, [index, ready]);

  // Marque l'écran courant (déclenche les révélations en CSS)
  useEffect(() => {
    const slidesEls = track.current?.querySelectorAll<HTMLElement>(".slide");
    slidesEls?.forEach((s, i) => {
      s.dataset.active = String(i === index);
      s.setAttribute("aria-hidden", String(i !== index));
      // Les écrans hors champ ne doivent pas capter le focus au Tab
      if (ready && i !== index) s.setAttribute("inert", "");
      else s.removeAttribute("inert");
    });
  }, [index, ready]);

  const current = slides[index];

  return (
    <div className="deck" ref={root} data-ready={ready}>
      <div className="deck-track" ref={track}>
        {children}
      </div>

      <nav className="deck-nav" aria-label="Navigation entre les chapitres">
        <button
          type="button"
          className="deck-arrow"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Chapitre précédent"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5 L8 12 L15 19" />
          </svg>
        </button>

        <ol className="deck-dots">
          {slides.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className="deck-dot"
                data-current={i === index}
                onClick={() => goTo(i)}
                aria-current={i === index ? "step" : undefined}
              >
                <span className="deck-dot-mark" aria-hidden="true" />
                <span className="deck-dot-label">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>

        <button
          type="button"
          className="deck-next"
          onClick={() => goTo(index + 1)}
          disabled={index === last}
        >
          <span>{index === last ? "Fin" : "Suivant"}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5 L16 12 L9 19" />
          </svg>
        </button>
      </nav>

      <p className="slide-scroll-hint" aria-hidden="true">
        ↓ suite du chapitre
      </p>

      <div className="deck-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${last > 0 ? index / last : 1})` }} />
      </div>

      <p className="deck-status" role="status">
        Chapitre {index + 1} sur {count} — {current?.label}
      </p>
    </div>
  );
}
