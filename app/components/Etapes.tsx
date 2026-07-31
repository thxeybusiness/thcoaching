"use client";

import { useState } from "react";
import { ETAPES } from "../lib/methode";

/** Les trois vagues du logo — une par étape de la méthode. */
const VAGUES = [
  "M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z",
  "M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z",
  "M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z",
];

/** Le logo, avec une seule vague allumée. */
function LogoEtape({ actif }: { actif: number }) {
  return (
    <svg className="etape-logo" viewBox="0 0 120 120" aria-hidden="true">
      {VAGUES.map((d, i) => (
        <path
          key={d}
          d={d}
          fill={i === actif ? "var(--orange-soft)" : "rgba(255,150,70,0.12)"}
        />
      ))}
    </svg>
  );
}

/**
 * Le déroulé en trois temps. Chaque carte n'affiche qu'une ligne ; le récit
 * complet se déplie au clic, comme les compétences se dévoilent au survol.
 */
export default function Etapes() {
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <div className="methode" data-cascade>
      <div className="methode-ligne" aria-hidden="true">
        <i />
      </div>

      {ETAPES.map((e, i) => (
        <div
          key={e.cle}
          className="pg-carte methode-etape"
          data-ouvert={ouvert === i}
        >
          <LogoEtape actif={i} />
          <span className="etape-num">{e.num}</span>
          <h3>{e.titre}</h3>
          <p className="etape-court">{e.court}</p>

          <div className="etape-detail" id={`etape-${e.cle}-detail`}>
            <p>{e.texte}</p>
          </div>

          <button
            type="button"
            className="etape-bascule"
            aria-expanded={ouvert === i}
            aria-controls={`etape-${e.cle}-detail`}
            aria-label={`${ouvert === i ? "Replier" : "Déplier"} l’étape ${e.titre}`}
            onClick={() => setOuvert(ouvert === i ? null : i)}
          >
            <span className="etape-signe" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
