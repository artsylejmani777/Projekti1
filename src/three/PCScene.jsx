import { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Line } from '@react-three/drei';
import { componentData, componentFocus } from './componentData.js';

// ═══════════════════════════════════════════════════════════
// CASE DIMENSIONS
// ═══════════════════════════════════════════════════════════
const CW = 4.4, CH = 5.2, CD = 2.9;
const LEFT = -CW/2, RIGHT = +CW/2, FRONT = +CD/2, REAR = -CD/2, TOP = +CH/2, BOT = -CH/2;

// ═══════════════════════════════════════════════════════════
// PBR MATERIALS
// ═══════════════════════════════════════════════════════════
const M = {
  chassis:      { color:'#242528', roughness:0.22, metalness:0.92 },
  frame:        { color:'#1e1f22', roughness:0.2,  metalness:0.94 },
  glassFrame:   { color:'#2a2b2e', roughness:0.12, metalness:0.9 },
  brushedAlu:   { color:'#a8aaae', roughness:0.18, metalness:0.96 },
  aluHeatsink:  { color:'#c4c6ca', roughness:0.14, metalness:0.97 },
  darkPlastic:  { color:'#131518', roughness:0.45, metalness:0.04 },
  blackPlastic: { color:'#0f1114', roughness:0.4,  metalness:0.05 },
  fanFrame:     { color:'#101114', roughness:0.3,  metalness:0.1 },
  fanBlade:     { color:'#17191d', roughness:0.28, metalness:0.04 },
  pcbGreen:     { color:'#0f2618', roughness:0.55, metalness:0.03 },
  pcbDark:      { color:'#0e1014', roughness:0.5,  metalness:0.04 },
  goldPin:      { color:'#d4a017', roughness:0.1,  metalness:0.97 },
  violet:       { color:'#8b5cf6', roughness:0.1, emissive:'#7c3aed', emissiveIntensity:0.7 },
  cyan:         { color:'#22d3ee', roughness:0.1, emissive:'#06b6d4', emissiveIntensity:0.5 },
  white:        { color:'#e2e8f0', roughness:0.1, emissive:'#cbd5e1', emissiveIntensity:0.3 },
};

// ═══════════════════════════════════════════════════════════
// HIGHLIGHT HELPER — wraps material with glow on hover/select
// ═══════════════════════════════════════════════════════════
function GlowMaterial({ base, hovered, selected, children }) {
  const mat = useMemo(() => {
    const b = { ...base };
    if (selected) {
      b.emissive = b.emissive || '#7c3aed';
      b.emissiveIntensity = (b.emissiveIntensity || 0) + 0.4;
    } else if (hovered) {
      b.emissive = b.emissive || '#5b8def';
      b.emissiveIntensity = (b.emissiveIntensity || 0) + 0.2;
    }
    return b;
  }, [base, hovered, selected]);
  return <meshStandardMaterial {...mat} />;
}

// ═══════════════════════════════════════════════════════════
// CAMERA FOCUS ANIMATION
// ═══════════════════════════════════════════════════════════
function CameraFocus({ focusTarget }) {
  const { camera } = useThree();
  const targetPos = useRef([5.5, 1.5, 5.5]);
  const targetLook = useRef([0, -0.2, 0]);

  useFrame((_, delta) => {
    const [tx, ty, tz] = focusTarget?.pos || [5.5, 1.5, 5.5];
    const [lx, ly, lz] = focusTarget?.target || [0, -0.2, 0];
    const s = Math.min(delta * 2.5, 1);

    targetPos.current[0] += (tx - targetPos.current[0]) * s;
    targetPos.current[1] += (ty - targetPos.current[1]) * s;
    targetPos.current[2] += (tz - targetPos.current[2]) * s;
    targetLook.current[0] += (lx - targetLook.current[0]) * s;
    targetLook.current[1] += (ly - targetLook.current[1]) * s;
    targetLook.current[2] += (lz - targetLook.current[2]) * s;
  });

  return (
    <OrbitControls
      enablePan={true} enableZoom={true}
      minDistance={2.5} maxDistance={14}
      maxPolarAngle={Math.PI/1.35}
      target={targetLook.current}
      enableDamping dampingFactor={0.08}
      makeDefault
    />
  );
}

