import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { componentData } from './componentData.js';

/* ──────────────────────────────────────────────
   PC CASE MATERIALS
   ────────────────────────────────────────────── */
const M = {
  steel:       <meshStandardMaterial color="#2a2a2e" roughness={0.3} metalness={0.9} />,
  steelDark:   <meshStandardMaterial color="#1a1a1e" roughness={0.3} metalness={0.9} />,
  glass:       <meshStandardMaterial color="#88ccff" roughness={0.05} metalness={0.1} transparent opacity={0.18} />,
  glassEdge:   <meshStandardMaterial color="#333" roughness={0.2} metalness={0.9} />,
  pcb:         <meshStandardMaterial color="#0d2818" roughness={0.55} metalness={0.05} />,
  pcbTrace:    <meshStandardMaterial color="#4a8c5c" roughness={0.3} />,
  gold:        <meshStandardMaterial color="#d4a017" roughness={0.15} metalness={0.95} />,
  silver:      <meshStandardMaterial color="#b0b0b0" roughness={0.15} metalness={0.95} />,
  alu:         <meshStandardMaterial color="#c8c8c8" roughness={0.2} metalness={0.85} />,
  blackPlastic: <meshStandardMaterial color="#1a1a1a" roughness={0.45} metalness={0.1} />,
  fanFrame:    <meshStandardMaterial color="#111" roughness={0.3} />,
  fanBlade:    <meshStandardMaterial color="#1a1a1a" roughness={0.25} />,
  rgbCyan:     <meshStandardMaterial color="#00b4d8" roughness={0.1} emissive="#00b4d8" emissiveIntensity={0.6} />,
  rgbRed:      <meshStandardMaterial color="#e94560" roughness={0.1} emissive="#e94560" emissiveIntensity={0.5} />,
  copper:      <meshStandardMaterial color="#b87333" roughness={0.3} metalness={0.95} />,
};

/* ──────────────────────────────────────────────
   CASE FRAME
   ────────────────────────────────────────────── */
