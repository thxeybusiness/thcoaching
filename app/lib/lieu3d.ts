import * as THREE from "three";

/**
 * Le lieu : un bureau, la nuit.
 *
 * Tout est bâti en volumes simples — des boîtes, des cylindres, des cônes :
 * aucun fichier de modèle, et l'ensemble reste léger. Ce n'est pas un décor
 * réaliste, c'est un lieu reconnaissable, et c'est ce qui compte : on doit
 * sentir qu'il y a quelqu'un qui travaille ici, pas regarder un fond.
 *
 * Ce qui fait vivre la pièce n'est pas le nombre d'objets mais la lumière :
 * la lampe du bureau chauffe le plan de travail, l'écran teinte ce qui
 * l'entoure, et le store découpe la lumière du dehors en lames qui traversent
 * la poussière.
 *
 * Le module est partagé par l'intro et par le fond du site. C'est
 * volontaire : ce sont la même pièce, vue de deux endroits. Les décrire deux
 * fois les aurait fait diverger au premier détail ajouté d'un seul côté.
 */

/** Le niveau du sol, dans le repère de la pièce. */
export const SOL_Y = -1.62;

export type Lieu = {
  /** Tout le mobilier et les lumières, à déplacer d'un bloc. */
  groupe: THREE.Group;
  /** La vie de la pièce, à appeler à chaque image (s = secondes écoulées). */
  animer: (s: number) => void;
  detruire: () => void;
};

/**
 * Monte la pièce dans une scène.
 *
 * Les lumières se pèsent en deux familles, et c'est la distinction qui compte.
 * `intensite` porte sur les sources qu'on voit dans la pièce — la lampe, le
 * lampadaire, l'écran ; `ambiance` sur le remplissage, qui n'a pas de source
 * visible et ne sert qu'à déboucher les creux.
 *
 * Les baisser ensemble donne une pièce grise : tout descend, y compris le
 * remplissage, et il ne reste qu'une bouillie brune. En baissant surtout le
 * remplissage, la pièce s'assombrit sans perdre ses flaques chaudes — c'est
 * le contraste qui la fait tenir derrière du texte, pas la luminosité.
 *
 * `ombres` et `poussieres` sont les deux seuls postes vraiment coûteux : ce
 * sont eux qu'on coupe sur une machine modeste, pas la géométrie.
 */
