import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Storage({ onClick, hovered, ...props }) {
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
      onClick={(e) => { e.stopPropagation(); onClick('storage'); }}
      onPointerOver={() => hovered('storage')}
      onPointerOut={() => hovered(null)}
    >
      {/* M.2 NVMe SSD */}
      <group position={[0, 0.3, 0]}>
        {/* PCB */}
        <mesh>
          <boxGeometry args={[0.23, 0.004, 1.6]} />
          <meshStandardMaterial color="#1a3a1a" roughness={0.5} />
        </mesh>
        {/* Controller chip */}
        <mesh position={[-0.02, 0.006, -0.35]}>
          <boxGeometry args={[0.14, 0.01, 0.14]} />
          <meshStandardMaterial color="#111" roughness={0.2} />
        </mesh>
        {/* NAND chips */}
        {[-0.1, 0.1, 0.3, 0.5].map((z, i) => (
          <mesh key={`nand-${i}`} position={[-0.02, 0.006, z]}>
            <boxGeometry args={[0.16, 0.01, 0.16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
          </mesh>
        ))}
        {/* Gold connector */}
        <mesh position={[0, 0, -0.82]}>
          <boxGeometry args={[0.2, 0.002, 0.04]} />
          <meshStandardMaterial color="#ffd700" roughness={0.15} metalness={0.9} />
        </mesh>
      </group>

      {/* 2.5" SSD beside it (slightly offset) */}
      <group position={[0.35, 0.1, 0.1]}>
        <mesh>
          <boxGeometry args={[0.04, 0.2, 1.2]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Label */}
        <mesh position={[0.025, 0, 0]}>
          <boxGeometry args={[0.005, 0.14, 0.9]} />
          <meshStandardMaterial color="#444" roughness={0.4} />
        </mesh>
        {/* SATA connector */}
        <mesh position={[0, -0.13, -0.55]}>
          <boxGeometry args={[0.04, 0.05, 0.1]} />
          <meshStandardMaterial color="#111" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
