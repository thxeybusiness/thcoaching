import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { TRESSE } from "./lib/tresse";

/**
 * Visuel partagé sur WhatsApp, LinkedIn, iMessage, X…
 * Utilisé à la fois par `opengraph-image` et `twitter-image`.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "TH Coaching — Bâtir le business qui te correspond vraiment.";

const FONT_FILES = {
  soraBold: "@fontsource/sora/files/sora-latin-800-normal.woff",
  grotesk: "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff",
  groteskMedium:
    "@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff",
};

function loadFont(relativePath: string) {
  return readFile(join(process.cwd(), "node_modules", relativePath));
}

/**
 * La tresse, en dégradé orange, encodée en data URI.
 *
 * Le tracé vient de `lib/tresse`, comme le logo du site et l'icône : la
 * vignette de partage ne redessine pas la marque de son côté, sans quoi elle
 * dériverait au premier ajustement des proportions. Pas de fond non plus —
 * l'entrelacement est fait de vrais trous, la marque se pose donc directement
 * sur le noir de la vignette.
 */
const LOGO_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff8c1a"/>
        <stop offset="55%" stop-color="#ff5a1f"/>
        <stop offset="100%" stop-color="#e64c12"/>
      </linearGradient>
    </defs>
    <g transform="${TRESSE.pose}" fill="none" stroke="url(#g)" stroke-width="${TRESSE.largeur}" stroke-dasharray="${TRESSE.tirets}" stroke-dashoffset="${TRESSE.decalage}">
      <path d="${TRESSE.d}"/>
      <path d="${TRESSE.d}" transform="${TRESSE.quart}"/>
    </g>
  </svg>`
).toString("base64")}`;

export async function renderShareImage() {
  const [soraBold, grotesk, groteskMedium] = await Promise.all([
    loadFont(FONT_FILES.soraBold),
    loadFont(FONT_FILES.grotesk),
    loadFont(FONT_FILES.groteskMedium),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Halo orange en arrière-plan */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -180,
            width: 760,
            height: 760,
            borderRadius: 760,
            background:
              "radial-gradient(circle, rgba(255,90,31,0.34) 0%, rgba(255,90,31,0.10) 45%, rgba(255,90,31,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -320,
            left: -200,
            width: 700,
            height: 700,
            borderRadius: 700,
            background:
              "radial-gradient(circle, rgba(255,140,26,0.18) 0%, rgba(255,140,26,0) 68%)",
          }}
        />

        {/* En-tête : logo + nom */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_DATA_URI} width={86} height={86} alt="" />
          <span
            style={{
              fontFamily: "Sora",
              fontSize: 34,
              fontWeight: 800,
              color: "#f4f2ef",
              letterSpacing: "-0.01em",
            }}
          >
            TH Coaching
          </span>
        </div>

        {/* Accroche */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <span
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#ff8c1a",
            }}
          >
            Coaching Business &amp; Performance
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Sora",
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#f4f2ef",
            }}
          >
            <span>Bâtir le business</span>
            <span style={{ color: "#ff5a1f" }}>
              qui te correspond vraiment.
            </span>
          </div>
        </div>

        {/* Pied : promesse + domaine */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 26,
            fontFamily: "Space Grotesk",
            fontSize: 26,
            color: "rgba(255,255,255,0.62)",
          }}
        >
          <span>Fondations · Perfectionnement · Développement</span>
          <span style={{ color: "#ff8c1a", fontWeight: 500 }}>
            thcoaching.business
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Sora", data: soraBold, weight: 800, style: "normal" },
        { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
        {
          name: "Space Grotesk",
          data: groteskMedium,
          weight: 500,
          style: "normal",
        },
      ],
    }
  );
}
