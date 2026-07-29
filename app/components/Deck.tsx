"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { setDeckProgress } from "../lib/deck";

export type SlideMeta = { id: string; label: string };

/** useLayoutEffect côté client, useEffect au rendu serveur (évite l'avertissement). */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

      const depart = indexRef.current;
      indexRef.current = target;
      setIndex(target);

      // Tous les écrans traversés sont dévoilés dès le départ : sinon on les
      // voit défiler vides, puisque leur contenu n'apparaît qu'une fois actif.
      const el = track.current;
      const tous = el.querySelectorAll<HTMLElement>(".slide");
      const de = Math.min(depart, target);
      const a = Math.max(depart, target);
      for (let i = de; i <= a; i++) tous[i]?.setAttribute("data-seen", "true");

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      gsap.killTweensOf(xRef);
      animating.current = true;
      gsap.to(xRef, {
        current: target,
        duration: instant || reduce ? 0 : 0.72,
        ease: "power2.inOut",
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

  // Position de départ : respecte l'ancre de l'URL (#offre, #contact…).
  // Avant la peinture, pour ne pas montrer l'accueil puis sauter.
  useIsomorphicLayoutEffect(() => {
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

  /**
   * Molette et pavé tactile.
   *
   * Un pavé tactile n'envoie pas un événement par cran mais une rafale de
   * dizaines d'événements, dont une longue traîne d'inertie après que les
   * doigts ont quitté la surface. Deux pièges à éviter :
   *  - un seuil par événement ignore les glissements doux (deltas de 3-8),
   *    donc on cumule au lieu de filtrer ;
   *  - sans verrou, la traîne d'inertie déclenche 3 ou 4 changements d'écran
   *    pour un seul geste. On se re-arme donc au silence de la molette, pas
   *    après un délai fixe.
   * Un glissement maintenu (dont l'amplitude ne retombe pas) reste accepté :
   * c'est ce qui distingue un doigt encore posé d'une simple inertie.
   */
  useEffect(() => {
    if (!ready) return;
    const el = root.current;
    if (!el) return;

    const SEUIL = 45; // cumul nécessaire pour changer d'écran
    const SILENCE = 180; // ms sans événement = fin du geste
    const MAINTIEN = 900; // ms avant d'accepter un glissement maintenu

    let cumul = 0;
    let pic = 0;
    let arme = true;
    let dernier = 0;
    let declenche = 0;
    let timerSilence = 0;

    const finDuGeste = () => {
      arme = true;
      cumul = 0;
      pic = 0;
    };

    const onWheel = (e: WheelEvent) => {
      // Si le contenu de l'écran déborde, il défile en premier
      const inner = (e.target as HTMLElement)?.closest?.(
        ".slide-inner"
      ) as HTMLElement | null;
      if (inner && inner.scrollHeight > inner.clientHeight + 1) {
        const enHaut = inner.scrollTop <= 0;
        const enBas =
          inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
        if ((e.deltaY < 0 && !enHaut) || (e.deltaY > 0 && !enBas)) return;
      }

      // Toujours neutraliser l'événement : sinon Safari interprète un geste
      // horizontal comme « page précédente » et quitte le site.
      e.preventDefault();

      const now = performance.now();
      if (now - dernier > SILENCE) finDuGeste();
      dernier = now;

      window.clearTimeout(timerSilence);
      timerSilence = window.setTimeout(finDuGeste, SILENCE);

      // Firefox exprime la molette en lignes, pas en pixels : sans conversion
      // le seuil ne serait jamais atteint et rien ne bougerait.
      const unite =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta =
        (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unite;
      const ampleur = Math.abs(delta);
      pic = Math.max(pic, ampleur);

      if (!arme) {
        // Glissement encore maintenu (l'amplitude ne retombe pas) : on ré-arme
        if (now - declenche > MAINTIEN && ampleur >= pic * 0.55) {
          arme = true;
          cumul = 0;
        } else {
          return;
        }
      }

      if (cumul !== 0 && Math.sign(delta) !== Math.sign(cumul)) cumul = 0;
      cumul += delta;
      if (Math.abs(cumul) < SEUIL) return;

      const sens = cumul > 0 ? 1 : -1;
      arme = false;
      declenche = now;
      cumul = 0;
      goTo(indexRef.current + sens);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.clearTimeout(timerSilence);
      el.removeEventListener("wheel", onWheel);
    };
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
      if (i === index) s.dataset.seen = "true";
      s.setAttribute("aria-hidden", String(i !== index));
      // Les écrans hors champ ne doivent pas capter le focus au Tab
      if (ready && i !== index) s.setAttribute("inert", "");
      else s.removeAttribute("inert");
    });
  }, [index, ready]);

  const current = slides[index];

  return (
    // data-ready est posé dès le rendu serveur : sinon les cinq écrans
    // s'affichent empilés le temps de l'hydratation, puis s'effondrent d'un
    // coup. Sans JavaScript, le <noscript> du layout rétablit l'empilement.
    <div className="deck" ref={root} data-ready="true" data-live={ready}>
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
