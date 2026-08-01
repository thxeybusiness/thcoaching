/**
 * Le thème global du coaching : la personne accompagnée n'avance pas seule.
 * Tout un écosystème l'entoure — un coach, un programme complet, des
 * formations, des outils, un groupe — pour l'aider à bâtir son business.
 * Source unique partagée par l'intro (un mot = une vague du logo) et les
 * chapitres de l'accueil.
 */

export const PROMESSE =
  "Tout un écosystème pour t'aider à bâtir ton business.";

export type Etape = {
  cle: string;
  num: string;
  /** Mot unique — intro et repères courts */
  mot: string;
  /** Intitulé complet */
  titre: string;
  /** Une ligne, pour l'accueil */
  court: string;
  /** Le détail, en version longue */
  texte: string;
};

export const ETAPES: Etape[] = [
  {
    cle: "fondations",
    num: "01",
    mot: "Fondations",
    titre: "Fondations",
    court: "Acquérir les bases indispensables à toute activité.",
    texte:
      "Tout commence par les fondamentaux : ces bases indispensables à n'importe quelle activité, quel que soit le secteur. On les acquiert une par une, sans en sauter aucune.",
  },
  {
    cle: "perfectionnement",
    num: "02",
    mot: "Perfectionnement",
    titre: "Perfectionnement",
    court: "Les affiner et les adapter à ta situation.",
    texte:
      "On perfectionne ensuite ces bases jusqu'à ce qu'elles deviennent des réflexes, en les adaptant à ta situation réelle : ton niveau de départ, ton temps disponible et tes contraintes.",
  },
  {
    cle: "developpement",
    num: "03",
    mot: "Développement",
    titre: "Étude & développement",
    court: "Identifier le business fait pour toi, puis le construire.",
    texte:
      "Vient l'étude personnalisée approfondie : un travail en individuel sur ton profil, tes compétences, tes contraintes et tes objectifs, pour déterminer quel business est réellement fait pour toi — plutôt que de te lancer au hasard ou de copier le projet d'un autre. On développe ensuite : ton projet se construit sur ces bases solides et sur les conclusions de l'étude. Une activité pensée pour toi, et pour durer.",
  },
];
