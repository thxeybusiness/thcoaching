import Hero from "./components/Hero";
import Scene3D from "./components/Scene3D";
import Reveal from "./components/Reveal";
import CountUp from "./components/CountUp";
import Magnetic from "./components/Magnetic";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

const pillars = [
  {
    num: "01",
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
    num: "02",
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

function Marquee({
  items,
  ghost = false,
  reverse = false,
}: {
  items: string[];
  ghost?: boolean;
  reverse?: boolean;
}) {
  const row = `${items.join("  •  ")}  •  `;
  const cls = `marquee${ghost ? " marquee--ghost" : ""}${
    reverse ? " marquee--reverse" : ""
  }`;
  return (
    <div className={cls} aria-hidden="true">
      <div className="marquee-track">
        <span>{row.repeat(3)}</span>
        <span>{row.repeat(3)}</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Scene3D />
      <Hero />

      <Marquee
        items={[
          "Stratégie",
          "Intelligence artificielle",
          "Temps",
          "Clients",
          "Argent",
          "Alimentation",
          "Sommeil",
          "Sport",
        ]}
      />

      {/* Offre / Programme */}
      <section id="offre" className="section">
        <div className="section-glow section-glow--left" aria-hidden="true" />
        <div className="container">
          <Reveal>
            <p className="section-label">Le programme</p>
            <h2 className="section-title">
              Un Coaching Complet
              <br />
              <span className="accent">Business &amp; Performance.</span>
            </h2>
            <p className="section-intro">
              Un accompagnement à 360° qui couvre à la fois la croissance de
              votre business et votre équilibre personnel. On travaille
              l&apos;essentiel, dans l&apos;ordre qui vous fait avancer.
            </p>
          </Reveal>

          <Reveal className="pillars" stagger y={50}>
            {pillars.map((p) => (
              <div key={p.group} className="pillar" data-hover>
                <span className="pillar-num" aria-hidden="true">
                  {p.num}
                </span>
                <h3 className="pillar-title">{p.group}</h3>
                <ul className="pillar-list">
                  {p.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>

          <Reveal>
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
          </Reveal>
        </div>
      </section>

      {/* À propos */}
      <section id="apropos" className="section about">
        <span className="about-ghost" aria-hidden="true">
          360°
        </span>
        <div className="container about-grid">
          <Reveal className="about-text">
            <p className="section-label">À propos</p>
            <h2 className="section-title">
              Un coach à vos côtés,
              <br />
              pas au-dessus.
            </h2>
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
          </Reveal>
          <Reveal className="stats" stagger y={30}>
            <div className="stat">
              <strong>
                <CountUp to={360} suffix="°" />
              </strong>
              <span>vision business &amp; santé</span>
            </div>
            <div className="stat">
              <strong>
                <CountUp to={628} suffix=" €" />
              </strong>
              <span>de bonus offerts</span>
            </div>
            <div className="stat">
              <strong>
                <CountUp to={95} suffix="%" />
              </strong>
              <span>de recommandation</span>
            </div>
          </Reveal>
        </div>
      </section>

      <Marquee items={["Business", "Performance", "Santé"]} ghost reverse />

      {/* Contact */}
      <section id="contact" className="section contact">
        <div className="contact-glow" aria-hidden="true" />
        <div className="container contact-inner">
          <Reveal>
            <p className="section-label section-label--center">Contact</p>
            <h2 className="contact-title">
              Prêt à passer au
              <br />
              <span className="accent">niveau supérieur ?</span>
            </h2>
            <p className="contact-sub">
              Réservez votre appel découverte gratuit de 30 minutes. On fait le
              point sur vos objectifs, sans engagement.
            </p>
            <div className="contact-cta">
              <Magnetic>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Coaching%20Business%20%26%20Performance`}
                  className="btn btn-orange btn-xl"
                >
                  Réserver mon appel
                </a>
              </Magnetic>
            </div>
            <p className="contact-note">
              Réponse sous 24h ouvrées · {CONTACT_EMAIL}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
