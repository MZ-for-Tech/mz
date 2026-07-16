"use client";

import { useRef, useMemo, Suspense, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Center } from "@react-three/drei";
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

function AnimatedGroups({
  shapesData,
  extrudeSettings
}: {
  shapesData: { shape: THREE.Shape, isM: boolean }[],
  extrudeSettings: any
}) {
  const mGroupRef = useRef<THREE.Group>(null);
  const zGroupRef = useRef<THREE.Group>(null);

  const totalPaths = shapesData.length;

  useFrame((state, delta) => {
    if (!mGroupRef.current || !zGroupRef.current) return;

    // Read scroll position ONCE per frame
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const progress = Math.min(Math.max(scrollY / 500, 0), 1);

    const targetZM = -2500 * progress;
    const targetRotYM = -0.5 * progress;

    const targetZZ = 2500 * progress;
    const targetRotYZ = 0.5 * progress;

    mGroupRef.current.position.z = THREE.MathUtils.lerp(mGroupRef.current.position.z, targetZM, delta * 6);
    mGroupRef.current.rotation.y = THREE.MathUtils.lerp(mGroupRef.current.rotation.y, targetRotYM, delta * 6);

    zGroupRef.current.position.z = THREE.MathUtils.lerp(zGroupRef.current.position.z, targetZZ, delta * 6);
    zGroupRef.current.rotation.y = THREE.MathUtils.lerp(zGroupRef.current.rotation.y, targetRotYZ, delta * 6);
  });

  // Shared materials to prevent thousands of WebGL programs / material instantiations
  const mMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffeba1", metalness: 0.8, roughness: 0.25 }), []);
  const zMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a8b600", metalness: 0.8, roughness: 0.25 }), []);

  return (
    <>
      <group ref={mGroupRef}>
        {shapesData.map((data, i) => {
          if (!data.isM) return null;
          const baseZ = (i - totalPaths / 2) * 0.1;
          return (
            <mesh key={i} position={[0, 0, baseZ]} material={mMaterial}>
              <extrudeGeometry args={[data.shape, extrudeSettings]} />
            </mesh>
          );
        })}
      </group>
      <group ref={zGroupRef}>
        {shapesData.map((data, i) => {
          if (data.isM) return null;
          const baseZ = (i - totalPaths / 2) * 0.1;
          return (
            <mesh key={i} position={[0, 0, baseZ]} material={zMaterial}>
              <extrudeGeometry args={[data.shape, extrudeSettings]} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

function LogoGeometry() {
  const svg = useLoader(SVGLoader, '/mz.svg');
  const tiltGroupRef = useRef<THREE.Group>(null);
  const autoRotateGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!tiltGroupRef.current || !autoRotateGroupRef.current) return;

    // Slow automatic Y-axis rotation
    autoRotateGroupRef.current.rotation.y += 0.003;

    // Mouse-reactive tilt
    const targetTiltX = state.pointer.y * 0.3;
    const targetTiltY = state.pointer.x * 0.3;

    tiltGroupRef.current.rotation.x = THREE.MathUtils.lerp(tiltGroupRef.current.rotation.x, targetTiltX, 0.05);
    tiltGroupRef.current.rotation.y = THREE.MathUtils.lerp(tiltGroupRef.current.rotation.y, targetTiltY, 0.05);
  });

  const shapesData = useMemo(() => {
    const data: { shape: THREE.Shape, isM: boolean }[] = [];
    svg.paths.forEach(path => {
      const color = path.color;
      const isM = color.r > 0.9;
      const shapes = path.toShapes();
      shapes.forEach(shape => {
        data.push({
          shape,
          isM
        });
      });
    });
    return data;
  }, [svg]);

  // Memoize extrudeSettings so R3F doesn't recreate geometries if this component rerenders
  const extrudeSettings = useMemo(() => ({
    depth: 40,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 2,
    bevelSegments: 8,
    curveSegments: 3, // Lower curve resolution to drastically reduce polygon count
  }), []);

  return (
    <group ref={tiltGroupRef}>
      <group ref={autoRotateGroupRef}>
        <Center scale={[0.0035, -0.0035, 0.0035]} position={[0, 0, 0]}>
          <AnimatedGroups shapesData={shapesData} extrudeSettings={extrudeSettings} />
        </Center>
      </group>
    </group>
  );
}

export default function MzLogo3D({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", minHeight: "500px" }}
    >
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
        <Suspense fallback={null}>
          <LogoGeometry />
        </Suspense>

        {/* Lighting */}
        <ambientLight intensity={0.2} color="#ffffff" />
        <directionalLight position={[-10, 10, 10]} intensity={3.0} color="#ffffff" />
        <pointLight position={[0, 0, -5]} intensity={2.0} color="#ffeba1" distance={20} decay={2} />
      </Canvas>
    </div>
  );
}
