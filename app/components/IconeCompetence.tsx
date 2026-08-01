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
  // ---- Pôle 1 : fondations de soi ----
  vision: {
    fond: <path d="M9.6 4.6 24 8.6 9.6 12.6z" />,
    trait: (
      <>
        <path d="M9.6 3v26" />
        <path d="M9.6 4.6 24 8.6 9.6 12.6z" />
      </>
    ),
  },
  confiance: {
    fond: <path d="M16 3.4 27 7.6v8c0 6.8-4.6 11.8-11 13.4-6.4-1.6-11-6.6-11-13.4v-8z" />,
    trait: (
      <>
        <path d="M16 3.4 27 7.6v8c0 6.8-4.6 11.8-11 13.4-6.4-1.6-11-6.6-11-13.4v-8z" />
        <path d="M11.4 15.8 14.8 19.2 20.8 12.4" />
      </>
    ),
  },
  regard: {
    fond: <circle cx="16" cy="16" r="4" />,
    trait: (
      <>
        <path d="M2.6 16S8 7.4 16 7.4 29.4 16 29.4 16 24 24.6 16 24.6 2.6 16 2.6 16z" />
        <circle cx="16" cy="16" r="4" />
      </>
    ),
  },
  stress: {
    fond: <circle cx="24.6" cy="9" r="3" />,
    trait: (
      <>
        <path d="M2.6 20.6h4.8l2.6-7 4 14 3.2-11 2.6 4h9.6" />
        <circle cx="24.6" cy="9" r="3" />
      </>
    ),
  },
  environnement: {
    fond: <path d="M16 3.4 29 13.4H3z" />,
    trait: (
      <>
        <path d="M16 3.4 29 13.4H3z" />
        <path d="M6.2 13.4v14a1.6 1.6 0 0 0 1.6 1.6h16.4a1.6 1.6 0 0 0 1.6-1.6v-14" />
        <path d="M13 29v-8h6v8" />
      </>
    ),
  },
  proches: {
    fond: <path d="M16 27.4S6.4 21.4 6.4 14.8a5.4 5.4 0 0 1 9.6-3.2 5.4 5.4 0 0 1 9.6 3.2c0 6.6-9.6 12.6-9.6 12.6z" />,
    trait: (
      <>
        <path d="M16 27.4S6.4 21.4 6.4 14.8a5.4 5.4 0 0 1 9.6-3.2 5.4 5.4 0 0 1 9.6 3.2c0 6.6-9.6 12.6-9.6 12.6z" />
        <circle cx="10.4" cy="6" r="2.8" />
        <circle cx="21.6" cy="6" r="2.8" />
      </>
    ),
  },
  // ---- Pôle 2 : créer & se démarquer ----
  branding: {
    fond: <circle cx="16" cy="12.6" r="5" />,
    trait: (
      <>
        <circle cx="16" cy="12.6" r="9.6" />
        <circle cx="16" cy="12.6" r="5" />
        <path d="M10.4 21 8 29.4l8-3.4 8 3.4-2.4-8.4" />
      </>
    ),
  },
  da: {
    fond: <circle cx="11" cy="12" r="2.6" />,
    trait: (
      <>
        <path d="M16 3.4c7 0 12.6 5.4 12.6 12 0 4-3 5.6-5.6 5.6h-2.6c-2 0-3.4 1.4-3.4 3.2 0 1 .4 1.6.4 2.4 0 1.4-1 2.4-2.6 2.4-6.6 0-12.4-5.6-12.4-12.8S9 3.4 16 3.4z" />
        <circle cx="11" cy="12" r="2.6" />
        <circle cx="19.4" cy="9.6" r="2" />
      </>
    ),
  },
  storytelling: {
    fond: <path d="M16 5.4v20.4c-2.6-1.8-6-2.6-11-2.6V5.4c5 0 8.4.8 11 2.6z" />,
    trait: (
      <>
        <path d="M16 5.4v20.4c-2.6-1.8-6-2.6-11-2.6V5.4c5 0 8.4.8 11 2.6z" />
        <path d="M16 5.4v20.4c2.6-1.8 6-2.6 11-2.6V5.4c-5 0-8.4.8-11 2.6z" />
      </>
    ),
  },
  copywriting: {
    fond: <path d="M20.4 5.6 26.4 11.6 24 14 18 8z" />,
    trait: (
      <>
        <path d="M20.4 5.6 26.4 11.6 12.4 25.6 4.6 27.4 6.4 19.6z" />
        <path d="M18 8 24 14" />
      </>
    ),
  },
  photo: {
    fond: <circle cx="16" cy="17.4" r="4.6" />,
    trait: (
      <>
        <path d="M4.6 9.6h5l2.4-3.4h8l2.4 3.4h5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4.6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" />
        <circle cx="16" cy="17.4" r="4.6" />
      </>
    ),
  },
  camera: {
    fond: <path d="M21.6 13.4 29 9.4v13.2l-7.4-4z" />,
    trait: (
      <>
        <rect x="3" y="9.4" width="18.6" height="13.2" rx="2.4" />
        <path d="M21.6 13.4 29 9.4v13.2l-7.4-4z" />
        <circle cx="10.4" cy="16" r="2.6" />
      </>
    ),
  },
  plateformes: {
    fond: <rect x="21" y="10.6" width="8" height="15.4" rx="2" />,
    trait: (
      <>
        <rect x="3" y="5.6" width="15.6" height="12.4" rx="2.2" />
        <path d="M7.4 22.4h6.8M10.8 18v4.4" />
        <rect x="21" y="10.6" width="8" height="15.4" rx="2" />
        <path d="M24.2 23.6h1.6" />
      </>
    ),
  },
  // ---- Pôle 3 : vente & revenus ----
  offre: {
    fond: <circle cx="10.6" cy="10.6" r="2.4" />,
    trait: (
      <>
        <path d="M16.4 3.4H5.4A2 2 0 0 0 3.4 5.4v11l13 13 12.2-12.2z" />
        <circle cx="10.6" cy="10.6" r="2.4" />
      </>
    ),
  },
  prospection: {
    fond: <path d="M13 19.4 19 19.4 19 27 13 29z" />,
    trait: (
      <>
        <path d="M3 5h26l-10 12v10l-6 2V17z" />
      </>
    ),
  },
  qualification: {
    fond: <circle cx="23" cy="22.6" r="5.8" />,
    trait: (
      <>
        <circle cx="12.6" cy="9.6" r="4.6" />
        <path d="M4 25.4c0-4.8 3.8-8.6 8.6-8.6 1.6 0 3.2.4 4.4 1.2" />
        <circle cx="23" cy="22.6" r="5.8" />
        <path d="M20.4 22.6 22.4 24.6 25.8 20.8" />
      </>
    ),
  },
  negociation: {
    fond: <path d="M4.4 16.6h9.2a4.6 4.6 0 0 1-9.2 0z" />,
    trait: (
      <>
        <path d="M16 5.4v21.2M11 27h10" />
        <path d="M5.6 9.6h20.8" />
        <path d="M9 9.6v7M23 9.6v7" />
        <path d="M4.4 16.6h9.2a4.6 4.6 0 0 1-9.2 0z" />
        <path d="M18.4 16.6h9.2a4.6 4.6 0 0 1-9.2 0z" />
        <circle cx="16" cy="5.4" r="2" />
      </>
    ),
  },
  suivi: {
    fond: <path d="M3.6 8 16 16.6 28.4 8z" />,
    trait: (
      <>
        <rect x="3.6" y="8" width="24.8" height="16" rx="2.2" />
        <path d="M3.6 9.4 16 18 28.4 9.4" />
        <path d="M24 27.6 28 24l-4-3.6" />
      </>
    ),
  },
  preuve: {
    fond: <path d="M16 3.6 19.8 11.4 28.4 12.6 22.2 18.6 23.6 27 16 23z" />,
    trait: (
      <path d="M16 3.6 19.8 11.4 28.4 12.6 22.2 18.6 23.6 27 16 23 8.4 27 9.8 18.6 3.6 12.6 12.2 11.4z" />
    ),
  },
  recurrence: {
    fond: <rect x="4" y="20.6" width="6.4" height="7.4" rx="1.4" />,
    trait: (
      <>
        <rect x="4" y="20.6" width="6.4" height="7.4" rx="1.4" />
        <rect x="12.8" y="15" width="6.4" height="13" rx="1.4" />
        <rect x="21.6" y="9" width="6.4" height="19" rx="1.4" />
        <path d="M6 10.6 12 5l6 3.4L24.8 3" />
        <path d="M20.6 3h4.6v4.6" />
      </>
    ),
  },
  // ---- Pôle 4 : systèmes & levier ----
  automatisation: {
    fond: <path d="M17.4 7.4 11.4 17.4h4.2l-1.2 7.4 6.6-10.6h-4.4z" />,
    trait: (
      <>
        <path d="M17.4 7.4 11.4 17.4h4.2l-1.2 7.4 6.6-10.6h-4.4z" />
        <path d="M8.2 23.4A11 11 0 0 1 10.4 7.2" />
        <path d="M6.4 19.6 8.2 23.8 12.4 22" />
        <path d="M23.8 8.6A11 11 0 0 1 21.6 24.8" />
        <path d="M25.6 12.4 23.8 8.2 19.6 10" />
      </>
    ),
  },
  process: {
    fond: <rect x="3.4" y="12.4" width="9" height="7.2" rx="1.8" />,
    trait: (
      <>
        <rect x="3.4" y="12.4" width="9" height="7.2" rx="1.8" />
        <rect x="19.6" y="4" width="9" height="7.2" rx="1.8" />
        <rect x="19.6" y="20.8" width="9" height="7.2" rx="1.8" />
        <path d="M12.4 16h3.6v-8.4h3.6M16 16v8.4h3.6" />
      </>
    ),
  },
  // ---- Pôle 5 : organisation & croissance ----
  decision: {
    fond: <circle cx="16" cy="26.4" r="3" />,
    trait: (
      <>
        <circle cx="16" cy="26.4" r="3" />
        <path d="M16 23.4v-6.8" />
        <path d="M16 16.6 6.6 8.2M16 16.6l9.4-8.4" />
        <path d="M4 4.4h4.4v4.4M28 4.4h-4.4v4.4" />
      </>
    ),
  },
  apprentissage: {
    fond: <path d="M16 9.6 3.6 14.4 16 19.2 28.4 14.4z" />,
    trait: (
      <>
        <path d="M16 9.6 3.6 14.4 16 19.2 28.4 14.4z" />
        <path d="M8.6 16.6v7c0 1.8 3.4 3.6 7.4 3.6s7.4-1.8 7.4-3.6v-7" />
        <path d="M28.4 14.4v7.4" />
      </>
    ),
  },
  delegation: {
    fond: <circle cx="16" cy="6.6" r="3.4" />,
    trait: (
      <>
        <circle cx="16" cy="6.6" r="3.4" />
        <circle cx="6.4" cy="25.4" r="3.4" />
        <circle cx="25.6" cy="25.4" r="3.4" />
        <path d="M16 10v5.6M6.4 22v-6.4h19.2V22" />
      </>
    ),
  },
  partenariat: {
    fond: <circle cx="11" cy="16" r="6.6" />,
    trait: (
      <>
        <circle cx="11" cy="16" r="6.6" />
        <circle cx="21" cy="16" r="6.6" />
      </>
    ),
  },
  // Écran de formation : les deux formations offertes
  formation: {
    fond: <path d="M13.4 11.6 20.4 15.6l-7 4z" />,
    trait: (
      <>
        <rect x="3.4" y="5" width="25.2" height="17.6" rx="2.6" />
        <path d="M13.4 11.6 20.4 15.6l-7 4z" />
        <path d="M10.4 27.4h11.2M16 22.6v4.8" />
      </>
    ),
  },
  // Clé : accès privés et réductions
  acces: {
    fond: <circle cx="10.6" cy="10.6" r="3.4" />,
    trait: (
      <>
        <circle cx="10.6" cy="10.6" r="6.4" />
        <circle cx="10.6" cy="10.6" r="3.4" />
        <path d="M15.2 15.2 27.4 27.4M21.4 21.4l2.9-2.9M24.3 24.3l2.9-2.9" />
      </>
    ),
  },
  // Trois personnes : le groupe privé
  groupe: {
    fond: <circle cx="16" cy="9.4" r="4.2" />,
    trait: (
      <>
        <circle cx="16" cy="9.4" r="4.2" />
        <path d="M9.4 24c0-3.6 3-6.6 6.6-6.6s6.6 3 6.6 6.6" />
        <circle cx="5.6" cy="14.6" r="3.2" />
        <path d="M1.6 26.4c0-2.8 1.8-5.2 4.4-6" />
        <circle cx="26.4" cy="14.6" r="3.2" />
        <path d="M30.4 26.4c0-2.8-1.8-5.2-4.4-6" />
      </>
    ),
  },
  // Orbite : la vision à 360°
  tour: {
    fond: <circle cx="16" cy="16" r="3.2" />,
    trait: (
      <>
        <circle cx="16" cy="16" r="12" />
        <circle cx="16" cy="16" r="3.2" />
        <circle cx="16" cy="4" r="2.4" />
        <circle cx="28" cy="16" r="2.4" />
        <circle cx="16" cy="28" r="2.4" />
        <circle cx="4" cy="16" r="2.4" />
      </>
    ),
  },
  // Cadeau : les bonus inclus
  cadeau: {
    fond: <rect x="3.6" y="12.6" width="24.8" height="5.4" rx="1.6" />,
    trait: (
      <>
        <rect x="3.6" y="12.6" width="24.8" height="5.4" rx="1.6" />
        <path d="M5.8 18v9.4a1.6 1.6 0 0 0 1.6 1.6h17.2a1.6 1.6 0 0 0 1.6-1.6V18" />
        <path d="M16 12.6V29" />
        <path d="M16 12.6S14.4 5 10.6 5a3.2 3.2 0 0 0 0 7.6z" />
        <path d="M16 12.6S17.6 5 21.4 5a3.2 3.2 0 0 1 0 7.6z" />
      </>
    ),
  },
  // Mur de tuiles : les compétences travaillées
  grille: {
    fond: <rect x="3.6" y="3.6" width="11" height="11" rx="2.2" />,
    trait: (
      <>
        <rect x="3.6" y="3.6" width="11" height="11" rx="2.2" />
        <rect x="17.4" y="3.6" width="11" height="11" rx="2.2" />
        <rect x="3.6" y="17.4" width="11" height="11" rx="2.2" />
        <rect x="17.4" y="17.4" width="11" height="11" rx="2.2" />
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
