'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const DOMAIN_SIZE = 10;
const SEGMENTS = 112;
const MAX_RADIUS = Math.sqrt(50);
const Z_SCALE = (DOMAIN_SIZE * 0.8) / MAX_RADIUS;

function makeSurfaceGeometry(segments: number, colored: boolean, isDark: boolean) {
  const geometry = new THREE.PlaneGeometry(DOMAIN_SIZE, DOMAIN_SIZE, segments, segments);
  const positions = geometry.attributes.position.array as Float32Array;
  const colors = colored ? new Float32Array(positions.length) : null;

  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index];
    const y = positions[index + 1];
    const radius = Math.sqrt(x * x + y * y);
    positions[index + 2] = radius;

    if (colors) {
      const intensity = Math.pow(radius / MAX_RADIUS, 2);
      const saturation = isDark ? 0.1 + intensity * 0.6 : 0.32 + intensity * 0.42;
      const lightness = isDark ? 0.15 + intensity * 0.65 : 0.22 + intensity * 0.34;
      const color = new THREE.Color().setHSL(18 / 360, saturation, lightness);
      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  if (colors) geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function RadialSurface({ isDark }: { isDark: boolean }) {
  const surface = useMemo(() => makeSurfaceGeometry(SEGMENTS, true, isDark), [isDark]);
  const wireframe = useMemo(() => makeSurfaceGeometry(24, false, isDark), [isDark]);
  const gridColors = isDark ? ['#444444', '#1a1a1a'] : ['#8a8176', '#d8d1c8'];

  return (
    <group position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, Z_SCALE]}>
      <mesh geometry={surface}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.7} metalness={0.18} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <mesh geometry={wireframe} position={[0, 0, 0.012]}>
        <meshBasicMaterial color={isDark ? '#d4774e' : '#68301f'} opacity={isDark ? 0.24 : 0.3} wireframe transparent side={THREE.DoubleSide} />
      </mesh>
      <gridHelper args={[15, 20, gridColors[0], gridColors[1]]} position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]} />
      <axesHelper args={[6]} position={[0, 0, -0.13]} />
    </group>
  );
}

export default function DarkVeilRadialSurface3D({ isDark, paper }: { isDark: boolean; paper: string }) {
  return (
    <Canvas camera={{ position: [14, 15, 18], fov: 35 }} dpr={[1, 1.5]}>
      <color attach="background" args={[paper]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[10, 20, 10]} intensity={1.25} />
      <pointLight position={[-10, 10, -10]} intensity={0.45} />
      <RadialSurface isDark={isDark} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 - 0.1} minDistance={9} maxDistance={32} target={[0, 1, 0]} />
    </Canvas>
  );
}
