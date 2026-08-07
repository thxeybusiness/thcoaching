import * as THREE from "three";
import { construireLieu } from "./lieu3d";
import { construireLogo, ETEINTE } from "./logo3d";

/**
 * La scène 3D de l'intro : les trois vagues du logo, en volume, et les trois
 * mots posés dans l'espace avec elles.
 *
 * Le module est chargé à la volée par l'intro, et seulement si le navigateur
 * le rapporte à temps — l'intro dure une seconde, elle ne doit jamais
 * attendre après lui. Sans lui, l'intro joue sa version plate.
 *
 * La pièce et le logo viennent de `lieu3d` et `logo3d`, partagés avec le fond
 * du site : c'est ce qui garantit que le rideau se lève sur le même espace,
 * vu du même endroit, et que le raccord ne se voie pas.
 */

export { ETEINTE, ALLUMEE, EMISSIF_REPOS } from "./logo3d";

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

  // Le bureau, à pleine lumière : ici, la pièce est le sujet
  const lieu = construireLieu(scene, renderer);

  // ---- Les trois vagues, chacune dans son pivot ----
  const logo = construireLogo({ couleur: ETEINTE });
  const { groupe, vagues, matieres } = logo;

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

    lieu.animer((t - depart) / 1000);

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
      logo.detruire();
      mots.forEach((m) => {
        m.geometry.dispose();
        m.material.map?.dispose();
        m.material.dispose();
      });
      lieu.detruire();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
