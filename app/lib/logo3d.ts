import * as THREE from "three";

/**
 * Le logo TH Coaching en volume : une tresse de deux anneaux.
 *
 * Deux boucles allongées, croisées à angle droit et entrelacées — quatre
 * lobes sur les diagonales, un carré au milieu. Elle est calculée, pas
 * importée : aucun fichier de modèle à télécharger, et surtout aucun fond à
 * détourer, puisqu'il n'y a pas d'image.
 *
 * Le module est partagé par l'intro et par le fond du site : les deux
 * montrent exactement le même objet, sinon le passage de l'un à l'autre se
 * voit.
 */

/** Le logo éteint, allumé, et la lueur propre à la matière. */
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

/* ---- Les proportions de la marque ----
   Elles se lisent dans l'ordre : la boucle, puis le ruban qui la parcourt. */

/** Demi-longueur de la partie droite de la boucle. */
const DEMI = 0.8;
/** Rayon des deux bouts ronds. */
const RAYON = 0.46;
/** Largeur du ruban, et son épaisseur : un méplat, pas une corde. */
const LARGEUR = 0.38;
const EPAISSEUR = 0.12;
/**
 * Amplitude de l'entrelacement. Elle doit dépasser l'épaisseur du ruban —
 * sinon les deux anneaux se traversent au lieu de passer l'un sur l'autre.
 */
const ONDULE = 0.105;

/** Encombrement final de la tresse, une fois montée. */
const TAILLE = 2.1;

const AME = 220; // échantillons le long de la boucle
const SECTION = 24; // points de la section du ruban

/**
 * L'âme d'une boucle : un stade — deux droites, deux demi-cercles — parcouru
 * avec une ondulation en profondeur.
 *
 * L'ondulation vaut −A·sin(2θ), où θ est l'angle polaire du point. Cette
 * fonction a exactement la forme qu'il faut : elle atteint ±A aux quatre
 * croisements, qui tombent aux quatre diagonales, et s'annule entre eux. Le
 * ruban passe donc devant puis derrière sans qu'on ait à forcer sa courbe.
 */
function ame(n: number) {
  const droit = 2 * DEMI;
  const arc = Math.PI * RAYON;
  const perim = 2 * droit + 2 * arc;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const s = (i / n) * perim;
    let x: number;
    let y: number;
    if (s < droit) {
      x = -DEMI + s;
      y = RAYON;
    } else if (s < droit + arc) {
      const a = (s - droit) / RAYON;
      x = DEMI + Math.sin(a) * RAYON;
      y = Math.cos(a) * RAYON;
    } else if (s < 2 * droit + arc) {
      x = DEMI - (s - droit - arc);
      y = -RAYON;
    } else {
      const a = (s - 2 * droit - arc) / RAYON;
      x = -DEMI - Math.sin(a) * RAYON;
      y = -Math.cos(a) * RAYON;
    }
    pts.push(new THREE.Vector3(x, y, -ONDULE * Math.sin(2 * Math.atan2(y, x))));
  }
  return pts;
}

/**
 * La section du ruban : un stade, large et mince, aux bords pleins.
 *
 * On rend aussi la normale du contour, et pas seulement le décalage du
 * point. Les deux ne coïncident que sur un tube rond : sur une face plate, la
 * normale est franchement perpendiculaire alors que le décalage pointe en
 * biais vers le coin. Confondre les deux zébrait le ruban de bandes de
 * lumière.
 */
function section(n: number) {
  const r = EPAISSEUR / 2;
  const d = LARGEUR / 2 - r;
  const q: [number, number, number, number][] = [];
  const demi = Math.max(2, Math.round(n / 2));
  for (let i = 0; i <= demi; i++) {
    const a = -Math.PI / 2 + (i / demi) * Math.PI;
    q.push([d + Math.cos(a) * r, Math.sin(a) * r, Math.cos(a), Math.sin(a)]);
  }
  for (let i = 0; i <= demi; i++) {
    const a = Math.PI / 2 + (i / demi) * Math.PI;
    q.push([-d + Math.cos(a) * r, Math.sin(a) * r, Math.cos(a), Math.sin(a)]);
  }
  q.pop();
  return q;
}

