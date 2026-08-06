"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ETAPES } from "../lib/methode";
import { cadence as t, INTRO_FIN } from "../lib/intro";
import type { SceneIntro } from "../lib/intro3d";
import { EMISSIF_REPOS } from "../lib/intro3d";

/**
 * Intro : les trois étapes du déroulé allument le logo.
 *
 * 1. Le logo apparaît en grand, ses trois vagues éteintes
 * 2. « Fondations », « Perfectionnement », « Développement » entrent l'un
 *    après l'autre — chaque mot allume la vague correspondante
 * 3. Au troisième mot, un éclat couvre l'écran ; le décor s'efface derrière
 *    lui et le site apparaît pendant que l'éclat retombe.
 *
 * Le logo est en volume quand c'est possible : chaque vague arrive de loin,
 * bascule à sa place et s'allume avec son mot. Mais l'intro ne dure qu'une
 * seconde et Three.js pèse 81 ko — on ne l'attend donc qu'un court instant.
 * Passé ce délai, l'intro joue sa version plate, à l'identique. En pratique
 * la 3D apparaît dès la deuxième visite, le moteur étant alors en cache.
 */

/** Ce qu'on accorde au moteur 3D pour se charger avant de s'en passer. */
const ATTENTE_3D = 600;

/** Au-delà, la machine ne suit pas : on joue l'intro à plat. Le budget d'une
 *  image à 60 Hz est de 16 ms ; on tolère le double, pas plus. */
const MS_PAR_IMAGE_MAX = 32;

const WAVE_PATHS = [
  "M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z",
  "M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z",
  "M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z",
];

/** Ordonnées des trois vagues (centre du tracé dans le viewBox). */
const HAUTEURS = ["25%", "49%", "73%"];

/** Chaque étape est posée en face de sa vague. */
const PILIERS = ETAPES.map((e, i) => ({ mot: e.mot, y: HAUTEURS[i] }));

/** Le plus long des trois mots : c'est lui qui donne sa largeur au bloc. */
const PLUS_LONG = PILIERS.reduce(
  (a, b) => (b.mot.length > a.length ? b.mot : a),
  ""
);

/** Départ de l'éclat, puis instant où le site apparaît derrière lui.
    Toutes les durées passent par `t` : elles sont écrites à leur valeur
    d'origine et divisées par la cadence commune. */
const ECLAT = t(1.46);
const OUVERTURE = INTRO_FIN;