export function construireLieu(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  reglages: {
    ombres?: boolean;
    poussieres?: number;
    intensite?: number;
    ambiance?: number;
    brume?: [number, number];
    portee?: number;
    decalage?: THREE.Vector3Like;
  } = {}
): Lieu {
  const {
    ombres = true,
    poussieres: NB_POUSSIERES = 700,
    intensite = 1,
    ambiance: POIDS_AMBIANCE = 1,
    brume = [9, 34],
    portee = 3.4,
    decalage = { x: 0, y: -0.95, z: -0.9 },
  } = reglages;

  /** Tout ce que la pièce alloue et qu'il faudra rendre au démontage. */
  const aRanger: { dispose: () => void }[] = [];
  /** Les sources visibles dans la pièce. */
  const feux: THREE.Light[] = [];
  /** Le remplissage, qui n'a pas de source. */
  const remplissage: THREE.Light[] = [];

  /* Un décor, et non un fond.
   *
   * Le logo flottait au-dessus d'un dégradé CSS : deux mondes qui ne se
   * répondaient pas. Ici le ciel est une sphère où la caméra se trouve, le
   * sol une vraie surface qui reçoit la lumière, et une brume les relie —
   * c'est elle qui efface l'horizon et fait tenir l'ensemble. */
  const cielTexture = (() => {
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 256;
    const g = c.getContext("2d")!;
    const d = g.createLinearGradient(0, 0, 0, 256);
    d.addColorStop(0, "#050403");
    d.addColorStop(0.3, "#0e0907");
    d.addColorStop(0.47, "#22120a");
    d.addColorStop(0.55, "#3d1c0c");
    d.addColorStop(0.63, "#22130c");
    d.addColorStop(0.82, "#0d0907");
    d.addColorStop(1, "#060505");
    g.fillStyle = d;
    g.fillRect(0, 0, 8, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  aRanger.push(cielTexture);

  /* Ce n'est plus un ciel mais l'ambiance de la pièce : ce qu'on aperçoit
     au-delà des murs, et ce qui teinte les angles morts. */
  const geoCiel = new THREE.SphereGeometry(60, 24, 16);
  const matCiel = new THREE.MeshBasicMaterial({
    map: cielTexture,
    side: THREE.BackSide,
    fog: false,
  });
  aRanger.push(geoCiel, matCiel);
  const ciel = new THREE.Mesh(geoCiel, matCiel);
  scene.add(ciel);

  /* La brume efface la ligne d'horizon. Elle commence tôt quand la pièce est
     le sujet ; derrière du texte, on la repousse — à 9 unités elle noyait le
     mur du fond dans un brun uniforme, et c'est ce brun qui donnait à
     l'ensemble son air de purée. */
  scene.fog = new THREE.Fog(0x22120a, brume[0], brume[1]);

  const lieu = new THREE.Group();
  scene.add(lieu);

  /** Un volume, avec sa matière — le vocabulaire de tout le mobilier. */
  const bloc = (
    geo: THREE.BufferGeometry,
    couleur: number,
    grain = 0.85,
    metal = 0
  ) => {
    const mat = new THREE.MeshStandardMaterial({
      color: couleur,
      roughness: grain,
      metalness: metal,
    });
    aRanger.push(geo, mat);
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = ombres;
    m.receiveShadow = ombres;
    lieu.add(m);
    return m;
  };

  // ---- La pièce : un fond et un mur latéral, rien de plus ----
  const mur = bloc(new THREE.BoxGeometry(16, 8, 0.2), 0x1d1512, 0.95);
  mur.position.set(0, SOL_Y + 4, -5.2);
  mur.castShadow = false;

  /* Le mur de gauche est percé : quatre pans autour du trou, et non un
     panneau plein. C'est la condition pour que la fenêtre donne sur quelque
     chose — jusqu'ici les lames de lumière traversaient la pièce sans que
     leur source existe. Le trou fait 2,90 de haut sur 2,30 de large, un peu
     moins que le châssis, qui le recouvre donc de tous les côtés. */
  const PANS: [number, number, number, number][] = [
    // [hauteur, profondeur, y du centre, z du centre]
    [1.05, 10, SOL_Y + 0.525, -0.6], // l'allège, sous la fenêtre
    [4.05, 10, SOL_Y + 5.975, -0.6], // le linteau, au-dessus
    [2.9, 3.05, SOL_Y + 2.5, -4.075], // le trumeau côté fond
    [2.9, 4.65, SOL_Y + 2.5, 2.075], // le trumeau côté spectateur
  ];
  PANS.forEach(([h, pr, y, z]) => {
    const pan = bloc(new THREE.BoxGeometry(0.2, h, pr), 0x191210, 0.95);
    pan.position.set(-7.4, y, z);
    pan.castShadow = false;
  });

  // ---- Le bureau ----
  const plateau = bloc(new THREE.BoxGeometry(3.9, 0.09, 1.6), 0x3a2418, 0.7);
  plateau.position.set(0.15, SOL_Y + 1.05, -1.75);

  [-1.7, 1.7].forEach((dx) => {
    const pied = bloc(new THREE.BoxGeometry(0.09, 1.05, 1.4), 0x241812, 0.8);
    pied.position.set(0.15 + dx, SOL_Y + 0.52, -1.75);
  });

  // ---- L'écran : c'est lui qui éclaire le bureau par en dessous ----
  const pied = bloc(new THREE.BoxGeometry(0.36, 0.05, 0.24), 0x14100e, 0.6, 0.4);
  pied.position.set(-0.85, SOL_Y + 1.12, -2.05);
  const mat = bloc(new THREE.BoxGeometry(0.07, 0.42, 0.07), 0x14100e, 0.6, 0.4);
  mat.position.set(-0.85, SOL_Y + 1.33, -2.05);
  const cadre = bloc(new THREE.BoxGeometry(1.34, 0.82, 0.05), 0x14100e, 0.6, 0.4);
  cadre.position.set(-0.85, SOL_Y + 1.78, -2.06);

  const geoDalle = new THREE.PlaneGeometry(1.24, 0.72);
  const matDalle = new THREE.MeshBasicMaterial({ color: 0x2a1a12, fog: true });
  aRanger.push(geoDalle, matDalle);
  const dalle = new THREE.Mesh(geoDalle, matDalle);
  dalle.position.set(-0.85, SOL_Y + 1.78, -2.03);
  lieu.add(dalle);

  // ---- La lampe : la vraie source chaude de la pièce ----
  const socle = bloc(new THREE.CylinderGeometry(0.17, 0.19, 0.05, 16), 0x2e1d14, 0.7);
  socle.position.set(1.45, SOL_Y + 1.12, -1.9);
  const bras = bloc(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 10), 0x2e1d14, 0.6, 0.3);
  bras.position.set(1.45, SOL_Y + 1.48, -1.9);
  bras.rotation.z = 0.24;
  const abatJour = bloc(new THREE.ConeGeometry(0.2, 0.24, 18, 1, true), 0x51301c, 0.65);
  abatJour.position.set(1.28, SOL_Y + 1.82, -1.9);
  abatJour.rotation.z = 0.5;

  const REPOS_LAMPE = 5.5;
  const lampe = new THREE.PointLight(0xffb066, REPOS_LAMPE, 6.5, 2);
  lampe.position.set(1.24, SOL_Y + 1.72, -1.86);
  lieu.add(lampe);
  feux.push(lampe);

  // ---- La chaise ----
  const assise = bloc(new THREE.BoxGeometry(0.62, 0.08, 0.6), 0x241a16, 0.9);
  assise.position.set(0.2, SOL_Y + 0.58, -1.05);
  const dossier = bloc(new THREE.BoxGeometry(0.6, 0.72, 0.07), 0x241a16, 0.9);
  dossier.position.set(0.2, SOL_Y + 0.96, -0.74);
  dossier.rotation.x = 0.14;
  const colonne = bloc(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 10), 0x14100e, 0.6, 0.4);
  colonne.position.set(0.2, SOL_Y + 0.3, -1.05);
  const etoile = bloc(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 5), 0x14100e, 0.6, 0.4);
  etoile.position.set(0.2, SOL_Y + 0.04, -1.05);

  // ---- La plante : le seul volume vivant de la pièce ----
  const pot = bloc(new THREE.CylinderGeometry(0.2, 0.15, 0.34, 14), 0x4a2a1c, 0.9);
  pot.position.set(-2.9, SOL_Y + 0.17, -2.3);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const feuille = bloc(new THREE.ConeGeometry(0.1, 0.62, 5), 0x2f3f24, 0.95);
    feuille.position.set(
      -2.9 + Math.cos(a) * 0.13,
      SOL_Y + 0.62 + (i % 2) * 0.12,
      -2.3 + Math.sin(a) * 0.13
    );
    feuille.rotation.set(Math.sin(a) * 0.42, a, -Math.cos(a) * 0.42);
  }

  // ---- L'étagère et ses livres ----
  const etagere = bloc(new THREE.BoxGeometry(2.4, 0.07, 0.3), 0x33211a, 0.85);
  etagere.position.set(-2.2, SOL_Y + 2.5, -4.9);
  const TEINTES = [0x6b3a22, 0x3d2a1e, 0x7a4526, 0x2b2a24, 0x59331f];
  for (let i = 0; i < 9; i++) {
    const h = 0.3 + (i % 4) * 0.06;
    const livre = bloc(
      new THREE.BoxGeometry(0.07 + (i % 3) * 0.02, h, 0.22),
      TEINTES[i % TEINTES.length],
      0.95
    );
    livre.position.set(-3.2 + i * 0.13, SOL_Y + 2.54 + h / 2, -4.9);
    livre.rotation.z = i === 6 ? 0.24 : 0;
  }

  // ---- Une tasse, posée là ----
  const tasse = bloc(new THREE.CylinderGeometry(0.08, 0.07, 0.12, 14), 0x6b3f26, 0.8);
  tasse.position.set(0.75, SOL_Y + 1.16, -1.45);

  // ---- Ce qui traîne sur le bureau : c'est ça qui dit qu'on y travaille ----
  const clavier = bloc(new THREE.BoxGeometry(0.72, 0.03, 0.26), 0x1a1512, 0.85);
  clavier.position.set(-0.7, SOL_Y + 1.11, -1.42);
  clavier.rotation.y = 0.06;

  const carnet = bloc(new THREE.BoxGeometry(0.3, 0.025, 0.4), 0x7a4526, 0.9);
  carnet.position.set(0.28, SOL_Y + 1.11, -1.5);
  carnet.rotation.y = -0.22;

  const feuille = bloc(new THREE.BoxGeometry(0.26, 0.006, 0.35), 0xd8cdbd, 0.95);
  feuille.position.set(0.29, SOL_Y + 1.13, -1.48);
  feuille.rotation.y = -0.16;

  const stylo = bloc(new THREE.CylinderGeometry(0.011, 0.011, 0.17, 8), 0x22201d, 0.5, 0.5);
  stylo.position.set(0.44, SOL_Y + 1.14, -1.36);
  stylo.rotation.set(0, 0.5, Math.PI / 2);

  // Une pile de livres, posée au coin du plateau
  [0, 1, 2].forEach((i) => {
    const l = bloc(
      new THREE.BoxGeometry(0.34 - i * 0.02, 0.045, 0.25),
      [0x59331f, 0x2b2a24, 0x6b3a22][i],
      0.95
    );
    l.position.set(1.72, SOL_Y + 1.13 + i * 0.047, -1.62);
    l.rotation.y = 0.1 - i * 0.09;
  });

  // ---- Le tapis : il pose le bureau au sol ----
  const tapis = bloc(new THREE.BoxGeometry(4.6, 0.02, 2.6), 0x33231d, 0.98);
  tapis.position.set(0.15, SOL_Y + 0.011, -1.35);
  tapis.castShadow = false;

  // ---- Le lampadaire du coin droit : la pièce était vide de ce côté ----
  const socleLamp = bloc(new THREE.CylinderGeometry(0.22, 0.24, 0.04, 16), 0x1e1613, 0.7, 0.3);
  socleLamp.position.set(3.5, SOL_Y + 0.02, -2.6);
  const tige = bloc(new THREE.CylinderGeometry(0.028, 0.028, 2.1, 10), 0x1e1613, 0.6, 0.35);
  tige.position.set(3.5, SOL_Y + 1.07, -2.6);
  const chapeau = bloc(new THREE.CylinderGeometry(0.3, 0.22, 0.34, 18, 1, true), 0x6b4028, 0.75);
  chapeau.position.set(3.5, SOL_Y + 2.24, -2.6);

  const lampadaire = new THREE.PointLight(0xffb070, 3.4, 7, 2);
  lampadaire.position.set(3.5, SOL_Y + 2.1, -2.6);
  lieu.add(lampadaire);
  feux.push(lampadaire);

  // ---- Un cadre au mur, et une horloge ----
  const cadreMur = bloc(new THREE.BoxGeometry(0.9, 1.2, 0.05), 0x2a1d16, 0.9);
  cadreMur.position.set(2.6, SOL_Y + 2.6, -5.05);
  const toile = bloc(new THREE.BoxGeometry(0.78, 1.08, 0.02), 0x4a2a18, 0.95);
  toile.position.set(2.6, SOL_Y + 2.6, -5.01);

  const horloge = bloc(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 20), 0x241a16, 0.85);
  horloge.position.set(0.6, SOL_Y + 3.2, -5.05);
  horloge.rotation.x = Math.PI / 2;

  // ---- Deux caisses au sol : le coin qui n'est jamais rangé ----
  [0, 1].forEach((i) => {
    const caisse = bloc(
      new THREE.BoxGeometry(0.62 - i * 0.08, 0.46, 0.5),
      0x5a3a24,
      0.98
    );
    caisse.position.set(-4.3 + i * 0.16, SOL_Y + 0.23 + i * 0.46, -3.4);
    caisse.rotation.y = 0.18 - i * 0.34;
  });

  // ---- L'architecture : ce qu'on ne remarque que si ça manque ----
  const plinthe = bloc(new THREE.BoxGeometry(16, 0.16, 0.08), 0x2a1e18, 0.95);
  plinthe.position.set(0, SOL_Y + 0.08, -5.06);
  plinthe.castShadow = false;

  const plintheCote = bloc(new THREE.BoxGeometry(0.08, 0.16, 10), 0x2a1e18, 0.95);
  plintheCote.position.set(-7.26, SOL_Y + 0.08, -0.6);
  plintheCote.castShadow = false;

  // Une porte, entrouverte : la pièce donne sur quelque part
  const porte = bloc(new THREE.BoxGeometry(1.05, 2.35, 0.07), 0x2f2019, 0.9);
  porte.position.set(5.1, SOL_Y + 1.18, -5.0);
  porte.rotation.y = -0.16;
  const poignee = bloc(new THREE.SphereGeometry(0.045, 10, 8), 0x8a6a44, 0.4, 0.7);
  poignee.position.set(4.7, SOL_Y + 1.15, -4.9);

  const interrupteur = bloc(new THREE.BoxGeometry(0.14, 0.2, 0.03), 0x3a2c24, 0.9);
  interrupteur.position.set(4.05, SOL_Y + 1.5, -5.04);
  interrupteur.castShadow = false;

  // ---- Le poste de travail, dans le détail ----
  const sousMain = bloc(new THREE.BoxGeometry(1.3, 0.012, 0.5), 0x241a15, 0.95);
  sousMain.position.set(-0.6, SOL_Y + 1.1, -1.45);
  sousMain.castShadow = false;

  const souris = bloc(new THREE.SphereGeometry(0.055, 12, 8), 0x1a1512, 0.7);
  souris.position.set(-0.05, SOL_Y + 1.13, -1.4);
  souris.scale.set(1, 0.62, 1.45);

  const potCrayons = bloc(new THREE.CylinderGeometry(0.075, 0.065, 0.19, 14, 1, true), 0x3f2a1c, 0.85);
  potCrayons.position.set(-1.6, SOL_Y + 1.2, -1.72);
  [-0.02, 0.02, 0.05].forEach((dx, i) => {
    const crayon = bloc(
      new THREE.CylinderGeometry(0.009, 0.009, 0.26, 6),
      [0xff8c2e, 0xd8cdbd, 0x6b3a22][i],
      0.7
    );
    crayon.position.set(-1.6 + dx, SOL_Y + 1.31, -1.72 + dx);
    crayon.rotation.z = dx * 3;
  });

  const telephone = bloc(new THREE.BoxGeometry(0.16, 0.02, 0.31), 0x14100e, 0.5, 0.4);
  telephone.position.set(0.95, SOL_Y + 1.11, -1.28);
  telephone.rotation.y = 0.34;

  const photo = bloc(new THREE.BoxGeometry(0.22, 0.28, 0.03), 0x5a3a24, 0.9);
  photo.position.set(-1.98, SOL_Y + 1.25, -2.0);
  photo.rotation.y = 0.42;

  /* Trois pense-bêtes sur le bord de l'écran : le seul orange de la pièce
     avec le logo, et il n'est pas là par hasard. */
  [0, 1, 2].forEach((i) => {
    const note = bloc(new THREE.BoxGeometry(0.11, 0.11, 0.006), 0xff8c2e, 0.95);
    note.position.set(-0.18, SOL_Y + 1.95 - i * 0.14, -2.02);
    note.rotation.z = 0.1 - i * 0.09;
  });

  /* Le câble de l'écran : il tombe derrière le bureau. Une courbe suffit —
     c'est la seule chose de la pièce qui ne soit pas une arête droite, et
     c'est précisément pour ça qu'elle se remarque. */
  const courbe = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.85, SOL_Y + 1.14, -2.12),
    new THREE.Vector3(-0.95, SOL_Y + 0.86, -2.3),
    new THREE.Vector3(-1.1, SOL_Y + 0.3, -2.24),
    new THREE.Vector3(-1.25, SOL_Y + 0.04, -2.5),
  ]);
  const cable = bloc(new THREE.TubeGeometry(courbe, 24, 0.012, 6, false), 0x14100e, 0.7);
  cable.castShadow = false;

  // Le caisson à tiroirs, rangé sous le plateau
  const caisson = bloc(new THREE.BoxGeometry(0.6, 0.82, 0.9), 0x2e2018, 0.9);
  caisson.position.set(1.35, SOL_Y + 0.41, -1.9);
  [0, 1, 2].forEach((i) => {
    const tiroir = bloc(new THREE.BoxGeometry(0.5, 0.02, 0.03), 0x8a6a44, 0.5, 0.6);
    tiroir.position.set(1.35, SOL_Y + 0.18 + i * 0.26, -1.46);
  });

  // ---- Le reste de la pièce ----
  const corbeille = bloc(new THREE.CylinderGeometry(0.17, 0.13, 0.34, 14, 1, true), 0x2a201a, 0.9);
  corbeille.position.set(-1.9, SOL_Y + 0.17, -2.7);
  const boulette = bloc(new THREE.SphereGeometry(0.06, 8, 6), 0xcfc3b2, 0.98);
  boulette.position.set(-1.72, SOL_Y + 0.06, -2.42);

  // Le radiateur sous la fenêtre, avec ses ailettes
  const radiateur = bloc(new THREE.BoxGeometry(0.14, 0.5, 1.7), 0x39281f, 0.85);
  radiateur.position.set(-7.0, SOL_Y + 0.4, -1.4);
  for (let i = 0; i < 7; i++) {
    const ailette = bloc(new THREE.BoxGeometry(0.17, 0.46, 0.05), 0x422f24, 0.85);
    ailette.position.set(-6.98, SOL_Y + 0.4, -2.1 + i * 0.23);
    ailette.castShadow = false;
  }

  // Un panneau de liège et ses papiers épinglés
  const liege = bloc(new THREE.BoxGeometry(1.5, 1.0, 0.04), 0x5c4028, 0.98);
  liege.position.set(-4.05, SOL_Y + 1.85, -5.03);
  liege.castShadow = false;
  [
    [-0.4, 0.2, 0.32, 0.26],
    [0.1, 0.3, 0.26, 0.2],
    [0.35, -0.15, 0.3, 0.34],
    [-0.25, -0.28, 0.22, 0.22],
  ].forEach((f, i) => {
    const papier = bloc(
      new THREE.BoxGeometry(f[2], f[3], 0.008),
      i === 1 ? 0xff8c2e : 0xd8cdbd,
      0.95
    );
    papier.position.set(-4.05 + f[0], SOL_Y + 1.85 + f[1], -5.0);
    papier.rotation.z = 0.12 - i * 0.07;
    papier.castShadow = false;
  });

  /* L'écran éclaire ce qu'il a devant lui : une lumière froide et faible,
     seule note non chaude de la pièce. */
  const lueurEcran = new THREE.PointLight(0xbfd0e8, 1.1, 3.2, 2);
  lueurEcran.position.set(-0.85, SOL_Y + 1.75, -1.8);
  lieu.add(lueurEcran);
  feux.push(lueurEcran);

  /* ---- La fenêtre : un store, et la lumière qui passe entre ses lames ----
     Ce sont ces lames qui donnent l'heure et l'ambiance. Elles bougent très
     lentement, comme une lumière d'extérieur qui change. */
  const texLame = (() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 8;
    const g = c.getContext("2d")!;
    const d = g.createLinearGradient(0, 0, 256, 0);
    d.addColorStop(0, "rgba(255,150,60,0)");
    d.addColorStop(0.45, "rgba(255,160,80,0.5)");
    d.addColorStop(1, "rgba(255,150,60,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, 256, 8);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  aRanger.push(texLame);

  /* Le cadre de la fenêtre et ses lattes, sur le mur de gauche : sans elle,
     les lames de lumière tombaient de nulle part. */
  /* Le châssis est un cadre, et non un panneau.
     Il était plein : tant que le mur derrière l'était aussi, personne ne
     pouvait s'en apercevoir. Le mur une fois percé, c'est lui qui bouchait le
     trou — la ville était bien là, derrière un volet de bois. Deux traverses,
     deux montants, et un meneau au milieu qui en fait une fenêtre à deux
     vantaux. */
  const MENUISERIE: [number, number, number, number][] = [
    // [hauteur, profondeur, y du centre, z du centre]
    [0.22, 2.6, SOL_Y + 1.01, -1.4], // traverse basse
    [0.22, 2.6, SOL_Y + 3.99, -1.4], // traverse haute
    [3.2, 0.2, SOL_Y + 2.5, -2.6], // montant côté fond
    [3.2, 0.2, SOL_Y + 2.5, -0.2], // montant côté spectateur
    [3.2, 0.08, SOL_Y + 2.5, -1.4], // le meneau
  ];
  MENUISERIE.forEach(([h, pr, y, z]) => {
    const piece = bloc(new THREE.BoxGeometry(0.12, h, pr), 0x241a15, 0.9);
    piece.position.set(-7.24, y, z);
    piece.castShadow = false;
  });

  const vitre = bloc(new THREE.BoxGeometry(0.04, 2.9, 2.3), 0x3a2415, 0.4, 0.2);
  vitre.position.set(-7.16, SOL_Y + 2.5, -1.4);
  vitre.castShadow = false;

  for (let i = 0; i < 9; i++) {
    const latte = bloc(new THREE.BoxGeometry(0.05, 0.16, 2.28), 0x2e211a, 0.9);
    latte.position.set(-7.1, SOL_Y + 1.2 + i * 0.32, -1.4);
    latte.rotation.z = 0.34;
  }

  /* ------------------------------------------------------------------
     Ce qu'il y a derrière la vitre.

     Une pièce n'existe pas seule : elle donne sur quelque chose. Le mur est
     percé, il fallait maintenant remplir le trou. La ville est peinte sur une
     seule toile posée loin derrière — une masse d'immeubles et leurs fenêtres
     allumées. Un immeuble par volume aurait coûté cent objets pour un
     résultat qu'on ne voit qu'à travers un store.

     C'est surtout la deuxième température de couleur de la pièce : tout est
     chaud à l'intérieur, tout est froid dehors, et c'est ce contraste-là qui
     dit qu'il est tard. */
  const texVille = (() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 288;
    const g = c.getContext("2d")!;
    const nuit = g.createLinearGradient(0, 0, 0, 288);
    nuit.addColorStop(0, "#070b14");
    nuit.addColorStop(0.62, "#131c2b");
    nuit.addColorStop(1, "#2a2029");
    g.fillStyle = nuit;
    g.fillRect(0, 0, 512, 288);

    // Les immeubles, de gauche à droite, chacun avec ses fenêtres allumées
    let x = -30;
    while (x < 540) {
      const large = 28 + Math.random() * 58;
      const haut = 60 + Math.random() * 155;
      g.fillStyle = "#080b12";
      g.fillRect(x, 288 - haut, large, haut);
      for (let fy = 288 - haut + 12; fy < 278; fy += 15) {
        for (let fx = x + 7; fx < x + large - 9; fx += 13) {
          if (Math.random() < 0.34) continue; // la plupart des fenêtres sont éteintes
          g.fillStyle =
            Math.random() > 0.7
              ? "rgba(255, 198, 128, 0.92)"
              : "rgba(186, 206, 238, 0.62)";
          g.fillRect(fx, fy, 6, 8);
        }
      }
      x += large + 3 + Math.random() * 12;
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  aRanger.push(texVille);

  const geoVille = new THREE.PlaneGeometry(22, 12.4);
  const matVille = new THREE.MeshBasicMaterial({ map: texVille, fog: false });
  aRanger.push(geoVille, matVille);
  const ville = new THREE.Mesh(geoVille, matVille);
  ville.position.set(-11.5, SOL_Y + 3.4, -1.2);
  ville.rotation.y = Math.PI / 2; // la toile regarde vers la pièce
  lieu.add(ville);

  /* La vitre redevient une vitre : opaque, elle bouchait le trou qu'on venait
     d'ouvrir. */
  const verre = vitre.material as THREE.MeshStandardMaterial;
  verre.transparent = true;
  verre.opacity = 0.14;
  verre.roughness = 0.12;
  verre.metalness = 0.1;
  vitre.receiveShadow = false;

  /* Et la lumière qui entre avec. Froide, faible, mais c'est elle qui donne
     un bord bleuté au mobilier de gauche — sans quoi la pièce n'est qu'orange
     du sol au plafond. */
  const lueurFenetre = new THREE.PointLight(0x9db6d8, 2.2, 9, 2);
  lueurFenetre.position.set(-6.5, SOL_Y + 2.4, -1.4);
  lieu.add(lueurFenetre);
  feux.push(lueurFenetre);

  /* ------------------------------------------------------------------
     Le côté droit.

     Il n'existait pas : la caméra du site passe désormais par là et la pièce
     s'ouvrait sur le vide. Un mur, sa plinthe, et de quoi meubler le coin.
     ------------------------------------------------------------------ */
  const murDroit = bloc(new THREE.BoxGeometry(0.2, 8, 10), 0x191210, 0.95);
  murDroit.position.set(7.4, SOL_Y + 4, -0.6);
  murDroit.castShadow = false;

  const plintheDroite = bloc(new THREE.BoxGeometry(0.08, 0.16, 10), 0x2a1e18, 0.95);
  plintheDroite.position.set(7.26, SOL_Y + 0.08, -0.6);
  plintheDroite.castShadow = false;

  // Un meuble bas, ses dossiers empilés et une petite plante
  const meuble = bloc(new THREE.BoxGeometry(1.2, 0.72, 0.46), 0x2e2018, 0.9);
  meuble.position.set(6.4, SOL_Y + 0.36, -4.7);
  [0, 1, 2, 3].forEach((i) => {
    const dossier = bloc(
      new THREE.BoxGeometry(0.28, 0.04, 0.36),
      [0x7a4526, 0xd8cdbd, 0x59331f, 0xd8cdbd][i],
      0.95
    );
    dossier.position.set(6.15, SOL_Y + 0.74 + i * 0.042, -4.68);
    dossier.rotation.y = 0.06 - i * 0.05;
  });
  const potHaut = bloc(new THREE.CylinderGeometry(0.11, 0.09, 0.18, 12), 0x4a2a1c, 0.9);
  potHaut.position.set(6.85, SOL_Y + 0.81, -4.7);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const brin = bloc(new THREE.ConeGeometry(0.05, 0.34, 5), 0x2f3f24, 0.95);
    brin.position.set(
      6.85 + Math.cos(a) * 0.07,
      SOL_Y + 1.05,
      -4.7 + Math.sin(a) * 0.07
    );
    brin.rotation.set(Math.sin(a) * 0.4, a, -Math.cos(a) * 0.4);
  }

  /* ------------------------------------------------------------------
     La porte donne sur quelque part.

     Un rai de lumière sous la porte : c'est la chose la plus courte à écrire
     et la plus efficace du lot. Une pièce dont la porte est noire par en
     dessous est une pièce isolée dans le vide.
     ------------------------------------------------------------------ */
  const geoRai = new THREE.PlaneGeometry(0.92, 0.05);
  const matRai = new THREE.MeshBasicMaterial({
    color: 0xffcb8a,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
  });
  aRanger.push(geoRai, matRai);
  const rai = new THREE.Mesh(geoRai, matRai);
  rai.rotation.x = -Math.PI / 2;
  rai.position.set(5.05, SOL_Y + 0.012, -4.82);
  lieu.add(rai);

  const lueurCouloir = new THREE.PointLight(0xffc487, 0.9, 1.9, 2);
  lueurCouloir.position.set(5.05, SOL_Y + 0.22, -4.72);
  lieu.add(lueurCouloir);
  feux.push(lueurCouloir);

  // Le portemanteau à côté, avec sa veste et un sac posé dessous
  const perche = bloc(new THREE.CylinderGeometry(0.028, 0.028, 1.9, 10), 0x2a1e18, 0.7);
  perche.position.set(4.3, SOL_Y + 0.95, -4.62);
  const patere = bloc(new THREE.CylinderGeometry(0.02, 0.02, 0.34, 8), 0x2a1e18, 0.7);
  patere.position.set(4.3, SOL_Y + 1.82, -4.62);
  patere.rotation.z = Math.PI / 2;
  const veste = bloc(new THREE.BoxGeometry(0.34, 0.92, 0.14), 0x2b2f38, 0.95);
  veste.position.set(4.44, SOL_Y + 1.3, -4.58);
  veste.rotation.z = -0.05;
  const sac = bloc(new THREE.BoxGeometry(0.38, 0.3, 0.22), 0x33261e, 0.95);
  sac.position.set(4.12, SOL_Y + 0.15, -4.4);
  sac.rotation.y = 0.28;

  /* ------------------------------------------------------------------
     Le mur du fond se remplit.
     ------------------------------------------------------------------ */
  // Un tableau blanc, et ce qui reste dessus
  const tableau = bloc(new THREE.BoxGeometry(1.5, 0.94, 0.04), 0x4c473e, 0.9);
  tableau.position.set(0.25, SOL_Y + 2.35, -5.03);
  tableau.castShadow = false;
  const rebord = bloc(new THREE.BoxGeometry(1.5, 0.05, 0.08), 0x2a1d16, 0.85);
  rebord.position.set(0.25, SOL_Y + 1.86, -5.0);
  [
    [-0.4, 0.24, 0.5],
    [-0.32, 0.06, 0.34],
    [0.28, 0.14, 0.42],
    [0.24, -0.1, 0.26],
  ].forEach(([dx, dy, l], i) => {
    const trait = bloc(new THREE.BoxGeometry(l, 0.025, 0.006), i === 2 ? 0xd05a24 : 0x2f3540, 0.95);
    trait.position.set(0.25 + dx, SOL_Y + 2.35 + dy, -5.0);
    trait.rotation.z = 0.03 - i * 0.02;
    trait.castShadow = false;
  });

  // Un calendrier, à côté du panneau de liège
  const calendrier = bloc(new THREE.BoxGeometry(0.44, 0.58, 0.03), 0xd8cdbd, 0.95);
  calendrier.position.set(-5.45, SOL_Y + 2.0, -5.02);
  calendrier.castShadow = false;
  const bandeau = bloc(new THREE.BoxGeometry(0.44, 0.14, 0.035), 0xff8c2e, 0.9);
  bandeau.position.set(-5.45, SOL_Y + 2.22, -5.015);
  bandeau.castShadow = false;

  // Une cimaise haute : elle donne au mur son échelle
  const cimaise = bloc(new THREE.BoxGeometry(16, 0.07, 0.05), 0x2a1e18, 0.9);
  cimaise.position.set(0, SOL_Y + 3.75, -5.04);
  cimaise.castShadow = false;

  /* Un luminaire au plafond, éteint. Il n'y a pas de plafond — la caméra
     passe au-dessus sur un chapitre — mais un abat-jour suspendu au bout de
     son fil suffit à faire exister ce plafond hors champ. Éteint, il raconte
     en plus qu'à cette heure-ci, seule la lampe du bureau sert encore. */
  const fil = bloc(new THREE.CylinderGeometry(0.008, 0.008, 1.1, 6), 0x1a1512, 0.8);
  fil.position.set(-1.2, SOL_Y + 4.25, -3.2);
  fil.castShadow = false;
  const suspension = bloc(
    new THREE.CylinderGeometry(0.34, 0.24, 0.28, 18, 1, true),
    0x3a2a20,
    0.85
  );
  suspension.position.set(-1.2, SOL_Y + 3.56, -3.2);

  // ---- Ce qui traîne encore au sol ----
  const tabouret = bloc(new THREE.CylinderGeometry(0.21, 0.21, 0.07, 14), 0x33231d, 0.9);
  tabouret.position.set(-3.7, SOL_Y + 0.56, -3.85);
  const pivotTabouret = bloc(new THREE.CylinderGeometry(0.035, 0.035, 0.52, 8), 0x14100e, 0.6, 0.4);
  pivotTabouret.position.set(-3.7, SOL_Y + 0.27, -3.85);
  const socleTabouret = bloc(new THREE.CylinderGeometry(0.24, 0.24, 0.035, 12), 0x14100e, 0.6, 0.4);
  socleTabouret.position.set(-3.7, SOL_Y + 0.02, -3.85);

  // Une multiprise et son câble, le long de la plinthe
  const multiprise = bloc(new THREE.BoxGeometry(0.36, 0.06, 0.11), 0x241a15, 0.85);
  multiprise.position.set(-2.6, SOL_Y + 0.06, -4.86);
  multiprise.castShadow = false;
  const filPrise = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.42, SOL_Y + 0.05, -4.86),
    new THREE.Vector3(-2.0, SOL_Y + 0.03, -4.6),
    new THREE.Vector3(-1.5, SOL_Y + 0.03, -3.4),
    new THREE.Vector3(-1.35, SOL_Y + 0.03, -2.6),
  ]);
  const cordon = bloc(new THREE.TubeGeometry(filPrise, 20, 0.011, 6, false), 0x14100e, 0.8);
  cordon.castShadow = false;

  const lames = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const geo = new THREE.PlaneGeometry(7.4, 0.5);
    const matLame = new THREE.MeshBasicMaterial({
      map: texLame,
      transparent: true,
      opacity: 0.1 + (i % 3) * 0.03,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: true,
    });
    aRanger.push(geo, matLame);
    const lame = new THREE.Mesh(geo, matLame);
    // Les lames tombent en biais, du haut à gauche vers le bas à droite
    lame.position.set(-2.6 + i * 0.34, SOL_Y + 3.4 - i * 0.62, -4.4 + i * 0.12);
    lame.rotation.z = -0.42;
    lame.userData.base = 0.1 + (i % 3) * 0.03;
    lame.userData.vitesse = 0.05 + (i % 4) * 0.03;
    lames.add(lame);
  }
  lieu.add(lames);

  /* La poussière, dans la lumière : c'est le détail qui fait qu'une pièce
     paraît habitée plutôt que modélisée. */
  const posPoussiere = new Float32Array(NB_POUSSIERES * 3);
  for (let i = 0; i < NB_POUSSIERES; i++) {
    posPoussiere[i * 3] = (Math.random() - 0.5) * 13;
    posPoussiere[i * 3 + 1] = SOL_Y + Math.random() * 5.2;
    posPoussiere[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1.5;
  }
  const geoPoussiere = new THREE.BufferGeometry();
  geoPoussiere.setAttribute(
    "position",
    new THREE.BufferAttribute(posPoussiere, 3)
  );

  const texPoussiere = (() => {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 32;
    const g = c.getContext("2d")!;
    const d = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    d.addColorStop(0, "rgba(255,205,155,1)");
    d.addColorStop(0.45, "rgba(255,160,80,0.45)");
    d.addColorStop(1, "rgba(255,130,50,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, 32, 32);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const matPoussiere = new THREE.PointsMaterial({
    map: texPoussiere,
    size: 0.045,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
  });
  aRanger.push(geoPoussiere, matPoussiere, texPoussiere);
  const poussiere = new THREE.Points(geoPoussiere, matPoussiere);
  lieu.add(poussiere);

  /* La vapeur de la tasse.

     Vingt-quatre points qui montent et recommencent. C'est le seul mouvement
     de la pièce qui vienne d'un objet et non de la lumière, et c'est pour ça
     qu'il se remarque : tout le reste peut être un décor figé, pas une tasse
     qui fume. */
  const NB_VAPEUR = 24;
  const VAPEUR_BAS = SOL_Y + 1.24;
  const VAPEUR_HAUT = SOL_Y + 1.92;
  const posVapeur = new Float32Array(NB_VAPEUR * 3);
  for (let i = 0; i < NB_VAPEUR; i++) {
    posVapeur[i * 3] = 0.75 + (Math.random() - 0.5) * 0.05;
    posVapeur[i * 3 + 1] = VAPEUR_BAS + Math.random() * (VAPEUR_HAUT - VAPEUR_BAS);
    posVapeur[i * 3 + 2] = -1.45 + (Math.random() - 0.5) * 0.05;
  }
  const geoVapeur = new THREE.BufferGeometry();
  geoVapeur.setAttribute("position", new THREE.BufferAttribute(posVapeur, 3));
  const matVapeur = new THREE.PointsMaterial({
    map: texPoussiere,
    size: 0.055,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.17,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
  });
  aRanger.push(geoVapeur, matVapeur);
  const vapeur = new THREE.Points(geoVapeur, matVapeur);
  lieu.add(vapeur);

  /* Le sol : une vraie surface, et non un simple receveur d'ombre. En
     transparent, l'ombre se détachait sur le fond CSS comme une dalle posée
     dans le vide. Avec une matière et la brume, elle s'éteint dans le lointain
     et le logo se met enfin à reposer sur quelque chose. */
  const geoSol = new THREE.PlaneGeometry(30, 22);
  const matSol = new THREE.MeshStandardMaterial({
    color: 0x2b1a12,
    roughness: 0.92,
    metalness: 0.05,
  });
  aRanger.push(geoSol, matSol);
  const sol = new THREE.Mesh(geoSol, matSol);
  sol.rotation.x = -Math.PI / 2;
  sol.position.y = SOL_Y;
  sol.receiveShadow = ombres;
  lieu.add(sol);

  /* La pièce descend et recule : le logo doit flotter au-dessus du plan de
     travail, pas se poser dessus. Tout le mobilier bouge d'un bloc, les
     lumières comprises — elles appartiennent au lieu. */
  lieu.position.set(decalage.x, decalage.y, decalage.z);

  // ---- Lumières ----
  /* La clé est nettement en avant : posée au-dessus, elle raserait la grande
     face du logo, qui resterait dans un rouge sombre alors que la matière est
     orange. Une face plate ne s'éclaire que si la lumière la regarde. */
  const cle = new THREE.DirectionalLight(0xfff0e0, 2.15);
  cle.position.set(3.2, 7.2, 4.4);
  cle.castShadow = ombres;
  cle.shadow.mapSize.set(1024, 1024);
  cle.shadow.camera.left = -portee;
  cle.shadow.camera.right = portee;
  cle.shadow.camera.top = portee;
  cle.shadow.camera.bottom = -portee;
  cle.shadow.camera.near = 0.5;
  cle.shadow.camera.far = 22;
  cle.shadow.bias = -0.0006;
  cle.shadow.normalBias = 0.02;
  scene.add(cle);
  remplissage.push(cle);

  // La lisière reste chaude : une lisière froide grise l'orange de la marque
  const lisiere = new THREE.DirectionalLight(0xffc79c, 0.9);
  lisiere.position.set(-5.2, 1.4, -3.2);
  scene.add(lisiere);
  remplissage.push(lisiere);

  const braise = new THREE.PointLight(0xff6a2a, 6, 14, 2);
  braise.position.set(-1.4, -2.4, 2.6);
  scene.add(braise);
  remplissage.push(braise);

  // Un rebond depuis la place du spectateur : il débouche les creux
  const rebond = new THREE.DirectionalLight(0xffd0aa, 0.85);
  rebond.position.set(-2.6, 0.4, 6.4);
  scene.add(rebond);
  remplissage.push(rebond);

  const ambiance = new THREE.AmbientLight(0xffc39a, 0.82);
  scene.add(ambiance);
  remplissage.push(ambiance);

  /* Les poids se mettent à la fin, famille par famille : les valeurs écrites
     ci-dessus sont celles de l'intro, où la pièce est le sujet. Les toucher
     une à une aurait fait perdre les rapports à l'intérieur de chaque
     famille — et ce sont eux, et non les valeurs absolues, qui font
     l'ambiance. */
  if (intensite !== 1) feux.forEach((f) => (f.intensity *= intensite));
  if (POIDS_AMBIANCE !== 1) {
    remplissage.forEach((f) => (f.intensity *= POIDS_AMBIANCE));
  }
  const reposLampe = lampe.intensity;

  /* Un environnement fabriqué sur place : un dégradé équirectangulaire, clair
     en haut et chaud en bas. Il ne se voit jamais — il ne sert qu'aux reflets.
     Sombre, il éteignait l'orange : sur une matière un peu métallique, c'est
     l'environnement qui fait la couleur. */
  const envTexture = (() => {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 128;
    const g = c.getContext("2d")!;
    const d = g.createLinearGradient(0, 0, 0, 128);
    d.addColorStop(0, "#fff1e2");
    d.addColorStop(0.36, "#c49a7c");
    d.addColorStop(0.58, "#4a3a31");
    d.addColorStop(1, "#c25a22");
    g.fillStyle = d;
    g.fillRect(0, 0, 32, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const cible = pmrem.fromEquirectangular(tex);
    tex.dispose();
    pmrem.dispose();
    return cible.texture;
  })();
  scene.environment = envTexture;

  return {
    groupe: lieu,

    /* La pièce vit : la poussière dérive dans la lumière, les lames du store
       respirent, la lampe vacille imperceptiblement. Rien de spectaculaire —
       c'est l'absence totale de mouvement qui trahit un décor. */
    animer(s: number) {
      poussiere.rotation.y = s * 0.01;
      poussiere.position.y = Math.sin(s * 0.16) * 0.2;
      lames.children.forEach((lame, i) => {
        const m = lame as THREE.Mesh<
          THREE.PlaneGeometry,
          THREE.MeshBasicMaterial
        >;
        const v = m.userData.vitesse as number;
        m.material.opacity =
          (m.userData.base as number) * (0.6 + 0.4 * Math.sin(s * v * 1.6 + i));
      });
      lampe.intensity =
        reposLampe *
        (1 + (Math.sin(s * 1.7) * 0.18 + Math.sin(s * 4.3) * 0.07) /
          REPOS_LAMPE);

      /* La vapeur monte, s'enroule, et recommence en bas. L'enroulement suit
         la hauteur autant que le temps, et l'écart s'ouvre en montant : sans
         ça les vingt-quatre points ondulent tous ensemble et on voit une
         file indienne, pas un filet de vapeur. */
      const pv = geoVapeur.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < NB_VAPEUR; i++) {
        let y = pv.getY(i) + 0.0022;
        if (y > VAPEUR_HAUT) y = VAPEUR_BAS;
        const monte = (y - VAPEUR_BAS) / (VAPEUR_HAUT - VAPEUR_BAS);
        pv.setY(i, y);
        pv.setX(i, 0.75 + Math.sin(y * 9 + s * 0.9 + i) * 0.05 * monte);
        pv.setZ(i, -1.45 + Math.cos(y * 7 + s * 0.7 + i) * 0.045 * monte);
      }
      pv.needsUpdate = true;
    },

    detruire() {
      aRanger.forEach((r) => r.dispose());
      envTexture.dispose();
      scene.environment = null;
      scene.fog = null;
    },
  };
}
