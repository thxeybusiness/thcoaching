import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * La scène 3D de l'intro : les trois vagues du logo, en volume.
 *
 * Le module est chargé à la volée par l'intro, et seulement si le navigateur
 * le rapporte à temps — l'intro dure une seconde, elle ne doit jamais
 * attendre après lui. Sans lui, l'intro joue sa version plate.
 *
 * Comme sur le reste du site, la géométrie est fabriquée depuis le SVG de la
 * marque : aucun fichier de modèle à télécharger.
 */

const LOGO = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><path d='M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z'/><path d='M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z'/><path d='M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z'/></svg>`;

/** La vague éteinte, et la vague allumée.
 *
 * L'éteinte n'est pas noire mais une braise : un matériau quasi noir prend
 * toute la lumière de la lisière froide et vire au gris — on croirait du
 * plastique, pas du métal éteint. */
export const ETEINTE = 0x4a1c08;
export const ALLUMEE = 0xff5a1f;

export type SceneIntro = {
  /** Durée médiane d'une image, mesurée sur de vraies images. Voir plus bas. */
  mesurer: () => Promise<number>;
  /** Les trois vagues, de haut en bas — une par pilier. */
  vagues: THREE.Object3D[];
  /** Leurs matériaux, un par vague : elles s'allument séparément. */
  matieres: THREE.MeshPhysicalMaterial[];
  /** L'ensemble, pour l'incliner ou le pousser vers la caméra. */
  groupe: THREE.Group;
  detruire: () => void;
};

export function monterIntro3D(hote: HTMLElement): SceneIntro {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.72;
  /* Les trois vagues s'ombrent les unes les autres : sans ça elles flottent
     côte à côte et le volume ne se lit pas. Carte réduite de moitié par
     rapport au rendu fixe — à cette taille, personne ne verra la
     différence, et l'intro doit rester légère. */
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  hote.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const environnement = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environnement.texture;

  // ---- Les trois vagues ----
  const groupe = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const matieres: THREE.MeshPhysicalMaterial[] = [];
  const vagues: THREE.Object3D[] = [];

  new SVGLoader().parse(LOGO).paths.forEach((p) => {
    SVGLoader.createShapes(p).forEach((forme) => {
      const geo = new THREE.ExtrudeGeometry(forme, {
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
      geos.push(geo);

      const matiere = new THREE.MeshPhysicalMaterial({
        color: ETEINTE,
        metalness: 0.55,
        roughness: 0.42,
        clearcoat: 0.2,
        clearcoatRoughness: 0.45,
        envMapIntensity: 0.3,
        emissive: ALLUMEE,
        emissiveIntensity: 0,
      });
      matieres.push(matiere);

      /* Chaque vague est posée dans son propre pivot, centré sur elle : sans
         ça une rotation la ferait tourner autour du centre du logo et la
         vague du haut décrirait un grand arc au lieu de basculer sur place. */
      geo.computeBoundingBox();
      const centre = new THREE.Vector3();
      geo.boundingBox!.getCenter(centre);

      const maille = new THREE.Mesh(geo, matiere);
      maille.position.copy(centre).negate();
      maille.castShadow = true;
      maille.receiveShadow = true;

      const pivot = new THREE.Group();
      pivot.position.copy(centre);
      pivot.add(maille);
      vagues.push(pivot);
      groupe.add(pivot);
    });
  });

  groupe.scale.setScalar(0.021);
  scene.add(groupe);

  // ---- Lumières ----
  const cle = new THREE.DirectionalLight(0xfff2e6, 2.3);
  cle.position.set(4.6, 6.2, 1.8);
  cle.castShadow = true;
  cle.shadow.mapSize.set(512, 512);
  cle.shadow.camera.left = -2.6;
  cle.shadow.camera.right = 2.6;
  cle.shadow.camera.top = 2.6;
  cle.shadow.camera.bottom = -2.6;
  cle.shadow.camera.near = 0.5;
  cle.shadow.camera.far = 16;
  cle.shadow.bias = -0.0006;
  cle.shadow.normalBias = 0.02;
  scene.add(cle);

  /* Lisière plus douce et moins froide qu'au rendu fixe : à cette taille et
     sur une vague éteinte, elle grisait tout. */
  const lisiere = new THREE.DirectionalLight(0xd8dcf0, 1.1);
  lisiere.position.set(-5, 1.2, -3.4);
  scene.add(lisiere);

  const bas = new THREE.PointLight(0xff4a12, 9, 12, 2);
  bas.position.set(-1.2, -2.8, 2.2);
  scene.add(bas);

  scene.add(new THREE.AmbientLight(0xffffff, 0.1));

  // ---- Cadrage ----
  const cadrer = () => {
    const l = hote.clientWidth || 1;
    const h = hote.clientHeight || 1;
    renderer.setSize(l, h, false);
    camera.aspect = l / h;
    /* Le logo occupe une part fixe de la boîte, quelle que soit sa forme :
       on recule sur la contrainte la plus serrée des deux. */
    const fov = (camera.fov * Math.PI) / 180;
    const parHauteur = 1.05 / Math.tan(fov / 2);
    const parLargeur = 1.26 / Math.tan(fov / 2) / camera.aspect;
    camera.position.set(0, 0, Math.max(parHauteur, parLargeur) / 0.82);
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
   * Pas en chronométrant `render()` : l'appel empile des commandes et rend
   * la main avant que quoi que ce soit ne soit tracé — on mesurerait
   * quelques microsecondes sur une machine à genoux. On regarde donc
   * l'écart entre images réellement affichées.
   *
   * L'intro ne dure qu'une seconde : la mesure se fait pendant qu'elle joue,
   * et l'appelant retire le volume en cours de route s'il est trop cher.
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
    groupe,
    detruire() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", cadrer);
      geos.forEach((g) => g.dispose());
      matieres.forEach((m) => m.dispose());
      environnement.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
