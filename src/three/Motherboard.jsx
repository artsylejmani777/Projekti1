import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Motherboard({ onClick, hovered, ...props }) {
  const boardRef = useRef();
  const w = 4.8, d = 5.6, t = 0.08;

  useFrame((_, delta) => {
    if (boardRef.current) {
      boardRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={boardRef} {...props}>
      {/* Main PCB */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClick('motherboard'); }}
        onPointerOver={() => hovered('motherboard')}
        onPointerOut={() => hovered(null)}
      >
        <boxGeometry args={[w, t, d]} />
        <meshStandardMaterial color="#1a472a" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* PCB traces - top */}
      {[...Array(6)].map((_, i) => (
        <mesh key={`trace-t-${i}`} position={[0, t/2 + 0.005, -1.2 + i * 0.5]}>
          <boxGeometry args={[w * 0.8, 0.01, 0.03]} />
          <meshStandardMaterial color="#90c695" roughness={0.3} />
        </mesh>
      ))}

      {/* PCB traces - bottom */}
      {[...Array(4)].map((_, i) => (
        <mesh key={`trace-b-${i}`} position={[0, t/2 + 0.005, 1 + i * 0.6]}>
          <boxGeometry args={[w * 0.8, 0.01, 0.03]} />
          <meshStandardMaterial color="#90c695" roughness={0.3} />
        </mesh>
      ))}

      {/* PCIe slots */}
      {[...Array(3)].map((_, i) => (
        <mesh key={`pcie-${i}`} position={[-1.2, t/2 + 0.06, -2 + i * 1.6]}>
          <boxGeometry args={[0.06, 0.1, 2.2]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
      ))}

      {/* RAM slots - right side */}
      {[...Array(4)].map((_, i) => (
        <mesh key={`dimm-${i}`} position={[1.6, t/2 + 0.06, -1.5 + i * 0.8]}>
          <boxGeometry args={[0.08, 0.1, 1.4]} />
          <meshStandardMaterial color="#111" roughness={0.4} />
        </mesh>
      ))}

      {/* Chipset heatsink */}
      <mesh position={[-0.6, t/2 + 0.04, 1.8]}>
        <boxGeometry args={[0.8, 0.06, 0.8]} />
        <meshStandardMaterial color="#808080" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* VRM heatsinks */}
      {[-1.6, 0, 1.6].map((x, i) => (
        <mesh key={`vrm-${i}`} position={[x, t/2 + 0.04, -2.4]}>
          <boxGeometry args={[0.6, 0.06, 0.3]} />
          <meshStandardMaterial color="#707070" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* I/O panel */}
      <mesh position={[0, 0.25, d/2]}>
        <boxGeometry args={[1.2, 0.5, 0.04]} />
        <meshStandardMaterial color="#444" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Capacitors */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`cap-${i}`} position={[-1.8 + i * 0.5, t/2 + 0.04, -0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
          <meshStandardMaterial color="#111" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
