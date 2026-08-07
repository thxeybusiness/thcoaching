import * as THREE from "three";

/**
 * Le logo TH Coaching en volume : trois vagues extrudées.
 *
 * La géométrie est fabriquée depuis les courbes de la marque — aucun fichier
 * de modèle à télécharger, et la forme reste celle du logo au point de
 * contrôle près.
 *
 * Le module est partagé par l'intro et par le fond du site : les deux doivent
 * montrer exactement le même objet, sinon le passage de l'un à l'autre se voit.
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
export const LUEUR = 0xff8c2e;

/**
 * Part d'émission conservée au repos.
 *
 * Sans elle, tout ce qui tombe dans l'ombre — sur un objet en volume, la
 * moitié de la surface — repart vers le grenat : ce n'est pas la couleur qui
 * perd, c'est le noir qui gagne.
 */
export const EMISSIF_REPOS = 0.12;

export type Logo3D = {
  /** L'ensemble des trois vagues, à l'échelle du logo. */
  groupe: THREE.Group;
  /** Les trois vagues, de haut en bas — une par pilier. */
  vagues: THREE.Object3D[];
  /** Leurs matériaux, un par vague : elles s'allument séparément. */
  matieres: THREE.MeshStandardMaterial[];
  detruire: () => void;
};

/**
 * Monte le logo.
 *
 * `couleur` est la teinte de départ : éteinte pour l'intro, qui les allume
 * une à une ; déjà allumée pour le fond du site, où il n'y a rien à raconter.
 */
export function construireLogo(
  reglages: { couleur?: number; ombres?: boolean } = {}
): Logo3D {
  const { couleur = ETEINTE, ombres = true } = reglages;

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

    /* Une matière mate : pas de vernis, pas de métal. Elle reçoit en revanche
       presque toute la lumière d'environnement — une surface mate la répand au
       lieu de la réfléchir, et la brider éteignait l'orange. Sans vernis ni
       reflets, `MeshStandardMaterial` suffit : c'est un nuanceur plus court
       que le modèle physique complet. */
    const matiere = new THREE.MeshStandardMaterial({
      color: couleur,
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
    maille.castShadow = ombres;
    maille.receiveShadow = ombres;

    /* Chaque vague pivote sur elle-même : sans pivot propre, une rotation la
       ferait décrire un grand arc autour du centre du logo. */
    const pivot = new THREE.Group();
    pivot.position.copy(centre);
    pivot.userData.repos = centre.clone();
    pivot.add(maille);
    vagues.push(pivot);
    groupe.add(pivot);
  });

  return {
    groupe,
    vagues,
    matieres,
    detruire() {
      geos.forEach((g) => g.dispose());
      matieres.forEach((m) => m.dispose());
    },
  };
}
