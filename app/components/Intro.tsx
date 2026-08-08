"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ETAPES } from "../lib/methode";
import { cadence as t, INTRO_FIN } from "../lib/intro";
import type { SceneIntro } from "../lib/intro3d";
import { EMISSIF_REPOS } from "../lib/intro3d";

/**
 * Intro : les trois étapes du déroulé montent le logo.
 *
 * 1. Le bureau est là, la tresse n'y est pas encore
 * 2. « Fondations » et « Perfectionnement » amènent chacun un anneau : il
 *    vient de loin, se pose, et s'allume
 * 3. « Développement » arrive sur la tresse achevée. Elle se serre, fait un
 *    tour complet sur elle-même en profondeur et s'embrase ; un éclat couvre
 *    l'écran, le décor s'efface derrière lui et le site apparaît pendant que
 *    l'éclat retombe.
 *
 * L'intro est en volume, ou elle n'est pas.
 *
 * Elle a longtemps eu une doublure à plat, en SVG, qui prenait la main quand
 * le moteur 3D tardait ou quand la machine ne suivait pas. C'est cette
 * doublure qui se jouait presque à chaque fois : la pièce a beaucoup grossi,
 * la première image paie la compilation des nuanceurs, et le garde-fou de
 * performance la condamnait avant même qu'elle ait commencé. On ne peut pas
 * mesurer le coût d'une scène sur son image la plus chère.
 *
 * Elle est retirée. Si le moteur n'arrive pas, ou si la machine n'a pas de
 * WebGL, il n'y a pas de repli : le rideau ne se lève pas, il n'existe pas —
 * le site s'ouvre directement. Une seconde de vide vaut mieux qu'une intro
 * qui ne ressemble pas au site qu'elle annonce.
 */

/** Ce qu'on accorde au moteur 3D pour arriver. Passé ce délai, pas d'intro. */
const ATTENTE_3D = 2500;

/** Les trois mots, dans l'ordre du déroulé. */
const PILIERS = ETAPES.map((e) => e.mot);

/** Instant où le second anneau a fini de se poser : la tresse est faite.
    C'est de là que part son mouvement propre. */
const REGROUPE = t(1.46);

/** Départ de l'éclat, puis instant où le site apparaît derrière lui.
    Toutes les durées passent par `t` : elles sont écrites à leur valeur
    d'origine et divisées par la cadence commune. */
