"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ALLUMEE, LUEUR } from "../lib/logo3d";

/**
 * Le 360°, en volume.
 *
 * L'anneau et le maillage étaient deux traits de SVG posés à plat. Ils sont
 * ici de vrais objets : un jonc rond et cinq liens qui le traversent, éclairés
 * par une lampe qui tourne autour. C'est elle qui fait le relief — un reflet
 * qui se déplace le long d'un tore dit sa rondeur bien mieux qu'un dégradé,
 * parce qu'il se déplace pour de vrai.
 *
 * La toile est posée dans l'orbite, en enfant : elle prend sa taille et suit
 * ses déplacements sans qu'on ait à la recaler. Et la caméra est
 * orthographique, réglée sur les mêmes 400 unités que le viewBox du SVG —
 * l'anneau de rayon 150 tombe donc exactement là où tombait le trait, et les
 * pastilles, qui restent en HTML, restent posées dessus.
 *
 * Le pôle choisi porte une lampe qui lui est propre. Quand on change de pôle,
 * elle ne saute pas : elle fait le tour jusqu'à lui, et l'anneau s'allume sur
 * son passage. C'est le seul endroit du site où l'on voit une lumière voyager.
 *
 * Rien de tout cela n'est indispensable : sans WebGL, sur un écran étroit ou
 * en mouvement réduit, la toile ne se monte pas et les traits du SVG restent
 * en place. C'est pour ça qu'ils ne sont masqués qu'une fois le relief prêt.
 */

/** Demi-côté du viewBox de l'orbite : la caméra couvre exactement ±200. */
const DEMI = 200;
/** Rayon de l'anneau, dans ces mêmes unités — celui du `<circle>` du SVG. */
const RAYON = 150;
/** Demi-épaisseur du jonc. */
const JONC = 4.6;

/** En dessous, on ne monte pas un second contexte WebGL pour un décor. */
const LARGEUR_MINI = 861;

/** Les cinq pôles, à leur angle sur l'anneau (0° en haut, sens horaire). */
function place(i: number, n: number) {
  const a = ((i * 360) / n - 90) * (Math.PI / 180);
  return new THREE.Vector3(Math.cos(a) * RAYON, -Math.sin(a) * RAYON, 0);
}

