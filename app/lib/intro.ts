/**
 * Cadence de l'intro.
 *
 * Les durées restent écrites à leur valeur d'origine dans le composant et
 * sont divisées ici : le rapport reste lisible et un seul nombre règle la
 * vitesse d'ensemble.
 */
export const VITESSE_INTRO = 1.7;

/** Convertit une durée d'origine en durée réellement jouée. */
export const cadence = (secondes: number) => secondes / VITESSE_INTRO;

/**
 * Instant où le rideau se lève, partagé avec le hero et la scène 3D pour
 * qu'ils démarrent exactement à ce moment (et pas avant, sinon leur
 * animation se joue derrière et le site apparaît déjà figé).
 */
export const INTRO_FIN = cadence(1.66);
