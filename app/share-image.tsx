import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Visuel partagé sur WhatsApp, LinkedIn, iMessage, X…
 * Utilisé à la fois par `opengraph-image` et `twitter-image`.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "TH Coaching — Développez votre business sans négliger votre santé.";

const FONT_FILES = {
  soraBold: "@fontsource/sora/files/sora-latin-800-normal.woff",
  grotesk: "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff",
  groteskMedium:
    "@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff",
};

function loadFont(relativePath: string) {
  return readFile(join(process.cwd(), "node_modules", relativePath));
}

/** Le logo 3 vagues, en dégradé orange, encodé en data URI. */
const LOGO_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff8c1a"/>
        <stop offset="100%" stop-color="#ff5a1f"/>
      </linearGradient>
    </defs>
    <g fill="url(#g)">
      <path d="M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z"/>
      <path d="M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z"/>
      <path d="M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z"/>
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
            <span>Développez votre business.</span>
            <span style={{ color: "#ff5a1f" }}>Sans négliger votre santé.</span>
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
          <span>Stratégie · IA · Temps · Clients · Argent · Santé</span>
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
