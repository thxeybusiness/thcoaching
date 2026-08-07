import type { CSSProperties } from "react";
import Hero from "./components/Hero";
import Sequences from "./components/Sequences";
import CountUp from "./components/CountUp";
import Magnetic from "./components/Magnetic";
import Deck, { type SlideMeta } from "./components/Deck";
import LogoEtape from "./components/LogoEtape";
import IconeCompetence from "./components/IconeCompetence";
import Poles from "./components/Poles";
import { NB_COMPETENCES } from "./lib/programme";
import { ETAPES } from "./lib/methode";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

/** Décalage de la révélation d'un élément à l'entrée de son écran. */
const r = (i: number) => ({ "--r-i": i }) as CSSProperties;

const SLIDES: SlideMeta[] = [
  { id: "accueil", label: "Accueil" },
  { id: "methode", label: "Méthode" },
  { id: "offre", label: "Programme" },
  { id: "bonus", label: "Écosystème" },
  { id: "apropos", label: "À propos" },
  { id: "contact", label: "Contact" },
];

const bonuses = [
  {
    icone: "formation",
    title: "Formations & logiciels",
    text: "ASA & JDS en marketing digital, et des logiciels créés pour le business.",
  },
  {
    icone: "acces",
    title: "Accès privés & réductions",
    text: "Réservés aux personnes accompagnées.",
  },
  {
    icone: "groupe",
    title: "Groupe privé d'entraide",
    text: "Pour progresser entre entrepreneurs.",
  },
];

/** Ce qui entoure la personne accompagnée. Le coach n'est pas un bonus : il
 *  est en tête, et hors du compte. */
const ENTOURAGE = [
  {
    icone: "partenariat",
    title: "Un coach à tes côtés",
    text: "Disponible, du premier jour au projet debout.",
  },
  ...bonuses,
];

/**
 * Les trois repères de la section « à propos ». Deux sont des chiffres, qui
 * défilent à l'arrivée ; le troisième est un mot — le nombre de bonus n'est
 * pas figé, on ne l'annonce donc pas comme un compte.
 */
type Repere = {
  icone: string;
  libelle: string;
  valeur?: number;
  suffixe?: string;
  mot?: string;
};

const CHIFFRES: Repere[] = [
  { icone: "tour", valeur: 360, suffixe: "°", libelle: "d'accompagnement" },
  { icone: "cadeau", mot: "Plusieurs", libelle: "bonus inclus" },
  { icone: "grille", valeur: NB_COMPETENCES, suffixe: "", libelle: "compétences travaillées" },
];

