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
export type Appui = {
  icone: string;
  nom: string;
  /** Position sur l'anneau, en degrés, 0 pointant vers la droite. */
  angle: number;
  /**
   * Rang de l'appui. Comme pour les pôles du chapitre « Programme », il ne
   * suit pas la place sur l'anneau : les deux sont deux informations
   * distinctes, et les numéros ne se lisent donc pas dans l'ordre en
   * tournant.
   */
  num: string;
};

export const APPUIS: Appui[] = [
  { icone: "partenariat", nom: "Un coach", angle: -90, num: "01" },
  { icone: "grille", nom: "43 compétences", angle: -18, num: "03" },
  { icone: "formation", nom: "Formations & logiciels", angle: 54, num: "05" },
  { icone: "acces", nom: "Outils & accès", angle: 126, num: "04" },
  { icone: "groupe", nom: "Groupe privé", angle: 198, num: "02" },
];

/**
 * La scène est dessinée dans un carré de 400, centre (200, 200), les cinq
 * appuis posés sur un anneau de rayon 150 — le même repère que l'orbite du
 * chapitre « Programme », pour que les deux se ressemblent.
 */
export const SCENE = 400;
export const CENTRE = SCENE / 2;
export const RAYON = 150;

const point = (angle: number) => {
  const r = (angle * Math.PI) / 180;
  return [CENTRE + RAYON * Math.cos(r), CENTRE + RAYON * Math.sin(r)] as const;
};

/**
 * Le maillage : une étoile à cinq branches qui relie chaque appui aux deux
 * qui ne lui sont pas voisins. C'est la figure du chapitre « Programme »,
 * reprise ici — un écosystème, c'est ce qui se tient entre les appuis, pas
 * cinq rayons partant d'un centre.
 */
export const MAILLAGE = (() => {
  const n = APPUIS.length;
  const ordre = Array.from({ length: n + 1 }, (_, i) => (i * 2) % n);
  return (
    ordre
      .map((i, k) => {
        const [x, y] = point(APPUIS[i].angle);
        return `${k === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
})();