const ECLAT = t(4.78);
const OUVERTURE = INTRO_FIN;

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
    let secours = 0;
    let annule = false;

    const course = Promise.race([
      import("../lib/intro3d").then((m) => m.monterIntro3D),
      new Promise<null>((r) => setTimeout(() => r(null), ATTENTE_3D)),
    ]).catch(() => null);

    course.then((monter) => {
      if (annule) return;
      if (monter && scene3d.current) {
        try {
          scene = monter(scene3d.current, PILIERS);
        } catch {
          scene = undefined; // WebGL indisponible
        }
      }

      // Pas de volume, pas d'intro : le site s'ouvre sans rideau.
      if (!scene) {
        setDone(true);
        return;
      }

      root.current?.setAttribute("data-volume", "true");

      /* Filet de sécurité : le rideau se lève à l'heure, quoi qu'il arrive.
         Une machine qui rame ferait traîner la ligne de temps de GSAP, qui
         lisse les longues images — et le visiteur resterait devant un écran
         noir. Ce minuteur, lui, ne dépend d'aucune image. Il part d'ici et
         non du montage du composant : la scène a pu se faire attendre, et le
         compte ne commence qu'une fois l'intro lancée. */
      secours = window.setTimeout(
        () => setDone(true),
        (INTRO_FIN + 0.8) * 1000
      );

      jouer(scene);
    });

    function jouer(vue: SceneIntro) {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => setDone(true),
        });

        /* Trois mots, deux anneaux.
           Les deux premiers mots font arriver un anneau chacun : il vient de
           loin et de côté, se pose, et s'allume. Le troisième tombe sur une
           tresse déjà faite — c'est elle, alors, qui prend la parole (plus
           bas). */
        vue.anneaux.forEach((pivot, i) => {
          const debut = t(0.34 + i * 0.44);
          const matiere = vue.matieres[i];
          const cote = i === 0 ? -1 : 1;

          tl.fromTo(
            pivot.position,
            { x: cote * 1.7, z: -2.4 },
            { x: 0, z: 0, duration: t(0.62), ease: "power3.out" },
            debut
          )
            .fromTo(
              pivot.rotation,
              { z: cote * 1.15, x: 0.5, y: -0.35 },
              {
                z: 0,
                x: 0,
                y: 0,
                duration: t(0.72),
                ease: "back.out(1.35)",
              },
              debut
            )
            // Il s'allume en arrivant : braise, puis orange de la marque
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
        });

        /* ---- Une fois la tresse faite ----
           Trois gestes qui s'enchaînent sans se recouvrir : elle se serre,
           elle se retourne, elle s'embrase. Le mouvement porte sur le noyau
           et non sur l'ensemble : l'affiche entière garde pendant ce temps
           son inclinaison lente, et les deux ne se marchent pas dessus. */

        /* Le serrage. Les deux anneaux viennent de s'emboîter, le nœud se
           tend d'un coup — comme une vraie tresse qu'on tire par les deux
           bouts — puis se détend en débordant à peine. C'est ce très court
           resserrement qui donne au regroupement son point final. */
        tl.to(
          vue.noyau.scale,
          { x: 0.87, y: 0.87, z: 0.87, duration: t(0.16), ease: "power2.in" },
          REGROUPE - t(0.02)
        ).to(
          vue.noyau.scale,
          {
            x: 1,
            y: 1,
            z: 1,
            duration: t(0.52),
            ease: "elastic.out(1, 0.55)",
          },
          REGROUPE + t(0.14)
        );

        /* Le tour. Un tour complet en profondeur, autour de l'axe vertical de
           l'écran. À mi-chemin la tresse se présente sur la tranche : c'est le
           seul moment de l'intro où l'on voit qu'elle a une épaisseur, donc
           qu'elle est un objet et non un dessin.

           Un tour entier, et pas un demi-tour : vue de dos, une tresse
           échange ses dessus et ses dessous, elle reviendrait donc en nœud
           inverse. Le tour complet est le seul qui se referme exactement sur
           la marque de départ.

           Il prend son temps — près d'une seconde pour un seul tour. C'est
           lent pour une intro, et c'est voulu : un tour expédié ne se lit pas,
           on n'y voit qu'un clignotement.

           C'est le seul mouvement de la fin. La tresse a aussi tourné dans son
           plan pendant un temps : elle passait par la position droite avant de
           revenir sur ses diagonales. Deux rotations coup sur coup faisaient
           une pirouette de trop — le tour en profondeur dit déjà tout, et il
           le dit mieux seul. */
        tl.to(
          vue.noyau.rotation,
          { y: Math.PI * 2, duration: t(1.6), ease: "power2.inOut" },
          REGROUPE + t(0.16)
        );

        vue.matieres.forEach((matiere) => {
          // L'étincelle du serrage
          tl.to(
            matiere,
            {
              emissiveIntensity: 0.45,
              duration: t(0.12),
              yoyo: true,
              repeat: 1,
              ease: "power2.out",
            },
            REGROUPE
          )
            /* Puis la chauffe. Elle monte pendant le tour, pendant le
               redressement, et continue de monter pendant que la marque se
               tient droite : c'est ce qui empêche ce long temps d'arrêt d'être
               un temps mort. Elle atteint son maximum juste avant l'éclat, qui
               prend alors le relais. */
            .to(
              matiere,
              {
                emissiveIntensity: 0.85,
                duration: t(3.0),
                ease: "power2.in",
              },
              REGROUPE + t(0.3)
            );
        });

        // Les trois mots, eux, entrent un par un — un par temps
        vue.mots.forEach((mot, i) => {
          const debut = t(0.34 + i * 0.44);
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
        });

        // L'éclat part du logo, qui se tient au centre de la scène plein écran
        tl.call(
          () => {
            const el = root.current;
            if (!el) return;
            el.style.setProperty("--fx", "56%");
            el.style.setProperty("--fy", "50%");
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
              /* La scène 3D est plein écran et hors du bloc du décor : sans
                 cette ligne elle ne s'effaçait pas avec lui et restait
                 visible derrière l'éclat pendant que celui-ci retombait. */
              gsap.set([".intro-fond", ".intro-vignette", ".intro-scene3d"], {
                opacity: 0,
              });
              if (root.current) root.current.style.background = "transparent";
              /* Démontée ici et non au démontage du composant : invisible,
                 elle continuerait à rendre une image par trame pendant que le
                 site, lui, joue son propre plan d'entrée. */
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

        /* L'ensemble s'incline pendant toute l'intro. Il ne se rapproche plus
           de la caméra à l'éclat : ce dernier élan lisait comme un zoom, et
           il écrasait la composition juste avant qu'elle disparaisse. */
        tl.fromTo(
          vue.groupe.rotation,
          { y: -0.34, x: -0.16 },
          /* On garde un peu de biais à l'arrivée : de face, la lumière clé
             frappe la grande face de plein fouet et la lave. */
          { y: -0.28, x: -0.12, duration: t(4.8), ease: "power2.out" },
          0
        );
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
      {/* Le fond sur lequel la scène se charge, puis l'éclat de sortie. */}
      <div className="intro-fond" />
      <div className="intro-vignette" />
      <div className="intro-flash" />

      {/* La scène, plein écran : c'est toute l'intro. */}
      <span ref={scene3d} className="intro-scene3d" />
    </div>
  );
}
