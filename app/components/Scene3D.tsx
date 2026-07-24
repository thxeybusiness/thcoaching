"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Monde 3D continu (canvas fixe plein écran) :
 * — vague de particules + lucioles dans le hero (s'estompent au scroll)
 * — objet « chrome liquide » éclairé studio qui voyage à travers les
 *   chapitres de la page, piloté par le scroll (chorégraphie par keyframes),
 *   avec inertie et parallax souris.
 */

type KF = { p: number; x: number; y: number; s: number; ry: number };

const KEYFRAMES: KF[] = [
  { p: 0.0, x: 2.4, y: 0.2, s: 1.0, ry: 0.6 },
  { p: 0.3, x: -2.5, y: 0.1, s: 0.8, ry: 2.6 },
  { p: 0.62, x: 2.5, y: 0.15, s: 0.85, ry: 4.4 },
  { p: 1.0, x: 0.0, y: -0.55, s: 1.05, ry: 6.2 },
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
        ry: a.ry + (b.ry - a.ry) * t,
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // Éclairage studio (reflets) + lumières orange
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const keyLight = new THREE.PointLight(0xff5a1f, 60, 30);
    keyLight.position.set(3.5, 2.5, 2.5);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xff8c1a, 30, 30);
    fillLight.position.set(-3.5, -1.5, 2);
    scene.add(fillLight);

    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: reduce ? 1 : 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uScroll: { value: 0 },
      uFade: { value: 1 },
    };

    // ---- Vague de particules (chapitre hero) ----
    const geometry = new THREE.PlaneGeometry(18, 10, 170, 95);
    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uProgress;
        uniform vec2 uMouse;
        uniform float uScroll;
        varying float vEl;

        void main() {
          vec3 pos = position;

          float w =
              sin(pos.x * 0.85 + uTime * 0.9) * 0.34
            + sin(pos.y * 1.05 + uTime * 0.7) * 0.30
            + sin((pos.x + pos.y) * 0.55 + uTime * 1.15) * 0.20;

          vec2 muv = (uMouse - 0.5) * vec2(18.0, 10.0);
          float md = distance(pos.xy, muv);
          w += 0.7 * exp(-md * 0.45) * sin(uTime * 2.2 - md * 1.2);

          w += uScroll;
          w *= uProgress;

          pos.z += w;
          vEl = w;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (30.0 / -mv.z) * (0.45 + uProgress * 0.75);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying float vEl;
        uniform float uProgress;
        uniform float uFade;

        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, d);

          vec3 orange = vec3(1.0, 0.35, 0.10);
          vec3 amber  = vec3(1.0, 0.68, 0.26);
          float t = smoothstep(-0.25, 0.8, vEl);
          vec3 col = mix(orange, amber, t);
          float bright = 0.42 + t * 1.1;

          gl_FragColor = vec4(col * bright, min(1.0, glow * uProgress * uFade * 1.3));
        }
      `,
    });
    material.toneMapped = false;
    const points = new THREE.Points(geometry, material);
    points.rotation.x = -Math.PI / 2.25;
    points.position.y = -0.35;
    scene.add(points);

    // ---- Lucioles (présentes sur toute la page, plus discrètes ensuite) ----
    const F_COUNT = 170;
    const fGeo = new THREE.BufferGeometry();
    const fPos = new Float32Array(F_COUNT * 3);
    const fSeed = new Float32Array(F_COUNT);
    for (let i = 0; i < F_COUNT; i++) {
      fPos[i * 3] = (Math.random() - 0.5) * 15;
      fPos[i * 3 + 1] = Math.random() * 4.4 - 0.8;
      fPos[i * 3 + 2] = (Math.random() - 0.5) * 7;
      fSeed[i] = Math.random();
    }
    fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
    fGeo.setAttribute("aSeed", new THREE.BufferAttribute(fSeed, 1));
    const fMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: uniforms.uTime,
        uProgress: uniforms.uProgress,
        uFade: uniforms.uFade,
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uProgress;
        attribute float aSeed;
        varying float vTw;
        varying float vSeed;

        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.35 + aSeed * 43.0) * 0.4;
          pos.x += cos(uTime * 0.22 + aSeed * 27.0) * 0.35;
          vTw = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.7 + aSeed * 80.0));
          vSeed = aSeed;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = ((aSeed * 30.0 + 9.0) / -mv.z) * uProgress;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uProgress;
        uniform float uFade;
        varying float vTw;
        varying float vSeed;

        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float glow = pow(smoothstep(0.5, 0.0, d), 1.6);
          vec3 col = mix(vec3(1.0, 0.45, 0.14), vec3(1.0, 0.82, 0.5), vSeed);
          float fade = max(uFade, 0.35);
          gl_FragColor = vec4(col, glow * vTw * uProgress * fade * 0.75);
        }
      `,
    });
    fMat.toneMapped = false;
    const fireflies = new THREE.Points(fGeo, fMat);
    scene.add(fireflies);

    // ---- Forme signature : disque orange pastel aux bords diffus ----
    // (reproduction de la forme Spline « Liquid Circle » de l'utilisateur)
    const blob = new THREE.Group();

    const discGeo = new THREE.CircleGeometry(1.15, 96);
    const discUniforms = { uTime: { value: 0 } };
    const discMat = new THREE.ShaderMaterial({
      uniforms: discUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 c = vUv - 0.5;
          float r = length(c) * 2.0;
          float a = atan(c.y, c.x);

          // Bord organique qui respire doucement (effet « liquid »)
          float wob = 0.05 * sin(a * 3.0 + uTime * 0.5)
                    + 0.035 * sin(a * 5.0 - uTime * 0.35);

          // Dégradé pêche → orange doux, bord très diffus
          vec3 centre = vec3(1.0, 0.86, 0.69);
          vec3 bord   = vec3(0.97, 0.63, 0.35);
          vec3 col = mix(centre, bord, smoothstep(0.15, 0.95, r));

          float alpha = 1.0 - smoothstep(0.30 + wob, 0.98 + wob, r);
          alpha = pow(alpha, 1.5);

          gl_FragColor = vec4(col, alpha * 0.97);
        }
      `,
    });
    discMat.toneMapped = false;
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.scale.set(1.0, 0.85, 1.0); // légèrement elliptique, comme la référence
    blob.add(disc);

    // Halo très doux derrière la forme
    const haloCanvas = document.createElement("canvas");
    haloCanvas.width = haloCanvas.height = 128;
    const hctx = haloCanvas.getContext("2d");
    if (hctx) {
      const grad = hctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,170,100,0.30)");
      grad.addColorStop(0.5, "rgba(255,130,60,0.12)");
      grad.addColorStop(1, "rgba(255,110,40,0)");
      hctx.fillStyle = grad;
      hctx.fillRect(0, 0, 128, 128);
    }
    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const haloMat = new THREE.SpriteMaterial({
      map: haloTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      transparent: true,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(3.4);
    halo.position.z = -0.3;
    blob.add(halo);

    // Face caméra, inclinaison légère + rotation dans le plan (comme la réf.)
    blob.rotation.set(-0.18, 0.12, 0.45);
    blob.position.set(KEYFRAMES[0].x, KEYFRAMES[0].y, 0.6);
    scene.add(blob);

    // ---- Interactions ----
    const targetMouse = new THREE.Vector2(0.5, 0.55);
    const onPointer = (e: PointerEvent) => {
      targetMouse.set(
        e.clientX / width,
        1 - e.clientY / height
      );
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let targetScroll = 0;
    const onScroll = () => {
      targetScroll = Math.min(window.scrollY * 0.0016, 1.2);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

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
    const introDuration = 2.2;
    let raf = 0;
    let pageP = 0;

    const tick = () => {
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      discUniforms.uTime.value = t;

      if (!reduce && uniforms.uProgress.value < 1) {
        const p = Math.min(clock.elapsedTime / introDuration, 1);
        uniforms.uProgress.value = 1 - Math.pow(1 - p, 3);
      }

      uniforms.uMouse.value.lerp(targetMouse, 0.06);
      uniforms.uScroll.value += (targetScroll - uniforms.uScroll.value) * 0.06;

      // Fondu de la vague après le hero
      const fadeTarget = Math.max(0, 1 - (window.scrollY / height) * 1.15);
      uniforms.uFade.value += (fadeTarget - uniforms.uFade.value) * 0.08;

      // Progression 0→1 sur la hauteur totale de la page
      const docH = document.documentElement.scrollHeight - height;
      const rawP = docH > 0 ? window.scrollY / docH : 0;
      pageP += (rawP - pageP) * 0.07; // inertie

      const kf = sampleKF(pageP);
      const aspectScale = Math.min(1, camera.aspect / 1.45);
      const mx = uniforms.uMouse.value.x - 0.5;
      const my = uniforms.uMouse.value.y - 0.55;

      // Respiration douce + halo vivant
      const breathe = 1 + Math.sin(t * 0.8) * 0.045;
      haloMat.opacity = 0.8 + Math.sin(t * 0.8) * 0.12;

      blob.position.x = kf.x * aspectScale + mx * 0.3;
      blob.position.y = kf.y + my * 0.25 + Math.sin(t * 0.45) * 0.08;
      blob.scale.setScalar(kf.s * 0.92 * breathe * uniforms.uProgress.value);
      blob.rotation.z = 0.45 + t * 0.04 + mx * 0.1;
      blob.rotation.x = -0.18 + my * -0.12;
      blob.rotation.y = 0.12 + kf.ry * 0.03 + mx * 0.15;

      // Caméra : dérive douce + parallax
      camera.position.x += (mx * 0.5 + Math.sin(t * 0.12) * 0.2 - camera.position.x) * 0.03;
      camera.position.y += (1.4 + my * -0.35 - camera.position.y) * 0.03;
      camera.lookAt(0, 0.1, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      fGeo.dispose();
      fMat.dispose();
      discGeo.dispose();
      discMat.dispose();
      haloTex.dispose();
      haloMat.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="world-canvas" aria-hidden="true" />;
}
