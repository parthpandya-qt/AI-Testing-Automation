"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Globe, ShieldCheck, Zap } from "lucide-react";

interface ThreeInteractiveOrbProps {
  badgesRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ThreeInteractiveOrb({ badgesRef }: ThreeInteractiveOrbProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 320;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.4;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    // --- Lighting ---
    // Ambient light so the night side is subtly visible
    const ambientLight = new THREE.AmbientLight(0x2a3b50, 0.9);
    scene.add(ambientLight);

    // Directional sunlight casting authentic day/night terminator
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(4, 2.5, 4.5);
    scene.add(sunLight);

    // Soft cyan rim light for cosmic contrast
    const rimLight = new THREE.PointLight(0x38bdf8, 1.8, 15);
    rimLight.position.set(-4, -2, -2);
    scene.add(rimLight);

    // --- Main Container with 23.4° Axial Tilt ---
    const earthContainer = new THREE.Object3D();
    earthContainer.rotation.z = (-23.4 * Math.PI) / 180;
    scene.add(earthContainer);

    // --- 2. Earth Sphere with Photographic Textures ---
    const earthGeo = new THREE.SphereGeometry(1.55, 64, 64);
    const earthMap = textureLoader.load("/earth/earthmap1k.jpg");
    const earthBump = textureLoader.load("/earth/earthbump1k.jpg");
    const earthSpec = textureLoader.load("/earth/earthspec1k.jpg");

    const earthMat = new THREE.MeshPhongMaterial({
      map: earthMap,
      bumpMap: earthBump,
      bumpScale: 0.04,
      specularMap: earthSpec,
      specular: new THREE.Color(0x334e68),
      shininess: 25,
      side: THREE.FrontSide,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthContainer.add(earthMesh);

    // --- 3. Dynamic Clouds Sphere with Alpha Transparency ---
    const cloudGeo = new THREE.SphereGeometry(1.575, 64, 64);
    const cloudTexture = textureLoader.load(
      "/earth/earthcloudmap_transparent.png"
    );

    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      side: THREE.DoubleSide,
      opacity: 0.85,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthContainer.add(cloudMesh);

    // --- 4. Atmospheric Blue Fresnel Glow Shader ---
    const atmosphereGeo = new THREE.SphereGeometry(1.63, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        coeficient: { value: 0.8 },
        power: { value: 2.0 },
        glowColor: { value: new THREE.Color(0x00b3ff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float coeficient;
        uniform float power;
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(coeficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
          gl_FragColor = vec4(glowColor, intensity * 0.9);
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthContainer.add(atmosphereMesh);

    // --- 5. Interactive Drag & Rotation Logic ---
    let isDragging = false;
    let previousPointerPosition = { x: 0, y: 0 };
    let velocityX = 0;
    let velocityY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      previousPointerPosition = { x: e.clientX, y: e.clientY };
      velocityX = 0;
      velocityY = 0;
      mount.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointerPosition.x;
      const deltaY = e.clientY - previousPointerPosition.y;

      velocityX = deltaX * 0.005;
      velocityY = deltaY * 0.005;

      earthMesh.rotation.y += velocityX;
      cloudMesh.rotation.y += velocityX * 1.1;
      earthContainer.rotation.x += velocityY * 0.5;

      previousPointerPosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      setIsInteracting(false);
      try {
        mount.releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch if pointer wasn't captured
      }
    };

    mount.addEventListener("pointerdown", handlePointerDown);
    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerup", handlePointerUp);
    mount.addEventListener("pointercancel", handlePointerUp);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!isDragging) {
        // Apply inertia decay
        velocityX *= 0.94;
        velocityY *= 0.94;

        // Base continuous rotation
        earthMesh.rotation.y += 0.0012 + velocityX;
        // Clouds drift slightly faster across continents
        cloudMesh.rotation.y += 0.0018 + velocityX * 1.1;
        earthContainer.rotation.x += velocityY * 0.5;

        // Keep axial tilt within comfortable view bounds
        earthContainer.rotation.x = THREE.MathUtils.clamp(
          earthContainer.rotation.x,
          -0.5,
          0.5
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      mount.removeEventListener("pointerdown", handlePointerDown);
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerup", handlePointerUp);
      mount.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("resize", handleResize);

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      earthGeo.dispose();
      earthMat.dispose();
      earthMap.dispose();
      earthBump.dispose();
      earthSpec.dispose();

      cloudGeo.dispose();
      cloudMat.dispose();
      cloudTexture.dispose();

      atmosphereGeo.dispose();
      atmosphereMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full max-w-[460px] aspect-square mx-auto select-none">
      {/* 3D Earth Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10 touch-none"
        title="Click and drag to rotate the photorealistic 3D Earth"
      />

      {/* Floating Holographic Status Badges (Hidden on narrow mobile to prevent horizontal overflow) */}
      <div
        ref={badgesRef}
        className="pointer-events-none hidden sm:block transition-opacity duration-150"
      >
        <div className="absolute -top-3 -left-2 z-20 animate-bounce duration-1000">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl backdrop-blur-md bg-slate-900/85 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Global Test Infrastructure</span>
          </div>
        </div>

        <div className="absolute top-1/4 -right-4 z-20">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl backdrop-blur-md bg-slate-900/85 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>99.8% Test Accuracy</span>
          </div>
        </div>

        <div className="absolute -bottom-2 -right-3 z-20">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl backdrop-blur-md bg-slate-900/85 border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow-lg shadow-indigo-500/10">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Sub-Second Test Runs</span>
          </div>
        </div>

        {/* Interactive Drag Hint */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap bg-slate-900/60 backdrop-blur-xs px-3 py-0.5 rounded-full border border-slate-800/60">
          {isInteracting ? "Rotating 3D Earth" : "Drag to Rotate 3D Earth"}
        </div>
      </div>
    </div>
  );
}
