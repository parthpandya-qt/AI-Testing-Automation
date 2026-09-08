"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0008);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    // --- Deep Space Galaxy Starfield Dome (from threejs-earth) ---
    const starfieldTexture = textureLoader.load("/earth/galaxystarfield.png");
    starfieldTexture.wrapS = THREE.RepeatWrapping;
    starfieldTexture.wrapT = THREE.RepeatWrapping;
    starfieldTexture.repeat.set(2, 2);

    const starDomeGeo = new THREE.SphereGeometry(600, 48, 48);
    const starDomeMat = new THREE.MeshBasicMaterial({
      map: starfieldTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.85,
    });
    const starDome = new THREE.Mesh(starDomeGeo, starDomeMat);
    scene.add(starDome);

    // --- Ambient & Accent Lights ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 2, 250);
    cyanLight.position.set(60, 40, 50);
    scene.add(cyanLight);

    const indigoLight = new THREE.PointLight(0x818cf8, 2, 250);
    indigoLight.position.set(-60, -40, 40);
    scene.add(indigoLight);

    // --- Twinkling 3D Star Particles for Parallax Depth ---
    const particleCount = 1600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorA = new THREE.Color("#38bdf8"); // Cyan glow
    const colorB = new THREE.Color("#818cf8"); // Soft indigo
    const colorC = new THREE.Color("#ffffff"); // Diamond white
    const colorD = new THREE.Color("#93c5fd"); // Starlight blue

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 500;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 450;

      const rand = Math.random();
      const mixedColor =
        rand < 0.2
          ? colorA
          : rand < 0.4
          ? colorB
          : rand < 0.75
          ? colorC
          : colorD;

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 1.5 + 0.5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    // --- Mouse Movement & Parallax ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.03;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.03;
    };
    window.addEventListener("mousemove", onMouseMove);

    // --- Resize Handler ---
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation for subtle parallax
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      camera.position.x = targetX * 0.5;
      camera.position.y = -targetY * 0.5;
      camera.lookAt(0, 0, 0);

      // Rotate galaxy star dome slowly
      starDome.rotation.y = elapsedTime * 0.004;
      starDome.rotation.x = Math.sin(elapsedTime * 0.002) * 0.02;

      // Rotate particle stars
      particleSystem.rotation.y = elapsedTime * 0.015;
      particleSystem.rotation.x = elapsedTime * 0.008;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      starDomeGeo.dispose();
      starDomeMat.dispose();
      starfieldTexture.dispose();
      geometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}

