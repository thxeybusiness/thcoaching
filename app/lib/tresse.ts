/**
 * La tresse, à plat.
 *
 * Mêmes proportions que la version en volume — elles sont recopiées ici et
 * nulle part ailleurs, et le tracé s'en déduit par le calcul : il n'y a aucun
 * chemin dessiné à la main qui pourrait dériver de la géométrie 3D.
 *
 * L'entrelacement se fait sans découpe et sans fond. Chaque anneau est percé
 * de deux trous, exactement aux deux croisements où l'autre lui passe devant.
 * Comme ce sont de vrais trous, et non un trait de la couleur du fond, la
 * marque tient sur n'importe quel fond — y compris transparent.
 *
 * Les deux anneaux portent le même pointillé, au même décalage. Ce n'est pas
 * une économie : le second est le premier tourné d'un quart de tour, et cette
 * rotation échange précisément ses croisements gagnés et perdus.
 */

/** Demi-longueur de la partie droite de la boucle. */
const DEMI = 0.8;
/** Rayon des deux bouts ronds. */
const RAYON = 0.46;
/** Largeur du ruban. */
const LARGEUR = 0.38;

const DROIT = 2 * DEMI;
const ARC = Math.PI * RAYON;
const PERIM = 2 * DROIT + 2 * ARC;

/** Le point le plus éloigné du centre, bord du ruban compris. */
const DEMI_ENCOMBREMENT = DEMI + RAYON + LARGEUR / 2;

export type Tresse = {
  /** Le tracé d'un anneau : deux droites, deux arcs. */
  d: string;
  /** Épaisseur du trait — c'est elle qui donne au ruban sa largeur. */
  largeur: number;
  /** Le pointillé qui perce les deux croisements subis. */
  tirets: string;
  decalage: number;
  /** Les deux anneaux : l'un droit, l'autre au quart de tour. */
  quart: string;
  /** Les bouts ronds sur les diagonales, comme sur la marque. */
  pose: string;
};

/**
 * @param boite côté du viewBox
 * @param marge air autour de la tresse, dans les mêmes unités
 */
export function tracerTresse(boite = 120, marge = 8): Tresse {
  const c = boite / 2;
  const k = (c - marge) / DEMI_ENCOMBREMENT;
  const n = (v: number) => +(v * k).toFixed(3);
  const px = (x: number, y: number) =>
    `${(c + x * k).toFixed(3)} ${(c - y * k).toFixed(3)}`;

  /* Un tracé exact plutôt qu'échantillonné : c'est ce qui permet de compter
     sa longueur analytiquement, donc de placer les trous au bon endroit. */
  const d =
    `M${px(-DEMI, RAYON)}` +
    `L${px(DEMI, RAYON)}` +
    `A${n(RAYON)} ${n(RAYON)} 0 0 1 ${px(DEMI, -RAYON)}` +
    `L${px(-DEMI, -RAYON)}` +
    `A${n(RAYON)} ${n(RAYON)} 0 0 1 ${px(-DEMI, RAYON)}Z`;

  /* Les quatre croisements tombent en (±RAYON, ±RAYON). Un anneau passe
     dessous à deux d'entre eux — ceux où l'ondulation de la version en
     volume, −sin(2θ), vaut −1. Sur sa longueur, ils se trouvent ici. */
  const s1 = DEMI + RAYON;
  const s2 = 3 * DEMI + ARC + RAYON;

  /* Le trou laisse passer le ruban qui croise, donc dépasse sa largeur, sans
     mordre dans le bout rond : au-delà du croisement la partie droite ne
     court plus que sur DEMI − RAYON, et un trou plus large que le double de
     cette réserve entamerait le lobe. */
  const trou = LARGEUR * 1.35;

  return {
    d,
    largeur: n(LARGEUR),
    tirets: `${n(s2 - s1 - trou)} ${n(trou)} ${n(PERIM - (s2 - s1) - trou)} ${n(trou)}`,
    decalage: n(-(s1 + trou / 2)),
    quart: `rotate(90 ${c} ${c})`,
    pose: `rotate(45 ${c} ${c})`,
  };
}

/** Le tracé courant, sur le viewBox de 120 utilisé partout. */
export const TRESSE = tracerTresse();
