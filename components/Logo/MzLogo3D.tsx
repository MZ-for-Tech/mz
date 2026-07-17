"use client";

import {
  Suspense,
  useMemo,
  useRef,
  useEffect
} from "react";

import {
  Canvas,
  useLoader,
  useFrame,
  useThree
} from "@react-three/fiber";

import { Center } from "@react-three/drei";

import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/*
 * Z-offset per painter's layer (in SVG coordinate units).
 * The SVG has 480 paths drawn back-to-front. 75 positions have
 * multiple stacked paths (confirmed by analysis). Without a Z offset
 * those paths share the exact same depth plane → z-fighting / flickering.
 *
 * 480 * 0.02 = 9.6 SVG units total stack height.
 * At scale 0.0035 → 0.034 world units (invisible at camera z=12).
 * The extrude depth is 32 SVG units, so the stack is < 30% of depth,
 * meaning the faces never bleed through the back of the logo.
 */
const Z_STEP = 0.02;

function Logo() {
  const svg = useLoader(SVGLoader, "/mz.svg");

  const logoRef = useRef<THREE.Group>(null);
  const sweepLightRef = useRef<THREE.PointLight>(null);

  const { gl } = useThree();

  // Interaction state — all in refs, never triggers re-render
  const hovered = useRef(false);
  const scrollY = useRef(0);
  const scrollVel = useRef(0);  // scroll velocity for spin kick

  const extrudeSettings = useMemo(
    () => ({
      depth: 32,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelSegments: 2,
      curveSegments: 1,
    }),
    []
  );

  /*
   * Build one entry per shape, preserving SVG painter's draw order.
   * Each shape gets a unique z offset (pathIndex * Z_STEP) so no two
   * shapes share the same depth plane → z-fighting eliminated.
   *
   * Material cache: identical hex colors reuse the same material object,
   * so we never create more materials than there are unique colors.
   */
  const meshData = useMemo(() => {
    const materialCache = new Map<string, THREE.MeshStandardMaterial>();

    const getMaterial = (color: string) => {
      if (!materialCache.has(color)) {
        materialCache.set(
          color,
          new THREE.MeshStandardMaterial({
            color,
            metalness: 0.9,
            roughness: 0.25,
          })
        );
      }
      return materialCache.get(color)!;
    };

    let pathIndex = 0;
    const items: {
      geometry: THREE.ExtrudeGeometry;
      material: THREE.MeshStandardMaterial;
      zOffset: number;
    }[] = [];

    svg.paths.forEach((path) => {
      const color = `#${path.color.getHexString()}`;
      const zOffset = pathIndex * Z_STEP;
      pathIndex++;

      path.toShapes().forEach((shape) => {
        items.push({
          geometry: new THREE.ExtrudeGeometry(shape, extrudeSettings),
          material: getMaterial(color),
          zOffset,
        });
      });
    });


    return items;
  }, [svg, extrudeSettings]);

  useEffect(() => {
    const geos = meshData.map((d) => d.geometry);
    const mats = new Set(meshData.map((d) => d.material));
    return () => {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    };
  }, [meshData]);

  // Hover tracking on the WebGL canvas element
  useEffect(() => {
    const el = gl.domElement;
    const onEnter = () => { hovered.current = true; };
    const onLeave = () => { hovered.current = false; };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  // Scroll tracking + velocity for spin kick
  useEffect(() => {
    let lastY = window.scrollY;
    let velDecayTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const current = window.scrollY;
      scrollVel.current = (current - lastY) * 0.002; // scale to sane range
      lastY = current;
      scrollY.current = current;
      clearTimeout(velDecayTimer);
      // Decay velocity to 0 shortly after scrolling stops
      velDecayTimer = setTimeout(() => { scrollVel.current = 0; }, 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(velDecayTimer);
    };
  }, []);

  useFrame((state) => {
    if (!logoRef.current) return;

    const t = state.clock.elapsedTime;
    const isHovered = hovered.current;

    // --- Scroll tilt: logo tilts back as user scrolls down ---
    const scrollProgress = Math.min(scrollY.current / (window.innerHeight * 0.8), 1);
    const scrollTiltX = scrollProgress * 0.4; // max ~23° backward tilt

    // --- Mouse tracking & interaction ---
    // Tilt influence doubles while hovering (feels magnetic)
    const tiltStrength = isHovered ? 0.22 : 0.10;
    
    // Base organic sway (feels like it's floating in fluid)
    const swayX = Math.sin(t * 0.8) * 0.03;
    const swayY = Math.cos(t * 0.6) * 0.05;
    const floatY = Math.sin(t * 1.2) * 0.1;

    // Apply floating
    logoRef.current.position.y = THREE.MathUtils.lerp(
      logoRef.current.position.y,
      floatY,
      0.04
    );

    // Combine scroll tilt, mouse tracking, and organic sway
    const targetX = scrollTiltX + state.pointer.y * tiltStrength + swayX;
    const targetY = state.pointer.x * (isHovered ? 0.25 : 0.15) + swayY;
    const targetZ = -state.pointer.x * (isHovered ? 0.10 : 0.05);

    logoRef.current.rotation.x = THREE.MathUtils.lerp(
      logoRef.current.rotation.x,
      targetX,
      0.04
    );
    logoRef.current.rotation.y = THREE.MathUtils.lerp(
      logoRef.current.rotation.y,
      targetY + scrollVel.current,
      0.04
    );
    logoRef.current.rotation.z = THREE.MathUtils.lerp(
      logoRef.current.rotation.z,
      targetZ,
      0.04
    );

    // Decay the scroll kick each frame
    scrollVel.current *= 0.88;

    // --- Scale pulse on hover ---
    const targetScale = isHovered ? 1.045 : 1.0;
    const curScale = logoRef.current.scale.x;
    logoRef.current.scale.setScalar(
      THREE.MathUtils.lerp(curScale, targetScale, 0.06)
    );

    // --- Camera parallax ---
    // Camera pulls back slightly on scroll (cinematic recede)
    const isMobile = state.size.width < 768;
    const baseZ = isMobile ? 19 : 12;
    const targetZ_cam = baseZ + scrollProgress * 2.5;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.6, 0.03);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 0.35, 0.03);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ_cam, 0.04);
    state.camera.lookAt(0, 0, 0);

    // --- Sweep light ---
    // Flares brighter on hover, still sweeps in ambient mode
    if (sweepLightRef.current) {
      sweepLightRef.current.position.x = Math.sin(t * 0.35) * 8;
      sweepLightRef.current.position.y = 2 + Math.cos(t * 0.45) * 3;
      sweepLightRef.current.position.z = 6;

      const baseIntensity = isHovered ? 6.5 : 3.5;
      sweepLightRef.current.intensity = THREE.MathUtils.lerp(
        sweepLightRef.current.intensity,
        baseIntensity + Math.sin(t * 0.6) * 0.5,
        0.08
      );
    }
  });

  return (
    <>
      <group ref={logoRef}>
        <Center scale={[0.0035, -0.0035, 0.0035]}>
          {meshData.map((item, i) => (
            <mesh
              key={i}
              geometry={item.geometry}
              material={item.material}
              position={[0, 0, item.zOffset]}
              castShadow={false}
              receiveShadow={false}
              frustumCulled
            />
          ))}
        </Center>
      </group>

      <pointLight
        ref={sweepLightRef}
        color="#FFE78D"
        distance={30}
        decay={2}
      />
    </>
  );
}

export default function MzLogo3D({
  className
}: {
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px"
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 12],
          fov: 38
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          logarithmicDepthBuffer: true,
        }}
      >
        <Suspense fallback={null}>
          <Logo />
        </Suspense>

        {/* Darkness */}
        <ambientLight intensity={0.07} />

        {/* Main spotlight */}
        <directionalLight
          position={[8, 10, 8]}
          intensity={3}
          color="#FFE78D"
        />

        {/* Rim light */}
        <directionalLight
          position={[-8, 2, -8]}
          intensity={1}
          color="#FFFFFF"
        />

        {/* Gold underglow - slightly repositioned to catch the gaps delicately */}
        <pointLight
          position={[0, -3, 2]}
          intensity={1.2}
          color="#D4A820"
          distance={15}
        />

        {/* Olive reflection */}
        <pointLight
          position={[5, -2, -2]}
          intensity={0.3}
          color="#88B600"
        />
      </Canvas>
    </div>
  );
}