"use client";

import {
  Suspense,
  useRef,
  useEffect,
  useState
} from "react";

import {
  Canvas,
  useFrame,
  useThree
} from "@react-three/fiber";

import { PerformanceMonitor, Environment } from "@react-three/drei";

import * as THREE from "three";

import {
  buildMeshData,
  serializeMeshData,
  hydrateMeshData,
  readCachedMeshData,
  writeCachedMeshData,
  rememberMeshData,
  isValidCachedMeshData,
  globalMeshData,
  type MeshData,
} from "./meshBuilder";

// How long the scatter→assemble intro plays (seconds). Tune here only.
const ASSEMBLY_DURATION = 0.9;

function Logo({ onLoad, assemblyStartDelayMs = 0 }: { onLoad?: () => void; assemblyStartDelayMs?: number }) {
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

  /*
   * Mesh data comes from meshBuilder: in-memory cache → IndexedDB cache →
   * build-from-SVG (first visit ever). This keeps the ~300 ms SVG parse +
   * extrude off the critical path on cold loads.
   */
  const [meshData, setMeshData] = useState<MeshData | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Session cache (client-side navigation)
      if (globalMeshData) {
        setMeshData(globalMeshData);
        return;
      }
      // 2. IndexedDB cache (survives hard reloads) — skips parse + extrude.
      //    Guarded: a corrupt/stale cache must never silently brick the logo —
      //    on any failure we fall through to the build path and warn instead.
      try {
        const cached = await readCachedMeshData();
        if (cancelled) return;
        if (cached && isValidCachedMeshData(cached)) {
          const data = hydrateMeshData(cached);
          rememberMeshData(data);
          setMeshData(data);
          return;
        }
        if (cached) {
          console.warn(
            "Logo mesh cache failed validation, rebuilding:",
            (cached as { items?: unknown[] }).items?.length ?? "?",
            "items"
          );
        }
      } catch (err) {
        console.warn("Logo mesh cache read failed, rebuilding:", err);
      }
      // 3. First-ever build (also the fallback when storage is unavailable)
      try {
        const res = await fetch("/mz.svg");
        const text = await res.text();
        if (cancelled) return;
        const data = buildMeshData(text);
        rememberMeshData(data);
        setMeshData(data);
        // Persist for the next cold load (fire-and-forget, non-fatal)
        void writeCachedMeshData(serializeMeshData(data));
      } catch (err) {
        console.error("Failed to build logo mesh data:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Choreography: mesh data marks "ready" (the fade-in starts here); the
  // assembly then waits one beat (`assemblyStartDelayMs`) so the pieces
  // converge as the hero words land instead of before them.
  const dataReadyAtRef = useRef<number>(0);

  useEffect(() => {
    if (!meshData) return;
    // Anchor the choreography once — re-runs (the parent re-renders when
    // onLoad fires, changing its identity) must not shift this or the
    // assembly gate would stall mid-flight.
    if (dataReadyAtRef.current === 0) {
      dataReadyAtRef.current = performance.now();
    }
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fire = () => {
      raf = requestAnimationFrame(() => requestAnimationFrame(() => onLoad?.()));
    };
    // When the assembly will play, the hero fade-in waits for it to START so
    // the pre-assembly hold (pieces frozen at scatter positions) is never
    // visible — the logo appears already mid-flight. Return visitors
    // (sessionStorage / reduced-motion) skip the assembly and get the
    // assembled logo immediately.
    const wait = assemblyDone.current
      ? 0
      : Math.max(0, dataReadyAtRef.current + assemblyStartDelayMs - performance.now());
    if (wait <= 0) fire();
    else timer = setTimeout(fire, wait);
    return () => {
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
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
  const assemblyDone = useRef(
    typeof window !== 'undefined' && sessionStorage.getItem('mz_logo_animated_v3') === 'true'
  );
  const reduceMotionRef = useRef(false);

  // Reduced motion: skip the scatter→assemble intro entirely (pieces just
  // start assembled, which is also what sessionStorage users get).
  useEffect(() => {
    if (typeof window !== "undefined") {
      reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotionRef.current) assemblyDone.current = true;
    }
  }, []);

  // Hold the pieces at their scattered start positions until the reveal
  // moment — otherwise the first revealed frame would show the logo already
  // assembled, then scatter it back out to reassemble.
  useEffect(() => {
    if (!meshData || assemblyDone.current) return;
    meshData.items.forEach((item, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      mesh.position.set(item.scatterX, item.scatterY, item.scatterZ + item.zOffset);
      mesh.rotation.set(item.rotX, item.rotY, item.rotZ);
    });
  }, [meshData]);

  useFrame((state, _delta) => {
    if (!logoRef.current || !meshData) return;

    const t = state.clock.elapsedTime;

    // --- Assembly Animation ---
    // Gated until one beat after the data is ready (see dataReadyAtRef), so
    // the pieces converge as the hero words land. Before the gate opens,
    // pieces are held at their scattered positions by the effect above.
    if (
      !assemblyDone.current &&
      dataReadyAtRef.current > 0 &&
      performance.now() >= dataReadyAtRef.current + assemblyStartDelayMs
    ) {
      // Wall-clock progress: the assembly always completes in exactly
      // ASSEMBLY_DURATION of real time, regardless of frame rate. (Per-frame
      // accumulation with a cap made the intro crawl on slow renderers — e.g.
      // ~30 frames minimum on software rendering — which reads as "the logo
      // never appears". A multi-second freeze now jumps the animation instead
      // of stretching it, which is the right behaviour for a fast site.)
      if (animStartTime.current === -1) {
        animStartTime.current = performance.now();
      }
      const progress = Math.min(
        1,
        (performance.now() - animStartTime.current) / (ASSEMBLY_DURATION * 1000)
      );
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

      if (progress >= 1) {
        assemblyDone.current = true;
        if (typeof window !== 'undefined') {
          // Versioned so a marker from an older build can't suppress the
          // current animation — bump when the intro changes.
          sessionStorage.setItem('mz_logo_animated_v3', 'true');
        }
      }
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

  if (!meshData) return null;

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
  onLoad,
  assemblyStartDelayMs = 0,
}: {
  className?: string;
  onLoad?: () => void;
  assemblyStartDelayMs?: number;
}) {
  const [dpr, setDpr] = useState(1.5);
  // Render only while the logo is on screen. The Canvas defaults to
  // frameloop="always" (a render every animation frame, forever, even when
  // scrolled out of view). Toggling to "never" off-screen stops the
  // permanent GPU/main-thread burn; flipping back resumes the loop.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px"
      }}
    >
        <Canvas
          frameloop={inView ? "always" : "never"}
          dpr={dpr}
          camera={{
            position: [0, 0, 12],
            fov: 38,
            near: 5,
            far: 40,
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
        <PerformanceMonitor
          onIncline={() => setDpr(Math.min(2, dpr + 0.25))}
          onDecline={() => setDpr(Math.max(1, dpr - 0.25))}
        />
        <Suspense fallback={null}>
          <Logo onLoad={onLoad} assemblyStartDelayMs={assemblyStartDelayMs} />
        </Suspense>

        {/* Environment map for realistic metallic reflections. Self-hosted
            (public/hdr/forest_slope_512_v2.hdr — a 512×256 box-downsampled
            copy of the drei "forest" preset, 472 KB vs the original 1.9 MB;
            env reflections are low-frequency so the loss is imperceptible.
            Filename is versioned because /hdr/* is cached immutable — a
            broken early build of the 512 file would otherwise be served
            forever. Wrapped in Suspense so the logo renders immediately and
            the reflections pop in when the HDR arrives. */}
        <Suspense fallback={null}>
          <Environment files="/hdr/forest_slope_512_v2.hdr" environmentIntensity={0.6} />
        </Suspense>

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