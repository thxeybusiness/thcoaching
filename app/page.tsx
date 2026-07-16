const CONTACT_EMAIL = "contact@thcoaching.business";

const pillars = [
  {
    group: "Business & performance",
    items: [
      "Stratégie business",
      "Intelligence artificielle",
      "Gestion du temps",
      "Gestion des clients",
      "Gestion de l'argent",
    ],
  },
  {
    group: "Corps & esprit",
    items: ["Alimentation", "Sommeil", "Sport"],
  },
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
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">Coaching Business &amp; Performance</span>
          <h1 className="hero-title">
            Développez votre business.
            <br />
            <span className="accent">Sans négliger votre santé.</span>
          </h1>
          <p className="hero-sub">
            Un accompagnement à 360° : stratégie, argent, temps, clients — mais
            aussi alimentation, sommeil et sport. Parce qu&apos;un business
            solide repose sur un corps et un esprit en pleine forme.
          </p>
          <div className="hero-actions">
            <a href="#contact" className="btn btn-orange">
              Réserver un appel découverte
            </a>
            <a href="#offre" className="btn btn-outline-light">
              Voir le programme
            </a>
          </div>
        </div>
      </section>

      {/* Offre / Programme */}
      <section id="offre" className="section">
        <div className="container">
          <p className="section-label">Le programme</p>
          <h2 className="section-title">
            Un Coaching Complet Business &amp; Performance
          </h2>
          <p className="section-intro">
            Un accompagnement à 360° qui couvre à la fois la croissance de votre
            business et votre équilibre personnel. On travaille l&apos;essentiel,
            dans l&apos;ordre qui vous fait avancer.
          </p>

          <div className="pillars">
            {pillars.map((p) => (
              <div key={p.group} className="pillar">
                <h3 className="pillar-title">{p.group}</h3>
                <ul className="pillar-list">
                  {p.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bonus */}
          <div className="bonus">
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
      </section>

      {/* À propos */}
      <section id="apropos" className="section about">
        <div className="container about-grid">
          <div className="about-text">
            <p className="section-label">À propos</p>
            <h2>Un coach à vos côtés, pas au-dessus.</h2>
            <p>
              Formé aux approches du coaching, j&apos;accompagne depuis plusieurs
              années des entrepreneurs et des dirigeants qui veulent du
              changement concret. Ma conviction : vous avez déjà les ressources —
              mon rôle est de vous aider à les activer.
            </p>
            <p>
              Chaque accompagnement est confidentiel, bienveillant et rigoureux.
              On avance à votre rythme, avec des objectifs clairs.
            </p>
          </div>
          <div className="stats">
            <div className="stat">
              <strong>360°</strong>
              <span>business & santé</span>
            </div>
            <div className="stat">
              <strong>628 €</strong>
              <span>de bonus offerts</span>
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
          <h2>Prêt·e à passer au niveau supérieur ?</h2>
          <p>
            Réservez votre appel découverte gratuit de 30 minutes. On fait le
            point sur vos objectifs, sans engagement.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Coaching%20Business%20%26%20Performance`}
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
