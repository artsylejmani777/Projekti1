import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import Motherboard from './Motherboard.jsx';
import CPU from './CPU.jsx';
import RAM from './RAM.jsx';
import GPU from './GPU.jsx';
import PSU from './PSU.jsx';
import Storage from './Storage.jsx';
import { componentData } from './componentData.js';

function Scene({ onSelect, onHover }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -3]} intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#00b4d8" />

      {/* Motherboard at center */}
      <Motherboard onClick={onSelect} hovered={onHover} />

      {/* CPU on motherboard */}
      <CPU
        position={[0, 0.06, -1.8]}
        onClick={onSelect}
        hovered={onHover}
      />

      {/* RAM slots */}
      <RAM
        position={[1.6, 0.06, -1.5]}
        onClick={onSelect}
        hovered={onHover}
      />

      {/* GPU in PCIe slot */}
      <GPU
        position={[-1.6, 0.04, -0.4]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onSelect}
        hovered={onHover}
      />

      {/* PSU at bottom */}
      <PSU
        position={[0, -0.4, 2.5]}
        onClick={onSelect}
        hovered={onHover}
      />

      {/* Storage drives */}
      <Storage
        position={[0, 0.04, 2.0]}
        onClick={onSelect}
        hovered={onHover}
      />

      {/* Base platform */}
      <mesh position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3.5, 3.8, 0.1, 64]} />
        <meshStandardMaterial color="#0a0e17" roughness={0.4} metalness={0.3} />
      </mesh>

      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={0.5}
        scale={8}
        blur={2.5}
      />
    </>
  );
}

function InfoPanel({ selected, onClose }) {
  if (!selected) return null;
  const data = componentData[selected];
  if (!data) return null;

  return (
    <div className="info-panel">
      <div className="info-panel-inner">
        <div className="info-panel-header">
          <span
            className="info-dot"
            style={{ background: data.accent, boxShadow: `0 0 8px ${data.accent}` }}
          />
          <h3>{data.name}</h3>
          <button className="info-close" onClick={onClose}>&times;</button>
        </div>
        <p className="info-desc">{data.description}</p>
        <h4>Key Specifications</h4>
        <ul className="info-specs">
          {data.specs.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <div className="info-tip">
          <strong>Pro Tip:</strong> {data.tips}
        </div>
      </div>
    </div>
  );
}

export default function PCScene() {
  const [active, setActive] = useState(null);

  const handleSelect = (id) => setActive(id);
  const handleHover = (id) => {
    // Hover state if needed — currently handled via cursor style in Canvas
  };

  return (
    <div className="explorer-scene">
      <InfoPanel selected={active} onClose={() => setActive(null)} />
      <Canvas
        camera={{ position: [3, 2.5, 6], fov: 45 }}
        style={{ cursor: active ? 'pointer' : 'grab' }}
      >
        <Suspense fallback={null}>
          <Scene onSelect={handleSelect} onHover={handleHover} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={3}
            maxDistance={12}
            maxPolarAngle={Math.PI / 1.6}
            target={[0, 0.2, 0]}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
