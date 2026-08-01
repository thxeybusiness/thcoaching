"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { POLES, NB_COMPETENCES } from "../lib/programme";
import GrilleCompetences from "./GrilleCompetences";

/**
 * Les cinq pôles, en un seul écran.
 *
 * L'orbite n'est plus décorative : c'est elle qui sélectionne le pôle, et son
 * mur de compétences s'échange à côté. On ne fait plus défiler cinq sections
 * identiques l'une après l'autre.
 *
 * Le survol suffit à changer de pôle ; le mur reste ensuite sur le dernier
 * survolé, le temps d'aller y lire une compétence.
 *
 * Les cinq panneaux restent dans le document — les inactifs sont rendus
 * invisibles et sortis du flux, non retirés — pour que les quarante-trois
 * compétences soient toujours indexables. L'orbite, elle, est accrochée au
 * début de sa rangée : en changeant de pôle, elle ne bouge pas d'un pixel,
 * seul le mur change.
 */
export default function Poles() {
  const [actif, setActif] = useState(0);
  const attente = useRef<number | null>(null);

  const annuler = () => {
    if (attente.current !== null) {
      window.clearTimeout(attente.current);
      attente.current = null;
    }
  };

  /**
   * Un survol appuyé change de pôle. Le court délai évite qu'un simple
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
   * tabulation, les flèches circulent entre les pôles. Sans cela, tabuler à
   * travers l'orbite activerait chaque pôle au passage.
   */
  const auClavier = (e: React.KeyboardEvent) => {
    const n = POLES.length;
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
        aria-label="Les cinq pôles"
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

        {POLES.map((p, i) => (
          <span
            key={p.cle}
            className="orbite-point"
            style={
              { "--a": `${(i * 360) / POLES.length}deg` } as CSSProperties
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
        {POLES.map((p, i) => (
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
                <p className="pilier-promesse">
                  <span className="pole-role">{p.role}</span>
                  {p.promesse}
                </p>
              </div>

              {/* Part de ce pôle dans les quarante-trois compétences */}
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
