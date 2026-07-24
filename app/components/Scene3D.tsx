"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Fond 3D WebGL du hero : un champ de particules orange en onde,
 * qui se construit à l'ouverture (intro), réagit au curseur et au scroll.
 * Three.js « brut » pour rester léger et compatible React 19 / Next 15.
 */
export default function Scene3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 5.4);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: reduce ? 1 : 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uScroll: { value: 0 },
    };

    const geometry = new THREE.PlaneGeometry(16, 9, 150, 90);

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

          // Onde au curseur
          vec2 muv = (uMouse - 0.5) * vec2(16.0, 9.0);
          float md = distance(pos.xy, muv);
          w += 0.7 * exp(-md * 0.45) * sin(uTime * 2.2 - md * 1.2);

          w += uScroll;
          w *= uProgress;

          pos.z += w;
          vEl = w;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (22.0 / -mv.z) * (0.45 + uProgress * 0.75);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vEl;
        uniform float uProgress;

        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, d);

          vec3 orange = vec3(1.0, 0.35, 0.10);
          vec3 amber  = vec3(1.0, 0.68, 0.26);
          float t = smoothstep(-0.25, 0.8, vEl);
          vec3 col = mix(orange, amber, t);
          float bright = 0.30 + t * 1.0;

          gl_FragColor = vec4(col * bright, glow * uProgress * 0.9);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    points.rotation.x = -Math.PI / 2.25;
    points.position.y = -0.35;
    scene.add(points);

    // Interactions
    const targetMouse = new THREE.Vector2(0.5, 0.55);
    const onPointer = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      targetMouse.set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height
      );
    };
    window.addEventListener("pointermove", onPointer);

    let targetScroll = 0;
    const onScroll = () => {
      targetScroll = Math.min(window.scrollY * 0.0016, 1.2);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // Boucle de rendu + montée d'intro
    const clock = new THREE.Clock();
    const introDuration = 2.4;
    let raf = 0;

    const tick = () => {
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;

      if (!reduce && uniforms.uProgress.value < 1) {
        const p = Math.min(clock.elapsedTime / introDuration, 1);
        // easeOutCubic
        uniforms.uProgress.value = 1 - Math.pow(1 - p, 3);
      }

      // Lissage des interactions
      uniforms.uMouse.value.lerp(targetMouse, 0.06);
      uniforms.uScroll.value += (targetScroll - uniforms.uScroll.value) * 0.06;

      // Dérive douce de caméra + parallax souris
      camera.position.x += (
        (targetMouse.x - 0.5) * 0.6 + Math.sin(t * 0.12) * 0.25 - camera.position.x
      ) * 0.03;
      camera.position.y += (
        1.5 + (targetMouse.y - 0.55) * -0.4 - camera.position.y
      ) * 0.03;
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
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="hero-canvas" aria-hidden="true" />;
}
