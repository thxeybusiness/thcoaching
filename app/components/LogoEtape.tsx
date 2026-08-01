/**
 * Le logo, avec une seule de ses trois vagues allumée.
 *
 * Sert de repère visuel à chaque étape du déroulé, sur l'accueil comme sur la
 * page programme — et fait écho à l'intro, où chaque mot allume une vague.
 */

const VAGUES = [
  "M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z",
  "M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z",
  "M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z",
];

export default function LogoEtape({
  actif,
  className = "etape-logo",
}: {
  actif: number;
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      {VAGUES.map((d, i) => (
        <path
          key={d}
          d={d}
          fill={i === actif ? "var(--orange)" : "rgba(255,150,70,0.12)"}
        />
      ))}
    </svg>
  );
}
