import type { CSSProperties } from "react";
import Hero from "./components/Hero";
import Scene3DLoader from "./components/Scene3DLoader";
import CountUp from "./components/CountUp";
import Magnetic from "./components/Magnetic";
import Deck, { type SlideMeta } from "./components/Deck";
import LogoEtape from "./components/LogoEtape";
import IconeCompetence from "./components/IconeCompetence";
import Poles from "./components/Poles";
import { POLES, NB_COMPETENCES } from "./lib/programme";
import { ETAPES } from "./lib/methode";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

/** Décalage de la révélation d'un élément à l'entrée de son écran. */
const r = (i: number) => ({ "--r-i": i }) as CSSProperties;

const SLIDES: SlideMeta[] = [
  { id: "accueil", label: "Accueil" },
  { id: "methode", label: "Méthode" },
  { id: "offre", label: "Programme" },
  { id: "bonus", label: "Bonus" },
  { id: "apropos", label: "À propos" },
  { id: "contact", label: "Contact" },
];

const bonuses = [
  {
    icone: "formation",
    title: "2 formations en Marketing Digital",
    text: "ASA & JDS, incluses dans l'accompagnement.",
  },
  {
    icone: "acces",
    title: "Accès privés & réductions",
    text: "Sur des SaaS développés pour le business.",
  },
  {
    icone: "groupe",
    title: "Groupe privé d'entraide",
    text: "Pour progresser entre entrepreneurs.",
  },
];

/** Les trois chiffres de la section « à propos », chacun avec son repère. */
const CHIFFRES = [
  { icone: "tour", valeur: 360, suffixe: "°", libelle: "vision business & santé" },
  { icone: "cadeau", valeur: bonuses.length, suffixe: "", libelle: "bonus inclus" },
  { icone: "grille", valeur: NB_COMPETENCES, suffixe: "", libelle: "compétences travaillées" },
];

export default function Home() {
  return (
    <>
      <Scene3DLoader />

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
                Pas de recette toute faite : on pose les bases, on les rend
                automatiques, puis on construit le business qui te ressemble.
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

        {/* 3 — Le programme, en entier : le 360° et sa couronne de compétences.
            Le chapitre n'a plus de résumé cliquable renvoyant ailleurs : le
            détail est ici. */}
        <section
          className="slide slide--programme"
          id="offre"
          aria-labelledby="offre-titre"
        >
          <div className="section-glow section-glow--left" aria-hidden="true" />
          <div className="slide-inner">
            <div className="container">
              <div className="programme-tete" style={r(0)} data-r>
                <h2 className="section-label" id="offre-titre">
                  Le programme
                </h2>
                <p className="programme-cles">
                  <strong>{POLES.length}</strong> pôles
                  <i aria-hidden="true" />
                  <strong>{NB_COMPETENCES}</strong> compétences
                  <i aria-hidden="true" />
                  <span className="programme-astuce">
                    Parcours l&apos;orbite, puis ouvre une compétence
                  </span>
                </p>
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
                Inclus dans l&apos;accompagnement
              </p>
              <h2 className="section-title" id="bonus-titre" style={r(1)} data-r>
                Ce que tu reçois
                <br />
                <span className="accent">en plus du coaching.</span>
              </h2>

              <ul className="bonus-cartes-accueil">
                {bonuses.map((b, i) => (
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
                  Ma conviction : il n&apos;existe pas un business idéal, mais
                  un business idéal <em>pour toi</em>. C&apos;est pour ça
                  qu&apos;on ne part jamais d&apos;un modèle tout fait, mais de
                  ton profil, de tes compétences et de tes contraintes réelles.
                </p>
                <p style={r(3)} data-r>
                  Chaque accompagnement est confidentiel, bienveillant et
                  rigoureux. On avance à ton rythme, avec des objectifs clairs.
                </p>
              </div>
              <div className="stats">
                {CHIFFRES.map((c, i) => (
                  <div key={c.libelle} className="stat" style={r(4 + i)} data-r>
                    <IconeCompetence nom={c.icone} />
                    <strong>
                      <CountUp to={c.valeur} suffix={c.suffixe} />
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
