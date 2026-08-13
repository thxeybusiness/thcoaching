"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { construireLieu } from "../lib/lieu3d";
import { ALLUMEE, EMISSIF_REPOS, construireLogo } from "../lib/logo3d";
import { getDeckProgress } from "../lib/deck";

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
 * pour le dernier écran. Le logo, lui, reste accroché à la caméra : il
 * traverse l'écran d'un chapitre à l'autre et se pose dans le coin que
 * chacun laisse libre — c'est lui qui dit où l'on en est.
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
  /* Méthode — la caméra regarde vers la fenêtre. Elle glissait vers la
     gauche mais continuait de regarder droit devant : le mur percé restait
     hors champ, et la ville derrière n'a jamais été vue. Il faut viser plus à
     gauche qu'on ne se tient, sans quoi on longe le mur au lieu de regarder
     à travers. La fenêtre se pose au bord gauche, le bureau au bord droit. */
  { p: 0.34, pos: [0.2, 0.5, 7.6], cible: [-3.0, -0.35, -2.0], roulis: 0.012 },
  // Programme — au-dessus du plan de travail, en plongée douce
  { p: 0.67, pos: [0.6, 1.5, 7.4], cible: [0.1, -0.9, -2.9], roulis: -0.01 },
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
 * l'espace libre, retenue sur ceux qui sont chargés.
 */
type Pose = { p: number; x: number; y: number; s: number; o: number };

/* Le logo accompagne la progression : il change de coin à chaque chapitre, et
 * on le voit faire le trajet.
 *
 * Deux réglages décident de ça, et ce sont les seuls. La taille : trop petit,
 * il devient une vignette dans un coin et on ne remarque plus qu'il a bougé.
 * Et les côtés : les coins alternent gauche / droite d'un chapitre à l'autre,
 * de sorte que chaque déplacement traverse l'écran au lieu de le longer.
 *
 * Chaque coin est choisi sur ce que le chapitre laisse libre — sous les
 * boutons de l'accueil, au-dessus des cartes de la méthode, à gauche de
 * l'orbite du programme. */
const POSES: Pose[] = [
  // Accueil : bas gauche, sous les deux boutons
  { p: 0.0, x: -0.74, y: -0.62, s: 0.42, o: 0.5 },
  // Méthode : haut droite, le titre tient la gauche et les cartes le bas
  { p: 0.34, x: 0.72, y: 0.5, s: 0.4, o: 0.5 },
  /* Programme : le chapitre le plus chargé du deck — le 360° tient le centre
     et les compétences tout le bas. Il reste la marge gauche, à mi-hauteur ;
     le logo s'y range et s'y fait discret plutôt que d'en disparaître. */
  { p: 0.67, x: -0.82, y: 0.3, s: 0.34, o: 0.32 },
  /* Dernier écran : le logo se couche derrière le wordmark. « Derrière » —
     à pleine opacité et à pleine taille, il passait devant et mangeait la
     moitié du mot. */
  { p: 1.0, x: 0.6, y: -0.4, s: 0.5, o: 0.7 },
];

/** Distance de la marque devant sa caméra. */
const PROFONDEUR_LOGO = 6;

/**
 * Demi-hauteur du cadre de la marque, dans ses unités à elle.
 *
 * C'est la hauteur qu'occupait le champ de 28° à six unités, du temps où la
 * marque était vue en perspective. Elle est conservée telle quelle : toutes
 * les places et toutes les tailles écrites plus haut restent valables, seule
 * la façon de projeter change.
 */
