/**
 * Cadence de l'intro.
 *
 * Les durées restent écrites à leur valeur d'origine dans le composant et
 * sont divisées ici : le rapport reste lisible et un seul nombre règle la
 * vitesse d'ensemble.
 *
 * Elle était de 1,7 ; à 2,72 l'intro va exactement 1,6 fois plus vite. Rien
 * d'autre n'a bougé : la chorégraphie est écrite en proportions, pas en
 * secondes, donc chaque geste garde sa place relative et le montage du décor
 * du site suit tout seul — il est commandé par l'éclat, pas par une horloge.
 */
export const VITESSE_INTRO = 2.72;

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
 * rideau attend maintenant que ce mouvement soit allé au bout : le tour dure
 * près d'une seconde à lui seul. Mais il n'attend rien de plus — l'éclat part
 * un dixième de seconde après le dernier geste. Un logo immobile à l'écran ne
 * raconte plus rien, et chaque instant qu'il y passe est du temps volé au
 * site.
 */
export const INTRO_FIN = cadence(3.68);

/**
 * L'intro annonce son éclat, elle ne se laisse pas deviner.
 *
 * Le reste du site savait déjà quand le rideau tombe — il le lisait dans
 * `INTRO_FIN`. Mais une constante se lit sur l'horloge du navigateur, alors
 * que l'intro, elle, se joue sur la ligne de temps de GSAP : dès qu'une image
 * coûte cher, GSAP ralentit sa ligne pour ne rien sauter, l'horloge continue,
 * et les deux se séparent. C'est ainsi que la pièce du site se montait par
 * dessus une tresse qui n'avait pas fini son tour.
 *
 * L'intro émet donc cet événement au moment exact où son éclat part. Ce qui
 * doit se caler dessus l'écoute, au lieu de compter dans son coin. Elle
 * l'émet aussi quand il n'y a pas d'intro du tout — sans quoi ce qui attend
 * ce signal attendrait pour rien.
 */
export const ECLAT_INTRO = "intro:eclat";
