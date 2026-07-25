"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Scène 3D minimale : le logo TH Coaching (3 vagues extrudées, orange),
 * qui suit la souris (parallax + inclinaison) et voyage à travers les
 * chapitres de la page au scroll, jusqu'au coucher derrière le wordmark.
 * Aucun shader custom, aucune particule, aucun blending additif —
 * uniquement des matériaux standards, fiables sur tous les navigateurs.
 */

type KF = { p: number; x: number; y: number; s: number };

const KEYFRAMES: KF[] = [
  { p: 0.0, x: 2.4, y: 0.2, s: 1.0 },
  { p: 0.3, x: -2.5, y: 0.1, s: 0.8 },
  { p: 0.6, x: 2.5, y: 0.15, s: 0.85 },
  { p: 0.84, x: -2.4, y: 0.2, s: 1.0 },
  // Fin de page : le logo se couche derrière le wordmark
  { p: 1.0, x: 0.0, y: -1.95, s: 1.25 },
];

function sampleKF(p: number): KF {
  if (p <= KEYFRAMES[0].p) return KEYFRAMES[0];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    if (p >= a.p && p <= b.p) {
      let t = (p - a.p) / (b.p - a.p);
      t = t * t * (3 - 2 * t); // smoothstep
      return {
        p,
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        s: a.s + (b.s - a.s) * t,
      };
    }
  }
  return KEYFRAMES[KEYFRAMES.length - 1];
}

export default function Scene3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 5.6);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // ---- Le logo TH Coaching (3 vagues extrudées) ----
    const LOGO_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><path d='M12 20 C44 4 76 34 108 14 L108 34 C76 54 44 24 12 40 Z'/><path d='M12 49 C44 33 76 63 108 43 L108 63 C76 83 44 53 12 69 Z'/><path d='M12 78 C44 62 76 92 108 72 L108 92 C76 112 44 82 12 98 Z'/></svg>`;
    const svgData = new SVGLoader().parse(LOGO_SVG);
    const logoMat = new THREE.MeshBasicMaterial({
      color: 0xff8c2e,
      side: THREE.DoubleSide,
    });
    logoMat.toneMapped = false;
    const logoGeos: THREE.BufferGeometry[] = [];
    const blob = new THREE.Group();
    const logo = new THREE.Group();
    svgData.paths.forEach((p) => {
      SVGLoader.createShapes(p).forEach((shape) => {
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: 6,
          bevelEnabled: false,
        });
        geo.translate(-60, -59, -3);
        geo.scale(1, -1, 1); // repère SVG (y vers le bas) → repère 3D
        logoGeos.push(geo);
        logo.add(new THREE.Mesh(geo, logoMat));
      });
    });
    const LOGO_SCALE = 0.019;
    logo.scale.setScalar(LOGO_SCALE);
    blob.add(logo);
    blob.rotation.set(-0.18, 0.12, 0.45);
    blob.position.set(KEYFRAMES[0].x, KEYFRAMES[0].y, 0.6);
    scene.add(blob);

    // ---- Interactions ----
    const targetMouse = new THREE.Vector2(0.5, 0.55);
    const mouse = new THREE.Vector2(0.5, 0.55);
    const onPointer = (e: PointerEvent) => {
      targetMouse.set(e.clientX / width, 1 - e.clientY / height);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // ---- Boucle ----
    const clock = new THREE.Clock();
    const introDelay = 1.55; // le logo 3D apparaît à la levée du rideau (×1.4)
    const introDuration = 1.4;
    let progress = reduce ? 1 : 0;
    let pageP = 0;
    let raf = 0;

    const tick = () => {
      const t = clock.getElapsedTime();

      if (!reduce && progress < 1) {
        const p = Math.min(Math.max(t - introDelay, 0) / introDuration, 1);
        progress = 1 - Math.pow(1 - p, 3);
      }

      mouse.lerp(targetMouse, 0.06);
      const mx = mouse.x - 0.5;
      const my = mouse.y - 0.55;

      // Progression 0→1 sur la hauteur totale de la page (avec inertie)
      const docH = document.documentElement.scrollHeight - height;
      const rawP = docH > 0 ? window.scrollY / docH : 0;
      pageP += (rawP - pageP) * 0.07;

      const kf = sampleKF(pageP);
      const aspectScale = Math.min(1, camera.aspect / 1.45);
      const breathe = 1 + Math.sin(t * 0.8) * 0.04;

      blob.position.x = kf.x * aspectScale + mx * 0.3;
      blob.position.y = kf.y + my * 0.25 + Math.sin(t * 0.45) * 0.07;
      blob.scale.setScalar(kf.s * 0.92 * breathe * progress);
      blob.rotation.z = Math.sin(t * 0.35) * 0.07 + mx * 0.08;
      blob.rotation.x = -0.12 + my * -0.12;
      blob.rotation.y = 0.08 + Math.sin(t * 0.25) * 0.1 + mx * 0.2;

      // Caméra : dérive douce + parallax souris
      camera.position.x +=
        (mx * 0.5 + Math.sin(t * 0.12) * 0.2 - camera.position.x) * 0.03;
      camera.position.y += (1.4 + my * -0.35 - camera.position.y) * 0.03;
      camera.lookAt(0, 0.1, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      logoGeos.forEach((g) => g.dispose());
      logoMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="world-canvas" aria-hidden="true" />;
}