export default function OrbiteRelief({
  actif,
  poles,
  onPret,
}: {
  /** Le pôle sélectionné : sa lampe le rejoint. */
  actif: number;
  /** Combien de pôles : l'anneau n'en suppose aucun nombre. */
  poles: number;
  /** Prévient quand le relief est en place, pour effacer les traits à plat. */
  onPret: (pret: boolean) => void;
}) {
  const toile = useRef<HTMLCanvasElement>(null);
  /* Le pôle courant passe par une référence et non par une dépendance : la
     scène ne doit surtout pas être démontée et remontée à chaque survol. */
  const vise = useRef(actif);
  vise.current = actif;

  useEffect(() => {
    const canvas = toile.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < LARGEUR_MINI) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return; // pas de WebGL : les traits du SVG font le travail
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    /* Les mêmes réglages que la pièce et que l'intro : sans quoi le #ff5a1f
       de la marque ne serait pas le même orange d'un bout à l'autre du site. */
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -DEMI,
      DEMI,
      DEMI,
      -DEMI,
      -400,
      400
    );
    camera.position.z = 200;

    /* Tout pivote ensemble, de quelques degrés à peine. À ce rayon, deux
       degrés déplacent l'anneau d'un dixième de pixel : les pastilles, qui
       sont en HTML et ne pivotent pas, restent posées dessus. Ce n'est pas le
       mouvement qu'on cherche — c'est ce qu'il fait glisser des reflets. */
    const ensemble = new THREE.Group();
    scene.add(ensemble);

    const geos: THREE.BufferGeometry[] = [];
    const matieres: THREE.Material[] = [];

    // ---- Le jonc ----
    const geoAnneau = new THREE.TorusGeometry(RAYON, JONC, 20, 220);
    const matAnneau = new THREE.MeshStandardMaterial({
      color: 0x33231a,
      metalness: 0.62,
      roughness: 0.26,
      emissive: ALLUMEE,
      emissiveIntensity: 0.1,
    });
    geos.push(geoAnneau);
    matieres.push(matAnneau);
    ensemble.add(new THREE.Mesh(geoAnneau, matAnneau));

    // ---- Le maillage : chaque pôle relié à ceux qui ne lui sont pas voisins ----
    const matLien = new THREE.MeshStandardMaterial({
      color: 0x2a1a12,
      metalness: 0.5,
      roughness: 0.4,
      emissive: ALLUMEE,
      emissiveIntensity: 0.06,
      transparent: true,
      opacity: 0.78,
    });
    matieres.push(matLien);
    /* Un pôle sur deux : sur cinq, ça dessine l'étoile d'un seul trait et ça
       relie exactement les couples qui ne se touchent pas sur l'anneau. */
    const saut = Math.max(2, Math.floor(poles / 2));
    for (let i = 0; i < poles; i++) {
      const a = place(i, poles);
      const b = place((i + saut) % poles, poles);
      const geo = new THREE.TubeGeometry(
        new THREE.LineCurve3(a, b),
        1,
        1.15,
        8,
        false
      );
      geos.push(geo);
      ensemble.add(new THREE.Mesh(geo, matLien));
    }

    // ---- La lentille sous le « 360° » ----
    const geoNoyau = new THREE.SphereGeometry(76, 48, 32);
    const matNoyau = new THREE.MeshStandardMaterial({
      color: 0x140e0a,
      metalness: 0.3,
      roughness: 0.52,
      emissive: ALLUMEE,
      emissiveIntensity: 0.045,
    });
    geos.push(geoNoyau);
    matieres.push(matNoyau);
    const noyau = new THREE.Mesh(geoNoyau, matNoyau);
    // Aplatie : c'est une lentille posée au centre, pas une bille
    noyau.scale.set(1, 1, 0.3);
    noyau.position.z = -14;
    ensemble.add(noyau);

    // ---- Les lumières ----
    scene.add(new THREE.AmbientLight(0xffd9b8, 0.5));

    /* La lampe qui tourne. C'est elle, et elle seule, qui donne le relief :
       le reflet qu'elle promène le long du jonc raconte sa rondeur. */
    const tournante = new THREE.PointLight(0xfff0dc, 950, 900, 2);
    scene.add(tournante);

    /* La lampe du pôle choisi. Elle ne saute pas d'un pôle à l'autre : elle y
       va, et l'anneau s'allume sur son passage. */
    const lampePole = new THREE.PointLight(LUEUR, 620, 460, 2);
    lampePole.position.copy(place(actif, poles)).setZ(34);
    scene.add(lampePole);

    // Un contre-jour froid, pour que le bord opposé ne se perde pas dans le noir
    const contre = new THREE.DirectionalLight(0x9fb8d8, 0.55);
    contre.position.set(-160, -120, 120);
    scene.add(contre);

    // ---- Taille ----
    const redimensionner = () => {
      const l = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (l === 0 || h === 0) return;
      renderer.setSize(l, h, false);
    };
    redimensionner();
    const observateurTaille = new ResizeObserver(redimensionner);
    observateurTaille.observe(canvas);

    /* On ne rend que ce qui est à l'écran. Les six chapitres du deck restent
       montés en permanence : sans ce garde-fou, l'orbite calculerait une image
       par trame pendant toute la visite, y compris depuis l'accueil. */
    let visible = false;
    const observateurVue = new IntersectionObserver(
      (e) => {
        visible = e.some((x) => x.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observateurVue.observe(canvas);

    // ---- Boucle ----
    const horloge = new THREE.Clock();
    const cible = new THREE.Vector3();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;

      const t = horloge.getElapsedTime();

      // La lampe fait le tour en une vingtaine de secondes, un peu au-dessus
      tournante.position.set(
        Math.cos(t * 0.32) * 250,
        Math.sin(t * 0.32) * 250,
        190
      );

      // Celle du pôle rejoint sa place — c'est le trajet qu'on doit voir
      cible.copy(place(vise.current, poles)).setZ(34);
      lampePole.position.lerp(cible, 0.055);

      ensemble.rotation.x = Math.sin(t * 0.21) * 0.035;
      ensemble.rotation.y = Math.sin(t * 0.17) * 0.045;

      renderer.render(scene, camera);
    };
    tick();

    onPret(true);

    return () => {
      cancelAnimationFrame(raf);
      observateurTaille.disconnect();
      observateurVue.disconnect();
      geos.forEach((g) => g.dispose());
      matieres.forEach((m) => m.dispose());
      renderer.dispose();
      onPret(false);
    };
    // `actif` est lu par référence : le relever ici remonterait toute la scène
    // à chaque survol.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poles]);

  return <canvas ref={toile} className="orbite-relief" aria-hidden="true" />;
}
