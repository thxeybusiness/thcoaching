import type { Metadata } from "next";
import Link from "next/link";
import CountUp from "../components/CountUp";
import ProgrammeMotion from "../components/ProgrammeMotion";
import Etapes from "../components/Etapes";
import Piliers from "../components/Piliers";
import { PILIERS, NB_COMPETENCES } from "../lib/programme";
import { PROMESSE } from "../lib/methode";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

export const metadata: Metadata = {
  title: "Le programme en détail",
  description:
    "Le déroulé en trois étapes — fondations, perfectionnement, étude et développement — et les dix-sept compétences travaillées pour bâtir le business qui te correspond vraiment.",
  alternates: { canonical: "https://thcoaching.business/programme" },
};

const BONUS = [
  {
    titre: "2 formations en Marketing Digital",
    texte: "ASA et JDS, incluses dans l'accompagnement.",
    valeur: 628,
    suffixe: " €",
  },
  {
    titre: "Accès privés & réductions",
    texte: "Sur des SaaS développés spécialement pour le business.",
    valeur: null,
    suffixe: "",
  },
  {
    titre: "Groupe privé d'entraide",
    texte: "Pour progresser ensemble, entre entrepreneurs.",
    valeur: null,
    suffixe: "",
  },
];

export default function Programme() {
  return (
    <article className="pg">
      <ProgrammeMotion />

      <div className="pg-progression" aria-hidden="true">
        <i />
      </div>

      {/* ---------- Ouverture ---------- */}
      <header className="pg-tete">
        <div className="pg-tete-fond" aria-hidden="true" />
        <div className="container pg-tete-inner">
          <Link href="/" className="pg-retour" data-anim>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12 H6 M12 6 L6 12 L12 18" />
            </svg>
            Retour à l&apos;accueil
          </Link>

          <p className="section-label" data-anim>
            Le programme en détail
          </p>
          <h1 className="pg-titre">
            {"Quatre piliers,".split(" ").map((m) => (
              <span key={m} className="mot-masque">
                <span className="mot">{m}</span>
              </span>
            ))}
            <br />
            {"dix-sept compétences.".split(" ").map((m) => (
              <span key={m} className="mot-masque">
                <span className="mot accent">{m}</span>
              </span>
            ))}
          </h1>
          <p className="pg-chapo" data-anim>
            {PROMESSE}
          </p>

          <div className="pg-cles" data-anim>
            <span>
              <strong>
                <CountUp to={PILIERS.length} />
              </strong>
              piliers
            </span>
            <span>
              <strong>
                <CountUp to={NB_COMPETENCES} />
              </strong>
              compétences
            </span>
            <span>
              <strong>
                <CountUp to={628} suffix=" €" />
              </strong>
              de bonus
            </span>
          </div>
        </div>
      </header>

      {/* ---------- La méthode ---------- */}
      <section className="pg-section" aria-labelledby="methode-titre">
        <div className="container">
          <h2 className="pg-h2" id="methode-titre" data-anim>
            Le déroulé, en trois étapes
          </h2>
          <p className="pg-intro" data-anim>
            Chaque étape allume une vague du logo. À la troisième, ton business
            est debout.
          </p>

          <Etapes />
        </div>
      </section>

      {/* ---------- Les quatre piliers : orbite + mur ---------- */}
      <section className="pg-section pg-section--piliers" aria-labelledby="tour">
        <span className="pg-fantome" aria-hidden="true">
          360°
        </span>
        <div className="container">
          <h2 className="pg-h2" id="tour" data-anim>
            Un tour complet
          </h2>
          <p className="pg-intro" data-anim>
            Le corps, le commerce, la création et le pilotage ne sont pas quatre
            sujets séparés. Ils tournent autour du même axe : toi.
          </p>

          <p className="comp-repere piliers-repere" data-anim>
            <span className="comp-repere-fleche" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12 H18 M12 6 L18 12 L12 18" />
              </svg>
            </span>
            Parcours les piliers sur l&apos;orbite, puis ouvre une compétence
          </p>

          <Piliers />
        </div>
      </section>

      {/* ---------- Les bonus ---------- */}
      <section className="pg-section" aria-labelledby="bonus-titre">
        <div className="container">
          <h2 className="pg-h2" id="bonus-titre" data-anim>
            Inclus en plus du coaching
          </h2>

          <div className="bonus-cartes" data-cascade>
            {BONUS.map((b) => (
              <div key={b.titre} className="pg-carte bonus-carte">
                {b.valeur !== null && (
                  <span className="bonus-carte-valeur">
                    <CountUp to={b.valeur} suffix={b.suffixe} />
                  </span>
                )}
                <h3>{b.titre}</h3>
                <p>{b.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Passage à l'action ---------- */}
      <section className="pg-fin">
        <div className="pg-fin-lueur" aria-hidden="true" />
        <div className="container">
          <h2 data-anim>
            On en parle
            <br />
            <span className="accent">de vive voix ?</span>
          </h2>
          <p data-anim>
            Un appel découverte gratuit de 30 minutes pour faire le point sur
            ton profil et tes objectifs, sans engagement.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Coaching%20Business%20%26%20Performance`}
            className="btn btn-orange btn-xl"
            data-anim
          >
            Réserver mon appel
          </a>
          <p className="pg-fin-note" data-anim>
            Réponse sous 24h ouvrées · {CONTACT_EMAIL}
          </p>
        </div>
      </section>
    </article>
  );
}
