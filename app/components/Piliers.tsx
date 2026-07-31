"use client";

import { useState, type CSSProperties } from "react";
import { PILIERS, NB_COMPETENCES } from "../lib/programme";
import GrilleCompetences from "./GrilleCompetences";

/**
 * Les quatre piliers, en un seul écran.
 *
 * L'orbite n'est plus décorative : c'est elle qui sélectionne le pilier, et
 * son mur de compétences s'échange à côté. On ne fait plus défiler quatre
 * sections identiques l'une après l'autre.
 *
 * Les quatre panneaux restent dans le document — seuls les inactifs sont
 * masqués — pour que les dix-sept compétences soient toujours indexables.
 */
export default function Piliers() {
  const [actif, setActif] = useState(0);

  return (
    <div className="piliers-vue">
      <div className="orbite" role="tablist" aria-label="Les quatre piliers">
        <span className="orbite-halo" aria-hidden="true" />
        <svg className="orbite-anneau" viewBox="0 0 400 400" aria-hidden="true">
          <circle className="orbite-piste" cx="200" cy="200" r="150" />
          <circle className="orbite-trace" cx="200" cy="200" r="150" />
        </svg>

        <span className="orbite-noyau" aria-hidden="true">
          <span className="orbite-noyau-valeur">360°</span>
          <span className="orbite-noyau-texte">d&apos;accompagnement</span>
        </span>

        {PILIERS.map((p, i) => (
          <span
            key={p.cle}
            className="orbite-point"
            style={
              { "--a": `${i * 90}deg`, "--teinte": p.teinte } as CSSProperties
            }
          >
            <span className="orbite-redresse">
              <button
                type="button"
                role="tab"
                id={`onglet-${p.cle}`}
                className="orbite-contenu"
                data-actif={i === actif}
                aria-selected={i === actif}
                aria-controls={`panneau-${p.cle}`}
                onClick={() => setActif(i)}
              >
                <i className="orbite-pastille" />
                <span className="orbite-textes">
                  <span className="orbite-nom">{p.court}</span>
                  <span className="orbite-compte">
                    {p.competences.length} compétences
                  </span>
                </span>
              </button>
            </span>
          </span>
        ))}
      </div>

      <div className="piliers-panneaux">
        {PILIERS.map((p, i) => (
          <div
            key={p.cle}
            className="pilier-panneau"
            id={`panneau-${p.cle}`}
            role="tabpanel"
            aria-labelledby={`onglet-${p.cle}`}
            hidden={i !== actif}
            style={{ "--teinte": p.teinte } as CSSProperties}
          >
            <div className="pilier-tete">
              <span className="pilier-num" aria-hidden="true">
                {p.num}
              </span>
              <div>
                <h3 className="pilier-titre">{p.titre}</h3>
                <p className="pilier-promesse">{p.promesse}</p>
              </div>

              {/* Part de ce pilier dans les dix-sept compétences */}
              <span
                className="pilier-part"
                style={
                  {
                    "--part": p.competences.length / NB_COMPETENCES,
                  } as CSSProperties
                }
              >
                <svg viewBox="0 0 44 44" aria-hidden="true">
                  <circle className="part-piste" cx="22" cy="22" r="18" />
                  <circle className="part-arc" cx="22" cy="22" r="18" />
                </svg>
                <b aria-hidden="true">{p.competences.length}</b>
                <span className="sr-only">
                  {p.competences.length} compétences sur {NB_COMPETENCES}
                </span>
              </span>
            </div>

            <GrilleCompetences
              cle={p.cle}
              num={p.num}
              competences={p.competences}
              actif={i === actif}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
