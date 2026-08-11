import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function PSU({ onClick, hovered, ...props }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group
      ref={groupRef}
      {...props}
      onClick={(e) => { e.stopPropagation(); onClick('psu'); }}
      onPointerOver={() => hovered('psu')}
      onPointerOut={() => hovered(null)}
    >
      {/* Main box */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.4, 0.7, 1.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Top label plate */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.2, 0.01, 1.0]} />
        <meshStandardMaterial color="#333" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Label text area */}
      <mesh position={[0, 0.71, 0]}>
        <boxGeometry args={[0.8, 0.005, 0.3]} />
        <meshStandardMaterial color="#ffd700" roughness={0.3} />
      </mesh>

      {/* Fan grill */}
      <mesh position={[0, 0.71, 0.3]}>
        <ringGeometry args={[0.25, 0.32, 32]} />
        <meshStandardMaterial color="#444" roughness={0.2} side={2} />
      </mesh>
      {/* Grill spokes */}
      {[...Array(6)].map((_, i) => (
        <mesh key={`spoke-${i}`} position={[0, 0.71, 0.3]} rotation={[0, 0, (Math.PI / 3) * i]}>
          <boxGeometry args={[0.01, 0.25, 0.005]} />
          <meshStandardMaterial color="#444" roughness={0.2} />
        </mesh>
      ))}

      {/* Fan hub */}
      <mesh position={[0, 0.72, 0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.01, 24]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Rear connectors */}
      <mesh position={[0, 0.3, 0.62]}>
        <boxGeometry args={[0.8, 0.08, 0.04]} />
        <meshStandardMaterial color="#333" roughness={0.2} />
      </mesh>
      {/* Power switch */}
      <mesh position={[0.5, 0.3, 0.62]}>
        <boxGeometry args={[0.1, 0.1, 0.04]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.2} />
      </mesh>

      {/* Modular cable ports */}
      {[...Array(6)].map((_, i) => (
        <mesh key={`port-${i}`} position={[-0.6 + i * 0.24, 0.08, 0.62]}>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}