function CaseFrame() {
  const tw = 0.08; // frame thickness
  const cw = 4.5, ch = 5.0, cd = 2.8;
  return (
    <group>
      {/* bottom frame */}
      <mesh position={[0, -ch/2, 0]}><boxGeometry args={[cw, tw, cd]} />{M.steelDark}</mesh>
      {/* top frame */}
      <mesh position={[0, ch/2, 0]}><boxGeometry args={[cw, tw, cd]} />{M.steelDark}</mesh>
      {/* front frame */}
      <mesh position={[0, 0, cd/2]}><boxGeometry args={[cw, ch, tw]} />{M.steel}</mesh>
      {/* rear frame */}
      <mesh position={[0, 0, -cd/2]}><boxGeometry args={[cw, ch, tw]} />{M.steel}</mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────
   PSU SHROUD (bottom compartment)
   ────────────────────────────────────────────── */
function PSUShroud() {
  return (
    <group>
      {/* shroud top cover */}
      <mesh position={[0, -0.8, 0]}><boxGeometry args={[4.2, 0.04, 2.4]} />{M.steel}</mesh>
      {/* shroud front face */}
      <mesh position={[0, -1.7, 1.35]}><boxGeometry args={[4.2, 1.8, 0.04]} />{M.steel}</mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────
   PSU
   ────────────────────────────────────────────── */
function PSU({ onClick, hovered }) {
  return (
    <group
      position={[1.0, -1.7, -0.2]}
      onClick={(e) => { e.stopPropagation(); onClick('psu'); }}
      onPointerOver={() => hovered('psu')}
      onPointerOut={() => hovered(null)}
    >
      <mesh><boxGeometry args={[1.5, 0.75, 1.3]} />{M.steel}</mesh>
      {/* fan grill */}
      <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.28, 0.28, 0.01, 32]} />{M.steelDark}</mesh>
      {[0,1,2,3].map(i => (
        <mesh key={`g${i}`} position={[0, 0.39, 0]} rotation={[0,0,(Math.PI/4)*i]}>
          <boxGeometry args={[0.25, 0.008, 0.008]} />{M.silver}
        </mesh>
      ))}
      {/* label */}
      <mesh position={[0, 0, 0.65]}><boxGeometry args={[0.6, 0.15, 0.005]} />{M.rgbCyan}</mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────
   CASE FANS
   ────────────────────────────────────────────── */
function CaseFan({ position, rotation, size = 0.55 }) {
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * 4; });
  return (
    <group position={position} rotation={rotation}>
      <mesh><ringGeometry args={[size * 0.35, size * 0.48, 32]} />{M.fanFrame}</mesh>
      <mesh position={[0, 0, -0.01]}>
        <cylinderGeometry args={[size * 0.09, size * 0.09, 0.02, 24]} />{M.fanFrame}
      </mesh>
      <group ref={ref}>
        {[0,1,2,3,4].map(i => (
          <mesh key={i} rotation={[0,0,(Math.PI*2/5)*i]}>
            <boxGeometry args={[0.02, size * 0.28, 0.005]} />{M.fanBlade}
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ──────────────────────────────────────────────
   MOTHERBOARD
   ────────────────────────────────────────────── */
function Motherboard({ onClick, hovered }) {
  const mw = 3.2, mh = 3.6, mt = 0.06;
  return (
    <group
      position={[0.15, 0.5, -1.32]}
      onClick={(e) => { e.stopPropagation(); onClick('motherboard'); }}
      onPointerOver={() => hovered('motherboard')}
      onPointerOut={() => hovered(null)}
    >
      {/* PCB */}
      <mesh><boxGeometry args={[mw, mt, mh]} />{M.pcb}</mesh>
      {/* traces */}
      {[0,1,2,3,4,5].map(i => (
        <mesh key={`t${i}`} position={[0, mt/2+0.002, -1.2 + i*0.5]}>
          <boxGeometry args={[mw*0.7, 0.005, 0.02]} />{M.pcbTrace}
        </mesh>
      ))}
      {/* chipset heatsink */}
      <mesh position={[-0.4, mt/2+0.04, 1.2]}><boxGeometry args={[0.6, 0.06, 0.6]} />{M.silver}</mesh>
      {/* VRM heatsinks */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={`vrm${i}`} position={[x, mt/2+0.04, -1.5]}>
          <boxGeometry args={[0.5, 0.05, 0.25]} />{M.silver}
        </mesh>
      ))}
      {/* PCIe x16 slot */}
      <mesh position={[-1.1, mt/2+0.04, 0.2]}><boxGeometry args={[0.05, 0.06, 1.8]} />{M.blackPlastic}</mesh>
      {/* PCIe clip */}
      <mesh position={[-1.1, mt/2+0.06, 0.95]}><boxGeometry args={[0.04, 0.04, 0.12]} />{M.blackPlastic}</mesh>
      {/* DIMM slots (4) */}
      {[0,1,2,3].map((_, i) => (
        <mesh key={`dimm${i}`} position={[1.0, mt/2+0.04, -1.0 + i*0.55]}>
          <boxGeometry args={[0.06, 0.06, 0.9]} />{M.blackPlastic}
        </mesh>
      ))}
      {/* I/O panel */}
      <mesh position={[0, 0.55, -mh/2 - 0.02]}><boxGeometry args={[1.0, 0.4, 0.03]} />{M.steel}</mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────
   CPU + COOLER
   ────────────────────────────────────────────── */
function CPUWithCooler({ onClick, hovered }) {
  const fanRef = useRef();
  useFrame((_, delta) => { if (fanRef.current) fanRef.current.rotation.y += delta * 6; });
  return (
    <group
      position={[0.15, 1.6, -1.6]}
      onClick={(e) => { e.stopPropagation(); onClick('cpu'); }}
      onPointerOver={() => hovered('cpu')}
      onPointerOut={() => hovered(null)}
    >
      {/* CPU socket (black square on board) */}
      <mesh position={[0, 0.03, 0]}><boxGeometry args={[0.7, 0.02, 0.7]} />{M.blackPlastic}</mesh>
      {/* CPU IHS (silver lid) */}
      <mesh position={[0, 0.09, 0]}><boxGeometry args={[0.6, 0.06, 0.6]} />{M.silver}</mesh>
      {/* Tower cooler - base plate */}
      <mesh position={[0, 0.16, 0]}><boxGeometry args={[0.55, 0.04, 0.55]} />{M.alu}</mesh>
      {/* Heatpipes */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={`hp${i}`} position={[x, 0.8, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.3, 16]} />{M.copper}
        </mesh>
      ))}
      {/* Fin stack top plate */}
      <mesh position={[0, 1.2, 0]}><boxGeometry args={[0.6, 0.03, 0.6]} />{M.alu}</mesh>
      {/* Fins */}
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <mesh key={`fin${i}`} position={[0, 0.4 + i*0.08, 0]}>
          <boxGeometry args={[0.64, 0.015, 0.28]} />{M.silver}
        </mesh>
      ))}
      {/* Fan on front of cooler */}
      <mesh position={[0, 0.75, 0.35]}>
        <ringGeometry args={[0.18, 0.25, 32]} />{M.fanFrame}
      </mesh>
      <group ref={fanRef} position={[0, 0.75, 0.34]}>
        {[0,1,2,3,4].map(i => (
          <mesh key={`fb${i}`} rotation={[0,0,(Math.PI*2/5)*i]}>
            <boxGeometry args={[0.015, 0.16, 0.005]} />{M.fanBlade}
          </mesh>
        ))}
      </group>
      {/* Fan hub */}
      <mesh position={[0, 0.75, 0.35]}><cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />{M.blackPlastic}</mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────
   RAM STICKS (2 installed)
   ────────────────────────────────────────────── */
function RAMStick({ offsetZ }) {
  return (
    <group position={[0, 0, offsetZ]}>
      {/* PCB */}
      <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.08, 1.2, 0.015]} />{M.pcb}</mesh>
      {/* Chips */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <mesh key={`c${i}`} position={[0, 0.15 + i*0.12, 0.012]}>
          <boxGeometry args={[0.07, 0.07, 0.008]} />{M.blackPlastic}
        </mesh>
      ))}
      {/* Gold contacts */}
      {[0,1,2,3].map(i => (
        <mesh key={`gc${i}`} position={[0, -0.2 + i*0.01, 0.012]}>
          <boxGeometry args={[0.06, 0.006, 0.004]} />{M.gold}
        </mesh>
      ))}
      {/* Heat spreader */}
      <mesh position={[0, 0.45, 0.014]}><boxGeometry args={[0.09, 0.55, 0.01]} />{M.silver}</mesh>
      {/* RGB top */}
      <mesh position={[0, 0.62, 0.014]}>
        <boxGeometry args={[0.09, 0.04, 0.006]} />{M.rgbCyan}
      </mesh>
    </group>
  );
}