/** Balaie la section le long de l'âme et referme la boucle. */
function ruban(centre: THREE.Vector3[]) {
  const prof = section(SECTION);
  const K = prof.length;
  const S = centre.length;
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  const T = new THREE.Vector3();
  const W = new THREE.Vector3();
  const N = new THREE.Vector3();
  const HAUT = new THREE.Vector3(0, 0, 1);

  for (let i = 0; i < S; i++) {
    const a = centre[(i - 1 + S) % S];
    const b = centre[(i + 1) % S];
    const c = centre[i];
    T.subVectors(b, a).normalize();
    /* Le repère se construit sur un « haut » fixe et non sur la courbure : un
       repère de Frenet vrille le long d'une boucle fermée, et le ruban se
       retrouverait tordu au raccord. */
    W.crossVectors(T, HAUT).normalize();
    N.crossVectors(W, T).normalize();
    for (let k = 0; k < K; k++) {
      const [u, v, nu, nv] = prof[k];
      pos.push(
        c.x + W.x * u + N.x * v,
        c.y + W.y * u + N.y * v,
        c.z + W.z * u + N.z * v
      );
      nor.push(
        W.x * nu + N.x * nv,
        W.y * nu + N.y * nv,
        W.z * nu + N.z * nv
      );
    }
  }
  for (let i = 0; i < S; i++) {
    const j = (i + 1) % S;
    for (let k = 0; k < K; k++) {
      const m = (k + 1) % K;
      const a = i * K + k;
      const b = i * K + m;
      const c = j * K + k;
      const d = j * K + m;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

export type Logo3D = {
  /** L'ensemble, à sa taille finale. */
  groupe: THREE.Group;
  /** Les deux anneaux, chacun dans son pivot — ils s'animent séparément. */
  anneaux: THREE.Object3D[];
  /** Leurs matières, une par anneau : ils s'allument l'un après l'autre. */
  matieres: THREE.MeshStandardMaterial[];
  detruire: () => void;
};

/**
 * Monte la tresse.
 *
 * `couleur` est la teinte de départ : éteinte pour l'intro, qui allume les
 * anneaux l'un après l'autre ; déjà allumée pour le fond du site, où il n'y a
 * rien à raconter.
 */
export function construireLogo(
  reglages: { couleur?: number; ombres?: boolean } = {}
): Logo3D {
  const { couleur = ETEINTE, ombres = true } = reglages;

  const groupe = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const matieres: THREE.MeshStandardMaterial[] = [];
  const anneaux: THREE.Object3D[] = [];

  const centre = ame(AME);

  /* Le second anneau est le premier tourné d'un quart de tour. Il n'a pas
     besoin d'ondulation propre : la rotation décale θ de 90°, donc sin(2θ)
     change de signe, et l'entrelacement se fait tout seul. */
  [0, Math.PI / 2].forEach((tour) => {
    const geo = ruban(centre);
    geos.push(geo);

    /* Une matière mate : pas de vernis, pas de métal. Elle reçoit en revanche
       presque toute la lumière d'environnement — une surface mate la répand
       au lieu de la réfléchir, et la brider éteignait l'orange. */
    const matiere = new THREE.MeshStandardMaterial({
      color: couleur,
      metalness: 0,
      roughness: 0.58,
      envMapIntensity: 0.95,
      emissive: LUEUR,
      emissiveIntensity: 0,
    });
    matieres.push(matiere);

    const maille = new THREE.Mesh(geo, matiere);
    maille.castShadow = ombres;
    maille.receiveShadow = ombres;
    maille.rotation.z = tour;

    /* Chaque anneau pivote sur lui-même : sans pivot propre, une rotation le
       ferait décrire un grand arc autour du centre de la tresse. */
    const pivot = new THREE.Group();
    pivot.userData.repos = new THREE.Vector3(0, 0, 0);
    pivot.add(maille);
    anneaux.push(pivot);
    groupe.add(pivot);
  });

  // Les bouts ronds sur les diagonales, comme sur la marque
  groupe.rotation.z = Math.PI / 4;

  /* La taille se mesure, elle ne se devine pas : les proportions ci-dessus
     décrivent la forme, pas son encombrement. Le porteur met la tresse à
     l'échelle attendue quelles que soient elles. */
  const porteur = new THREE.Group();
  porteur.add(groupe);
  const boite = new THREE.Box3().setFromObject(porteur);
  const t = boite.getSize(new THREE.Vector3());
  porteur.scale.setScalar(TAILLE / Math.max(t.x, t.y));

  return {
    groupe: porteur,
    anneaux,
    matieres,
    detruire() {
      geos.forEach((g) => g.dispose());
      matieres.forEach((m) => m.dispose());
    },
  };
}