export default function Home() {
  return (
    <>
      <Sequences />

      <Deck slides={SLIDES}>
        {/* 1 — Accueil */}
        <Hero />

        {/* 2 — Le déroulé */}
        <section className="slide" id="methode" aria-labelledby="methode-titre">
          <div className="section-glow section-glow--right" aria-hidden="true" />
          <div className="slide-inner">
            <div className="container">
              <p className="section-label" style={r(0)} data-r>
                La méthode
              </p>
              <h2
                className="section-title"
                id="methode-titre"
                style={r(1)}
                data-r
              >
                Le déroulé,
                <br />
                <span className="accent">en trois étapes.</span>
              </h2>
              <p className="section-intro" style={r(2)} data-r>
                On pose le socle, on le rend automatique, et c&apos;est dessus
                qu&apos;on monte ton projet.
              </p>

              <ol className="deroule">
                {ETAPES.map((e, i) => (
                  <li
                    key={e.cle}
                    className="deroule-etape"
                    style={r(3 + i)}
                    data-r
                  >
                    <span className="deroule-tete">
                      <LogoEtape actif={i} className="deroule-logo" />
                      <span className="deroule-num" aria-hidden="true">
                        {e.num}
                      </span>
                    </span>
                    <h3 className="deroule-titre">{e.titre}</h3>
                    <p className="deroule-court">{e.court}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 3 — La base : le 360° et sa couronne de compétences. Ces
            quarante-trois compétences ne sont pas la finalité, c'est le socle
            commun — une fois acquis, il sert à monter n'importe quel projet.
            Tout tourne autour de la personne accompagnée : c'est elle, le
            centre. */}
        <section
          className="slide slide--programme"
          id="offre"
          aria-labelledby="offre-titre"
        >
          <div className="section-glow section-glow--left" aria-hidden="true" />
          <div className="slide-inner">
            <div className="container">
              {/* La suradresse et son trait, puis le titre — la même paire
                  que sur les autres chapitres. Ne s'y ajoute plus rien : les
                  deux compteurs, la consigne et l'en-tête du pôle qui
                  s'empilaient dessous annonçaient un schéma qui se lit tout
                  seul. Le nom du pôle est déjà sur l'orbite, ses compétences
                  sont numérotées, et son anneau se surligne. */}
              <div className="programme-tete" style={r(0)} data-r>
                <p className="section-label">Les bases</p>
                <h2 className="section-title" id="offre-titre">
                  Se former pour mieux performer
                </h2>
              </div>

              <Poles />
            </div>
          </div>
        </section>

        {/* 4 — Les bonus */}
        <section className="slide" id="bonus" aria-labelledby="bonus-titre">
          <div className="slide-inner">
            <div className="container">
              <p className="section-label" style={r(0)} data-r>
                L&apos;écosystème autour de toi
              </p>
              <h2 className="section-title" id="bonus-titre" style={r(1)} data-r>
                Tu n&apos;avances
                <br />
                <span className="accent">jamais seul.</span>
              </h2>

              <ul className="bonus-cartes-accueil">
                {ENTOURAGE.map((b, i) => (
                  <li key={b.title} className="bonus-carte-accueil" style={r(2 + i)} data-r>
                    <IconeCompetence nom={b.icone} />
                    <strong>{b.title}</strong>
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 5 — À propos */}
        <section
          className="slide slide--about"
          id="apropos"
          aria-labelledby="apropos-titre"
        >
          <span className="about-ghost" aria-hidden="true">
            360°
          </span>
          <div className="slide-inner">
            <div className="container about-grid">
              <div className="about-text">
                <p className="section-label" style={r(0)} data-r>
                  À propos
                </p>
                <h2
                  className="section-title"
                  id="apropos-titre"
                  style={r(1)}
                  data-r
                >
                  Un coach à tes côtés,
                  <br />
                  pas au-dessus.
                </h2>
                <p style={r(2)} data-r>
                  Ma conviction : personne ne réussit seul, et il n&apos;existe
                  pas un business idéal — seulement celui qui te correspond. On
                  part donc de ton profil, de tes compétences et de tes
                  contraintes réelles.
                </p>
                <p style={r(3)} data-r>
                  Chaque accompagnement est confidentiel, bienveillant et
                  rigoureux. On avance à ton rythme, avec des objectifs clairs.
                </p>
              </div>
              <div className="stats">
                {CHIFFRES.map((c, i) => (
                  <div
                    key={c.libelle}
                    className={c.mot ? "stat stat--mot" : "stat"}
                    style={r(4 + i)}
                    data-r
                  >
                    <IconeCompetence nom={c.icone} />
                    <strong>
                      {c.mot ?? (
                        <CountUp to={c.valeur ?? 0} suffix={c.suffixe} />
                      )}
                    </strong>
                    <span>{c.libelle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6 — Contact */}
        <section
          className="slide slide--contact"
          id="contact"
          aria-labelledby="contact-titre"
        >
          <div className="contact-glow" aria-hidden="true" />
          <p className="footer-word" aria-hidden="true">
            TH Coaching
          </p>
          <div className="slide-inner">
            <div className="container contact-inner">
              <p
                className="section-label section-label--center"
                style={r(0)}
                data-r
              >
                Contact
              </p>
              <h2
                className="contact-title"
                id="contact-titre"
                style={r(1)}
                data-r
              >
                Prêt à passer au
                <br />
                <span className="accent">niveau supérieur ?</span>
              </h2>
              <p className="contact-sub" style={r(2)} data-r>
                Réserve ton appel découverte gratuit de 30 minutes. On fait le
                point sur ton profil et tes objectifs, sans engagement.
              </p>
              <div className="contact-cta" style={r(3)} data-r>
                <Magnetic>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=Coaching%20Business%20%26%20Performance`}
                    className="btn btn-orange btn-xl"
                  >
                    Réserver mon appel
                  </a>
                </Magnetic>
              </div>
              <p className="contact-note" style={r(4)} data-r>
                Réponse sous 24h ouvrées · {CONTACT_EMAIL}
              </p>
            </div>
          </div>
          <p className="contact-legal" style={r(6)} data-r>
            © 2026 TH Coaching · thcoaching.business
          </p>
        </section>
      </Deck>
    </>
  );
}
