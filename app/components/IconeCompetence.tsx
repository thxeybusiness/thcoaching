/**
 * Pictogrammes des dix-sept compétences.
 *
 * Système bicolore : un aplat teinté pose la masse, un contour la dessine
 * par-dessus. Deux groupes séparés — `ico-fond` et `ico-trait` — pour que le
 * contour puisse se dessiner au défilement (stroke-dashoffset) pendant que
 * l'aplat se révèle en fondu. ViewBox 32, contour 1,8, extrémités arrondies.
 * Aucun flou, aucun dégradé : l'orange de la marque suffit.
 */

type Trace = { fond?: React.ReactNode; trait: React.ReactNode };

const TRACES: Record<string, Trace> = {
  // Discipline, énergie mentale — une tête, un éclair
  mindset: {
    fond: <path d="M17.9 7.4 11 17.9h4.7l-1.4 6.7 6.9-10.4h-4.6z" />,
    trait: (
      <>
        <circle cx="16" cy="16" r="12" />
        <path d="M17.9 7.4 11 17.9h4.7l-1.4 6.7 6.9-10.4h-4.6z" />
      </>
    ),
  },
  // Comprendre son corps et son cerveau — un cœur et son tracé
  physiologie: {
    fond: (
      <path d="M16 27.8S4.6 20.6 4.6 13A6.4 6.4 0 0 1 16 9.1 6.4 6.4 0 0 1 27.4 13c0 7.6-11.4 14.8-11.4 14.8z" />
    ),
    trait: (
      <>
        <path d="M16 27.8S4.6 20.6 4.6 13A6.4 6.4 0 0 1 16 9.1 6.4 6.4 0 0 1 27.4 13c0 7.6-11.4 14.8-11.4 14.8z" />
        <path d="M6.4 15.6h4.4l2.2-4 3.2 7.2 2.2-3.2h6.8" />
      </>
    ),
  },
  sommeil: {
    fond: <path d="M26.6 19.8A11.8 11.8 0 0 1 12.2 5.4a11.9 11.9 0 1 0 14.4 14.4z" />,
    trait: (
      <>
        <path d="M26.6 19.8A11.8 11.8 0 0 1 12.2 5.4a11.9 11.9 0 1 0 14.4 14.4z" />
        <path d="M22.6 6.6v3.2M21 8.2h3.2M26.4 12.2v2M25.4 13.2h2" />
      </>
    ),
  },
  // Nutrition — un bol et une feuille
  alimentation: {
    fond: <path d="M16.4 13.2c-3.6 0-6.2-2.6-6.2-6 3.6 0 6.2 2.6 6.2 6z" />,
    trait: (
      <>
        <path d="M5 16.6h22a11 11 0 0 1-22 0z" />
        <path d="M3.4 28h25.2" />
        <path d="M16.4 13.2c-3.6 0-6.2-2.6-6.2-6 3.6 0 6.2 2.6 6.2 6z" />
      </>
    ),
  },
  // Haltère : les disques en aplat, la barre au trait
  sport: {
    fond: (
      <>
        <rect x="3.4" y="10.2" width="5.2" height="11.6" rx="2" />
        <rect x="23.4" y="10.2" width="5.2" height="11.6" rx="2" />
      </>
    ),
    trait: (
      <>
        <rect x="3.4" y="10.2" width="5.2" height="11.6" rx="2" />
        <rect x="23.4" y="10.2" width="5.2" height="11.6" rx="2" />
        <path d="M11.2 12.4v7.2M20.8 12.4v7.2M8.6 16h14.8" />
      </>
    ),
  },
  // Cible : stratégie de vente
  vente: {
    fond: <circle cx="16" cy="16" r="2.8" />,
    trait: (
      <>
        <circle cx="16" cy="16" r="12" />
        <circle cx="16" cy="16" r="7" />
        <circle cx="16" cy="16" r="2.8" />
      </>
    ),
  },
  // Contrat signé : closing
  closing: {
    fond: <path d="M19 4l5 5h-5z" />,
    trait: (
      <>
        <path d="M8 4h11l5 5v19H8z" />
        <path d="M19 4v5h5" />
        <path d="M11.8 19.6l3 3 5.6-6" />
        <path d="M11.8 13h5.6" />
      </>
    ),
  },
  // Relation client : deux personnes, la seconde en aplat
  client: {
    fond: <circle cx="22.6" cy="11.6" r="3.6" />,
    trait: (
      <>
        <circle cx="12" cy="12" r="4.6" />
        <path d="M3.6 27.4c0-4.6 3.8-8.4 8.4-8.4s8.4 3.8 8.4 8.4" />
        <circle cx="22.6" cy="11.6" r="3.6" />
        <path d="M23.4 18.6c3.4.4 6 3.4 6 7" />
      </>
    ),
  },
  // Pile de pièces : gestion financière
  finance: {
    fond: <ellipse cx="16" cy="8.6" rx="9.4" ry="3.6" />,
    trait: (
      <>
        <ellipse cx="16" cy="8.6" rx="9.4" ry="3.6" />
        <path d="M6.6 8.6v6.6c0 2 4.2 3.6 9.4 3.6s9.4-1.6 9.4-3.6V8.6" />
        <path d="M6.6 15.2v6.6c0 2 4.2 3.6 9.4 3.6s9.4-1.6 9.4-3.6v-6.6" />
      </>
    ),
  },
  // Mégaphone : création de contenu
  contenu: {
    fond: <path d="M11.6 11.6 21 6.2v19.6l-9.4-5.4z" />,
    trait: (
      <>
        <path d="M11.6 11.6 21 6.2v19.6l-9.4-5.4z" />
        <path d="M11.6 11.6H8.2a2.6 2.6 0 0 0-2.6 2.6v3.6a2.6 2.6 0 0 0 2.6 2.6h3.4" />
        <path d="M25 12.4a6 6 0 0 1 0 7.2" />
      </>
    ),
  },
  // Courbe de Bézier et ses poignées : graphisme
  graphisme: {
    fond: (
      <>
        <rect x="3.4" y="21.4" width="6" height="6" rx="1.4" />
        <rect x="22.6" y="4.6" width="6" height="6" rx="1.4" />
      </>
    ),
    trait: (
      <>
        <path d="M6.4 21.4C6.4 12 12 7.6 22.6 7.6" />
        <rect x="3.4" y="21.4" width="6" height="6" rx="1.4" />
        <rect x="22.6" y="4.6" width="6" height="6" rx="1.4" />
      </>
    ),
  },
  // Clap : montage vidéo
  video: {
    fond: <path d="M13.6 15.2 20.6 19l-7 3.8z" />,
    trait: (
      <>
        <rect x="3.6" y="6.6" width="24.8" height="18.8" rx="2.6" />
        <path d="M3.6 12.6h24.8" />
        <path d="M10.2 6.6v6M21.8 6.6v6" />
        <path d="M13.6 15.2 20.6 19l-7 3.8z" />
      </>
    ),
  },
  // Cube : la face du dessus en aplat
  cube: {
    fond: <path d="M16 3.2 27.4 9.8 16 16.4 4.6 9.8z" />,
    trait: (
      <>
        <path d="M16 3.2 27.4 9.8v12.4L16 28.8 4.6 22.2V9.8z" />
        <path d="M16 16.4 27.4 9.8M16 16.4v12.4M16 16.4 4.6 9.8" />
      </>
    ),
  },
  // Puce : maîtrise de l'IA
  ia: {
    fond: <rect x="13.2" y="13.2" width="5.6" height="5.6" rx="1.2" />,
    trait: (
      <>
        <rect x="9.6" y="9.6" width="12.8" height="12.8" rx="2.4" />
        <rect x="13.2" y="13.2" width="5.6" height="5.6" rx="1.2" />
        <path d="M12.6 9.6V5.2M16 9.6V5.2M19.4 9.6V5.2" />
        <path d="M12.6 26.8v-4.4M16 26.8v-4.4M19.4 26.8v-4.4" />
        <path d="M9.6 12.6H5.2M9.6 16H5.2M9.6 19.4H5.2" />
        <path d="M26.8 12.6h-4.4M26.8 16h-4.4M26.8 19.4h-4.4" />
      </>
    ),
  },
  // Horloge, avec la part de temps engagée en aplat
  temps: {
    fond: <path d="M16 16V4a12 12 0 0 1 10.4 6z" />,
    trait: (
      <>
        <circle cx="16" cy="16" r="12" />
        <path d="M16 8.4V16l5.4 3.2" />
      </>
    ),
  },
  // Jalons de projet
  projets: {
    fond: <rect x="3.6" y="6.2" width="16" height="5" rx="2.5" />,
    trait: (
      <>
        <rect x="3.6" y="6.2" width="16" height="5" rx="2.5" />
        <rect x="9.6" y="13.5" width="18.8" height="5" rx="2.5" />
        <rect x="6.4" y="20.8" width="13.6" height="5" rx="2.5" />
      </>
    ),
  },
  // Réseau : trois nœuds reliés
  reseau: {
    fond: (
      <>
        <circle cx="16" cy="6.4" r="3.6" />
        <circle cx="6.4" cy="24.6" r="3.6" />
        <circle cx="25.6" cy="24.6" r="3.6" />
      </>
    ),
    trait: (
      <>
        <path d="M14.3 9.6 8.1 21.4M17.7 9.6l6.2 11.8M10 24.6h12" />
        <circle cx="16" cy="6.4" r="3.6" />
        <circle cx="6.4" cy="24.6" r="3.6" />
        <circle cx="25.6" cy="24.6" r="3.6" />
      </>
    ),
  },
};

export default function IconeCompetence({ nom }: { nom: string }) {
  const t = TRACES[nom] ?? TRACES.cube;
  return (
    <svg className="comp-icone" viewBox="0 0 32 32" aria-hidden="true">
      {t.fond && <g className="ico-fond">{t.fond}</g>}
      <g className="ico-trait">{t.trait}</g>
    </svg>
  );
}
