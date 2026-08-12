import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { componentData } from './componentData.js';

// ═══════════════════════════════════════════════════════════
// CASE DIMENSIONS (physical boundary)
// ═══════════════════════════════════════════════════════════
const CASE = { w: 4.4, h: 5.2, d: 2.9 }; // width(height), height, depth
const CW = CASE.w, CH = CASE.h, CD = CASE.d;
const LEFT  = -CW/2;  // -2.2  — glass panel side
const RIGHT = +CW/2;  // +2.2  — motherboard tray side
const FRONT = +CD/2;  // +1.45 — front intake
const REAR  = -CD/2;  // -1.45 — rear exhaust
const TOP   = +CH/2;  // +2.6
const BOT   = -CH/2;  // -2.6

// ═══════════════════════════════════════════════════════════
// PBR MATERIALS
// ═══════════════════════════════════════════════════════════
const mat = (props) => <meshStandardMaterial {...props} />;
const M = {
  chassis:       { color:'#242528', roughness:0.22, metalness:0.92 },
  frame:         { color:'#1e1f22', roughness:0.2,  metalness:0.94 },
  glass:         { color:'#ddeeff', roughness:0.03, metalness:0.03, transparent:true, opacity:0.13 },
  glassFrame:    { color:'#2a2b2e', roughness:0.12, metalness:0.9 },
  brushedAlu:    { color:'#a8aaae', roughness:0.18, metalness:0.96 },
  aluHeatsink:   { color:'#c4c6ca', roughness:0.14, metalness:0.97 },
  darkPlastic:   { color:'#131518', roughness:0.45, metalness:0.04 },
  blackPlastic:  { color:'#0f1114', roughness:0.4,  metalness:0.05 },
  fanFrame:      { color:'#101114', roughness:0.3,  metalness:0.1 },
  fanBlade:      { color:'#17191d', roughness:0.28, metalness:0.04 },
  pcbGreen:      { color:'#0f2618', roughness:0.55, metalness:0.03 },
  pcbDark:       { color:'#0e1014', roughness:0.5,  metalness:0.04 },
  goldPin:       { color:'#d4a017', roughness:0.1,  metalness:0.97 },
  copper:        { color:'#c47a40', roughness:0.18, metalness:0.98 },
  // RGB
  violet:        { color:'#8b5cf6', roughness:0.1, emissive:'#7c3aed', emissiveIntensity:0.7 },
  cyan:          { color:'#22d3ee', roughness:0.1, emissive:'#06b6d4', emissiveIntensity:0.5 },
  white:         { color:'#e2e8f0', roughness:0.1, emissive:'#cbd5e1', emissiveIntensity:0.3 },
};

