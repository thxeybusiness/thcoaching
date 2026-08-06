import * as THREE from "three";

/**
 * La scène 3D de l'intro : les trois vagues du logo, en volume, et les trois
 * mots posés dans l'espace avec elles.
 *
 * Le module est chargé à la volée par l'intro, et seulement si le navigateur
 * le rapporte à temps — l'intro dure une seconde, elle ne doit jamais
 * attendre après lui. Sans lui, l'intro joue sa version plate.
 *
 * La géométrie est fabriquée depuis les courbes du logo : aucun fichier de
 * modèle à télécharger, et la forme reste celle de la marque au point de
 * contrôle près.
 */

/** Les trois vagues, par les quatre ordonnées qui les décrivent dans le
 *  repère du logo (viewBox 120 × 120, y vers le bas). */
const VAGUES = [
  [20, 14, 34, 40],
  [49, 43, 63, 69],
  [78, 72, 92, 98],
];

function formeVague(v: number[]) {
  const f = new THREE.Shape();
  f.moveTo(12, v[0]);
  f.bezierCurveTo(44, v[0] - 16, 76, v[0] + 14, 108, v[1]);
  f.lineTo(108, v[2]);
  f.bezierCurveTo(76, v[2] + 20, 44, v[2] - 10, 12, v[3]);
  f.closePath();
  return f;
}

/** La vague éteinte, la vague allumée, et la lueur propre à la matière. */
export const ETEINTE = 0x4a1c08;
export const ALLUMEE = 0xff5a1f;
const LUEUR = 0xff8c2e;

/**
 * Part d'émission conservée au repos.
 *
 * Sans elle, tout ce qui tombe dans l'ombre — sur un objet en volume, la
 * moitié de la surface — repart vers le grenat : ce n'est pas la couleur qui
 * perd, c'est le noir qui gagne.
 */
export const EMISSIF_REPOS = 0.12;

export type SceneIntro = {
  /** Durée médiane d'une image, mesurée sur de vraies images. Voir plus bas. */
  mesurer: () => Promise<number>;
  /** Les trois vagues, de haut en bas — une par pilier. */
  vagues: THREE.Object3D[];
  /** Leurs matériaux, un par vague : elles s'allument séparément. */
  matieres: THREE.MeshStandardMaterial[];
  /** Les trois mots, posés dans la scène et non par-dessus. */
  mots: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[];
  /** L'ensemble, pour l'incliner ou le pousser vers la caméra. */
  groupe: THREE.Group;
  detruire: () => void;
};