function RAM({ onClick, hovered }) {
  return (
    <group
      position={[1.15, 0.55, -1.45]}
      onClick={(e) => { e.stopPropagation(); onClick('ram'); }}
      onPointerOver={() => hovered('ram')}
      onPointerOut={() => hovered(null)}
    >
      <RAMStick offsetZ={0} />
      <RAMStick offsetZ={0.55} />
    </group>
  );
}

/* ──────────────────────────────────────────────
   GPU (horizontal in PCIe slot)
   ────────────────────────────────────────────── */
function GPU({ onClick, hovered }) {
  return (
    <group
      position={[-1.3, 0.25, -0.5]}
      rotation={[0, 0, Math.PI/2]}
      onClick={(e) => { e.stopPropagation(); onClick('gpu'); }}
      onPointerOver={() => hovered('gpu')}
      onPointerOut={() => hovered(null)}
    >
      {/* Card body */}
      <mesh><boxGeometry args={[0.55, 0.15, 2.2]} />{M.steelDark}</mesh>
      {/* Backplate */}
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[0.56, 0.03, 2.2]} />{M.silver}</mesh>
      {/* Shroud */}
      <mesh position={[0, -0.12, 0]}><boxGeometry args={[0.58, 0.04, 2.0]} />{M.steel}</mesh>
      {/* Fans */}
      {[-0.6, 0, 0.6].map((z, i) => (
        <group key={`gf${i}`} position={[0, -0.15, z]}>
          <mesh><ringGeometry args={[0.16, 0.22, 32]} />{M.fanFrame}</mesh>
          {[0,1,2].map(j => (
            <mesh key={`gb${j}`} rotation={[0,0,(Math.PI*2/3)*j]}>
              <boxGeometry args={[0.015, 0.14, 0.005]} />{M.fanBlade}
            </mesh>
          ))}
          <mesh position={[0,0,0.003]}><cylinderGeometry args={[0.06, 0.06, 0.008, 24]} />{M.blackPlastic}</mesh>
        </group>
      ))}
      {/* PCIe connector */}
      <mesh position={[-0.03, 0, 0]}><boxGeometry args={[0.04, 0.18, 1.5]} />{M.gold}</mesh>
      {/* RGB strip */}
      <mesh position={[0, -0.14, 0.4]}>
        <boxGeometry args={[0.45, 0.006, 0.015]} />{M.rgbRed}
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────
   STORAGE (M.2 on motherboard + 2.5" SSD)
   ────────────────────────────────────────────── */
function StorageDrives({ onClick, hovered }) {
  return (
    <group
      onClick={(e) => { e.stopPropagation(); onClick('storage'); }}
      onPointerOver={() => hovered('storage')}
      onPointerOut={() => hovered(null)}
    >
      {/* M.2 on motherboard */}
      <group position={[0.15, 0.55, 0.3]}>
        <mesh rotation={[Math.PI/2, 0, 0]}><boxGeometry args={[0.18, 0.003, 1.4]} />{M.pcb}</mesh>
        <mesh position={[0, -0.01, -0.3]}><boxGeometry args={[0.12, 0.008, 0.12]} />{M.blackPlastic}</mesh>
        <mesh position={[0, -0.005, -0.7]}><boxGeometry args={[0.16, 0.002, 0.03]} />{M.gold}</mesh>
      </group>
      {/* 2.5" SSD mounted behind tray (visible from side) */}
      <group position={[0.15, -0.1, 0.6]}>
        <mesh rotation={[0, Math.PI/2, 0]}><boxGeometry args={[0.03, 1.0, 0.7]} />{M.steel}</mesh>
        <mesh position={[0.02, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[0.005, 0.7, 0.5]} />{M.steelDark}
        </mesh>
      </group>
    </group>
  );
}

/* ──────────────────────────────────────────────
   GLASS SIDE PANEL (animated open/close)
   ────────────────────────────────────────────── */
function GlassPanel({ open }) {
  const ref = useRef();
  const targetAngle = open ? -Math.PI / 3 : 0;
  useFrame((_, delta) => {
    if (ref.current) {
      const cur = ref.current.rotation.y;
      ref.current.rotation.y += (targetAngle - cur) * Math.min(delta * 4, 1);
    }
  });

  return (
    <group ref={ref} position={[-2.35, 0, 0]}>
      {/* Glass pane */}
      <mesh position={[0.2, 0, 0]}><boxGeometry args={[0.02, 4.2, 2.4]} />{M.glass}</mesh>
      {/* Frame around glass */}
      <mesh position={[0.2, 2.15, 0]}><boxGeometry args={[0.04, 0.1, 2.6]} />{M.glassEdge}</mesh>
      <mesh position={[0.2, -2.15, 0]}><boxGeometry args={[0.04, 0.1, 2.6]} />{M.glassEdge}</mesh>
      <mesh position={[0.2, 0, 1.25]}><boxGeometry args={[0.04, 4.4, 0.1]} />{M.glassEdge}</mesh>
      <mesh position={[0.2, 0, -1.25]}><boxGeometry args={[0.04, 4.4, 0.1]} />{M.glassEdge}</mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────
   REAR PANEL
   ────────────────────────────────────────────── */
function RearPanel() {
  return (
    <group>
      <mesh position={[0, 0, -1.44]}><boxGeometry args={[4.2, 4.8, 0.04]} />{M.steelDark}</mesh>
      {/* PSU cutout */}
      <mesh position={[1.0, -1.85, -1.44]}><boxGeometry args={[1.4, 0.7, 0.05]} />{M.steelDark}</mesh>
      {/* I/O shield cutout */}
      <mesh position={[0.15, 1.0, -1.44]}><boxGeometry args={[0.9, 0.35, 0.05]} />{M.steel}</mesh>
      {/* PCIe slot covers */}
      {[0,1,2,3,4].map(i => (
        <mesh key={`pc${i}`} position={[-0.8, -0.8 + i*0.22, -1.44]}>
          <boxGeometry args={[0.15, 0.18, 0.04]} />{M.steel}
        </mesh>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────
   INFO PANEL (HTML overlay)
   ────────────────────────────────────────────── */
function InfoPanel({ selected, onClose }) {
  if (!selected) return null;
  const data = componentData[selected];
  if (!data) return null;

  return (
    <div className="info-panel">
      <div className="info-panel-inner">
        <div className="info-panel-header">
          <span className="info-dot" style={{background:data.accent,boxShadow:`0 0 8px ${data.accent}`}} />
          <h3>{data.name}</h3>
          <button className="info-close" onClick={onClose}>&times;</button>
        </div>
        <p className="info-desc">{data.description}</p>
        <h4>Key Specifications</h4>
        <ul className="info-specs">
          {data.specs.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <div className="info-tip"><strong>Pro Tip:</strong> {data.tips}</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   FULL SCENE
   ────────────────────────────────────────────── */
function Scene({ onSelect, onHover, panelOpen }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[8, 10, 6]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -5]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.4} color="#00b4d8" />

      {/* Case */}
      <CaseFrame />
      <RearPanel />
      <PSUShroud />

      {/* Internal components */}
      <Motherboard onClick={onSelect} hovered={onHover} />
      <CPUWithCooler onClick={onSelect} hovered={onHover} />
      <RAM onClick={onSelect} hovered={onHover} />
      <GPU onClick={onSelect} hovered={onHover} />
      <PSU onClick={onSelect} hovered={onHover} />
      <StorageDrives onClick={onSelect} hovered={onHover} />

      {/* Fans */}
      <CaseFan position={[0, 2.1, 1.38]} rotation={[0,0,0]} />
      <CaseFan position={[0, -2.1, 1.38]} rotation={[0,0,0]} />
      <CaseFan position={[0, 1.5, -1.42]} rotation={[0,Math.PI,0]} size={0.45} />

      {/* Glass side panel */}
      <GlassPanel open={panelOpen} />

      {/* Desk/platform */}
      <mesh position={[0, -2.9, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3.5, 4.0, 0.1, 64]} />
        <meshStandardMaterial color="#0a0e17" roughness={0.3} metalness={0.4} />
      </mesh>
      <ContactShadows position={[0, -2.85, 0]} opacity={0.5} scale={9} blur={2.5} />
    </>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function PCScene() {
  const [active, setActive] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="explorer-scene">
      <button
        className="panel-toggle"
        onClick={() => setPanelOpen(o => !o)}
        title={panelOpen ? 'Close side panel' : 'Open side panel'}
      >
        {panelOpen ? 'Close Case' : 'Open Case'}
      </button>

      <InfoPanel selected={active} onClose={() => setActive(null)} />

      <Canvas
        camera={{ position: [2, 0.5, 7], fov: 42 }}
        style={{ cursor: 'grab' }}
      >
        <Suspense fallback={null}>
          <Scene onSelect={setActive} onHover={() => {}} panelOpen={panelOpen} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={3}
            maxDistance={14}
            maxPolarAngle={Math.PI / 1.4}
            target={[0, 0, 0]}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