// ═══════════════════════════════════════════════════════════
// CASE FRAME
// ═══════════════════════════════════════════════════════════
function Chassis() {
  const t = 0.06;
  return (
    <group>
      {/* bottom + top plates */}
      <mesh position={[0, BOT, 0]}><boxGeometry args={[CW, t, CD]} />{mat(M.chassis)}</mesh>
      <mesh position={[0, TOP, 0]}><boxGeometry args={[CW, t, CD]} />{mat(M.chassis)}</mesh>
      {/* front panel */}
      <mesh position={[0, 0, FRONT]}><boxGeometry args={[CW, CH, t]} />{mat(M.frame)}</mesh>
      {/* rear panel */}
      <mesh position={[0, 0, REAR]}><boxGeometry args={[CW, CH, 0.05]} />{mat(M.chassis)}</mesh>
      {/* right side (motherboard tray) */}
      <mesh position={[RIGHT, 0, 0]}><boxGeometry args={[0.04, CH-0.1, CD-0.1]} />{mat(M.chassis)}</mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// PSU SHROUD
// ═══════════════════════════════════════════════════════════
function Shroud() {
  const sy = BOT + 1.1;
  return (
    <group>
      <mesh position={[0, sy, 0]}><boxGeometry args={[CW-0.15, 0.04, CD-0.2]} />{mat(M.chassis)}</mesh>
      <mesh position={[0, BOT+0.55, FRONT-0.01]}><boxGeometry args={[CW-0.15, 1.1, 0.04]} />{mat(M.frame)}</mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// PSU — inside bottom compartment
// ═══════════════════════════════════════════════════════════
function PSU({ onClick }) {
  const fanRef = useRef();
  useFrame((_, d) => { if (fanRef.current) fanRef.current.rotation.z += d * 3; });
  // Position: inside shroud, at bottom-rear
  const px = 0.7, py = BOT + 0.5, pz = REAR + 0.6;
  return (
    <group
      position={[px, py, pz]}
      onClick={(e) => { e.stopPropagation(); onClick('psu'); }}
    >
      <mesh><boxGeometry args={[1.5, 0.75, 1.3]} />{mat(M.chassis)}</mesh>
      <mesh position={[0, 0.4, 0]}><ringGeometry args={[0.25, 0.3, 48]} />{mat(M.fanFrame)}</mesh>
      {[0,1,2,3].map(i => (
        <mesh key={`sg${i}`} position={[0,0.395,0]} rotation={[0,0,Math.PI/4*i]}>
          <boxGeometry args={[0.26,0.005,0.005]} />{mat(M.chassis)}
        </mesh>
      ))}
      <group ref={fanRef} position={[0,0.4,-0.01]}>
        {[0,1,2,3,4,5,6].map(i => (
          <mesh key={`fb${i}`} rotation={[0,0,Math.PI*2/7*i]}>
            <boxGeometry args={[0.012,0.18,0.004]} />{mat(M.fanBlade)}
          </mesh>
        ))}
      </group>
      <mesh position={[0,0.4,0.01]}><cylinderGeometry args={[0.05,0.05,0.015,32]} />{mat(M.darkPlastic)}</mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// RGB FAN — attached to case
// ═══════════════════════════════════════════════════════════
function CaseFan({ pos, rot, sz=0.5, rgb='violet' }) {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.z += d * 3.5; });
  return (
    <group position={pos} rotation={rot}>
      <mesh><ringGeometry args={[sz*0.42, sz*0.5, 48]} />{mat(M.fanFrame)}</mesh>
      <mesh position={[0,0,0.006]}><ringGeometry args={[sz*0.36, sz*0.42, 48]} />{mat(M[rgb])}</mesh>
      <mesh position={[0,0,0.014]}><cylinderGeometry args={[sz*0.09,sz*0.09,0.02,32]} />{mat(M.darkPlastic)}</mesh>
      <group ref={ref}>
        {[0,1,2,3,4,5,6].map(i => (
          <mesh key={i} rotation={[0,0,Math.PI*2/7*i]} position={[0,0,0.01]}>
            <boxGeometry args={[0.013,sz*0.3,0.005]} />{mat(M.fanBlade)}
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// AIO RADIATOR (top mount) + TUBES + PUMP
// ═══════════════════════════════════════════════════════════
function Radiator() {
  const ry = TOP - 0.2;
  return (
    <group position={[0, ry, 0]}>
      <mesh><boxGeometry args={[3.4, 0.22, 1.2]} />{mat(M.aluHeatsink)}</mesh>
      {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
        <mesh key={i} position={[0,0,-0.45+i*0.09]}>
          <boxGeometry args={[3.3,0.2,0.012]} />{mat(M.chassis)}
        </mesh>
      ))}
      <mesh position={[-1.75,0,0]}><boxGeometry args={[0.18,0.25,1.3]} />{mat(M.darkPlastic)}</mesh>
      <mesh position={[1.75,0,0]}><boxGeometry args={[0.18,0.25,1.3]} />{mat(M.darkPlastic)}</mesh>
    </group>
  );
}

function Tubes() {
  return (
    <group>
      <mesh position={[-0.35, 1.2, -0.55]} rotation={[0.5, 0.3, 0]}>
        <cylinderGeometry args={[0.05,0.05,2.3,20]} />{mat(M.darkPlastic)}
      </mesh>
      <mesh position={[0.15, 1.1, -0.5]} rotation={[0.45, -0.2, 0]}>
        <cylinderGeometry args={[0.05,0.05,2.2,20]} />{mat(M.darkPlastic)}
      </mesh>
    </group>
  );
}

function Pump({ onClick }) {
  return (
    <group
      position={[0.1, 0.35, REAR+1.1]}
      onClick={(e) => { e.stopPropagation(); onClick('cpu'); }}
    >
      <mesh position={[0,0.04,0]}><boxGeometry args={[0.7,0.04,0.7]} />{mat(M.brushedAlu)}</mesh>
      <mesh position={[0,0.18,0]}><cylinderGeometry args={[0.28,0.3,0.24,48]} />{mat(M.darkPlastic)}</mesh>
      <mesh position={[0,0.32,0]}><cylinderGeometry args={[0.26,0.26,0.04,48]} />{mat(M.violet)}</mesh>
      <mesh position={[0,0.35,0]}><circleGeometry args={[0.1,32]} />{mat(M.white)}</mesh>
      <mesh position={[0.18,0.18,0.3]}><cylinderGeometry args={[0.05,0.05,0.08,20]} />{mat(M.darkPlastic)}</mesh>
      <mesh position={[-0.18,0.18,0.3]}><cylinderGeometry args={[0.05,0.05,0.08,20]} />{mat(M.darkPlastic)}</mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// MOTHERBOARD — on tray, inside case
// ═══════════════════════════════════════════════════════════
function Motherboard({ onClick }) {
  const mw = 3.0, mh = 3.4, mt = 0.04;
  const mx = RIGHT - 0.05, my = 0.4, mz = REAR + 1.8;
  return (
    <group
      position={[mx, my, mz]}
      onClick={(e) => { e.stopPropagation(); onClick('motherboard'); }}
    >
      <mesh><boxGeometry args={[mw, mt, mh]} />{mat(M.pcbGreen)}</mesh>
      {/* traces */}
      {[0,1,2,3,4,5,6].map(i => (
        <mesh key={`t${i}`} position={[0, mt/2+0.002, -1.1+i*0.38]}>
          <boxGeometry args={[mw*0.6, 0.003, 0.016]} />{mat({color:'#3a6e44', roughness:0.3})}
        </mesh>
      ))}
      {/* VRM heatsinks */}
      <mesh position={[-0.25, mt/2+0.06, -1.55]}><boxGeometry args={[1.3,0.08,0.3]} />{mat(M.aluHeatsink)}</mesh>
      <mesh position={[0.85, mt/2+0.06, -1.55]}><boxGeometry args={[0.7,0.08,0.3]} />{mat(M.aluHeatsink)}</mesh>
      {[-0.55,-0.25,0.05,0.35,0.65].map((x,i) => (
        <mesh key={`vf${i}`} position={[x, mt/2+0.1, -1.55]}>
          <boxGeometry args={[0.05,0.05,0.3]} />{mat(M.aluHeatsink)}
        </mesh>
      ))}
      {/* Chipset */}
      <mesh position={[-0.35, mt/2+0.04, 1.25]}><boxGeometry args={[0.6,0.06,0.6]} />{mat(M.aluHeatsink)}</mesh>
      <mesh position={[-0.35, mt/2+0.07, 1.25]}><boxGeometry args={[0.5,0.01,0.5]} />{mat(M.cyan)}</mesh>
      {/* PCIe x16 */}
      <mesh position={[-1.0, mt/2+0.03, 0.2]}><boxGeometry args={[0.035,0.04,1.8]} />{mat(M.darkPlastic)}</mesh>
      <mesh position={[-1.0, mt/2+0.05, 1.0]}><boxGeometry args={[0.025,0.03,0.08]} />{mat(M.blackPlastic)}</mesh>
      {/* DIMM slots */}
      {[0,1,2,3].map((_,i) => (
        <mesh key={`ds${i}`} position={[0.95, mt/2+0.03, -1.0+i*0.5]}>
          <boxGeometry args={[0.04,0.04,0.85]} />{mat(M.darkPlastic)}
        </mesh>
      ))}
      {/* M.2 */}
      <mesh position={[0.2, mt/2+0.01, 1.05]}><boxGeometry args={[0.16,0.008,1.3]} />{mat(M.pcbDark)}</mesh>
      <mesh position={[0.2, mt/2+0.015, 0.45]}><boxGeometry args={[0.12,0.008,0.12]} />{mat(M.blackPlastic)}</mesh>
      <mesh position={[0.2, mt/2+0.008, 0.4]}><boxGeometry args={[0.14,0.002,0.025]} />{mat(M.goldPin)}</mesh>
      {/* I/O */}
      <mesh position={[0, 0.4, -mh/2-0.02]}><boxGeometry args={[1.0,0.4,0.03]} />{mat(M.brushedAlu)}</mesh>
      {/* Capacitors */}
      {[0,1,2,3,4,5].map(i => (
        <mesh key={`cap${i}`} position={[-0.9+i*0.4, mt/2+0.03, 0]}>
          <cylinderGeometry args={[0.035,0.035,0.05,16]} />{mat(M.blackPlastic)}
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// RAM
// ═══════════════════════════════════════════════════════════
function RAMStick({ z }) {
  return (
    <group position={[0,0,z]}>
      <mesh position={[0,0.5,0]}><boxGeometry args={[0.06,1.0,0.012]} />{mat(M.pcbDark)}</mesh>
      {[0,1,2,3,4,5,6,7].map(i => (
        <mesh key={`c${i}`} position={[0,0.08+i*0.1,0.01]}>
          <boxGeometry args={[0.05,0.06,0.006]} />{mat(M.blackPlastic)}
        </mesh>
      ))}
      {[0,1,2,3].map(i => (
        <mesh key={`g${i}`} position={[0,-0.25+i*0.008,0.01]}>
          <boxGeometry args={[0.05,0.005,0.003]} />{mat(M.goldPin)}
        </mesh>
      ))}
      <mesh position={[0,0.35,0.012]}><boxGeometry args={[0.07,0.45,0.007]} />{mat(M.brushedAlu)}</mesh>
      <mesh position={[0,0.52,0.012]}><boxGeometry args={[0.07,0.035,0.004]} />{mat(M.violet)}</mesh>
    </group>
  );
}

function RAM({ onClick }) {
  return (
    <group
      position={[RIGHT-0.08, 0.5, REAR+0.7]}
      onClick={(e) => { e.stopPropagation(); onClick('ram'); }}
    >
      <RAMStick z={0} />
      <RAMStick z={0.5} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// GPU — horizontal in PCIe, inside case
// ═══════════════════════════════════════════════════════════
function GPU({ onClick }) {
  // GPU spans along Z (depth), sits in PCIe x16 slot
  // PCIe slot is at mobo left edge, GPU extends left from there
  const cx = -1.15, cy = 0.18, cz = REAR + 2.1;
  return (
    <group
      position={[cx, cy, cz]}
      rotation={[0, 0, Math.PI/2]}
      onClick={(e) => { e.stopPropagation(); onClick('gpu'); }}
    >
      <mesh position={[0,0.07,0]}><boxGeometry args={[0.55,0.025,2.2]} />{mat(M.aluHeatsink)}</mesh>
      <mesh><boxGeometry args={[0.55,0.12,2.2]} />{mat(M.pcbDark)}</mesh>
      <mesh position={[0,-0.1,0]}><boxGeometry args={[0.57,0.05,2.0]} />{mat(M.darkPlastic)}</mesh>
      <mesh position={[0,-0.11,0]}><boxGeometry args={[0.53,0.02,1.9]} />{mat(M.chassis)}</mesh>
      {[-0.65,0,0.65].map((z,i) => (
        <group key={`f${i}`} position={[0,-0.16,z]}>
          <mesh><ringGeometry args={[0.17,0.22,48]} />{mat(M.fanFrame)}</mesh>
          <mesh position={[0,0,0.003]}><ringGeometry args={[0.14,0.17,48]} />{mat(M.cyan)}</mesh>
          {[0,1,2,3,4].map(j => (
            <mesh key={`b${j}`} rotation={[0,0,Math.PI*2/5*j]} position={[0,0,0.004]}>
              <boxGeometry args={[0.01,0.13,0.004]} />{mat(M.fanBlade)}
            </mesh>
          ))}
          <mesh position={[0,0,0.01]}><cylinderGeometry args={[0.06,0.06,0.006,32]} />{mat(M.darkPlastic)}</mesh>
        </group>
      ))}
      <mesh position={[-0.025,0,0]}><boxGeometry args={[0.03,0.12,1.5]} />{mat(M.goldPin)}</mesh>
      <mesh position={[-0.28,0,1.1]}><boxGeometry args={[0.05,0.09,0.05]} />{mat(M.brushedAlu)}</mesh>
      <mesh position={[-0.28,0,1.0]}><boxGeometry args={[0.03,0.06,0.035]} />{mat(M.darkPlastic)}</mesh>
      <mesh position={[0,-0.15,0.45]}><boxGeometry args={[0.48,0.004,0.01]} />{mat(M.violet)}</mesh>
      <mesh position={[0,-0.15,-0.45]}><boxGeometry args={[0.3,0.003,0.025]} />{mat(M.white)}</mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════
function Storage({ onClick }) {
  return (
    <group
      onClick={(e) => { e.stopPropagation(); onClick('storage'); }}
    >
      <group position={[RIGHT-0.05, 0.2, FRONT-0.4]}>
        <mesh rotation={[0,Math.PI/2,0]}><boxGeometry args={[0.025,0.9,0.65]} />{mat(M.chassis)}</mesh>
        <mesh position={[0.02,0.1,0]} rotation={[0,Math.PI/2,0]}>
          <boxGeometry args={[0.004,0.55,0.38]} />{mat(M.blackPlastic)}
        </mesh>
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// CABLES
// ═══════════════════════════════════════════════════════════
function Cables() {
  return (
    <group>
      {/* 24-pin */}
      <mesh position={[0.4,-0.2,-0.5]} rotation={[0.6,0.3,0]}>
        <cylinderGeometry args={[0.05,0.05,1.4,16]} />{mat(M.darkPlastic)}
      </mesh>
      {/* PCIe power */}
      <mesh position={[-1.0,-0.05,-0.3]} rotation={[1.0,0.15,0]}>
        <cylinderGeometry args={[0.035,0.035,1.0,14]} />{mat(M.darkPlastic)}
      </mesh>
      {/* Front panel */}
      <mesh position={[0.9,0.15,FRONT-0.2]} rotation={[0.5,-0.4,0]}>
        <cylinderGeometry args={[0.025,0.025,0.9,12]} />{mat(M.blackPlastic)}
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// TEMPERED GLASS PANEL — hinged on front edge
// ═══════════════════════════════════════════════════════════
function GlassPanel({ open, onToggle }) {
  const hingeRef = useRef();
  const targetAngle = open ? -Math.PI / 3.5 : 0;
  useFrame((_, delta) => {
    if (hingeRef.current) {
      const cur = hingeRef.current.rotation.y;
      hingeRef.current.rotation.y += (targetAngle - cur) * Math.min(delta * 3, 1);
    }
  });

  return (
    <group
      position={[LEFT, 0, FRONT]}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
    >
      {/* hinge point: panel rotates around front edge */}
      <group ref={hingeRef}>
        {/* Glass pane offset so it sits flush when closed */}
        <mesh position={[0, 0, -CD/2 - FRONT]}>
          <boxGeometry args={[0.012, CH-0.3, CD-0.15]} />
          <meshPhysicalMaterial color="#ddeeff" roughness={0.02} metalness={0.02} transparent opacity={open ? 0.06 : 0.13} envMapIntensity={0.7} />
        </mesh>
        {/* Frame edges */}
        {[
          [0,TOP-0.06,0, 0.03,0.1,CD-0.05],
          [0,BOT+0.06,0, 0.03,0.1,CD-0.05],
          [0,0,0, 0.03,CH-0.5,0.08],
          [0,0,REAR+0.08, 0.03,CH-0.5,0.08],
        ].map(([px,py,pz,sx,sy,sz], i) => (
          <mesh key={`fe${i}`} position={[px,py,pz]}><boxGeometry args={[sx,sy,sz]} />{mat(M.glassFrame)}</mesh>
        ))}
        {/* Thumb screws */}
        {[TOP-0.4, BOT+0.4].map((y, i) => (
          <mesh key={`ts${i}`} position={[0.015, y, REAR+0.15]}>
            <cylinderGeometry args={[0.035,0.035,0.025,24]} />{mat(M.brushedAlu)}
          </mesh>
        ))}
        {/* Fake reflection highlight */}
        {!open && (
          <mesh position={[-0.008, 0.5, -0.6]} rotation={[0.2, 0, 0.1]}>
            <planeGeometry args={[CH-0.8, CD-0.6]} />
            <meshBasicMaterial color="#fff" transparent opacity={0.025} side={2} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// INFO OVERLAY
// ═══════════════════════════════════════════════════════════
function InfoPanel({ selected, onClose }) {
  if (!selected) return null;
  const d = componentData[selected];
  if (!d) return null;
  return (
    <div className="info-panel">
      <div className="info-panel-inner">
        <div className="info-panel-header">
          <span className="info-dot" style={{background:d.accent,boxShadow:`0 0 8px ${d.accent}`}} />
          <h3>{d.name}</h3>
          <button className="info-close" onClick={onClose}>&times;</button>
        </div>
        <p className="info-desc">{d.description}</p>
        <h4>Key Specifications</h4>
        <ul className="info-specs">{d.specs.map((s,i) => <li key={i}>{s}</li>)}</ul>
        <div className="info-tip"><strong>Pro Tip:</strong> {d.tips}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STUDIO LIGHTING
// ═══════════════════════════════════════════════════════════
function Lights() {
  return (
    <>
      <ambientLight intensity={0.22} />
      <directionalLight position={[6,5,8]} intensity={1.3} castShadow shadow-mapSize={1024} />
      <directionalLight position={[-3,3,-5]} intensity={0.4} />
      <directionalLight position={[0,-1,6]} intensity={0.35} />
      <spotLight position={[0,5,0]} intensity={0.25} color="#7c3aed" angle={0.3} penumbra={1} />
      <pointLight position={[0,1,5]} intensity={0.25} color="#cbd5e1" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// FULL SCENE
// ═══════════════════════════════════════════════════════════
function Scene({ onSelect, panelOpen, onToggle }) {
  return (
    <>
      <Lights />
      <Chassis />
      <Shroud />
      <Motherboard onClick={onSelect} />
      <Pump onClick={onSelect} />
      <Tubes />
      <Radiator />
      <RAM onClick={onSelect} />
      <GPU onClick={onSelect} />
      <PSU onClick={onSelect} />
      <Storage onClick={onSelect} />
      <Cables />
      {/* Front intake fans */}
      <CaseFan pos={[0, 1.6, FRONT-0.06]} rot={[0,0,0]} rgb="violet" />
      <CaseFan pos={[0, 0.45, FRONT-0.06]} rot={[0,0,0]} rgb="violet" />
      <CaseFan pos={[0, -0.7, FRONT-0.06]} rot={[0,0,0]} rgb="violet" />
      {/* Top radiator fans */}
      <CaseFan pos={[-1.4, TOP-0.1, 0]} rot={[0,0,0]} sz={0.45} rgb="cyan" />
      <CaseFan pos={[1.4, TOP-0.1, 0]} rot={[0,0,0]} sz={0.45} rgb="cyan" />
      {/* Rear exhaust */}
      <CaseFan pos={[0, 1.5, REAR+0.08]} rot={[0,Math.PI,0]} sz={0.42} rgb="white" />
      {/* Glass panel */}
      <GlassPanel open={panelOpen} onToggle={onToggle} />
      {/* Floor */}
      <mesh position={[0, BOT-0.4, 0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[10,10]} />
        <meshStandardMaterial color="#0a0d12" roughness={0.4} metalness={0.3} />
      </mesh>
      <ContactShadows position={[0, BOT-0.35, 0]} opacity={0.5} scale={9} blur={1.5} />
      <Environment preset="studio" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function PCScene() {
  const [active, setActive] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="explorer-scene">
      <div className="explorer-controls">
        <button className="panel-toggle" onClick={() => setPanelOpen(o => !o)}>
          {panelOpen ? 'Close Case' : 'Open Case'}
        </button>
        <button className="panel-toggle secondary" onClick={() => setActive(null)}>
          Reset View
        </button>
      </div>

      {!panelOpen && (
        <div className="panel-hint">
          Click "Open Case" or the glass panel to reveal the interior
        </div>
      )}

      <InfoPanel selected={active} onClose={() => setActive(null)} />

      <Canvas
        camera={{ position: [5.5, 1.5, 5.5], fov: 35 }}
        style={{ cursor: 'grab' }}
        gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.0 }}
        shadows
      >
        <Suspense fallback={null}>
          <Scene onSelect={setActive} panelOpen={panelOpen} onToggle={() => setPanelOpen(o => !o)} />
          <OrbitControls
            enablePan={true} enableZoom={true}
            minDistance={3.5} maxDistance={14}
            maxPolarAngle={Math.PI/1.35}
            target={[0, -0.2, 0]}
            enableDamping dampingFactor={0.08}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
