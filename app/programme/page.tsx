import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import CountUp from "../components/CountUp";
import ProgrammeMotion from "../components/ProgrammeMotion";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

export const metadata: Metadata = {
  title: "Le programme en détail",
  description:
    "Tout ce que comprend l'accompagnement TH Coaching : stratégie business, intelligence artificielle, temps, clients, argent, alimentation, sommeil, sport, et les bonus inclus.",
  alternates: { canonical: "https://thcoaching.business/programme" },
};

/** Les trois vagues du logo — une par étape de la méthode. */
const VAGUES = [
  "M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z",
  "M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z",
  "M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z",
];

const METHODE = [
  {
    titre: "Compréhension",
    texte:
      "On part de votre situation réelle : ce qui tourne, ce qui coince, et ce qui vous prend du temps sans rien rapporter. Avant d'ajouter quoi que ce soit, on regarde ce qui est déjà là.",
  },
  {
    titre: "Optimisation",
    texte:
      "On resserre ce qui existe : la stratégie, les outils, l'organisation des journées, et l'énergie disponible pour tenir le rythme. L'objectif n'est pas d'en faire plus, mais mieux.",
  },
  {
    titre: "Lancement",
    texte:
      "On passe à l'action avec un cap clair et des priorités tenables. C'est l'étape qui transforme le travail précédent en résultats concrets.",
  },
];

/** Les huit domaines, placés en orbite puis détaillés. */
const DOMAINES = [
  {
    court: "Stratégie",
    titre: "Stratégie business",
    volet: "business",
    texte:
      "Clarifier votre offre, votre positionnement et la direction à prendre en priorité.",
  },
  {
    court: "IA",
    titre: "Intelligence artificielle",
    volet: "business",
    texte:
      "Intégrer les bons outils là où ils font réellement gagner du temps, sans se disperser.",
  },
  {
    court: "Temps",
    titre: "Gestion du temps",
    volet: "business",
    texte:
      "Structurer vos journées autour de ce qui fait avancer, et protéger ce temps-là.",
  },
  {
    court: "Clients",
    titre: "Gestion des clients",
    volet: "business",
    texte:
      "Trouver, convaincre et fidéliser, avec un suivi qui tient dans la durée.",
  },
  {
    court: "Argent",
    titre: "Gestion de l'argent",
    volet: "business",
    texte:
      "Suivre vos chiffres et décider en connaissance de cause plutôt qu'au ressenti.",
  },
  {
    court: "Alimentation",
    titre: "Alimentation",
    volet: "corps",
    texte: "De l'énergie stable sur la journée, sans régime compliqué à tenir.",
  },
  {
    court: "Sommeil",
    titre: "Sommeil",
    volet: "corps",
    texte:
      "Récupérer vraiment — parce que la fatigue coûte plus cher que tout le reste.",
  },
  {
    court: "Sport",
    titre: "Sport",
    volet: "corps",
    texte: "Une pratique régulière qui tient avec un emploi du temps chargé.",
  },
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
            {"Tout ce que comprend".split(" ").map((m) => (
              <span key={m} className="mot-masque">
                <span className="mot">{m}</span>
              </span>
            ))}
            <br />
            {"l'accompagnement.".split(" ").map((m) => (
              <span key={m} className="mot-masque">
                <span className="mot accent">{m}</span>
              </span>
            ))}
          </h1>
          <p className="pg-chapo" data-anim>
            Huit domaines travaillés, une méthode en trois temps, et des
            ressources incluses en plus du coaching lui-même.
          </p>

          <div className="pg-cles" data-anim>
            <span>
              <strong>
                <CountUp to={8} />
              </strong>
              domaines
            </span>
            <span>
              <strong>
                <CountUp to={3} />
              </strong>
              étapes
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

      {/* ---------- L'orbite : les 8 domaines à 360° ---------- */}
      <section className="pg-section pg-section--orbite" aria-labelledby="tour">
        <span className="pg-fantome" aria-hidden="true">
          360°
        </span>
        <div className="container">
          <h2 className="pg-h2" id="tour" data-anim>
            Un tour complet
          </h2>
          <p className="pg-intro" data-anim>
            Le business et le corps ne sont pas deux sujets séparés. Ils tournent
            autour du même axe : vous.
          </p>

          <div className="orbite">
            <span className="orbite-halo" aria-hidden="true" />
            <svg className="orbite-anneau" viewBox="0 0 400 400" aria-hidden="true">
              <circle className="orbite-piste" cx="200" cy="200" r="150" />
              <circle className="orbite-trace" cx="200" cy="200" r="150" />
            </svg>

            <span className="orbite-noyau" aria-hidden="true">
              <span className="orbite-noyau-valeur">360°</span>
              <span className="orbite-noyau-texte">d&apos;accompagnement</span>
            </span>

            {DOMAINES.map((d, i) => (
              <span
                key={d.court}
                className="orbite-point"
                data-volet={d.volet}
                style={{ "--a": `${i * 45}deg` } as CSSProperties}
              >
                <span className="orbite-redresse">
                  <span className="orbite-contenu">
                    <i className="orbite-pastille" />
                    <span className="orbite-nom">{d.court}</span>
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
            La méthode, en trois temps
          </h2>
          <p className="pg-intro" data-anim>
            Chaque étape allume une vague du logo. À la troisième, tout est en
            place.
          </p>

          <div className="methode" data-cascade>
            <div className="methode-ligne" aria-hidden="true">
              <i />
            </div>
            {METHODE.map((e, i) => (
              <div key={e.titre} className="pg-carte methode-etape">
                <LogoEtape actif={i} />
                <span className="etape-num">0{i + 1}</span>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Les domaines en détail ---------- */}
      <section className="pg-section" aria-labelledby="domaines-titre">
        <span className="pg-fantome pg-fantome--droite" aria-hidden="true">
          Détail
        </span>
        <div className="container">
          <h2 className="pg-h2" id="domaines-titre" data-anim>
            Les huit domaines
          </h2>

          <div className="domaines" data-cascade>
            {DOMAINES.map((d, i) => (
              <div key={d.titre} className="pg-carte domaine" data-volet={d.volet}>
                <span className="domaine-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="domaine-volet">
                  {d.volet === "business" ? "Business" : "Corps & esprit"}
                </span>
                <h3>{d.titre}</h3>
                <p>{d.texte}</p>
                <span className="domaine-trait" aria-hidden="true" />
              </div>
            ))}
          </div>
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
            Un appel découverte gratuit de 30 minutes pour faire le point sur vos
            objectifs, sans engagement.
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
