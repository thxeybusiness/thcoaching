/**
 * Les cinq appuis de l'écosystème, tels qu'ils sont montrés dès le premier
 * écran : ce qui entoure la personne accompagnée.
 *
 * `angle` est la position sur l'anneau, en degrés, 0 pointant vers la droite.
 * Cinq appuis répartis tous les 72°, le premier au sommet.
 *
 * Les libellés sont volontairement courts — ce sont des repères sur un
 * schéma, pas des phrases. Le détail est raconté au chapitre « Écosystème ».
 */
export type Appui = { icone: string; nom: string; angle: number };

export const APPUIS: Appui[] = [
  { icone: "partenariat", nom: "Un coach", angle: -90 },
  { icone: "grille", nom: "43 compétences", angle: -18 },
  { icone: "formation", nom: "2 formations", angle: 54 },
  { icone: "acces", nom: "Outils & accès", angle: 126 },
  { icone: "groupe", nom: "Groupe privé", angle: 198 },
];
