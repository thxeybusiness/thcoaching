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
 *
 * Il tombait autrefois à 1,66, soit un quart de seconde après le dernier
 * anneau posé : la tresse n'avait pas le temps de faire quoi que ce soit une
 * fois regroupée, et son mouvement final se jouait derrière l'éclat. Le
 * rideau attend maintenant que ce mouvement soit allé au bout, et qu'on ait
 * eu le temps de le voir : le tour dure près d'une seconde à lui seul, la
 * tresse pivote ensuite d'un quart de tour dans son plan, puis se tient en
 * place près d'une seconde encore avant l'éclat.
 */
export const INTRO_FIN = cadence(5.8);
