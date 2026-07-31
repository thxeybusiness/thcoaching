"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PILIERS, NB_COMPETENCES } from "../lib/programme";
import GrilleCompetences from "./GrilleCompetences";

/**
 * Les quatre piliers, en un seul écran.
 *
 * L'orbite n'est plus décorative : c'est elle qui sélectionne le pilier, et
 * son mur de compétences s'échange à côté. On ne fait plus défiler quatre
 * sections identiques l'une après l'autre.
 *
 * Le survol suffit à changer de pilier ; le mur reste ensuite sur le dernier
 * survolé, le temps d'aller y lire une compétence.
 *
 * Les quatre panneaux restent dans le document — les inactifs sont rendus
 * invisibles, non retirés — pour que les dix-sept compétences soient
 * toujours indexables et que la hauteur du bloc ne varie jamais : en
 * changeant de pilier, seul le détail change, l'orbite ne bouge pas.
 */
export default function Piliers() {
  const [actif, setActif] = useState(0);
  const attente = useRef<number | null>(null);

  const annuler = () => {
    if (attente.current !== null) {
      window.clearTimeout(attente.current);
      attente.current = null;
    }
  };

  /**
   * Un survol appuyé change de pilier. Le court délai évite qu'un simple
   * passage de la souris vers le mur — qui longe le point de droite — ne
   * bascule le contenu au passage.
   */
  const survoler = (i: number) => {
    annuler();
    if (i === actif) return;
    attente.current = window.setTimeout(() => setActif(i), 110);
  };

  const choisir = (i: number) => {
    annuler();
    setActif(i);
  };

  useEffect(() => annuler, []);

  const boutons = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Motif ARIA des onglets : seul l'onglet actif est dans l'ordre de
   * tabulation, les flèches circulent entre les piliers. Sans cela, tabuler
   * à travers l'orbite activerait chaque pilier au passage.
   */
  const auClavier = (e: React.KeyboardEvent) => {
    const n = PILIERS.length;
    let cible: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") cible = (actif + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      cible = (actif - 1 + n) % n;
    else if (e.key === "Home") cible = 0;
    else if (e.key === "End") cible = n - 1;
    if (cible === null) return;
    e.preventDefault();
    choisir(cible);
    boutons.current[cible]?.focus();
  };

  return (
    <div className="piliers-vue">
      <div
        className="orbite"
        role="tablist"
        aria-label="Les quatre piliers"
        onKeyDown={auClavier}
      >
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
              { "--a": `${i * 90}deg` } as CSSProperties
            }
          >
            <span className="orbite-redresse">
              <button
                type="button"
                role="tab"
                id={`onglet-${p.cle}`}
                className="orbite-contenu"
                ref={(el) => {
                  boutons.current[i] = el;
                }}
                tabIndex={i === actif ? 0 : -1}
                data-actif={i === actif}
                aria-selected={i === actif}
                aria-controls={`panneau-${p.cle}`}
                onMouseEnter={() => survoler(i)}
                onMouseLeave={annuler}
                onFocus={() => choisir(i)}
                onClick={() => choisir(i)}
              >
                <i className="orbite-pastille" aria-hidden="true">
                  {i + 1}
                </i>
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
            data-actif={i === actif}
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
