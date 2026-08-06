/**
 * Position courante dans le deck, partagée entre le composant de navigation
 * et la scène 3D (qui suivait auparavant window.scrollY).
 * Valeur continue entre 0 (premier écran) et 1 (dernier écran) : elle bouge
 * pendant la transition, pas seulement à l'arrivée.
 */

/** Temps de voyage d'un chapitre à l'autre, en secondes. Les écrans qui
 *  jouent une séquence à leur arrivée s'y accordent. */
export const DUREE_VOYAGE = 0.72;

let progress = 0;

export function getDeckProgress() {
  return progress;
}

export function setDeckProgress(value: number) {
  progress = Math.min(1, Math.max(0, value));
}
