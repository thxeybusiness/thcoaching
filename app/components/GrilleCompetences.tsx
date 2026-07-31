"use client";

import { useState } from "react";
import IconeCompetence from "./IconeCompetence";
import type { Competence } from "../lib/programme";

/**
 * Le mur de compétences d'un pilier.
 *
 * Par défaut on ne voit que le pictogramme et le nom : la page se lit d'un
 * coup d'œil. Le détail se dévoile au survol (souris) ou au clic (tactile),
 * mais le texte reste toujours dans le document — il est donc lu par les
 * moteurs de recherche et les lecteurs d'écran.
 */
export default function GrilleCompetences({
  cle,
  num,
  competences,
}: {
  cle: string;
  num: string;
  competences: Competence[];
}) {
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <div className="comp-grille" data-grille>
      {competences.map((c, i) => (
        <button
          key={c.titre}
          type="button"
          className="competence"
          data-ouvert={ouvert === i}
          aria-expanded={ouvert === i}
          aria-controls={`${cle}-${i}-detail`}
          onClick={() => setOuvert(ouvert === i ? null : i)}
        >
          <span className="comp-index" aria-hidden="true">
            {num}.{i + 1}
          </span>

          <span className="comp-face">
            <IconeCompetence nom={c.icone} />
            <span className="comp-nom">{c.titre}</span>
          </span>

          <span className="comp-dos" id={`${cle}-${i}-detail`}>
            {c.texte}
          </span>

          <span className="comp-signe" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      ))}
    </div>
  );
}
