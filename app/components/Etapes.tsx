"use client";

import { useState } from "react";
import { ETAPES } from "../lib/methode";
import LogoEtape from "./LogoEtape";

/**
 * Le déroulé en trois temps. Chaque carte n'affiche qu'une ligne ; le récit
 * complet se déplie au clic, comme les compétences se dévoilent au survol.
 */
export default function Etapes() {
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <div className="methode" data-cascade>
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