const DEMI_CADRE = Math.tan(((28 * Math.PI) / 180) / 2) * PROFONDEUR_LOGO;

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
    // Deux passes par image : c'est la boucle qui décide quand effacer
    renderer.autoClear = false;
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

    /* ---- La marque, sur la vitre ----
       Elle n'est pas dans la pièce, elle est devant : sa place est une place
       à l'écran — le coin que le chapitre laisse libre — pas une place dans
       le décor.

       Elle était pourtant dessinée dans la même profondeur que le décor,
       simplement accrochée à la caméra à six unités devant elle. Or six
       unités devant la caméra, ça tombe en plein dans la pièce : au chapitre
       un chapitre la marque atterrissait à hauteur de bureau, et pendant le
       défilement la caméra balaie tout le volume, donc la marque traversait
       le bureau, la chaise, l'écran, les plantes. Le mobilier la découpait,
       morceau par morceau. On ne voyait pas un objet passer derrière un
       autre — la marque n'est pas dans la pièce, rien ne dit qu'elle devrait
       passer derrière quoi que ce soit — on voyait une forme se déformer.

       Elle a donc sa propre scène, dessinée par-dessus la pièce sur une
       profondeur remise à zéro. Rien ne peut plus la couper. Et sa lumière
       vient avec elle : de la pièce, dont les lampes défilaient, elle ne
       gardait qu'un éclairage qui changeait à chaque chapitre. */
    const marque = new THREE.Scene();

    /* Elle est vue sans perspective, et c'est le point.
       Vue en perspective, un objet posé au bord du cadre est regardé de
       biais : ses faces se raccourcissent, ses lobes s'ovalisent, et le
       défaut grandit à mesure qu'il s'éloigne du centre. Or cette marque
       passe justement son temps à changer de coin. Elle se déformait donc à
       chaque chapitre, différemment à chaque fois — et d'autant plus sur un
       écran large, où les coins sont les plus excentrés.

       Sans perspective, elle se projette exactement pareil partout : même
       forme au centre et dans un angle, sur un 21/9 comme sur un téléphone.
       Elle garde son volume — la lumière le lui donne — mais plus rien ne la
       tord. C'est ce qu'on attend d'une marque : qu'elle soit reconnaissable,
       pas qu'elle soit en situation. */
    const camMarque = new THREE.OrthographicCamera(
      -DEMI_CADRE * (width / height),
      DEMI_CADRE * (width / height),
      DEMI_CADRE,
      -DEMI_CADRE,
      0.1,
      40
    );

    const logo = construireLogo({ couleur: ALLUMEE, ombres: false });
    logo.matieres.forEach((m) => {
      m.transparent = true;
      m.opacity = 0;
      m.emissiveIntensity = EMISSIF_REPOS;
    });
    const porteur = new THREE.Group();
    porteur.add(logo.groupe);
    porteur.position.z = -PROFONDEUR_LOGO;
    marque.add(porteur);

    /* La matière garde le reflet de la pièce : c'est ce qui empêche la marque
       de se détacher du décor comme une vignette collée dessus. La lumière,
       elle, ne vient plus de la pièce — seul le reflet en vient. */
    marque.environment = scene.environment;

    /* Son encombrement, mesuré une fois : les poses sont écrites pour un
       écran d'ordinateur, et sur un téléphone tenu debout la demi-largeur
       fond de moitié — le logo sortait du cadre par la gauche. On le mesure
       plutôt que de le supposer : la forme peut changer, pas ce calcul. */
    const boite = new THREE.Box3().setFromObject(logo.groupe);
    const demiLogo = boite.getSize(new THREE.Vector3()).multiplyScalar(0.5);

    /* Sa clé, qui la suit dans son coin : elle l'éclaire en biais et lui rend
       son volume. Sans elle il ne resterait que la lumière d'environnement,
       qui arrive de partout à la fois — un aplat orange sans la moindre
       arête. */
    const cleLogo = new THREE.PointLight(0xffd9b3, 0, 3.4, 2);
    marque.add(cleLogo);

    /* Et de quoi ne pas laisser le reste tomber dans le noir. Cette part-là
       venait de la pièce, dont la caméra s'éloignait et se rapprochait sans
       cesse : d'un chapitre à l'autre la marque virait du plein orange au
       marron. Fixe, elle est enfin la même partout. */
    const jourMarque = new THREE.DirectionalLight(0xffe0c2, 0.85);
    jourMarque.position.set(-0.6, 0.9, 1);
    marque.add(jourMarque);
    marque.add(new THREE.AmbientLight(0xffd2ad, 0.42));

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
      camMarque.left = -DEMI_CADRE * camera.aspect;
      camMarque.right = DEMI_CADRE * camera.aspect;
      camMarque.updateProjectionMatrix();
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

      /* La pièce entre en fondu dès qu'elle est là.
         Elle attendait `INTRO_FIN` avant de commencer — pour ne pas s'animer
         derrière l'intro. Mais cette horloge-ci part du montage de la pièce,
         pas du chargement de la page : la pièce, montée pile au moment où le
         rideau se lève, réattendait donc toute la durée de l'intro avant de
         seulement commencer à apparaître, puis mettait encore une seconde et
         demie à le faire. Sept secondes de page nue à l'arrivée, et quatre
         sur les pages intérieures, où l'intro ne joue même pas.

         L'attente n'a plus lieu d'être : le montage est désormais commandé
         par l'éclat de l'intro, donc « quand la pièce est là » et « quand le
         rideau se lève » sont le même instant. */
      if (arrivee < 1) {
        const p = Math.min(t / 0.55, 1);
        arrivee = 1 - Math.pow(1 - p, 3);
      }
      mount.style.opacity = String(arrivee);

      souris.lerp(viseSouris, 0.05);

      // Progression 0→1 sur l'ensemble des écrans du deck (avec inertie)
      const brut = getDeckProgress();
      pageP += (brut - pageP) * 0.11;

      /* Le logo faiblit pendant qu'il voyage d'un chapitre à l'autre — il
         passe alors au-dessus du texte de l'écran d'arrivée — mais il ne
         s'efface pas : c'est précisément le trajet qu'on doit voir. Tombé à
         12 %, il disparaissait le temps du voyage et réapparaissait ailleurs,
         ce qui ne raconte plus rien. */
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
      const demiHauteur = DEMI_CADRE;
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
      /* Une inclinaison de quelques degrés, et rien de plus.
         Elle allait jusqu'à vingt degrés, et suivait la souris par-dessus le
         marché. Sur un objet plat, vingt degrés ne se lisent pas comme une
         inclinaison : ils se lisent comme un écrasement — les lobes ronds
         deviennent ovales, et comme la tresse est posée sur ses diagonales,
         l'écrasement tombe de biais et tord la forme. Réduite à trois ou
         quatre degrés, elle ne fait plus que ce qu'on lui demande : accrocher
         la lumière sur l'arête du ruban pour qu'on voie l'épaisseur. Et elle
         ne suit plus la souris : le décor a déjà son parallaxe, la marque n'a
         pas à bouger quand on ne lui demande rien. */
      porteur.rotation.set(
        -0.05,
        0.06 + Math.sin(t * 0.22) * 0.035,
        Math.sin(t * 0.3) * 0.012
      );

      const opacite = p.o * (0.45 + 0.55 * pose * pose) * arrivee;
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

      /* Deux passes. La pièce d'abord, puis la marque sur une profondeur
         remise à zéro : c'est cette remise à zéro qui fait qu'aucun meuble ne
         peut plus la découper. Entre ses deux anneaux, en revanche, la
         profondeur compte toujours — c'est elle qui les entrelace — et elle
         est bien conservée à l'intérieur de la passe. */
      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(marque, camMarque);

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
