/**
 * Pictogrammes des dix-sept compétences.
 *
 * Un seul système de tracé : viewBox 24, contour uniquement, épaisseur 1.6,
 * extrémités arrondies. Aucun aplat, aucun flou — ils se dessinent au
 * défilement (stroke-dashoffset) sans coûter de calque au navigateur.
 */

const TRACES: Record<string, React.ReactNode> = {
  // Discipline, énergie mentale
  mindset: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M13.2 6.4 8.8 13h3.4l-1.4 4.6 4.4-6.6h-3.4z" />
    </>
  ),
  // Physiologie, neurosciences
  physiologie: <path d="M2.5 12h4L9 6l4 12 2.5-6h6" />,
  sommeil: <path d="M20.2 14.8A8.6 8.6 0 0 1 9.2 3.8a8.6 8.6 0 1 0 11 11z" />,
  alimentation: (
    <>
      <path d="M4 20C4 11.2 11.2 4 20 4c0 8.8-7.2 16-16 16z" />
      <path d="M4.5 19.5 14 10" />
    </>
  ),
  sport: <path d="M4 9v6M7.5 6.5v11M16.5 6.5v11M20 9v6M7.5 12h9" />,
  // Cible : stratégie de vente
  vente: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  // Contrat signé : closing
  closing: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 14.5l2 2 4-4" />
    </>
  ),
  client: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20.5c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 6.2" />
      <path d="M17.8 14.9c1.9.9 3.2 2.9 3.2 5.1" />
    </>
  ),
  // Euro : gestion financière
  finance: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.6a4.6 4.6 0 0 0-6.8 3.4 4.6 4.6 0 0 0 6.8 3.4" />
      <path d="M6.8 11h5M6.8 13.4h5" />
    </>
  ),
  contenu: (
    <>
      <path d="M4 20.2l1.1-4.2L16 5.1l3.1 3.1L8.2 19.1z" />
      <path d="M14 7.1l3.1 3.1" />
    </>
  ),
  // Courbe de Bézier : graphisme
  graphisme: (
    <>
      <circle cx="5.5" cy="5.5" r="2.2" />
      <circle cx="18.5" cy="18.5" r="2.2" />
      <path d="M7.7 5.9c6.5 0 3.6 12.4 8.7 12.6" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.2" />
      <path d="M10 9.2l5 2.8-5 2.8z" />
    </>
  ),
  cube: (
    <>
      <path d="M12 2.8l8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4z" />
      <path d="M12 12l8.2-4.6M12 12v9.2M12 12L3.8 7.4" />
    </>
  ),
  // Puce : maîtrise de l'IA
  ia: (
    <>
      <rect x="8" y="8" width="8" height="8" rx="1.4" />
      <path d="M12 2.8V8M12 16v5.2M2.8 12H8M16 12h5.2" />
      <path d="M5.6 5.6 8 8M18.4 5.6 16 8M5.6 18.4 8 16M18.4 18.4 16 16" />
    </>
  ),
  temps: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 6.8V12l3.4 2" />
    </>
  ),
  projets: (
    <>
      <rect x="3" y="4" width="5" height="16" rx="1.2" />
      <rect x="10.5" y="4" width="5" height="9.5" rx="1.2" />
      <rect x="18" y="4" width="3" height="13" rx="1.2" />
    </>
  ),
  reseau: (
    <>
      <circle cx="12" cy="4.8" r="2.4" />
      <circle cx="5" cy="18.2" r="2.4" />
      <circle cx="19" cy="18.2" r="2.4" />
      <path d="M10.9 7 6.1 16M13.1 7l4.8 9M7.4 18.2h9.2" />
    </>
  ),
};

export default function IconeCompetence({ nom }: { nom: string }) {
  return (
    <svg className="comp-icone" viewBox="0 0 24 24" aria-hidden="true">
      {TRACES[nom] ?? TRACES.cube}
    </svg>
  );
}
