import { TRESSE } from "../lib/tresse";

/**
 * La marque, en repère d'étape.
 *
 * L'ancien logo avait trois vagues, et chaque étape allumait la sienne : le
 * rang se lisait dans le dessin. La tresse n'a que deux anneaux et rien qui
 * se compte jusqu'à trois — on ne peut pas lui faire dire un rang sans la
 * déformer. C'est donc le numéro posé à côté qui dit le rang, et la marque
 * qui dit si l'étape est allumée. Chacun son travail.
 */
export default function LogoEtape({
  allume = true,
  className = "etape-logo",
}: {
  /** Allumée, ou en veille. */
  allume?: boolean;
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g
        transform={TRESSE.pose}
        fill="none"
        stroke={allume ? "var(--orange)" : "rgba(255,150,70,0.16)"}
        strokeWidth={TRESSE.largeur}
        strokeDasharray={TRESSE.tirets}
        strokeDashoffset={TRESSE.decalage}
      >
        <path d={TRESSE.d} />
        <path d={TRESSE.d} transform={TRESSE.quart} />
      </g>
    </svg>
  );
}
