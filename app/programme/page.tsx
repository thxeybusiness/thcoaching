import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import CountUp from "../components/CountUp";
import ProgrammeMotion from "../components/ProgrammeMotion";
import { PILIERS, NB_COMPETENCES } from "../lib/programme";
import { ETAPES, PROMESSE } from "../lib/methode";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

export const metadata: Metadata = {
  title: "Le programme en détail",
  description:
    "Le déroulé en trois étapes — fondations, perfectionnement, étude et développement — et les dix-sept compétences travaillées pour bâtir le business qui te correspond vraiment.",
  alternates: { canonical: "https://thcoaching.business/programme" },
};

/** Les trois vagues du logo — une par étape de la méthode. */
const VAGUES = [
  "M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z",
  "M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z",
  "M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z",
];

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

/** Le logo, avec une seule vague allumée. */
function LogoEtape({ actif }: { actif: number }) {
  return (
    <svg className="etape-logo" viewBox="0 0 120 120" aria-hidden="true">
      {VAGUES.map((d, i) => (
        <path
          key={d}
          d={d}
          fill={i === actif ? "var(--orange-soft)" : "rgba(255,150,70,0.12)"}
        />
      ))}
    </svg>
  );
}

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
            {PROMESSE} On pose d&apos;abord les fondamentaux, on les
            perfectionne jusqu&apos;à ce qu&apos;ils deviennent des réflexes,
            puis on construit ton projet sur ces bases. Voici tout ce qui est
            travaillé en chemin, domaine par domaine.
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
                style={{ "--a": `${i * 90}deg` } as CSSProperties}
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

          <div className="methode" data-cascade>
            <div className="methode-ligne" aria-hidden="true">
              <i />
            </div>
            {ETAPES.map((e, i) => (
              <div key={e.cle} className="pg-carte methode-etape">
                <LogoEtape actif={i} />
                <span className="etape-num">{e.num}</span>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Les quatre piliers, en détail ---------- */}
      {PILIERS.map((p, i) => (
        <section
          key={p.cle}
          className="pg-section pg-pilier"
          id={p.cle}
          aria-labelledby={`${p.cle}-titre`}
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
              <span className="pilier-compte">
                {p.competences.length} compétences
              </span>
            </div>

            <div className="competences" data-cascade>
              {p.competences.map((c, j) => (
                <div key={c.titre} className="pg-carte competence">
                  <span className="competence-index" aria-hidden="true">
                    {p.num}.{j + 1}
                  </span>
                  <h3>{c.titre}</h3>
                  <p>{c.texte}</p>
                  <span className="domaine-trait" aria-hidden="true" />
                </div>
              ))}
            </div>
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
