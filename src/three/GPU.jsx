import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function GPU({ onClick, hovered, ...props }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      {...props}
      onClick={(e) => { e.stopPropagation(); onClick('gpu'); }}
      onPointerOver={() => hovered('gpu')}
      onPointerOut={() => hovered(null)}
    >
      {/* Main card body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.7, 0.6, 2.6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.3} />
      </mesh>

      {/* Backplate */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.72, 0.05, 2.6]} />
        <meshStandardMaterial color="#444" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Shroud (top cover) */}
      <mesh position={[0, 0.64, 0]}>
        <boxGeometry args={[0.74, 0.03, 2.4]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.25} metalness={0.4} />
      </mesh>

      {/* Fans */}
      {[-0.7, 0, 0.7].map((z, i) => (
        <group key={`fan-${i}`} position={[0, 0.65, z]}>
          {/* Fan ring */}
          <mesh>
            <ringGeometry args={[0.22, 0.28, 32]} />
            <meshStandardMaterial color="#333" roughness={0.2} side={2} />
          </mesh>
          {/* Fan hub */}
          <mesh position={[0, 0, -0.005]}>
            <cylinderGeometry args={[0.08, 0.08, 0.01, 24]} />
            <meshStandardMaterial color="#555" roughness={0.2} />
          </mesh>
          {/* Fan blades */}
          {[...Array(3)].map((_, j) => (
            <mesh
              key={`blade-${j}`}
              position={[0, 0, -0.005]}
              rotation={[0, 0, (Math.PI * 2 / 3) * j]}
            >
              <boxGeometry args={[0.02, 0.18, 0.01]} />
              <meshStandardMaterial color="#444" roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* PCIe connector */}
      <mesh position={[0.35, 0.12, 0]}>
        <boxGeometry args={[0.05, 0.24, 1.6]} />
        <meshStandardMaterial color="#d4a017" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Display ports */}
      <mesh position={[-0.4, 0.3, 1.35]}>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshStandardMaterial color="#888" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* RGB accent */}
      <mesh position={[0, 0.66, 0.5]}>
        <boxGeometry args={[0.6, 0.01, 0.02]} />
        <meshStandardMaterial
          color="#e94560"
          roughness={0.1}
          emissive="#e94560"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}
