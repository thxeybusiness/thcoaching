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
import Scene3DLoader from "./components/Scene3DLoader";
import { TRESSE } from "./lib/tresse";

const CONTACT_EMAIL = "thxeybusiness@gmail.com";

const SITE_TITLE = "TH Coaching — Tout un écosystème pour t'aider à bâtir ton business";
const SITE_DESCRIPTION =
  "D'abord le socle : quarante-trois compétences réparties en cinq pôles, la base commune à n'importe quel projet. C'est dessus que se monte ensuite ton business, ton entreprise, ton activité — entouré d'un coach, de deux formations, d'accès privés à des outils et d'un groupe d'entrepreneurs.";

export const metadata: Metadata = {
  metadataBase: new URL("https://thcoaching.business"),
  title: {
    default: SITE_TITLE,
    template: "%s · TH Coaching",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "écosystème business",
    "socle de compétences",
    "créer son entreprise",
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
      name: "Le socle de compétences, puis le projet qui se monte dessus",
      description:
        "Les quarante-trois compétences travaillées ne sont pas une fin : c'est le socle commun à tout projet, sur lequel se construit ensuite un business, une entreprise ou une activité. Un coach, des formations, des outils et un groupe d'entrepreneurs entourent la personne accompagnée. Accompagnement en trois étapes — fondations (acquérir les bases indispensables à toute activité), perfectionnement (les affiner jusqu'au réflexe), étude et développement (identifier le business fait pour ton profil, puis le construire). Cinq pôles travaillés : fondations de soi (vision, mindset, confiance, stress, sommeil, alimentation, sport), créer et se démarquer (personal branding, storytelling, contenu, copywriting, graphisme, photo, vidéo, 3D), vente et revenus (offre, prospection, closing, négociation, gestion client, finances), systèmes et levier (IA, automatisation, process), organisation et croissance (projets, temps, décision, délégation, réseau, partenariats).",
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
.deck-nav,.deck-progress,.deck-status,.intro{display:none}
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
          {/* La marque est dessinée dans la page, et non chargée depuis un
              fichier. C'était `/logo.svg` : au changement de logo, les
              navigateurs ont continué à servir l'ancien depuis leur cache —
              même adresse, même durée de vie, aucune raison d'aller
              revérifier. Dessinée ici, elle fait partie du document : elle ne
              peut plus être en retard sur lui. */}
          <svg
            className="brand-logo"
            viewBox="0 0 120 120"
            role="img"
            aria-label="TH Coaching"
          >
            <defs>
              <linearGradient id="marqueTete" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ff8c1a" />
                <stop offset="0.55" stopColor="#ff5a1f" />
                <stop offset="1" stopColor="#e64c12" />
              </linearGradient>
            </defs>
            <g
              transform={TRESSE.pose}
              fill="none"
              stroke="url(#marqueTete)"
              strokeWidth={TRESSE.largeur}
              strokeDasharray={TRESSE.tirets}
              strokeDashoffset={TRESSE.decalage}
            >
              <path d={TRESSE.d} />
              <path d={TRESSE.d} transform={TRESSE.quart} />
            </g>
          </svg>
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
        {/* Le fond du site, dans cet ordre : les vagues en dégradés, qui
            tiennent seules tant que la 3D n'est pas là (ou si le visiteur
            préfère moins d'animations), puis la pièce en volume par-dessus. */}
        <div className="waves-bg" aria-hidden="true" />
        <Scene3DLoader />
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
