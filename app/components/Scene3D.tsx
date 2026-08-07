"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { construireLieu } from "../lib/lieu3d";
import { ALLUMEE, EMISSIF_REPOS, construireLogo } from "../lib/logo3d";
import { getDeckProgress } from "../lib/deck";
import { INTRO_FIN } from "../lib/intro";

/**
 * Le fond du site : la pièce de l'intro, derrière tout le contenu.
 *
 * L'intro se terminait sur un bureau en volume et le rideau se levait sur un
 * dégradé plat : deux mondes qui ne se répondaient pas. C'est la même pièce
 * qui reste ici — même géométrie, mêmes lumières, même module — et le site
 * s'écrit dessus.
 *
 * Elle n'est plus le sujet pour autant. Le remplissage est écrasé — les
 * sources visibles, elles, gardent leur force — et un voile de dégradés la
 * recouvre (voir `.world-canvas::after`). Un fond qui garde la luminosité du
 * premier plan rend le texte illisible, quelle que soit sa qualité.
 *
 * Ce qui change d'un chapitre à l'autre, ce n'est pas le décor : c'est
 * l'endroit d'où on le regarde. La caméra se déplace dans la pièce au rythme
 * du deck — elle passe devant la fenêtre, monte au-dessus du bureau, recule
 * pour le dernier écran. Le logo, lui, reste accroché à la caméra : il se
 * pose dans le coin libre de chaque chapitre.
 */

/** Une position de caméra par chapitre du deck. */
type Plan = {
  p: number;
  /** Où se tient la caméra, dans la pièce. */
  pos: [number, number, number];
  /** Ce qu'elle regarde. */
  cible: [number, number, number];
  /** Une inclinaison très légère : une image parfaitement d'aplomb est morte. */
  roulis: number;
};

/**
 * Le premier plan reprend exactement le cadrage sur lequel l'intro se termine :
 * le rideau se lève sans que la caméra ne saute.
 */
const PLANS: Plan[] = [
  // Accueil — le plan de l'intro, qui se pose doucement sur le bureau
  { p: 0.0, pos: [0, 0, 10.4], cible: [0, -0.35, -1.2], roulis: 0 },
  // Méthode — la caméra glisse vers la fenêtre, les lames du store entrent
  { p: 0.2, pos: [-2.3, 0.45, 8.6], cible: [-1.6, -0.5, -2.6], roulis: 0.012 },
  // Programme — au-dessus du plan de travail, en plongée douce
  { p: 0.4, pos: [0.6, 1.5, 7.4], cible: [0.1, -0.9, -2.9], roulis: -0.01 },
  // Écosystème — le côté droit : le lampadaire et le cadre au mur
  { p: 0.6, pos: [3.1, 0.3, 8.2], cible: [2.0, -0.5, -3.2], roulis: -0.016 },
  // À propos — bas et près, à hauteur de bureau
  { p: 0.8, pos: [-1.0, -0.75, 6.6], cible: [-0.9, -0.9, -3.0], roulis: 0.014 },
  // Contact — on recule, la pièce entière
  { p: 1.0, pos: [0.3, 0.9, 11.2], cible: [0.2, -0.6, -2.2], roulis: 0 },
];

/**
 * La place du logo sur l'écran, chapitre par chapitre.
 *
 * `x` et `y` sont donnés en fractions de la demi-image (−1 = bord gauche ou
 * bas, +1 = bord droit ou haut) et non en unités du monde : c'est le seul
 * repère qui vaille aussi bien sur un 21/9 que sur un téléphone tenu debout.
 * `o` est son intensité une fois posé : pleine sur les écrans qui ont de
 * l'espace libre, nulle sur ceux dont le centre est déjà occupé.
 */
type Pose = { p: number; x: number; y: number; s: number; o: number };

/* Petit et franc plutôt que grand et fantomatique.
 *
 * Devant un fond plat, un logo large à 20 % d'opacité passait pour une
 * texture. Devant une pièce, il ne passe plus : il se lit comme une tache
 * brune, et il débordait du cadre par le bas. Réduit et rendu à sa couleur,
 * il redevient ce qu'il doit être — un objet posé dans la pièce, dans un coin
 * que le chapitre laisse libre. */
const POSES: Pose[] = [
  // Accueil : le coin bas gauche, sous les boutons
  { p: 0.0, x: -0.82, y: -0.72, s: 0.26, o: 0.45 },
  { p: 0.2, x: 0.8, y: 0.52, s: 0.26, o: 0.42 },
  // Programme : de tous les chapitres, le seul dont aucun coin n'est libre —
  // le 360° tient le centre et ses cartes tiennent les bords. Le logo sort.
  { p: 0.4, x: -0.8, y: -0.66, s: 0.24, o: 0 },
  { p: 0.6, x: -0.82, y: -0.7, s: 0.26, o: 0.42 },
  { p: 0.8, x: 0.82, y: -0.66, s: 0.26, o: 0.44 },
  /* Dernier écran : le logo se couche derrière le wordmark. « Derrière » —
     à 0,95 d'opacité et à cette taille, il passait devant et mangeait la
     moitié du mot. */
  { p: 1.0, x: 0.62, y: -0.42, s: 0.4, o: 0.6 },
];

