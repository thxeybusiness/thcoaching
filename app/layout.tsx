import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

export const metadata: Metadata = {
  metadataBase: new URL("https://thcoaching.business"),
  title: {
    default: "TH Coaching — Coach professionnel & de vie",
    template: "%s · TH Coaching",
  },
  description:
    "TH Coaching accompagne particuliers, dirigeants et équipes vers plus de clarté, de confiance et de résultats concrets. Coaching individuel, professionnel et ateliers.",
  keywords: [
    "coaching",
    "coach professionnel",
    "développement personnel",
    "accompagnement",
    "coaching de vie",
    "coaching dirigeant",
  ],
  openGraph: {
    title: "TH Coaching — Coach professionnel & de vie",
    description:
      "Un accompagnement humain, structuré et orienté action pour atteindre vos objectifs.",
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="TH Coaching" className="brand-logo" width={44} height={44} />
        </Link>
        <nav className="nav" aria-label="Navigation principale">
          <a href="#offre">Programme</a>
          <a href="#apropos">À propos</a>
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
      <p className="footer-word" aria-hidden="true">
        TH Coaching
      </p>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="brand-logo" width={44} height={44} />
            <p className="footer-tagline">
              Business &amp; Performance —
              <br />
              un accompagnement à 360°.
            </p>
          </div>
          <div className="footer-links">
            <a href="#offre">Programme</a>
            <a href="#apropos">À propos</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </div>
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
        <div className="waves-bg" aria-hidden="true" />
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
