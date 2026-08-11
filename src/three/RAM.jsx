import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function RAM({ onClick, hovered, ...props }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  const Stick = ({ offsetZ, color }) => (
    <group position={[0, 0, offsetZ]}>
      {/* PCB */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.12, 1.6, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Chips on PCB */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`chip-${i}`} position={[0, 0.3 + i * 0.15, 0.015]}>
          <boxGeometry args={[0.1, 0.1, 0.01]} />
          <meshStandardMaterial color="#111" roughness={0.2} />
        </mesh>
      ))}
      {/* Gold contacts at bottom */}
      {[...Array(6)].map((_, i) => (
        <mesh key={`contact-${i}`} position={[0, -0.12 + i * 0.015, 0.015]}>
          <boxGeometry args={[0.08, 0.008, 0.005]} />
          <meshStandardMaterial color="#ffd700" roughness={0.15} metalness={0.9} />
        </mesh>
      ))}
      {/* Heat spreader */}
      <mesh position={[0, 0.6, 0.02]}>
        <boxGeometry args={[0.13, 0.7, 0.015]} />
        <meshStandardMaterial color="#888" roughness={0.15} metalness={0.9} />
      </mesh>
      {/* RGB strip */}
      <mesh position={[0, 0.85, 0.02]}>
        <boxGeometry args={[0.13, 0.06, 0.008]} />
        <meshStandardMaterial
          color="#00b4d8"
          roughness={0.1}
          emissive="#00b4d8"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );

  return (
    <group
      ref={groupRef}
      {...props}
      onClick={(e) => { e.stopPropagation(); onClick('ram'); }}
      onPointerOver={() => hovered('ram')}
      onPointerOut={() => hovered(null)}
    >
      <Stick offsetZ={-0.15} color="#1e3a5f" />
      <Stick offsetZ={0.15} color="#1a3355" />
    </group>
  );
}
