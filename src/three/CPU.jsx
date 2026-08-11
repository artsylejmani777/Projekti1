import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function CPU({ onClick, hovered, ...props }) {
  const groupRef = useRef();
  const [heat, setHeat] = useState(0);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
    setHeat(prev => (prev + delta * 0.3) % (Math.PI * 2));
  });

  return (
    <group ref={groupRef} {...props}>
      {/* CPU substrate (green PCB) */}
      <mesh
        position={[0, 0.06, 0]}
        onClick={(e) => { e.stopPropagation(); onClick('cpu'); }}
        onPointerOver={() => hovered('cpu')}
        onPointerOut={() => hovered(null)}
      >
        <boxGeometry args={[1.0, 0.04, 1.0]} />
        <meshStandardMaterial color="#1a472a" roughness={0.5} />
      </mesh>

      {/* Pins on bottom */}
      {[...Array(10)].map((_, i) => (
        [...Array(10)].map((_, j) => (
          <mesh key={`pin-${i}-${j}`} position={[-0.4 + i * 0.09, 0.02, -0.4 + j * 0.09]}>
            <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
            <meshStandardMaterial color="#d4a017" roughness={0.2} metalness={0.9} />
          </mesh>
        ))
      ))}

      {/* IHS (metal lid) */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* CPU text engraving */}
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.6, 0.005, 0.2]} />
        <meshStandardMaterial color="#888" roughness={0.1} metalness={0.5} />
      </mesh>

      {/* Heatsink fins */}
      {[...Array(7)].map((_, i) => (
        <mesh key={`fin-${i}`} position={[0, 0.2 + i * 0.06, 0]}>
          <boxGeometry args={[0.96, 0.02, 0.96]} />
          <meshStandardMaterial
            color="#999"
            roughness={0.15}
            metalness={0.95}
            emissive="#441100"
            emissiveIntensity={0.1 + Math.sin(heat + i * 0.4) * 0.05}
          />
        </mesh>
      ))}

      {/* Fan on top */}
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.03, 32]} />
        <meshStandardMaterial color="#333" roughness={0.3} />
      </mesh>
      {/* Fan blades */}
      <mesh position={[0, 0.7, 0]} rotation={[0, heat * 3, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.015, 8]} />
        <meshStandardMaterial color="#222" roughness={0.2} />
      </mesh>
    </group>
  );
}