/** Distance du logo devant la caméra : c'est elle qui donne sa perspective. */
const PROFONDEUR_LOGO = 6;

const lissage = (t: number) => t * t * (3 - 2 * t);

/** Interpole une suite de repères classés par `p`. */
function echantillon<T extends { p: number }>(
  suite: T[],
  p: number,
  melange: (a: T, b: T, t: number) => T
): T {
  if (p <= suite[0].p) return suite[0];
  for (let i = 0; i < suite.length - 1; i++) {
    const a = suite[i];
    const b = suite[i + 1];
    if (p >= a.p && p <= b.p) {
      return melange(a, b, lissage((p - a.p) / (b.p - a.p)));
    }
  }
  return suite[suite.length - 1];
}

const entre = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ramène une valeur dans ±limite. */
const borner = (v: number, limite: number) =>
  Math.min(limite, Math.max(-limite, v));

export default function Scene3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    /* Sur un écran étroit, la pièce n'est plus qu'une ambiance : on coupe les
       deux seuls postes vraiment coûteux — les ombres portées et la moitié
       de la poussière — plutôt que de retirer du mobilier. La pièce reste la
       même, elle est seulement rendue moins cher. */
    let etroit = width < 861;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, etroit ? 1 : 1.5));
    /* Les mêmes réglages que l'intro, au réglage près : c'est la condition
       pour que l'orange soit identique de part et d'autre du rideau. ACES
       tirerait le #ff5a1f de la marque vers un rouge sombre. */
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = !etroit;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // La même focale que l'intro : une focale différente ferait sauter le raccord
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 200);
    scene.add(camera);

    const lieu = construireLieu(scene, renderer, {
      ombres: !etroit,
      poussieres: etroit ? 260 : 700,
      /* Les sources visibles gardent presque toute leur force : ce sont elles
         qui dessinent la pièce. C'est le remplissage qu'on écrase — sans lui,
         tout ce qui n'est pas éclairé retombe dans le noir, et le texte a de
         quoi se poser. */
      intensite: 0.9,
      ambiance: 0.28,
      // La brume est repoussée : de si loin, elle noyait le fond dans un brun plat
      brume: [16, 52],
      // La caméra parcourt la pièce : le cône d'ombre doit la couvrir en entier
      portee: 6.5,
    });

    /* Le logo est accroché à la caméra et non posé dans la pièce : il doit se
       ranger dans le coin libre de chaque chapitre, ce qui est une position à
       l'écran — pas une position dans le décor. Accroché ainsi, il garde
       malgré tout l'éclairage du lieu, puisque les lumières, elles, restent
       dans le monde. */
    const logo = construireLogo({ couleur: ALLUMEE, ombres: false });
    logo.matieres.forEach((m) => {
      m.transparent = true;
      m.opacity = 0;
      m.emissiveIntensity = EMISSIF_REPOS;
    });
    logo.groupe.scale.setScalar(0.021);
    const porteur = new THREE.Group();
    porteur.add(logo.groupe);
    porteur.position.z = -PROFONDEUR_LOGO;
    camera.add(porteur);

    /* Son encombrement, mesuré une fois : les poses sont écrites pour un
       écran d'ordinateur, et sur un téléphone tenu debout la demi-largeur
       fond de moitié — le logo sortait du cadre par la gauche. On le mesure
       plutôt que de le supposer : la forme peut changer, pas ce calcul. */
    const boite = new THREE.Box3().setFromObject(logo.groupe);
    const demiLogo = boite.getSize(new THREE.Vector3()).multiplyScalar(0.5);

    /* Sa propre clé, accrochée à la caméra elle aussi.
       Le remplissage de la pièce est écrasé et les lampes du bureau sont à
       plusieurs unités derrière : il ne restait au logo que la lumière
       d'environnement, qui arrive de partout à la fois — un aplat orange sans
       la moindre arête. Cette lampe-ci l'éclaire en biais et lui rend son
       volume. Sa portée est courte : à 3,4 unités elle meurt bien avant le
       mobilier, la pièce ne s'en aperçoit pas. */
    const cleLogo = new THREE.PointLight(0xffd9b3, 0, 3.4, 2);
    camera.add(cleLogo);

    // ---- Interactions ----
    const viseSouris = new THREE.Vector2(0, 0);
    const souris = new THREE.Vector2(0, 0);
    const surSouris = (e: PointerEvent) => {
      viseSouris.set(e.clientX / width - 0.5, 0.5 - e.clientY / height);
    };
    window.addEventListener("pointermove", surSouris, { passive: true });

    const surRedimension = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      etroit = width < 861;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, etroit ? 1 : 1.5)
      );
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", surRedimension);

    // ---- Boucle ----
    const horloge = new THREE.Clock();
    const melangePlan = (a: Plan, b: Plan, t: number): Plan => ({
      p: 0,
      pos: [
        entre(a.pos[0], b.pos[0], t),
        entre(a.pos[1], b.pos[1], t),
        entre(a.pos[2], b.pos[2], t),
      ],
      cible: [
        entre(a.cible[0], b.cible[0], t),
        entre(a.cible[1], b.cible[1], t),
        entre(a.cible[2], b.cible[2], t),
      ],
      roulis: entre(a.roulis, b.roulis, t),
    });
    const melangePose = (a: Pose, b: Pose, t: number): Pose => ({
      p: 0,
      x: entre(a.x, b.x, t),
      y: entre(a.y, b.y, t),
      s: entre(a.s, b.s, t),
      o: entre(a.o, b.o, t),
    });

    const regard = new THREE.Vector3();
    let arrivee = reduce ? 1 : 0; // l'entrée en scène, une fois le rideau levé
    let pageP = 0;
    let voyage = 0; // vitesse de déplacement lissée, pour le fondu
    let raf = 0;

    const tick = () => {
      // Onglet en arrière-plan : on garde la boucle vivante mais on ne rend rien
      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const t = horloge.getElapsedTime();

      /* La pièce entre en fondu quand le rideau se lève, pas avant : sinon
         elle s'anime derrière l'intro et le site apparaît déjà figé. */
      if (arrivee < 1) {
        const p = Math.min(Math.max(t - INTRO_FIN, 0) / 1.4, 1);
        arrivee = 1 - Math.pow(1 - p, 3);
      }
      mount.style.opacity = String(arrivee);

      souris.lerp(viseSouris, 0.05);

      // Progression 0→1 sur l'ensemble des écrans du deck (avec inertie)
      const brut = getDeckProgress();
      pageP += (brut - pageP) * 0.11;

      /* Le logo s'efface pendant qu'il voyage d'un chapitre à l'autre : sinon
         il traverse le texte de l'écran d'arrivée. Il revient une fois posé. */
      voyage += (Math.abs(brut - pageP) - voyage) * 0.18;
      const pose = 1 - Math.min(1, voyage * 16);

      // ---- La caméra dans la pièce ----
      const plan = echantillon(PLANS, pageP, melangePlan);
      /* La dérive et le parallaxe s'ajoutent au plan du chapitre : sans eux
         la caméra est parfaitement immobile entre deux écrans, et une caméra
         immobile devant un décor le dénonce comme décor. */
      camera.position.set(
        plan.pos[0] + souris.x * 0.55 + Math.sin(t * 0.11) * 0.16,
        plan.pos[1] + souris.y * 0.3 + Math.sin(t * 0.083) * 0.1,
        plan.pos[2]
      );
      regard.set(plan.cible[0], plan.cible[1], plan.cible[2]);
      camera.lookAt(regard);
      camera.rotateZ(plan.roulis + Math.sin(t * 0.07) * 0.004);

      // ---- Le logo, à sa place sur l'écran ----
      const p = echantillon(POSES, pageP, melangePose);
      const demiHauteur =
        Math.tan(((camera.fov * Math.PI) / 180) / 2) * PROFONDEUR_LOGO;
      const demiLargeur = demiHauteur * camera.aspect;
      const respire = 1 + Math.sin(t * 0.8) * 0.04;

      /* L'échelle d'abord, la position ensuite : c'est elle qui décide de
         l'encombrement, donc de la marge qui reste avant le bord. */
      const echelle = p.s * (etroit ? 0.6 : 1) * respire;
      porteur.scale.setScalar(echelle);
      const limiteX = Math.max(0, demiLargeur - demiLogo.x * echelle - 0.04);
      const limiteY = Math.max(0, demiHauteur - demiLogo.y * echelle - 0.04);
      porteur.position.x = borner(p.x * demiLargeur, limiteX);
      porteur.position.y = borner(p.y * demiHauteur, limiteY);
      porteur.rotation.set(
        -0.12 + souris.y * -0.16,
        0.1 + Math.sin(t * 0.25) * 0.12 + souris.x * 0.24,
        Math.sin(t * 0.35) * 0.06
      );

      const opacite = p.o * (0.12 + 0.88 * pose * pose) * arrivee;
      logo.matieres.forEach((m) => {
        m.opacity = opacite;
      });
      logo.groupe.visible = opacite > 0.004;

      // La clé suit le logo, en haut à droite et un peu en avant, et s'éteint avec lui
      cleLogo.position.set(
        porteur.position.x + 0.6,
        porteur.position.y + 0.75,
        -PROFONDEUR_LOGO + 1.5
      );
      cleLogo.intensity = 3.4 * opacite;

      lieu.animer(t);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", surSouris);
      window.removeEventListener("resize", surRedimension);
      logo.detruire();
      lieu.detruire();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="world-canvas" aria-hidden="true" />;
}
