import type { CSSProperties } from "react";
import Link from "next/link";
import Hero from "./components/Hero";
import Scene3DLoader from "./components/Scene3DLoader";
import CountUp from "./components/CountUp";
import Magnetic from "./components/Magnetic";
import Deck, { type SlideMeta } from "./components/Deck";
import { PILIERS, NB_COMPETENCES } from "./lib/programme";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

/** Décalage de la révélation d'un élément à l'entrée de son écran. */
const r = (i: number) => ({ "--r-i": i }) as CSSProperties;

const SLIDES: SlideMeta[] = [
  { id: "accueil", label: "Accueil" },
  { id: "offre", label: "Programme" },
  { id: "bonus", label: "Bonus" },
  { id: "apropos", label: "À propos" },
  { id: "contact", label: "Contact" },
];

const bonuses = [
  {
    title: "2 formations en Marketing Digital",
    text: "ASA & JDS — valeur totale de 628 €, offertes.",
  },
  {
    title: "Accès privés & réductions exclusives",
    text: "Sur des SaaS développés spécialement pour le business.",
  },
  {
    title: "Groupe privé d'entraide",
    text: "Pour progresser ensemble, entre entrepreneurs.",
  },
];

export default function Home() {
  return (
    <>
      <Scene3DLoader />

      <Deck slides={SLIDES}>
        {/* 1 — Accueil */}
        <Hero />

        {/* 2 — Le programme */}
        <section className="slide" id="offre" aria-labelledby="offre-titre">
          <div className="section-glow section-glow--left" aria-hidden="true" />
          <div className="slide-inner">
            <div className="container">
              <p className="section-label" style={r(0)} data-r>
                Le programme
              </p>
              <h2 className="section-title" id="offre-titre" style={r(1)} data-r>
                Un Coaching Complet
                <br />
                <span className="accent">Business &amp; Performance.</span>
              </h2>
              <p className="section-intro" style={r(2)} data-r>
                Quatre piliers, {NB_COMPETENCES} compétences : du socle
                physique et mental jusqu&apos;au pilotage de votre activité.
              </p>

              <Link href="/programme" className="pillars" style={r(3)} data-r>
                <span className="pillars-grille">
                  {PILIERS.map((p) => (
                    <span key={p.cle} className="pillar">
                      <span className="pillar-num" aria-hidden="true">
                        {p.num}
                      </span>
                      <span className="pillar-title">{p.titre}</span>
                      <span className="pillar-promesse">{p.promesse}</span>
                      <span className="pillar-compte">
                        {p.competences.length} compétences
                      </span>
                    </span>
                  ))}
                </span>
                <span className="pillars-lien">
                  Voir tout ce que comprend l&apos;accompagnement
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12 H18 M12 6 L18 12 L12 18" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3 — Les bonus */}
        <section className="slide" id="bonus" aria-labelledby="bonus-titre">
          <div className="slide-inner">
            <div className="container">
              <p className="section-label" style={r(0)} data-r>
                Inclus dans l&apos;accompagnement
              </p>
              <h2 className="section-title" id="bonus-titre" style={r(1)} data-r>
                Ce que vous recevez
                <br />
                <span className="accent">en plus du coaching.</span>
              </h2>

              <div className="bonus" style={r(2)} data-r>
                <div className="bonus-head">
                  <h3>Inclus en bonus</h3>
                  <span className="bonus-value">+ de 628 € offerts</span>
                </div>
                <ul className="bonus-list">
                  {bonuses.map((b) => (
                    <li key={b.title}>
                      <strong>{b.title}</strong>
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4 — À propos */}
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
                  Un coach à vos côtés,
                  <br />
                  pas au-dessus.
                </h2>
                <p style={r(2)} data-r>
                  Ma conviction : un business qui tient dans la durée repose sur
                  des fondations solides — une stratégie claire, des outils qui
                  font gagner du temps, et un corps qui suit. C&apos;est pour ça
                  que l&apos;accompagnement travaille les deux à la fois.
                </p>
                <p style={r(3)} data-r>
                  Chaque accompagnement est confidentiel, bienveillant et
                  rigoureux. On avance à votre rythme, avec des objectifs
                  clairs.
                </p>
              </div>
              <div className="stats">
                <div className="stat" style={r(4)} data-r>
                  <strong>
                    <CountUp to={360} suffix="°" />
                  </strong>
                  <span>vision business &amp; santé</span>
                </div>
                <div className="stat" style={r(5)} data-r>
                  <strong>
                    <CountUp to={628} suffix=" €" />
                  </strong>
                  <span>de bonus offerts</span>
                </div>
                <div className="stat" style={r(6)} data-r>
                  <strong>
                    <CountUp to={NB_COMPETENCES} />
                  </strong>
                  <span>compétences travaillées</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 — Contact */}
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
                Réservez votre appel découverte gratuit de 30 minutes. On fait
                le point sur vos objectifs, sans engagement.
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
