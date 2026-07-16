const CONTACT_EMAIL = "contact@thcoaching.business";

const services = [
  {
    title: "Coaching individuel",
    description:
      "Un accompagnement sur-mesure pour retrouver de la clarté, dépasser vos blocages et avancer avec confiance vers vos objectifs de vie.",
    points: ["Confiance en soi", "Transitions de vie", "Équilibre pro / perso"],
  },
  {
    title: "Coaching professionnel",
    description:
      "Pour dirigeants, managers et entrepreneurs : leadership, prise de décision et gestion du stress pour performer sans s'épuiser.",
    points: ["Leadership", "Prise de parole", "Gestion du temps"],
  },
  {
    title: "Ateliers & séminaires",
    description:
      "Des sessions collectives, en entreprise ou en groupe, pour renforcer la cohésion, la motivation et l'intelligence collective.",
    points: ["Cohésion d'équipe", "Motivation", "Communication"],
  },
];

const steps = [
  {
    n: "01",
    title: "Appel découverte",
    text: "Un échange gratuit de 30 minutes pour comprendre votre situation et vos objectifs, sans engagement.",
  },
  {
    n: "02",
    title: "Plan d'accompagnement",
    text: "Nous définissons ensemble un programme clair, avec des objectifs mesurables et un rythme adapté.",
  },
  {
    n: "03",
    title: "Séances de coaching",
    text: "Des séances régulières, en visio ou en présentiel, pour progresser étape par étape.",
  },
  {
    n: "04",
    title: "Ancrage & autonomie",
    text: "On consolide vos acquis pour que les changements durent bien au-delà de l'accompagnement.",
  },
];

const testimonials = [
  {
    quote:
      "Un accompagnement qui a changé ma façon de diriger. J'ai gagné en sérénité et mes équipes le ressentent au quotidien.",
    author: "Camille R.",
    role: "Dirigeante de PME",
  },
  {
    quote:
      "J'étais bloquée depuis des mois. En quelques séances, j'ai retrouvé confiance et j'ai enfin osé changer de voie.",
    author: "Julien M.",
    role: "En reconversion",
  },
  {
    quote:
      "Bienveillant et exigeant à la fois. Les résultats sont concrets, on ne tourne pas en rond.",
    author: "Sarah L.",
    role: "Manager",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Coaching de vie &amp; coaching professionnel</p>
          <h1 className="hero-title">
            Révélez votre potentiel,
            <br />
            <span className="accent">atteignez vos objectifs.</span>
          </h1>
          <p className="hero-sub">
            TH Coaching accompagne particuliers, dirigeants et équipes vers plus
            de clarté, de confiance et de résultats durables. Un
            accompagnement humain, structuré et orienté action.
          </p>
          <div className="hero-actions">
            <a href="#contact" className="btn btn-primary">
              Réserver un appel découverte
            </a>
            <a href="#services" className="btn btn-ghost">
              Découvrir les services
            </a>
          </div>
          <ul className="hero-badges">
            <li>✓ Premier appel offert</li>
            <li>✓ En visio ou en présentiel</li>
            <li>✓ Approche confidentielle</li>
          </ul>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Ce que je propose</p>
            <h2>Des accompagnements adaptés à chaque étape</h2>
          </div>
          <div className="grid grid-3">
            {services.map((s) => (
              <article key={s.title} className="card">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <ul className="tag-list">
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Méthode */}
      <section id="methode" className="section section--alt">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">La méthode</p>
            <h2>Un parcours clair, en 4 étapes</h2>
          </div>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.n} className="step">
                <span className="step-n">{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* À propos */}
      <section id="apropos" className="section">
        <div className="container about">
          <div className="about-media" aria-hidden="true">
            <div className="about-photo">TH</div>
          </div>
          <div className="about-text">
            <p className="eyebrow">À propos</p>
            <h2>Un coach à vos côtés, pas au-dessus</h2>
            <p>
              Certifié et formé aux approches du coaching, j'accompagne depuis
              plusieurs années des personnes et des organisations qui veulent
              du changement concret. Ma conviction : vous avez déjà les
              ressources — mon rôle est de vous aider à les activer.
            </p>
            <p>
              Chaque accompagnement est confidentiel, bienveillant et
              rigoureux. On avance à votre rythme, avec des objectifs clairs et
              des résultats que l'on mesure ensemble.
            </p>
            <div className="stats">
              <div className="stat">
                <strong>120+</strong>
                <span>personnes accompagnées</span>
              </div>
              <div className="stat">
                <strong>8 ans</strong>
                <span>d'expérience</span>
              </div>
              <div className="stat">
                <strong>95%</strong>
                <span>de recommandation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="section section--alt">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Témoignages</p>
            <h2>Ils ont franchi le cap</h2>
          </div>
          <div className="grid grid-3">
            {testimonials.map((t) => (
              <figure key={t.author} className="quote-card">
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <strong>{t.author}</strong>
                  <span>{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="section">
        <div className="container cta">
          <div className="cta-inner">
            <h2>Prêt·e à passer à l'action ?</h2>
            <p>
              Réservez votre appel découverte gratuit de 30 minutes. On fait le
              point sur votre situation et je vous dis honnêtement si je peux
              vous aider.
            </p>
            <div className="cta-actions">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Demande%20d'appel%20découverte`}
                className="btn btn-primary"
              >
                Écrire à {CONTACT_EMAIL}
              </a>
            </div>
            <p className="cta-note">
              Réponse sous 24h ouvrées · Échange confidentiel et sans
              engagement.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
