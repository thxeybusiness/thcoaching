import type { CSSProperties } from "react";
import Hero from "./components/Hero";
import Sequences from "./components/Sequences";
import Magnetic from "./components/Magnetic";
import Deck, { type SlideMeta } from "./components/Deck";
import LogoEtape from "./components/LogoEtape";
import Poles from "./components/Poles";
import { ETAPES } from "./lib/methode";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

/** Décalage de la révélation d'un élément à l'entrée de son écran. */
const r = (i: number) => ({ "--r-i": i }) as CSSProperties;

const SLIDES: SlideMeta[] = [
  { id: "accueil", label: "Accueil" },
  { id: "methode", label: "Méthode" },
  { id: "offre", label: "Programme" },
  { id: "contact", label: "Contact" },
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
                      <LogoEtape className="deroule-logo" />
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
              <div className="programme-tete">
                <p className="section-label" style={r(0)} data-r>
                  Les bases
                </p>
                {/* Deux lignes, la seconde en orange : c'est la forme de tous
                    les titres du site. Sur une seule ligne et tout en blanc,
                    ce chapitre-là avait l'air d'appartenir à un autre. */}
                <h2
                  className="section-title"
                  id="offre-titre"
                  style={r(1)}
                  data-r
                >
                  Se former
                  <br />
                  <span className="accent">pour mieux performer</span>
                </h2>
              </div>

              <Poles />
            </div>
          </div>
        </section>

        {/* 4 — Contact */}
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