// ═══════════════════════════════════════════════════════════
// CONNECTION LINES
// ═══════════════════════════════════════════════════════════
function ConnectionLines({ component, show }) {
  if (!show || !component) return null;
  const lines = {
    gpu:    [[-1.5,0.1,-0.4],[-0.8,0.05,0.2],[0.7,-2.1,0.2]],
    cpu:    [[0.1,0.35,-0.4],[0.3,0.4,0.5],[1.0,0.5,-0.8]],
    ram:    [[1.0,0.55,-0.8],[0.3,0.4,0.5]],
    motherboard: [[0.3,0.4,0.5],[0.1,0.35,-0.4],[1.0,0.55,-0.8],[-1.5,0.1,-0.4],[0.7,-2.1,0.2]],
    psu:    [[0.7,-2.1,0.2],[0.3,0.4,0.5],[-1.5,0.1,-0.4]],
    storage:[[0.3,0.4,1.0],[0.3,0.4,0.5]],
    cooler: [[0.1,0.35,-0.4],[0,2.2,0]],
    radiator:[[0,2.2,0],[0.1,0.35,-0.4]],
    fans:   [[0,1.6,1.2],[0.3,0.4,0.5],[0,-2.2,1.2]],
  };
  const pts = lines[component];
  if (!pts) return null;
  return (
    <Line
      points={pts}
      color="#7c3aed"
      lineWidth={0.8}
      transparent
      opacity={0.5}
      dashed
      dashSize={0.3}
      gapSize={0.2}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// CASE
// ═══════════════════════════════════════════════════════════
function Chassis() {
  const t = 0.06;
  return (
    <group>
      <mesh position={[0,BOT,0]}><boxGeometry args={[CW,t,CD]} /><meshStandardMaterial {...M.chassis} /></mesh>
      <mesh position={[0,TOP,0]}><boxGeometry args={[CW,t,CD]} /><meshStandardMaterial {...M.chassis} /></mesh>
      <mesh position={[0,0,FRONT]}><boxGeometry args={[CW,CH,t]} /><meshStandardMaterial {...M.frame} /></mesh>
      <mesh position={[0,0,REAR]}><boxGeometry args={[CW,CH,0.05]} /><meshStandardMaterial {...M.chassis} /></mesh>
      <mesh position={[RIGHT,0,0]}><boxGeometry args={[0.04,CH-0.1,CD-0.1]} /><meshStandardMaterial {...M.chassis} /></mesh>
    </group>
  );
}

function Shroud() {
  return (
    <group>
      <mesh position={[0,BOT+1.1,0]}><boxGeometry args={[CW-0.15,0.04,CD-0.2]} /><meshStandardMaterial {...M.chassis} /></mesh>
      <mesh position={[0,BOT+0.55,FRONT-0.01]}><boxGeometry args={[CW-0.15,1.1,0.04]} /><meshStandardMaterial {...M.frame} /></mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// INTERACTIVE WRAPPER — adds hover/select to any group
// ═══════════════════════════════════════════════════════════
function Interactive({ id, onClick, onHover, children }) {
  return (
    <group
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(id); }}
      onPointerOut={() => onHover(null)}
    >
      {children}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// PSU
// ═══════════════════════════════════════════════════════════
function PSU({ hovered, selected, onSelect, onHover }) {
  const fanRef = useRef();
  useFrame((_, d) => { if (fanRef.current) fanRef.current.rotation.z += d * 3; });
  return (
    <Interactive id="psu" onClick={onSelect} onHover={onHover}>
      <group position={[0.7, BOT+0.5, REAR+0.6]}>
        <mesh><boxGeometry args={[1.5,0.75,1.3]} /><GlowMaterial base={M.chassis} hovered={hovered==='psu'} selected={selected==='psu'} /></mesh>
        <mesh position={[0,0.4,0]}><ringGeometry args={[0.25,0.3,48]} /><meshStandardMaterial {...M.fanFrame} /></mesh>
        {[0,1,2,3].map(i=><mesh key={`s${i}`} position={[0,0.395,0]} rotation={[0,0,Math.PI/4*i]}><boxGeometry args={[0.26,0.005,0.005]} /><meshStandardMaterial {...M.chassis} /></mesh>)}
        <group ref={fanRef} position={[0,0.4,-0.01]}>
          {[0,1,2,3,4,5,6].map(i=><mesh key={`b${i}`} rotation={[0,0,Math.PI*2/7*i]}><boxGeometry args={[0.012,0.18,0.004]} /><meshStandardMaterial {...M.fanBlade} /></mesh>)}
        </group>
        <mesh position={[0,0.4,0.01]}><cylinderGeometry args={[0.05,0.05,0.015,32]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
      </group>
    </Interactive>
  );
}

// ═══════════════════════════════════════════════════════════
// RGB FAN
// ═══════════════════════════════════════════════════════════
function CaseFan({ pos, rot, sz=0.5, rgb='violet' }) {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.z += d * 3.5; });
  return (
    <group position={pos} rotation={rot}>
      <mesh><ringGeometry args={[sz*0.42,sz*0.5,48]} /><meshStandardMaterial {...M.fanFrame} /></mesh>
      <mesh position={[0,0,0.006]}><ringGeometry args={[sz*0.36,sz*0.42,48]} /><meshStandardMaterial {...M[rgb]} /></mesh>
      <mesh position={[0,0,0.014]}><cylinderGeometry args={[sz*0.09,sz*0.09,0.02,32]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
      <group ref={ref}>{[0,1,2,3,4,5,6].map(i=><mesh key={i} rotation={[0,0,Math.PI*2/7*i]} position={[0,0,0.01]}><boxGeometry args={[0.013,sz*0.3,0.005]} /><meshStandardMaterial {...M.fanBlade} /></mesh>)}</group>
    </group>
  );
}

function FanGroup({ hovered, selected, onSelect, onHover }) {
  return (
    <Interactive id="fans" onClick={onSelect} onHover={onHover}>
      <CaseFan pos={[0,1.6,FRONT-0.06]} rot={[0,0,0]} rgb="violet" />
      <CaseFan pos={[0,0.45,FRONT-0.06]} rot={[0,0,0]} rgb="violet" />
      <CaseFan pos={[0,-0.7,FRONT-0.06]} rot={[0,0,0]} rgb="violet" />
      <CaseFan pos={[-1.4,TOP-0.1,0]} rot={[0,0,0]} sz={0.45} rgb="cyan" />
      <CaseFan pos={[1.4,TOP-0.1,0]} rot={[0,0,0]} sz={0.45} rgb="cyan" />
      <CaseFan pos={[0,1.5,REAR+0.08]} rot={[0,Math.PI,0]} sz={0.42} rgb="white" />
    </Interactive>
  );
}

// ═══════════════════════════════════════════════════════════
// AIO: Radiator + Tubes + Pump
// ═══════════════════════════════════════════════════════════
function Radiator({ hovered, selected, onSelect, onHover }) {
  return (
    <Interactive id="radiator" onClick={onSelect} onHover={onHover}>
      <group position={[0, TOP-0.2, 0]}>
        <mesh><boxGeometry args={[3.4,0.22,1.2]} /><GlowMaterial base={M.aluHeatsink} hovered={hovered==='radiator'} selected={selected==='radiator'} /></mesh>
        {[0,1,2,3,4,5,6,7,8,9,10].map(i=><mesh key={i} position={[0,0,-0.45+i*0.09]}><boxGeometry args={[3.3,0.2,0.012]} /><meshStandardMaterial {...M.chassis} /></mesh>)}
        <mesh position={[-1.75,0,0]}><boxGeometry args={[0.18,0.25,1.3]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
        <mesh position={[1.75,0,0]}><boxGeometry args={[0.18,0.25,1.3]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
      </group>
    </Interactive>
  );
}

function Tubes() {
  return (
    <group>
      <mesh position={[-0.35,1.2,-0.55]} rotation={[0.5,0.3,0]}><cylinderGeometry args={[0.05,0.05,2.3,20]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
      <mesh position={[0.15,1.1,-0.5]} rotation={[0.45,-0.2,0]}><cylinderGeometry args={[0.05,0.05,2.2,20]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
    </group>
  );
}

function Pump({ hovered, selected, onSelect, onHover }) {
  return (
    <Interactive id="cooler" onClick={onSelect} onHover={onHover}>
      <group position={[0.1,0.35,REAR+1.1]}>
        <mesh position={[0,0.04,0]}><boxGeometry args={[0.7,0.04,0.7]} /><GlowMaterial base={M.brushedAlu} hovered={hovered==='cooler'} selected={selected==='cooler'} /></mesh>
        <mesh position={[0,0.18,0]}><cylinderGeometry args={[0.28,0.3,0.24,48]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
        <mesh position={[0,0.32,0]}><cylinderGeometry args={[0.26,0.26,0.04,48]} /><meshStandardMaterial {...M.violet} /></mesh>
        <mesh position={[0,0.35,0]}><circleGeometry args={[0.1,32]} /><meshStandardMaterial {...M.white} /></mesh>
        <mesh position={[0.18,0.18,0.3]}><cylinderGeometry args={[0.05,0.05,0.08,20]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
        <mesh position={[-0.18,0.18,0.3]}><cylinderGeometry args={[0.05,0.05,0.08,20]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
      </group>
    </Interactive>
  );
}

// ═══════════════════════════════════════════════════════════
// MOTHERBOARD
// ═══════════════════════════════════════════════════════════
function Motherboard({ hovered, selected, onSelect, onHover }) {
  const mw=3.0, mh=3.4, mt=0.04;
  return (
    <Interactive id="motherboard" onClick={onSelect} onHover={onHover}>
      <group position={[RIGHT-0.05,0.4,REAR+1.8]}>
        <mesh><boxGeometry args={[mw,mt,mh]} /><GlowMaterial base={M.pcbGreen} hovered={hovered==='motherboard'} selected={selected==='motherboard'} /></mesh>
        {[0,1,2,3,4,5,6].map(i=><mesh key={`t${i}`} position={[0,mt/2+0.002,-1.1+i*0.38]}><boxGeometry args={[mw*0.6,0.003,0.016]} /><meshStandardMaterial color="#3a6e44" roughness={0.3} /></mesh>)}
        <mesh position={[-0.25,mt/2+0.06,-1.55]}><boxGeometry args={[1.3,0.08,0.3]} /><meshStandardMaterial {...M.aluHeatsink} /></mesh>
        <mesh position={[0.85,mt/2+0.06,-1.55]}><boxGeometry args={[0.7,0.08,0.3]} /><meshStandardMaterial {...M.aluHeatsink} /></mesh>
        {[-0.55,-0.25,0.05,0.35,0.65].map((x,i)=><mesh key={`vf${i}`} position={[x,mt/2+0.1,-1.55]}><boxGeometry args={[0.05,0.05,0.3]} /><meshStandardMaterial {...M.aluHeatsink} /></mesh>)}
        <mesh position={[-0.35,mt/2+0.04,1.25]}><boxGeometry args={[0.6,0.06,0.6]} /><meshStandardMaterial {...M.aluHeatsink} /></mesh>
        <mesh position={[-0.35,mt/2+0.07,1.25]}><boxGeometry args={[0.5,0.01,0.5]} /><meshStandardMaterial {...M.cyan} /></mesh>
        <mesh position={[-1.0,mt/2+0.03,0.2]}><boxGeometry args={[0.035,0.04,1.8]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
        <mesh position={[-1.0,mt/2+0.05,1.0]}><boxGeometry args={[0.025,0.03,0.08]} /><meshStandardMaterial {...M.blackPlastic} /></mesh>
        {[0,1,2,3].map((_,i)=><mesh key={`ds${i}`} position={[0.95,mt/2+0.03,-1.0+i*0.5]}><boxGeometry args={[0.04,0.04,0.85]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>)}
        <mesh position={[0.2,mt/2+0.01,1.05]}><boxGeometry args={[0.16,0.008,1.3]} /><meshStandardMaterial {...M.pcbDark} /></mesh>
        <mesh position={[0.2,mt/2+0.015,0.45]}><boxGeometry args={[0.12,0.008,0.12]} /><meshStandardMaterial {...M.blackPlastic} /></mesh>
        <mesh position={[0.2,mt/2+0.008,0.4]}><boxGeometry args={[0.14,0.002,0.025]} /><meshStandardMaterial {...M.goldPin} /></mesh>
        <mesh position={[0,0.4,-mh/2-0.02]}><boxGeometry args={[1.0,0.4,0.03]} /><meshStandardMaterial {...M.brushedAlu} /></mesh>
        {[0,1,2,3,4,5].map(i=><mesh key={`cap${i}`} position={[-0.9+i*0.4,mt/2+0.03,0]}><cylinderGeometry args={[0.035,0.035,0.05,16]} /><meshStandardMaterial {...M.blackPlastic} /></mesh>)}
      </group>
    </Interactive>
  );
}

// ═══════════════════════════════════════════════════════════
// RAM
// ═══════════════════════════════════════════════════════════
function RAMStick({ z }) {
  return (
    <group position={[0,0,z]}>
      <mesh position={[0,0.5,0]}><boxGeometry args={[0.06,1.0,0.012]} /><meshStandardMaterial {...M.pcbDark} /></mesh>
      {[0,1,2,3,4,5,6,7].map(i=><mesh key={`c${i}`} position={[0,0.08+i*0.1,0.01]}><boxGeometry args={[0.05,0.06,0.006]} /><meshStandardMaterial {...M.blackPlastic} /></mesh>)}
      {[0,1,2,3].map(i=><mesh key={`g${i}`} position={[0,-0.25+i*0.008,0.01]}><boxGeometry args={[0.05,0.005,0.003]} /><meshStandardMaterial {...M.goldPin} /></mesh>)}
      <mesh position={[0,0.35,0.012]}><boxGeometry args={[0.07,0.45,0.007]} /><meshStandardMaterial {...M.brushedAlu} /></mesh>
      <mesh position={[0,0.52,0.012]}><boxGeometry args={[0.07,0.035,0.004]} /><meshStandardMaterial {...M.violet} /></mesh>
    </group>
  );
}

function RAM({ hovered, selected, onSelect, onHover }) {
  return (
    <Interactive id="ram" onClick={onSelect} onHover={onHover}>
      <group position={[RIGHT-0.08,0.5,REAR+0.7]}>
        <RAMStick z={0} />
        <RAMStick z={0.5} />
      </group>
    </Interactive>
  );
}

// ═══════════════════════════════════════════════════════════
// GPU
// ═══════════════════════════════════════════════════════════
function GPU({ hovered, selected, onSelect, onHover }) {
  return (
    <Interactive id="gpu" onClick={onSelect} onHover={onHover}>
      <group position={[-1.15,0.18,REAR+2.1]} rotation={[0,0,Math.PI/2]}>
        <mesh position={[0,0.07,0]}><boxGeometry args={[0.55,0.025,2.2]} /><GlowMaterial base={M.aluHeatsink} hovered={hovered==='gpu'} selected={selected==='gpu'} /></mesh>
        <mesh><boxGeometry args={[0.55,0.12,2.2]} /><meshStandardMaterial {...M.pcbDark} /></mesh>
        <mesh position={[0,-0.1,0]}><boxGeometry args={[0.57,0.05,2.0]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
        <mesh position={[0,-0.11,0]}><boxGeometry args={[0.53,0.02,1.9]} /><meshStandardMaterial {...M.chassis} /></mesh>
        {[-0.65,0,0.65].map((z,i)=><group key={`f${i}`} position={[0,-0.16,z]}>
          <mesh><ringGeometry args={[0.17,0.22,48]} /><meshStandardMaterial {...M.fanFrame} /></mesh>
          <mesh position={[0,0,0.003]}><ringGeometry args={[0.14,0.17,48]} /><meshStandardMaterial {...M.cyan} /></mesh>
          {[0,1,2,3,4].map(j=><mesh key={`b${j}`} rotation={[0,0,Math.PI*2/5*j]} position={[0,0,0.004]}><boxGeometry args={[0.01,0.13,0.004]} /><meshStandardMaterial {...M.fanBlade} /></mesh>)}
          <mesh position={[0,0,0.01]}><cylinderGeometry args={[0.06,0.06,0.006,32]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
        </group>)}
        <mesh position={[-0.025,0,0]}><boxGeometry args={[0.03,0.12,1.5]} /><meshStandardMaterial {...M.goldPin} /></mesh>
        <mesh position={[-0.28,0,1.1]}><boxGeometry args={[0.05,0.09,0.05]} /><meshStandardMaterial {...M.brushedAlu} /></mesh>
        <mesh position={[-0.28,0,1.0]}><boxGeometry args={[0.03,0.06,0.035]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
        <mesh position={[0,-0.15,0.45]}><boxGeometry args={[0.48,0.004,0.01]} /><meshStandardMaterial {...M.violet} /></mesh>
      </group>
    </Interactive>
  );
}

// ═══════════════════════════════════════════════════════════
// STORAGE + CABLES
// ═══════════════════════════════════════════════════════════
function Storage({ hovered, selected, onSelect, onHover }) {
  return (
    <Interactive id="storage" onClick={onSelect} onHover={onHover}>
      <group position={[RIGHT-0.05,0.2,FRONT-0.4]}>
        <mesh rotation={[0,Math.PI/2,0]}><boxGeometry args={[0.025,0.9,0.65]} /><GlowMaterial base={M.chassis} hovered={hovered==='storage'} selected={selected==='storage'} /></mesh>
        <mesh position={[0.02,0.1,0]} rotation={[0,Math.PI/2,0]}><boxGeometry args={[0.004,0.55,0.38]} /><meshStandardMaterial {...M.blackPlastic} /></mesh>
      </group>
    </Interactive>
  );
}

function Cables() {
  return (
    <group>
      <mesh position={[0.4,-0.2,-0.5]} rotation={[0.6,0.3,0]}><cylinderGeometry args={[0.05,0.05,1.4,16]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
      <mesh position={[-1.0,-0.05,-0.3]} rotation={[1.0,0.15,0]}><cylinderGeometry args={[0.035,0.035,1.0,14]} /><meshStandardMaterial {...M.darkPlastic} /></mesh>
      <mesh position={[0.9,0.15,FRONT-0.2]} rotation={[0.5,-0.4,0]}><cylinderGeometry args={[0.025,0.025,0.9,12]} /><meshStandardMaterial {...M.blackPlastic} /></mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// GLASS PANEL — hinge animation
// ═══════════════════════════════════════════════════════════
function GlassPanel({ open, onToggle }) {
  const hingeRef = useRef();
  const targetAngle = open ? -Math.PI / 3.5 : 0;
  useFrame((_, delta) => {
    if (hingeRef.current) hingeRef.current.rotation.y += (targetAngle - hingeRef.current.rotation.y) * Math.min(delta * 3, 1);
  });
  return (
    <group position={[LEFT,0,FRONT]} onClick={(e)=>{e.stopPropagation();onToggle();}}>
      <group ref={hingeRef}>
        <mesh position={[0,0,-CD/2-FRONT]}>
          <boxGeometry args={[0.012,CH-0.3,CD-0.15]} />
          <meshPhysicalMaterial color="#ddeeff" roughness={0.02} metalness={0.02} transparent opacity={open?0.06:0.13} envMapIntensity={0.7} />
        </mesh>
        {[[0,TOP-0.06,0,0.03,0.1,CD-0.05],[0,BOT+0.06,0,0.03,0.1,CD-0.05],[0,0,0,0.03,CH-0.5,0.08],[0,0,REAR+0.08,0.03,CH-0.5,0.08]].map(([px,py,pz,sx,sy,sz],i)=><mesh key={`fe${i}`} position={[px,py,pz]}><boxGeometry args={[sx,sy,sz]} /><meshStandardMaterial {...M.glassFrame} /></mesh>)}
        {[TOP-0.4,BOT+0.4].map((y,i)=><mesh key={`ts${i}`} position={[0.015,y,REAR+0.15]}><cylinderGeometry args={[0.035,0.035,0.025,24]} /><meshStandardMaterial {...M.brushedAlu} /></mesh>)}
        {!open&&<mesh position={[-0.008,0.5,-0.6]} rotation={[0.2,0,0.1]}><planeGeometry args={[CH-0.8,CD-0.6]} /><meshBasicMaterial color="#fff" transparent opacity={0.025} side={2} /></mesh>}
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// LIGHTING
// ═══════════════════════════════════════════════════════════
function Lights() {
  return (<>
    <ambientLight intensity={0.22} />
    <directionalLight position={[6,5,8]} intensity={1.3} castShadow shadow-mapSize={1024} />
    <directionalLight position={[-3,3,-5]} intensity={0.4} />
    <directionalLight position={[0,-1,6]} intensity={0.35} />
    <spotLight position={[0,5,0]} intensity={0.25} color="#7c3aed" angle={0.3} penumbra={1} />
    <pointLight position={[0,1,5]} intensity={0.25} color="#cbd5e1" />
  </>);
}

// ═══════════════════════════════════════════════════════════
// INFO PANEL — dark glass UI
// ═══════════════════════════════════════════════════════════
function InfoPanel({ selected, onClose, onToggleConnections, showConnections }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (selected) setTimeout(() => setVisible(true), 50);
    else setVisible(false);
  }, [selected]);

  if (!selected) return null;
  const d = componentData[selected];
  if (!d) return null;

  return (
    <div className={`info-panel ${visible ? 'visible' : ''}`}>
      <div className="info-panel-inner">
        <div className="info-panel-header">
          <span className="info-dot" style={{background:d.accent,boxShadow:`0 0 10px ${d.accent}`}} />
          <h3>{d.name}</h3>
          <button className="info-close" onClick={onClose}>&times;</button>
        </div>
        <p className="info-desc">{d.description}</p>
        <div className="info-section">
          <h4>Specifications</h4>
          <ul className="info-specs">{d.specs.map((s,i)=><li key={i}>{s}</li>)}</ul>
        </div>
        <div className="info-tip"><strong>Pro Tip:</strong> {d.tips}</div>
        <div className="info-actions">
          <button
            className={`btn-connection ${showConnections ? 'active' : ''}`}
            onClick={onToggleConnections}
          >
            {showConnections ? 'Hide Connections' : 'Show Connections'}
          </button>
          <button className="btn-connection secondary" onClick={onClose}>
            Back to PC
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════
function Scene({ onSelect, hovered, selected, panelOpen, onToggle, showConnections }) {
  const h = (id) => onSelect(id, 'hover');
  const s = (id) => onSelect(id, 'select');

  return (<>
    <Lights />
    <Chassis />
    <Shroud />
    <Motherboard hovered={hovered} selected={selected} onSelect={s} onHover={h} />
    <Pump hovered={hovered} selected={selected} onSelect={s} onHover={h} />
    <Tubes />
    <Radiator hovered={hovered} selected={selected} onSelect={s} onHover={h} />
    <RAM hovered={hovered} selected={selected} onSelect={s} onHover={h} />
    <GPU hovered={hovered} selected={selected} onSelect={s} onHover={h} />
    <PSU hovered={hovered} selected={selected} onSelect={s} onHover={h} />
    <Storage hovered={hovered} selected={selected} onSelect={s} onHover={h} />
    <FanGroup hovered={hovered} selected={selected} onSelect={s} onHover={h} />
    <Cables />
    <GlassPanel open={panelOpen} onToggle={onToggle} />
    <ConnectionLines component={selected} show={showConnections && !!selected} />
    <mesh position={[0,BOT-0.4,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
      <planeGeometry args={[10,10]} /><meshStandardMaterial color="#0a0d12" roughness={0.4} metalness={0.3} />
    </mesh>
    <ContactShadows position={[0,BOT-0.35,0]} opacity={0.5} scale={9} blur={1.5} />
    <Environment preset="studio" />
  </>);
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function PCScene() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  const focusTarget = selected ? componentFocus[selected] : null;

  const handleSelect = (id, mode) => {
    if (mode === 'hover') {
      setHovered(id);
    } else {
      if (selected === id) {
        setSelected(null);
        setShowConnections(false);
      } else {
        setSelected(id);
        setShowConnections(false);
      }
    }
  };

  // Reset connections when selection changes
  useEffect(() => { setShowConnections(false); }, [selected]);

  return (
    <div className="explorer-scene" style={{cursor:hovered?'pointer':'grab'}}>
      <div className="explorer-controls">
        <button className="panel-toggle" onClick={() => setPanelOpen(o => !o)}>
          {panelOpen ? 'Close Case' : 'Open Case'}
        </button>
        {selected && (
          <button className="panel-toggle secondary" onClick={() => { setSelected(null); setShowConnections(false); }}>
            Back to PC
          </button>
        )}
      </div>

      {!panelOpen && !selected && (
        <div className="panel-hint">Click "Open Case" or the glass panel to reveal the interior</div>
      )}

      <InfoPanel
        selected={selected}
        onClose={() => { setSelected(null); setShowConnections(false); }}
        onToggleConnections={() => setShowConnections(v => !v)}
        showConnections={showConnections}
      />

      <Canvas
        camera={{ position: [5.5, 1.5, 5.5], fov: 35 }}
        gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.0 }}
        shadows
      >
        <Suspense fallback={null}>
          <Scene
            onSelect={handleSelect}
            hovered={hovered}
            selected={selected}
            panelOpen={panelOpen}
            onToggle={() => setPanelOpen(o => !o)}
            showConnections={showConnections}
          />
          <CameraFocus focusTarget={focusTarget} />
        </Suspense>
      </Canvas>
    </div>
  );
}