export function monterIntro3D(
  hote: HTMLElement,
  libelles: string[]
): SceneIntro {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  /* Pas de mappage filmique : ACES tire l'orange de la marque (#ff5a1f, très
     saturé) vers un rouge sombre. Sur un logo, la fidélité de la couleur
     passe avant le rendu cinéma — la luminosité se règle aux lumières. */
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  hote.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

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

  /* Ce n'est plus un ciel mais l'ambiance de la pièce : ce qu'on aperçoit
     au-delà des murs, et ce qui teinte les angles morts. */
  const ciel = new THREE.Mesh(
    new THREE.SphereGeometry(60, 24, 16),
    new THREE.MeshBasicMaterial({
      map: cielTexture,
      side: THREE.BackSide,
      fog: false,
    })
  );
  scene.add(ciel);

  // La brume commence tôt : c'est elle qui efface la ligne d'horizon
  scene.fog = new THREE.Fog(0x22120a, 9, 34);

  /* ------------------------------------------------------------------
     Le lieu.

     Un bureau, la nuit. Tout est bâti en volumes simples — des boîtes, des
     cylindres, des cônes : aucun fichier de modèle, et l'ensemble reste
     léger. Ce n'est pas un décor réaliste, c'est un lieu reconnaissable, et
     c'est ce qui compte : on doit sentir qu'il y a quelqu'un qui travaille
     ici, pas regarder un fond.

     Ce qui fait vivre la pièce n'est pas le nombre d'objets mais la lumière :
     la lampe du bureau chauffe le plan de travail, l'écran teinte ce qui
     l'entoure, et le store découpe la lumière du dehors en lames qui
     traversent la poussière.
     ------------------------------------------------------------------ */
  const lieu = new THREE.Group();
  scene.add(lieu);

  /** Tout ce que la pièce alloue et qu'il faudra rendre au démontage. */
  const aRanger: { dispose: () => void }[] = [];

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
    m.castShadow = true;
    m.receiveShadow = true;
    lieu.add(m);
    return m;
  };

  const SOL_Y = -1.62;

  // ---- La pièce : un fond et un mur latéral, rien de plus ----
  const mur = bloc(new THREE.BoxGeometry(16, 8, 0.2), 0x1d1512, 0.95);
  mur.position.set(0, SOL_Y + 4, -5.2);
  mur.castShadow = false;

  const murCote = bloc(new THREE.BoxGeometry(0.2, 8, 10), 0x191210, 0.95);
  murCote.position.set(-7.4, SOL_Y + 4, -0.6);
  murCote.castShadow = false;

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

  const lampe = new THREE.PointLight(0xffb066, 5.5, 6.5, 2);
  lampe.position.set(1.24, SOL_Y + 1.72, -1.86);
  lieu.add(lampe);

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
  const chassis = bloc(new THREE.BoxGeometry(0.12, 3.2, 2.6), 0x241a15, 0.9);
  chassis.position.set(-7.24, SOL_Y + 2.5, -1.4);
  chassis.castShadow = false;

  const vitre = bloc(new THREE.BoxGeometry(0.04, 2.9, 2.3), 0x3a2415, 0.4, 0.2);
  vitre.position.set(-7.16, SOL_Y + 2.5, -1.4);
  vitre.castShadow = false;

  for (let i = 0; i < 9; i++) {
    const latte = bloc(new THREE.BoxGeometry(0.05, 0.16, 2.28), 0x2e211a, 0.9);
    latte.position.set(-7.1, SOL_Y + 1.2 + i * 0.32, -1.4);
    latte.rotation.z = 0.34;
  }

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
  const POUSSIERES = 700;
  const posPoussiere = new Float32Array(POUSSIERES * 3);
  for (let i = 0; i < POUSSIERES; i++) {
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

  /* Un environnement fabriqué sur place : un dégradé équirectangulaire, clair
     en haut et chaud en bas. Il ne se voit jamais — il ne sert qu'aux reflets.
     Sombre, il éteignait l'orange : sur une matière un peu métallique, c'est
     l'environnement qui fait la couleur. */
  function environnement() {
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
  }
  const envTexture = environnement();
  scene.environment = envTexture;

  // ---- Les trois vagues, chacune dans son pivot ----
  const groupe = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const matieres: THREE.MeshStandardMaterial[] = [];
  const vagues: THREE.Object3D[] = [];

  VAGUES.forEach((v) => {
    const geo = new THREE.ExtrudeGeometry(formeVague(v), {
      depth: 26,
      bevelEnabled: true,
      bevelThickness: 0.7,
      bevelSize: 0.55,
      bevelSegments: 2,
      curveSegments: 24,
    });
    geo.translate(-60, -59, -13);
    geo.scale(1, -1, 1); // repère SVG (y vers le bas) → repère 3D
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geos.push(geo);

    /* Une matière mate : pas de vernis, pas de métal. Elle reçoit en
       revanche presque toute la lumière d'environnement — une surface mate
       la répand au lieu de la réfléchir, et la brider éteignait l'orange.
       Sans vernis ni reflets, `MeshStandardMaterial` suffit : c'est un
       nuanceur plus court que le modèle physique complet. */
    const matiere = new THREE.MeshStandardMaterial({
      color: ETEINTE,
      metalness: 0,
      roughness: 0.58,
      envMapIntensity: 0.95,
      emissive: LUEUR,
      emissiveIntensity: 0,
    });
    matieres.push(matiere);

    const centre = new THREE.Vector3();
    geo.boundingBox!.getCenter(centre);

    const maille = new THREE.Mesh(geo, matiere);
    maille.position.copy(centre).negate();
    maille.castShadow = true;
    maille.receiveShadow = true;

    /* Chaque vague pivote sur elle-même : sans pivot propre, une rotation la
       ferait décrire un grand arc autour du centre du logo. */
    const pivot = new THREE.Group();
    pivot.position.copy(centre);
    pivot.userData.repos = centre.clone();
    pivot.add(maille);
    vagues.push(pivot);
    groupe.add(pivot);
  });

  /* Logo et mots forment une seule affiche : c'est elle qu'on centre et
     qu'on cadre. Placés séparément, ils débordaient de l'écran dès que le
     mot était long — « Perfectionnement » sortait par la gauche. */
  groupe.scale.setScalar(0.021);
  const affiche = new THREE.Group();
  affiche.add(groupe);
  scene.add(affiche);

  // ---- Les trois mots, posés dans la scène ----
  const mots: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];

  /* La toile est taillée sur la mesure du mot, pas l'inverse : à largeur
     fixe, « Perfectionnement » débordait et se retrouvait amputé de ses
     premières lettres. La hauteur du plan reste la même pour les trois, sa
     largeur suit celle du texte. */
  const HAUTEUR_MOT = 0.22; // discrets : ils accompagnent, ils ne pèsent pas
  const CORPS = 72;
  const MARGE = 24;
  const ECART = 0.5; // entre le bord droit des mots et le bord gauche du logo

  libelles.slice(0, 3).forEach((libelle, i) => {
    const lettres = libelle.toUpperCase().split("").join(" ");
    const police = `700 ${CORPS}px ui-monospace, Menlo, Consolas, monospace`;

    const mesure = document.createElement("canvas").getContext("2d")!;
    mesure.font = police;
    const largeurTexte = Math.ceil(mesure.measureText(lettres).width);

    const c = document.createElement("canvas");
    c.width = largeurTexte + MARGE * 2;
    c.height = Math.round(CORPS * 1.7);
    const g = c.getContext("2d")!;
    g.font = police;
    g.textAlign = "right";
    g.textBaseline = "middle";
    g.fillStyle = "#f7f3ee";
    g.fillText(lettres, c.width - MARGE, c.height / 2);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;

    const largeur = (HAUTEUR_MOT * c.width) / c.height;
    const plan = new THREE.Mesh(
      new THREE.PlaneGeometry(largeur, HAUTEUR_MOT),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
        fog: true, // les mots sont dans le décor, la brume les touche aussi
      })
    );
    /* Bord droit à zéro, quelle que soit la longueur : les trois mots sont
       alignés sur la même marge. L'affiche est recentrée juste après. */
    plan.position.set(-largeur / 2, 0.58 - i * 0.58, 0.16);
    plan.userData.repos = plan.position.clone();
    affiche.add(plan);
    mots.push(plan);
  });

  /* Le logo prend place à droite des mots, puis l'affiche entière est ramenée
     sur son centre : la composition tient au milieu de l'écran quelle que
     soit la longueur du plus long mot. */
  groupe.position.x = ECART + 1.26;
  const tailleAffiche = (() => {
    const boite = new THREE.Box3().setFromObject(affiche);
    const centre = boite.getCenter(new THREE.Vector3());
    affiche.children.forEach((e) => {
      e.position.x -= centre.x;
      if (e.userData.repos) e.userData.repos.x -= centre.x;
    });
    return boite.getSize(new THREE.Vector3());
  })();
  const logoX = groupe.position.x;

  /* Le sol : une vraie surface, et non un simple receveur d'ombre. En
     transparent, l'ombre se détachait sur le fond CSS comme une dalle
     posée dans le vide. Avec une matière et la brume, elle s'éteint dans
     le lointain et le logo se met enfin à reposer sur quelque chose. */
  const sol = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 22),
    new THREE.MeshStandardMaterial({
      color: 0x2b1a12,
      roughness: 0.92,
      metalness: 0.05,
    })
  );
  sol.rotation.x = -Math.PI / 2;
  sol.position.y = SOL_Y;
  sol.receiveShadow = true;
  lieu.add(sol);

  /* La pièce descend et recule : le logo doit flotter au-dessus du plan de
     travail, pas se poser dessus. Tout le mobilier bouge d'un bloc, les
     lumières comprises — elles appartiennent au lieu. */
  lieu.position.set(0, -0.95, -0.9);

  // ---- Lumières ----
  /* La clé est nettement en avant : posée au-dessus, elle raserait la grande
     face du logo, qui resterait dans un rouge sombre alors que la matière est
     orange. Une face plate ne s'éclaire que si la lumière la regarde. */
  const cle = new THREE.DirectionalLight(0xfff0e0, 2.15);
  cle.position.set(3.2, 7.2, 4.4);
  cle.castShadow = true;
  cle.shadow.mapSize.set(1024, 1024);
  cle.shadow.camera.left = -3.4;
  cle.shadow.camera.right = 3.4;
  cle.shadow.camera.top = 3.4;
  cle.shadow.camera.bottom = -3.4;
  cle.shadow.camera.near = 0.5;
  cle.shadow.camera.far = 22;
  cle.shadow.bias = -0.0006;
  cle.shadow.normalBias = 0.02;
  scene.add(cle);

  // La lisière reste chaude : une lisière froide grise l'orange de la marque
  const lisiere = new THREE.DirectionalLight(0xffc79c, 0.9);
  lisiere.position.set(-5.2, 1.4, -3.2);
  scene.add(lisiere);

  const braise = new THREE.PointLight(0xff6a2a, 6, 14, 2);
  braise.position.set(-1.4, -2.4, 2.6);
  scene.add(braise);

  // Un rebond depuis la place du spectateur : il débouche les creux
  const rebond = new THREE.DirectionalLight(0xffd0aa, 0.85);
  rebond.position.set(-2.6, 0.4, 6.4);
  scene.add(rebond);

  scene.add(new THREE.AmbientLight(0xffc39a, 0.82));

  /* Le cadrage se calcule, il ne se devine pas : on recule la caméra juste
     assez pour que l'affiche tienne — sur la hauteur ou sur la largeur, selon
     celle qui contraint. Le remplissage laisse volontairement de l'air : une
     composition qui touche les bords écrase tout le reste. */
  const REMPLISSAGE = 0.5;

  const cadrer = () => {
    const l = hote.clientWidth || 1;
    const h = hote.clientHeight || 1;
    renderer.setSize(l, h, false);
    camera.aspect = l / h;

    // Sur un écran étroit, les mots ne tiennent plus à côté du logo
    const etroit = camera.aspect < 1.05;
    mots.forEach((m) => {
      m.visible = !etroit;
    });
    groupe.position.x = etroit ? 0 : logoX;
    affiche.position.x = etroit ? 0 : 0;

    const largeur = etroit ? 2.52 : tailleAffiche.x;
    const fov = (camera.fov * Math.PI) / 180;
    const parHauteur = tailleAffiche.y / 2 / Math.tan(fov / 2);
    const parLargeur = largeur / 2 / Math.tan(fov / 2) / camera.aspect;
    camera.position.set(
      0,
      0,
      Math.max(parHauteur, parLargeur) / REMPLISSAGE
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  cadrer();
  window.addEventListener("resize", cadrer);

  // ---- Boucle ----
  let raf = 0;
  let derniere = 0;
  const intervalles: number[] = [];
  const depart = performance.now();
  const tick = () => {
    const t = performance.now();
    if (derniere) intervalles.push(t - derniere);
    derniere = t;

    /* La pièce vit : la poussière dérive dans la lumière, les lames du store
       respirent, la lampe vacille imperceptiblement. Rien de spectaculaire —
       c'est l'absence totale de mouvement qui trahit un décor. */
    const s = (t - depart) / 1000;
    poussiere.rotation.y = s * 0.01;
    poussiere.position.y = Math.sin(s * 0.16) * 0.2;
    lames.children.forEach((lame, i) => {
      const m = lame as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      const v = m.userData.vitesse as number;
      m.material.opacity =
        (m.userData.base as number) * (0.6 + 0.4 * Math.sin(s * v * 1.6 + i));
    });
    lampe.intensity = 5.5 + Math.sin(s * 1.7) * 0.18 + Math.sin(s * 4.3) * 0.07;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  /**
   * Combien coûte une image, pour de vrai ?
   *
   * Pas en chronométrant `render()` : l'appel empile des commandes et rend la
   * main avant que quoi que ce soit ne soit tracé — on mesurerait quelques
   * microsecondes sur une machine à genoux. On regarde donc l'écart entre
   * images réellement affichées.
   */
  const mesurer = () =>
    new Promise<number>((resoudre) => {
      const debut = intervalles.length;
      const attendre = () => {
        if (intervalles.length - debut >= 4) {
          const pris = intervalles.slice(debut).sort((a, b) => a - b);
          resoudre(pris[Math.floor(pris.length / 2)]);
          return;
        }
        requestAnimationFrame(attendre);
      };
      requestAnimationFrame(attendre);
    });

  return {
    mesurer,
    vagues,
    matieres,
    mots,
    groupe,
    detruire() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", cadrer);
      geos.forEach((g) => g.dispose());
      matieres.forEach((m) => m.dispose());
      mots.forEach((m) => {
        m.geometry.dispose();
        m.material.map?.dispose();
        m.material.dispose();
      });
      sol.geometry.dispose();
      (sol.material as THREE.Material).dispose();
      ciel.geometry.dispose();
      (ciel.material as THREE.Material).dispose();
      cielTexture.dispose();
      aRanger.forEach((r) => r.dispose());
      envTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
