const CONTACT_EMAIL = "contact@thcoaching.business";

const offers = [
  {
    n: "01",
    title: "Coaching individuel",
    text: "Un accompagnement sur-mesure pour retrouver de la clarté, dépasser vos blocages et avancer avec confiance.",
    tag: "Particuliers",
  },
  {
    n: "02",
    title: "Coaching professionnel",
    text: "Leadership, prise de décision et gestion du stress pour dirigeants, managers et entrepreneurs.",
    tag: "Pros & dirigeants",
  },
  {
    n: "03",
    title: "Ateliers collectifs",
    text: "Des sessions en entreprise ou en groupe pour renforcer la cohésion et la motivation des équipes.",
    tag: "Équipes",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">Coach professionnel &amp; de vie</span>
          <h1 className="hero-title">
            Passez à l&apos;action.
            <br />
            <span className="accent">Atteignez vos objectifs.</span>
          </h1>
          <p className="hero-sub">
            TH Coaching accompagne particuliers, dirigeants et équipes vers plus
            de clarté, de confiance et de résultats concrets.
          </p>
          <div className="hero-actions">
            <a href="#contact" className="btn btn-orange">
              Réserver un appel découverte
            </a>
            <a href="#offres" className="btn btn-outline-light">
              Voir les offres
            </a>
          </div>
        </div>
      </section>

      {/* Offres */}
      <section id="offres" className="section">
        <div className="container">
          <p className="section-label">Les offres</p>
          <h2 className="section-title">Un accompagnement pour chaque objectif</h2>
          <div className="offers">
            {offers.map((o) => (
              <article key={o.n} className="offer">
                <span className="offer-n">{o.n}</span>
                <div className="offer-body">
                  <h3>{o.title}</h3>
                  <p>{o.text}</p>
                </div>
                <span className="offer-tag">{o.tag}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* À propos */}
      <section id="apropos" className="section about">
        <div className="container about-grid">
          <div className="about-text">
            <p className="section-label">À propos</p>
            <h2>Un coach à vos côtés, pas au-dessus.</h2>
            <p>
              Formé aux approches du coaching, j&apos;accompagne depuis plusieurs
              années des personnes et des organisations qui veulent du changement
              concret. Ma conviction : vous avez déjà les ressources — mon rôle
              est de vous aider à les activer.
            </p>
            <p>
              Chaque accompagnement est confidentiel, bienveillant et rigoureux.
              On avance à votre rythme, avec des objectifs clairs.
            </p>
          </div>
          <div className="stats">
            <div className="stat">
              <strong>120+</strong>
              <span>personnes accompagnées</span>
            </div>
            <div className="stat">
              <strong>8 ans</strong>
              <span>d&apos;expérience</span>
            </div>
            <div className="stat">
              <strong>95%</strong>
              <span>de recommandation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section contact">
        <div className="container contact-inner">
          <h2>Prêt·e à commencer ?</h2>
          <p>
            Réservez votre appel découverte gratuit de 30 minutes. Sans
            engagement.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Demande%20d'appel%20découverte`}
            className="btn btn-dark"
          >
            Écrire à {CONTACT_EMAIL}
          </a>
          <p className="contact-note">Réponse sous 24h ouvrées.</p>
        </div>
      </section>
    </>
  );
}
