"use client";

import {
  Suspense,
  useMemo,
  useRef,
  useEffect,
  useState
} from "react";

import {
  Canvas,
  useLoader,
  useFrame,
  useThree
} from "@react-three/fiber";

import { PerformanceMonitor, Environment } from "@react-three/drei";

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

// Global cache to prevent re-building 480 geometries every time the user returns to the main page.
// Reset to null here so HMR picks up material changes during development.
let globalMeshData: {
  items: {
    geometry: THREE.ExtrudeGeometry;
    material: THREE.MeshStandardMaterial;
    zOffset: number;
    scatterX: number;
    scatterY: number;
    scatterZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
  }[];
  cx: number;
  cy: number;
} | null = null;


function Logo({ onLoad }: { onLoad?: () => void }) {
  const svg = useLoader(SVGLoader, "/mz.svg");

  const logoRef = useRef<THREE.Group>(null);
  const sweepLightRef = useRef<THREE.PointLight>(null);

  const { gl, size } = useThree();

  const isMobile = size.width < 768;
  const logoScale = isMobile ? 0.0022 : 0.0035;

  // Mouse tracking & drag interaction refs
  const hovered = useRef(false);
  const scrollY = useRef(0);
  const scrollVel = useRef(0);
  const isDragging = useRef(false);
  const prevPointerPos = useRef({ x: 0, y: 0 });
  const dragRotation = useRef({ x: 0, y: 0 });
  const dragVelocity = useRef({ x: 0, y: 0 });

  const extrudeSettings = useMemo(
    () => ({
      depth: 32,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelSegments: 1, // Reduced from 2 for better performance on mobile GPUs
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
    if (globalMeshData) return globalMeshData;

    const materialCache = new Map<string, THREE.MeshStandardMaterial>();

    let matIndex = 0;
    const getMaterial = (color: string) => {
      if (!materialCache.has(color)) {
        materialCache.set(
          color,
          new THREE.MeshStandardMaterial({
            color,
            metalness: 0.9,
            roughness: 0.25,
            // Push each unique material slightly further in depth so back-faces
            // from adjacent paths don't occupy the exact same depth plane.
            polygonOffset: true,
            polygonOffsetFactor: matIndex,
            polygonOffsetUnits: matIndex,
          })
        );
        matIndex++;
      }
      return materialCache.get(color)!;
    };

    let pathIndex = 0;
    const items: {
      geometry: THREE.ExtrudeGeometry;
      material: THREE.MeshStandardMaterial;
      zOffset: number;
      scatterX: number;
      scatterY: number;
      scatterZ: number;
      rotX: number;
      rotY: number;
      rotZ: number;
    }[] = [];

    // Parse viewBox to find exact mathematical center
    let cx = 0;
    let cy = 0;
    if (svg.xml) {
      const vb = (svg.xml as unknown as Element).getAttribute('viewBox');
      if (vb) {
        const parts = vb.split(/\s+/).map(parseFloat);
        if (parts.length === 4) {
          cx = parts[0] + parts[2] / 2;
          cy = parts[1] + parts[3] / 2;
        }
      }
    }

    svg.paths.forEach((path) => {
      const color = `#${path.color.getHexString()}`;
      const zOffset = pathIndex * Z_STEP;
      pathIndex++;

      path.toShapes().forEach((shape) => {
        items.push({
          geometry: new THREE.ExtrudeGeometry(shape, extrudeSettings),
          material: getMaterial(color),
          zOffset,
          scatterX: (Math.random() - 0.5) * 3000,
          scatterY: (Math.random() - 0.5) * 3000,
          scatterZ: 500 + Math.random() * 2000,
          rotX: (Math.random() - 0.5) * Math.PI * 2,
          rotY: (Math.random() - 0.5) * Math.PI * 2,
          rotZ: (Math.random() - 0.5) * Math.PI * 2,
        });
      });
    });

    return { items, cx, cy };
  }, [svg, extrudeSettings]);

  useEffect(() => {
    if (!globalMeshData) {
      globalMeshData = meshData;
    }
    // Geometries are ready, signal load complete after a tiny frame delay to ensure paint
    if (onLoad) {
      requestAnimationFrame(() => requestAnimationFrame(() => onLoad()));
    }
  }, [meshData, onLoad]);

  // Hover & Mouse Drag tracking on the WebGL canvas element
  useEffect(() => {
    const el = gl.domElement;
    
    const onEnter = () => { hovered.current = true; el.style.cursor = 'grab'; };
    const onLeave = () => { 
      hovered.current = false; 
      isDragging.current = false; 
      el.style.cursor = 'auto';
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      prevPointerPos.current = { x: e.clientX, y: e.clientY };
      el.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevPointerPos.current.x;
      const dy = e.clientY - prevPointerPos.current.y;
      
      dragRotation.current.y += dx * 0.008;
      dragRotation.current.x += dy * 0.008;

      dragVelocity.current.y = dx * 0.008;
      dragVelocity.current.x = dy * 0.008;

      prevPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging.current = false;
      if (hovered.current) el.style.cursor = 'grab';
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
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

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const animStartTime = useRef<number>(-1);
  const assemblyDone = useRef(false);

  useFrame((state) => {
    if (!logoRef.current) return;
    if (typeof document !== 'undefined' && document.querySelector('.preloader-container') !== null) {
      return; // Suspend 3D logo loop while preloader is active
    }

    const t = state.clock.elapsedTime;
    
    // --- Assembly Animation ---
    if (animStartTime.current === -1) {
      animStartTime.current = t;
    }
    
    if (!assemblyDone.current) {
      const elapsed = t - animStartTime.current;
      const progress = Math.min(1, elapsed / 1.5); // 1.5s assembly time
      // Fast, smooth ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const invEase = 1 - easeOut;

      meshData.items.forEach((item, i) => {
        const mesh = meshRefs.current[i];
        if (!mesh) return;

        mesh.position.set(
          item.scatterX * invEase,
          item.scatterY * invEase,
          item.scatterZ * invEase + item.zOffset
        );
        mesh.rotation.set(
          item.rotX * invEase,
          item.rotY * invEase,
          item.rotZ * invEase
        );
      });

      if (progress >= 1) assemblyDone.current = true;
    }

    const isHovered = hovered.current;

    // Apply inertia when mouse drag is released
    if (!isDragging.current) {
      dragRotation.current.x += dragVelocity.current.x;
      dragRotation.current.y += dragVelocity.current.y;
      dragVelocity.current.x *= 0.92;
      dragVelocity.current.y *= 0.92;

      // Slowly pull back to default orientation over time
      dragRotation.current.x = THREE.MathUtils.lerp(dragRotation.current.x, 0, 0.003);
      dragRotation.current.y = THREE.MathUtils.lerp(dragRotation.current.y, 0, 0.003);
    }

    // --- Scroll tilt: logo tilts back as user scrolls down ---
    const scrollProgress = Math.min(scrollY.current / (window.innerHeight * 0.8), 1);
    const scrollTiltX = scrollProgress * 0.4; // max ~23° backward tilt

    // --- Mouse tracking & interaction ---
    // Tilt influence doubles while hovering (feels magnetic)
    const tiltStrength = isHovered ? 0.22 : 0.10;

    // Base organic sway (feels like it's floating in fluid)
    const swayX = Math.sin(t * 0.8) * 0.03;
    const swayY = Math.cos(t * 0.4) * 0.18; // Increased amplitude for more noticeable left/right rotation
    const floatY = Math.sin(t * 1.2) * 0.1;

    // Apply floating
    logoRef.current.position.y = THREE.MathUtils.lerp(
      logoRef.current.position.y,
      floatY,
      0.04
    );

    // Combine scroll tilt, mouse tracking, drag rotation, and organic sway
    const targetX = scrollTiltX + state.pointer.y * tiltStrength + swayX + dragRotation.current.x;
    const targetY = state.pointer.x * (isHovered ? 0.25 : 0.15) + swayY + dragRotation.current.y;
    const targetZ = -state.pointer.x * (isHovered ? 0.10 : 0.05);

    logoRef.current.rotation.x = THREE.MathUtils.lerp(
      logoRef.current.rotation.x,
      targetX,
      0.08
    );
    logoRef.current.rotation.y = THREE.MathUtils.lerp(
      logoRef.current.rotation.y,
      targetY + scrollVel.current,
      0.08
    );
    logoRef.current.rotation.z = THREE.MathUtils.lerp(
      logoRef.current.rotation.z,
      targetZ,
      0.08
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
    const baseZ = 12;
    const targetZ_cam = baseZ + scrollProgress * 2.5;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.6, 0.03);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 0.35, 0.03);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ_cam, 0.04);
    state.camera.lookAt(0, 0, 0);

    // --- Sweep light / Interactive Spotlight ---
    // In ambient mode, light sweeps slowly. On hover, it tracks the cursor like a flashlight.
    if (sweepLightRef.current) {
      const targetLightX = isHovered ? state.pointer.x * 15 : Math.sin(t * 0.35) * 8;
      const targetLightY = isHovered ? state.pointer.y * 15 : 2 + Math.cos(t * 0.45) * 3;
      const targetLightZ = isHovered ? 4 : 6;

      sweepLightRef.current.position.x = THREE.MathUtils.lerp(sweepLightRef.current.position.x, targetLightX, 0.08);
      sweepLightRef.current.position.y = THREE.MathUtils.lerp(sweepLightRef.current.position.y, targetLightY, 0.08);
      sweepLightRef.current.position.z = THREE.MathUtils.lerp(sweepLightRef.current.position.z, targetLightZ, 0.08);

      const baseIntensity = isHovered ? 8.5 : 3.5;
      sweepLightRef.current.intensity = THREE.MathUtils.lerp(
        sweepLightRef.current.intensity,
        baseIntensity + (isHovered ? 0 : Math.sin(t * 0.6) * 0.5),
        0.08
      );
    }
  });

  return (
    <>
      <group ref={logoRef}>
        <group scale={[logoScale, -logoScale, logoScale]}>
          <group position={[-meshData.cx, -meshData.cy, 0]}>
            {meshData.items.map((item, i) => (
              <mesh
                key={i}
                ref={(el) => { meshRefs.current[i] = el; }}
                geometry={item.geometry}
                material={item.material}
                position={[0, 0, item.zOffset]}
                rotation={[0, 0, 0]}
                castShadow={false}
                receiveShadow={false}
                frustumCulled
              />
            ))}
          </group>
        </group>
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
  className,
  onLoad
}: {
  className?: string;
  onLoad?: () => void;
}) {
  const [dpr, setDpr] = useState(1.0);

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
        dpr={dpr}
        camera={{
          position: [0, 0, 12],
          fov: 38
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          // Higher depth-buffer precision near the camera eliminates
          // back-face z-fighting when the logo rotates to show its rear.
          logarithmicDepthBuffer: true,
        }}
      >
        <PerformanceMonitor onIncline={() => setDpr(1.0)} onDecline={() => setDpr(0.75)} />
        <Suspense fallback={null}>
          <Logo onLoad={onLoad} />
        </Suspense>

        {/* Environment map for realistic metallic reflections */}
        <Environment files="/hdr/forest_1k.hdr" environmentIntensity={0.6} />

        {/* Darkness / Base ambient */}
        <ambientLight intensity={0.4} />

        {/* Main spotlight - brighter and warmer */}
        <directionalLight
          position={[8, 10, 8]}
          intensity={5.5}
          color="#FFF2B2"
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