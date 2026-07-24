"use client";

import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

/**
 * Scène Spline plug-and-play : passer l'URL `.splinecode` exportée
 * depuis Spline (Export → Code Export → React) et la scène remplace
 * l'objet 3D du chapitre correspondant.
 *
 * Usage : <SplineScene url="https://prod.spline.design/xxx/scene.splinecode" />
 */
export default function SplineScene({ url }: { url: string }) {
  return (
    <div className="spline-scene" aria-hidden="true">
      <Suspense fallback={null}>
        <Spline scene={url} />
      </Suspense>
    </div>
  );
}
