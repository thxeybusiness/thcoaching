import { gsap } from "gsap";
import { DUREE_VOYAGE } from "./deck";

/**
 * Les outils communs aux séquences des chapitres.
 *
 * Chaque chapitre du deck entre comme un plan de film plutôt que de
 * s'afficher. Les gestes qui reviennent d'un chapitre à l'autre — découper un
 * texte, relever un titre caractère par caractère, faire courir une vague de
 * lumière dans les lettres — sont écrits ici une seule fois.
 */

/**
 * Décalage du départ d'une séquence quand on revient sur un chapitre : elle
 * commence pendant le dernier tiers du voyage. Lancée au clic, la moitié se
 * jouerait hors de l'écran ; lancée à l'arrivée, l'écran resterait vide près
 * d'une seconde.
 */
export const DELAI_RETOUR = DUREE_VOYAGE - 0.34;

/** Un retour se joue plus vif qu'une découverte. */
export const VIVACITE_RETOUR = 1.4;

/** L'ombre portée des grands titres, et sa version éclairée. */
export const OMBRE = "0 2px 26px rgba(0, 0, 0, 0.85)";
export const OMBRE_LUMIERE = "0 0 18px rgba(255, 216, 176, 0.6)";

/** Emballe un nœud de texte en mots — et, si demandé, en caractères. */
function emballer(texte: Text, enCaracteres: boolean) {
  const frag = document.createDocumentFragment();
  // On garde les blancs tels quels : ce sont eux qui autorisent les retours
  // à la ligne, et un mot collé au suivant casserait la mise en page.
  (texte.nodeValue ?? "").split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      frag.appendChild(document.createTextNode(part));
      return;
    }
    const mot = document.createElement("span");
    mot.className = "mot-anim";
    if (enCaracteres) {
      Array.from(part).forEach((c) => {
        const s = document.createElement("span");
        s.className = "char";
        s.textContent = c;
        mot.appendChild(s);
      });
    } else {
      mot.textContent = part;
    }
    frag.appendChild(mot);
  });
  texte.parentNode?.replaceChild(frag, texte);
}

/**
 * Découpe un texte en mots — et, si demandé, chaque mot en caractères.
 *
 * Le découpage se fait nœud de texte par nœud de texte, en place : les
 * retours à la ligne et les fragments colorés des titres survivent. Passer
 * par `textContent` les effacerait. Idempotent : un texte déjà découpé est
 * laissé tel quel.
 */
export function decouper(el: HTMLElement, enCaracteres: boolean) {
  if (el.dataset.decoupe) return;
  el.dataset.decoupe = "1";
  const parcours = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textes: Text[] = [];
  while (parcours.nextNode()) textes.push(parcours.currentNode as Text);
  textes.forEach((t) => emballer(t, enCaracteres));
}

/** Découpe tous les éléments visés dans un chapitre. */
export function decouperTout(
  racine: ParentNode,
  selecteur: string,
  enCaracteres: boolean
) {
  racine
    .querySelectorAll<HTMLElement>(selecteur)
    .forEach((el) => decouper(el, enCaracteres));
}

/**
 * Un titre se relève : chaque caractère bascule vers le lecteur.
 *
 * La perspective est portée par le caractère lui-même — les conteneurs de
 * titre sont souvent en `overflow: hidden`, ce qui aplatit tout contexte 3D
 * hérité d'un parent. Le déplacement reste court : contrairement au premier
 * écran, ces titres n'ont pas de masque qui cacherait les lettres sous le
 * sol, et une grande amplitude les ferait empiéter sur la ligne voisine.
 */
export function releverTitre(
  tl: gsap.core.Timeline,
  cible: gsap.DOMTarget,
  depart: number
) {
  tl.fromTo(
    cible,
    { y: 26, rotateX: -70, opacity: 0 },
    {
      y: 0,
      rotateX: 0,
      opacity: 1,
      transformPerspective: 520,
      duration: 0.75,
      stagger: 0.02,
      ease: "power3.out",
    },
    depart
  );
}

/**
 * Une vague de lumière court dans les lettres, ligne après ligne : chaque
 * caractère s'éclaire un court instant, l'un après l'autre, et retombe.
 * C'est un éclat qui suit la forme des lettres — là où une bande de lumière
 * posée par-dessus dessinerait un rectangle.
 */
export function vague(
  tl: gsap.core.Timeline,
  lignes: HTMLElement[],
  depart: number,
  entreLignes = 0.2
) {
  lignes.forEach((ligne, i) => {
    const chars = ligne.querySelectorAll(".char");
    if (!chars.length) return;
    tl.fromTo(
      chars,
      { textShadow: OMBRE },
      {
        textShadow: OMBRE_LUMIERE,
        duration: 0.2,
        stagger: 0.016,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
      },
      depart + i * entreLignes
    );
  });
}

/**
 * Un pictogramme se dessine : le contour se trace, l'aplat se révèle après.
 * Les tracés sont mesurés à la volée, une seule fois par élément.
 */
export function dessinerIcones(
  tl: gsap.core.Timeline,
  icones: HTMLElement[],
  depart: number,
  entreIcones = 0.09
) {
  icones.forEach((icone, i) => {
    const traits = icone.querySelectorAll<SVGGeometryElement>(".ico-trait *");
    if (!traits.length) return;
    traits.forEach((forme) => {
      const l = forme.getTotalLength?.() ?? 0;
      if (l) gsap.set(forme, { strokeDasharray: l, strokeDashoffset: l });
    });
    tl.to(
      traits,
      { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" },
      depart + i * entreIcones
    );
    const fond = icone.querySelector(".ico-fond");
    if (fond) {
      tl.fromTo(
        fond,
        { opacity: 0 },
        { opacity: 0.26, duration: 0.6, ease: "power2.out" },
        depart + i * entreIcones + 0.3
      );
    }
  });
}
