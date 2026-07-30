import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Intro from "./components/Intro";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

const SITE_TITLE = "TH Coaching — Coaching Business & Performance";
const SITE_DESCRIPTION =
  "Bâtir le business qui te correspond vraiment : on acquiert les fondamentaux, on les perfectionne jusqu'au réflexe, puis une étude personnalisée détermine le projet fait pour ton profil. Quatre piliers, dix-sept compétences.";

export const metadata: Metadata = {
  metadataBase: new URL("https://thcoaching.business"),
  title: {
    default: SITE_TITLE,
    template: "%s · TH Coaching",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "coaching business",
    "coach entrepreneur",
    "performance",
    "stratégie business",
    "intelligence artificielle",
    "gestion du temps",
    "accompagnement dirigeant",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "https://thcoaching.business",
    siteName: "TH Coaching",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: "https://thcoaching.business" },
  robots: { index: true, follow: true },
};

/** Fiche structurée pour Google (rich results / knowledge panel). */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "TH Coaching",
  url: "https://thcoaching.business",
  logo: "https://thcoaching.business/logo.svg",
  image: "https://thcoaching.business/opengraph-image",
  email: CONTACT_EMAIL,
  description: SITE_DESCRIPTION,
  inLanguage: "fr",
  serviceType: "Coaching business et performance",
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "Un Coaching Complet Business & Performance",
      description:
        "Accompagnement en trois étapes — fondations (acquérir les bases indispensables à toute activité), perfectionnement (les affiner jusqu'au réflexe), étude et développement (identifier le business fait pour ton profil, puis le construire). Quatre piliers travaillés : fondations personnelles (mindset, physiologie, sommeil, alimentation, sport), compétences commerciales (vente, closing, gestion client, finances), compétences créatives et techniques (contenu, graphisme, vidéo, 3D, IA), pilotage et levier (temps, projets, réseau).",
    },
  },
};

const NOSCRIPT_CSS = `
.deck[data-ready="true"]{height:auto;overflow:visible}
.deck[data-ready="true"] .deck-track{display:block;height:auto;transform:none}
.deck[data-ready="true"] .slide{width:auto;height:auto;min-height:100vh}
.deck[data-ready="true"] .slide-inner{display:block;height:auto;overflow:visible;padding:118px 0 96px}
.deck[data-ready="true"] .slide-inner>*{margin-block:0}
.deck[data-ready="true"] [data-r]{opacity:1;transform:none}
.deck-nav,.deck-progress,.deck-status,.slide-scroll-hint,.intro{display:none}
.contact-legal{position:static;transform:none;margin-top:28px}
.slide--contact .footer-word{position:static;transform:none}
`;

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
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
          <a href="/#offre">Programme</a>
          <a href="/#apropos">À propos</a>
          <a href="/#contact" className="nav-cta">
            <span className="nav-cta-long">Réserver un appel</span>
            <span className="nav-cta-short">Réserver</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {/* Sans JavaScript, le défilement horizontal ne peut pas fonctionner :
            on rétablit les chapitres empilés verticalement, tout le contenu
            reste alors lisible et indexable. */}
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        <div className="waves-bg" aria-hidden="true" />
        <Intro />
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <Header />
        <main id="contenu">{children}</main>
        <div className="grain" aria-hidden="true" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
