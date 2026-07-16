import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const CONTACT_EMAIL = "contact@thcoaching.business";

export const metadata: Metadata = {
  metadataBase: new URL("https://thcoaching.business"),
  title: {
    default: "TH Coaching — Accompagnement & coaching professionnel",
    template: "%s · TH Coaching",
  },
  description:
    "TH Coaching accompagne particuliers et dirigeants vers plus de clarté, de confiance et de résultats. Coaching individuel, coaching professionnel et ateliers.",
  keywords: [
    "coaching",
    "coach professionnel",
    "développement personnel",
    "accompagnement",
    "coaching de vie",
    "coaching dirigeant",
  ],
  openGraph: {
    title: "TH Coaching — Accompagnement & coaching professionnel",
    description:
      "Coaching individuel et professionnel pour révéler votre potentiel et atteindre vos objectifs.",
    url: "https://thcoaching.business",
    siteName: "TH Coaching",
    locale: "fr_FR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Accueil TH Coaching">
          <span className="brand-mark">TH</span>
          <span className="brand-name">Coaching</span>
        </Link>
        <nav className="nav" aria-label="Navigation principale">
          <a href="#services">Services</a>
          <a href="#methode">Méthode</a>
          <a href="#apropos">À propos</a>
          <a href="#temoignages">Témoignages</a>
          <a href="#contact" className="nav-cta">
            Réserver un appel
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const year = 2026;
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="brand brand--footer">
            <span className="brand-mark">TH</span>
            <span className="brand-name">Coaching</span>
          </div>
          <p className="footer-tagline">
            Accompagnement humain, orienté résultats.
          </p>
        </div>
        <div className="footer-links">
          <a href="#services">Services</a>
          <a href="#methode">Méthode</a>
          <a href="#contact">Contact</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
        <p className="footer-legal">© {year} TH Coaching · thcoaching.business</p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