const ETEINT = "rgba(255, 150, 70, 0.09)";
const ALLUME = "#ff8c2e";

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const scene3d = useRef<HTMLDivElement>(null);
  const chemin = usePathname();
  const [done, setDone] = useState(false);
  // Uniquement à l'arrivée sur l'accueil : sur une page intérieure, un rideau
  // de deux secondes n'aurait aucun sens.
  const surAccueil = chemin === "/";

  useEffect(() => {
    if (!surAccueil) {
      setDone(true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    let ctx: gsap.Context | undefined;
    let scene: SceneIntro | undefined;
    let annule = false;

    /* On laisse au moteur 3D un court instant pour arriver. S'il n'y est
       pas, on joue sans lui : l'intro ne doit jamais faire attendre. */
    /* Filet de sécurité : le rideau se lève à l'heure, quoi qu'il arrive.
       Une machine qui rame ferait traîner la ligne de temps de GSAP, qui
       lisse les longues images — et le visiteur resterait devant un écran
       noir. Ce minuteur, lui, ne dépend d'aucune image. */
    const secours = setTimeout(() => setDone(true), (INTRO_FIN + 0.8) * 1000);

    const course = Promise.race([
      import("../lib/intro3d").then((m) => m.monterIntro3D),
      new Promise<null>((r) => setTimeout(() => r(null), ATTENTE_3D)),
    ]).catch(() => null);

    course.then((monter) => {
      if (annule) return;
      if (monter && scene3d.current) {
        try {
          scene = monter(scene3d.current, PILIERS.map((p) => p.mot));
        } catch {
          scene = undefined; // WebGL indisponible : on reste en plat
        }
      }

      /* La scène se chronomètre pendant qu'elle joue : si la machine ne
         suit pas, on la retire en cours de route et le logo plat reprend
         sa place. Mieux vaut une intro sans volume qu'une intro qui traîne. */
      scene?.mesurer().then((ms) => {
        if (annule || ms <= MS_PAR_IMAGE_MAX) return;
        scene?.detruire();
        scene = undefined;
        root.current?.removeAttribute("data-volume");
      });
      const enVolume = !!scene;
      if (enVolume) root.current?.setAttribute("data-volume", "true");
      jouer(enVolume);
    });

    function jouer(enVolume: boolean) {
    ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setDone(true),
      });

      // 1. Le logo, vagues éteintes, dans un décor qui s'éveille
      if (!enVolume) {
        tl.from(".intro-logo-svg", {
          opacity: 0,
          scale: 0.92,
          duration: t(0.5),
          transformOrigin: "50% 50%",
        });
      }
      tl.from(".intro-fond", { opacity: 0, duration: t(1.1) }, 0)
        .fromTo(
          ".intro-rayons",
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: t(1.2), ease: "power2.out" },
          t(0.1)
        );

      // 2. Un mot = une vague qui s'allume
      PILIERS.forEach((_, i) => {
        const debut = t(0.34 + i * 0.44);

        if (enVolume && scene) {
          const pivot = scene.vagues[i];
          const matiere = scene.matieres[i];
          const mot = scene.mots[i];
          /* La vague arrive de loin, de côté et de biais, puis se pose à
             plat : c'est la bascule qui donne le volume, pas le voyage. */
          tl.fromTo(
            pivot.position,
            { z: -2.6 - i * 0.5, x: -1.5 },
            { z: 0, x: 0, duration: t(0.62), ease: "power3.out" },
            debut
          )
            .fromTo(
              pivot.rotation,
              { y: 1.25, x: 0.45, z: -0.22 },
              { y: 0, x: 0, z: 0, duration: t(0.72), ease: "back.out(1.35)" },
              debut
            )
            // Elle s'allume en arrivant : braise, puis orange de la marque
            .to(
              matiere.color,
              {
                r: 1,
                g: 0.352,
                b: 0.122,
                duration: t(0.34),
                ease: "power2.out",
              },
              debut + t(0.1)
            )
            .fromTo(
              matiere,
              { emissiveIntensity: 0 },
              {
                emissiveIntensity: 0.55,
                duration: t(0.16),
                yoyo: true,
                repeat: 1,
                ease: "power2.out",
              },
              debut + t(0.14)
            )
            /* La lueur ne retombe pas à zéro : sans elle, la moitié de la
               surface qui est dans l'ombre repart vers le grenat. */
            .to(
              matiere,
              { emissiveIntensity: EMISSIF_REPOS, duration: t(0.2) },
              debut + t(0.46)
            );

          // Le mot glisse avec sa vague, dans la scène
          if (mot) {
            tl.fromTo(
              mot.material,
              { opacity: 0 },
              { opacity: 0.92, duration: t(0.42), ease: "power2.out" },
              debut + t(0.06)
            ).fromTo(
              mot.position,
              { x: mot.userData.repos.x - 0.5 },
              { x: mot.userData.repos.x, duration: t(0.6), ease: "power3.out" },
              debut + t(0.06)
            );
          }
        }

        tl.to(
          `.intro-wave-${i}`,
          { fill: ALLUME, duration: t(0.3), ease: "power2.out" },
          debut
        )
          // léger sursaut de la vague au moment où elle s'allume
          .fromTo(
            `.intro-wave-${i}`,
            { scale: 1 },
            {
              scale: 1.07,
              duration: t(0.15),
              yoyo: true,
              repeat: 1,
              ease: "power1.inOut",
              transformOrigin: "50% 50%",
            },
            debut
          )
          // halo (transition CSS, plus léger qu'un filtre animé)
          .call(
            () => {
              root.current
                ?.querySelector(`.intro-wave-${i}`)
                ?.setAttribute("data-on", "true");
            },
            undefined,
            debut
          )
          .fromTo(
            `.intro-word-${i} .intro-word-texte`,
            { opacity: 0, x: 14, filter: "blur(4px)" },
            { opacity: 1, x: 0, filter: "blur(0px)", duration: t(0.42) },
            debut + t(0.04)
          )
          // La lumière ambiante monte d'un cran à chaque pilier
          .to(
            ".intro-halo",
            {
              opacity: 0.42 + i * 0.29,
              scale: 0.82 + i * 0.09,
              duration: t(0.55),
              ease: "power2.out",
            },
            debut
          );
      });

      // 3. Transition : un éclat couvre l'écran, le décor s'efface derrière
      //    lui, et le site apparaît pendant que l'éclat retombe.
      tl.call(
        () => {
          // L'éclat part du logo, où qu'il soit à l'écran
          const el = root.current;
          if (!el) return;
          if (el.dataset.volume === "true") {
            // En volume, le logo est au centre de la scène plein écran
            el.style.setProperty("--fx", "56%");
            el.style.setProperty("--fy", "50%");
            return;
          }
          const logo = el.querySelector(".intro-logo-svg");
          if (!logo) return;
          const r = logo.getBoundingClientRect();
          el.style.setProperty(
            "--fx",
            `${((r.left + r.width / 2) / window.innerWidth) * 100}%`
          );
          el.style.setProperty(
            "--fy",
            `${((r.top + r.height / 2) / window.innerHeight) * 100}%`
          );
        },
        undefined,
        ECLAT
      )
        .fromTo(
          ".intro-flash",
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1.15, duration: t(0.2), ease: "power2.in" },
          ECLAT
        )
        // Au sommet de l'éclat, tout le décor disparaît d'un coup : le site
        // est déjà là derrière, on ne voit jamais la coupure.
        .call(
          () => {
            /* Tout le décor disparaît d'un coup, la scène 3D comprise : elle
               est plein écran et hors du bloc plat, donc elle ne s'effaçait
               pas avec lui et restait visible derrière l'éclat pendant que
               celui-ci retombait. Le site est déjà là dessous — on ne doit
               jamais voir la coupure. */
            gsap.set(
              [
                ".intro-inner",
                ".intro-fond",
                ".intro-vignette",
                ".intro-scene3d",
              ],
              { opacity: 0 }
            );
            if (root.current) root.current.style.background = "transparent";
            /* La scène 3D est démontée ici et non au démontage du composant :
               invisible, elle continuerait à rendre une image par trame
               pendant que le site, lui, joue son propre plan d'entrée. */
            scene?.detruire();
            scene = undefined;
          },
          undefined,
          OUVERTURE
        )
        .to(
          ".intro-flash",
          { opacity: 0, scale: 1.6, duration: t(0.42), ease: "power2.out" },
          OUVERTURE
        );
      // L'ensemble s'incline pendant toute l'intro, puis pousse vers la
      // caméra au moment de l'éclat : le logo sort par l'avant.
      if (enVolume && scene) {
        /* L'ensemble s'incline pendant toute l'intro. Il ne se rapproche plus
           de la caméra à l'éclat : ce dernier élan lisait comme un zoom, et
           il écrasait la composition juste avant qu'elle disparaisse. */
        tl.fromTo(
          scene.groupe.rotation,
          { y: -0.34, x: -0.16 },
          /* On garde un peu de biais à l'arrivée : de face, la lumière clé
             frappe la grande face de plein fouet et la lave. */
          { y: -0.28, x: -0.12, duration: t(1.5), ease: "power2.out" },
          0
        );
      }
    }, root);
    }

    return () => {
      annule = true;
      clearTimeout(secours);
      ctx?.revert();
      scene?.detruire();
    };
  }, [surAccueil]);

  if (done) return null;

  return (
    <div ref={root} className="intro" aria-hidden="true">
      {/* Décor : vagues sombres en écho du logo, lueur chaude, vignette */}
      <div className="intro-fond" />
      <div className="intro-vignette" />
      <div className="intro-flash" />

      {/* La scène 3D, plein écran, hors du décor plat : celui-ci est masqué
          dès qu'elle prend la main, et un enfant hériterait du masquage. */}
      <span ref={scene3d} className="intro-scene3d" />

      <div className="intro-inner">
        <span className="intro-logo-zone">
          <span className="intro-rayons" />
          <span className="intro-halo" />
          <svg className="intro-logo-svg" viewBox="0 0 120 120">
            {WAVE_PATHS.map((d, i) => (
              <path
                key={d}
                className={`intro-wave intro-wave-${i}`}
                d={d}
                fill={ETEINT}
              />
            ))}
          </svg>
        </span>

        <p className="intro-piliers">
          {/* Copie invisible : les mots sont en absolu et ne donnent donc
              aucune largeur au bloc, qui serait décentré sans elle. */}
          <span className="intro-piliers-gabarit" aria-hidden="true">
            {PLUS_LONG}
          </span>
          {PILIERS.map(({ mot, y }, i) => (
            <span
              key={mot}
              className={`intro-word intro-word-${i}`}
              style={{ "--y": y } as React.CSSProperties}
            >
              <span className="intro-word-texte">{mot}</span>
            </span>
          ))}
        </p>
      </div>

    </div>
  );
}
