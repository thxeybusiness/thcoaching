import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import CountUp from "../components/CountUp";
import ProgrammeMotion from "../components/ProgrammeMotion";
import GrilleCompetences from "../components/GrilleCompetences";
import Etapes from "../components/Etapes";
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

      {/* ---------- L'orbite : les quatre piliers ---------- */}
      <section className="pg-section pg-section--orbite" aria-labelledby="tour">
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

          <div className="orbite">
            <span className="orbite-halo" aria-hidden="true" />
            <svg
              className="orbite-anneau"
              viewBox="0 0 400 400"
              aria-hidden="true"
            >
              <circle className="orbite-piste" cx="200" cy="200" r="150" />
              <circle className="orbite-trace" cx="200" cy="200" r="150" />
            </svg>

            <span className="orbite-noyau" aria-hidden="true">
              <span className="orbite-noyau-valeur">360°</span>
              <span className="orbite-noyau-texte">d&apos;accompagnement</span>
            </span>

            {PILIERS.map((p, i) => (
              <span
                key={p.cle}
                className="orbite-point"
                style={
                  { "--a": `${i * 90}deg`, "--teinte": p.teinte } as CSSProperties
                }
              >
                <span className="orbite-redresse">
                  <span className="orbite-contenu">
                    <i className="orbite-pastille" />
                    <span className="orbite-textes">
                      <span className="orbite-nom">{p.court}</span>
                      <span className="orbite-compte">
                        {p.competences.length} compétences
                      </span>
                    </span>
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

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

      {/* ---------- Les quatre piliers, en détail ---------- */}
      {PILIERS.map((p, i) => (
        <section
          key={p.cle}
          className="pg-section pg-pilier"
          id={p.cle}
          aria-labelledby={`${p.cle}-titre`}
          style={{ "--teinte": p.teinte } as CSSProperties}
        >
          {i % 2 === 0 && (
            <span className="pg-fantome pg-fantome--droite" aria-hidden="true">
              {p.num}
            </span>
          )}
          <div className="container">
            <div className="pilier-tete" data-anim>
              <span className="pilier-num" aria-hidden="true">
                {p.num}
              </span>
              <div>
                <h2 className="pg-h2" id={`${p.cle}-titre`}>
                  {p.titre}
                </h2>
                <p className="pilier-promesse">{p.promesse}</p>
              </div>

              {/* Part de ce pilier dans les dix-sept compétences */}
              <span
                className="pilier-part"
                style={
                  {
                    "--part": p.competences.length / NB_COMPETENCES,
                  } as CSSProperties
                }
              >
                <svg viewBox="0 0 44 44" aria-hidden="true">
                  <circle className="part-piste" cx="22" cy="22" r="18" />
                  <circle className="part-arc" cx="22" cy="22" r="18" />
                </svg>
                <b aria-hidden="true">{p.competences.length}</b>
                <span className="sr-only">
                  {p.competences.length} compétences sur {NB_COMPETENCES}
                </span>
              </span>
            </div>

            {i === 0 && (
              <p className="comp-repere" data-anim>
                <span className="comp-repere-signe" aria-hidden="true">
                  <i />
                  <i />
                </span>
                Ouvre une compétence pour le détail
              </p>
            )}

            <GrilleCompetences
              cle={p.cle}
              num={p.num}
              competences={p.competences}
            />
          </div>
        </section>
      ))}

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
