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
  matieres: THREE.MeshPhysicalMaterial[];
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

  const ciel = new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 24),
    new THREE.MeshBasicMaterial({
      map: cielTexture,
      side: THREE.BackSide,
      fog: false, // le ciel EST le lointain : la brume n'a pas à le manger
    })
  );
  scene.add(ciel);

  // La brume commence tôt : c'est elle qui efface la ligne d'horizon
  scene.fog = new THREE.Fog(0x22120a, 7, 23);

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
  const matieres: THREE.MeshPhysicalMaterial[] = [];
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

    const matiere = new THREE.MeshPhysicalMaterial({
      color: ETEINTE,
      metalness: 0.28,
      roughness: 0.36,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      envMapIntensity: 0.55,
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

  groupe.scale.setScalar(0.021);
  groupe.position.x = 0.85; // le logo à droite, les mots à sa gauche
  scene.add(groupe);

  // ---- Les trois mots, posés dans la scène ----
  const mots: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];

  /* La toile est taillée sur la mesure du mot, pas l'inverse : à largeur
     fixe, « Perfectionnement » débordait et se retrouvait amputé de ses
     premières lettres. La hauteur du plan reste la même pour les trois, sa
     largeur suit celle du texte. */
  const HAUTEUR_MOT = 0.3;
  const CORPS = 72;
  const MARGE = 24;

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
    // Alignés à droite sur une même marge, quelle que soit leur longueur
    plan.position.set(-0.75 - largeur / 2, 0.63 - i * 0.63, 0.16);
    plan.userData.repos = plan.position.clone();
    scene.add(plan);
    mots.push(plan);
  });

  /* Le sol : une vraie surface, et non un simple receveur d'ombre. En
     transparent, l'ombre se détachait sur le fond CSS comme une dalle
     posée dans le vide. Avec une matière et la brume, elle s'éteint dans
     le lointain et le logo se met enfin à reposer sur quelque chose. */
  const sol = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({
      color: 0x2b1a12,
      roughness: 0.92,
      metalness: 0.05,
    })
  );
  sol.rotation.x = -Math.PI / 2;
  sol.position.y = -1.62;
  sol.receiveShadow = true;
  scene.add(sol);

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

  // ---- Cadrage ----
  const cadrer = () => {
    const l = hote.clientWidth || 1;
    const h = hote.clientHeight || 1;
    renderer.setSize(l, h, false);
    camera.aspect = l / h;
    /* Sous un certain rapport, les mots ne tiennent plus à côté du logo :
       on recule, et le logo revient au centre. */
    const etroit = camera.aspect < 1.15;
    groupe.position.x = etroit ? 0 : 0.85;
    mots.forEach((m) => {
      m.visible = !etroit;
    });
    camera.position.set(0, 0, etroit ? 6.4 : 8.4);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  cadrer();
  window.addEventListener("resize", cadrer);

  // ---- Boucle ----
  let raf = 0;
  let derniere = 0;
  const intervalles: number[] = [];
  const tick = () => {
    const t = performance.now();
    if (derniere) intervalles.push(t - derniere);
    derniere = t;
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
      envTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
