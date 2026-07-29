import type { Metadata } from "next";
import Link from "next/link";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

export const metadata: Metadata = {
  title: "Le programme en détail",
  description:
    "Tout ce que comprend l'accompagnement TH Coaching : stratégie business, intelligence artificielle, temps, clients, argent, alimentation, sommeil, sport, et les bonus inclus.",
  alternates: { canonical: "https://thcoaching.business/programme" },
};

/** La méthode, reprise des trois piliers de l'intro. */
const METHODE = [
  {
    num: "01",
    titre: "Compréhension",
    texte:
      "On part de votre situation réelle : ce qui tourne, ce qui coince, et ce qui vous prend du temps sans rien rapporter. Avant d'ajouter quoi que ce soit, on regarde ce qui est déjà là.",
  },
  {
    num: "02",
    titre: "Optimisation",
    texte:
      "On resserre ce qui existe : la stratégie, les outils, l'organisation des journées, et l'énergie disponible pour tenir le rythme. L'objectif n'est pas d'en faire plus, mais mieux.",
  },
  {
    num: "03",
    titre: "Lancement",
    texte:
      "On passe à l'action avec un cap clair et des priorités tenables. C'est l'étape qui transforme le travail précédent en résultats concrets.",
  },
];

const DOMAINES = [
  {
    groupe: "Business & performance",
    items: [
      {
        titre: "Stratégie business",
        texte:
          "Clarifier votre offre, votre positionnement et la direction à prendre en priorité.",
      },
      {
        titre: "Intelligence artificielle",
        texte:
          "Intégrer les bons outils là où ils font réellement gagner du temps, sans se disperser.",
      },
      {
        titre: "Gestion du temps",
        texte:
          "Structurer vos journées autour de ce qui fait avancer, et protéger ce temps-là.",
      },
      {
        titre: "Gestion des clients",
        texte:
          "Trouver, convaincre et fidéliser, avec un suivi qui tient dans la durée.",
      },
      {
        titre: "Gestion de l'argent",
        texte:
          "Suivre vos chiffres et décider en connaissance de cause plutôt qu'au ressenti.",
      },
    ],
  },
  {
    groupe: "Corps & esprit",
    items: [
      {
        titre: "Alimentation",
        texte:
          "De l'énergie stable sur la journée, sans régime compliqué à tenir.",
      },
      {
        titre: "Sommeil",
        texte:
          "Récupérer vraiment — parce que la fatigue coûte plus cher que tout le reste.",
      },
      {
        titre: "Sport",
        texte:
          "Une pratique régulière qui tient avec un emploi du temps chargé.",
      },
    ],
  },
];

const BONUS = [
  {
    titre: "2 formations en Marketing Digital",
    texte: "ASA et JDS, d'une valeur totale de 628 €, incluses.",
    valeur: "628 €",
  },
  {
    titre: "Accès privés & réductions exclusives",
    texte: "Sur des SaaS développés spécialement pour le business.",
    valeur: null,
  },
  {
    titre: "Groupe privé d'entraide",
    texte: "Pour progresser ensemble, entre entrepreneurs.",
    valeur: null,
  },
];

export default function Programme() {
  return (
    <article className="page">
      <div className="container page-inner">
        <Link href="/" className="page-retour">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12 H6 M12 6 L6 12 L12 18" />
          </svg>
          Retour à l&apos;accueil
        </Link>

        <header className="page-tete">
          <p className="section-label">Le programme en détail</p>
          <h1 className="page-titre">
            Tout ce que comprend
            <br />
            <span className="accent">l&apos;accompagnement.</span>
          </h1>
          <p className="page-chapo">
            Un accompagnement à 360° : huit domaines travaillés, une méthode en
            trois temps, et des ressources incluses en plus du coaching lui-même.
          </p>
        </header>

        <section className="page-section" aria-labelledby="methode">
          <h2 className="page-h2" id="methode">
            La méthode, en trois temps
          </h2>
          <div className="methode">
            {METHODE.map((e) => (
              <div key={e.titre} className="methode-etape">
                <span className="methode-num" aria-hidden="true">
                  {e.num}
                </span>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
            ))}
          </div>
        </section>

        {DOMAINES.map((d) => (
          <section
            key={d.groupe}
            className="page-section"
            aria-labelledby={d.groupe}
          >
            <h2 className="page-h2" id={d.groupe}>
              {d.groupe}
            </h2>
            <dl className="domaines">
              {d.items.map((it) => (
                <div key={it.titre} className="domaine">
                  <dt>{it.titre}</dt>
                  <dd>{it.texte}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section className="page-section" aria-labelledby="bonus-detail">
          <h2 className="page-h2" id="bonus-detail">
            Inclus en plus du coaching
          </h2>
          <ul className="bonus-detail">
            {BONUS.map((b) => (
              <li key={b.titre}>
                <div>
                  <strong>{b.titre}</strong>
                  <span>{b.texte}</span>
                </div>
                {b.valeur && (
                  <span className="bonus-detail-valeur">{b.valeur}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="page-fin">
          <h2>
            On en parle
            <br />
            <span className="accent">de vive voix ?</span>
          </h2>
          <p>
            Un appel découverte gratuit de 30 minutes pour faire le point sur vos
            objectifs, sans engagement.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Coaching%20Business%20%26%20Performance`}
            className="btn btn-orange btn-xl"
          >
            Réserver mon appel
          </a>
          <p className="page-fin-note">
            Réponse sous 24h ouvrées · {CONTACT_EMAIL}
          </p>
        </section>
      </div>
    </article>
  );
}
