import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Text, Line, Image as DreiImage } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const CYAN = '#72f6ff';
const VIOLET = '#9d7cff';
const WHITE = '#f5f7ff';

const waypoints = [
  { x: 0.35, y: 0.05, z: 7.4, lookX: 0.35, lookY: 0.05 },
  { x: -1.35, y: 0.35, z: 8.3, lookX: -0.35, lookY: 0.2 },
  { x: 1.15, y: -0.15, z: 8.8, lookX: 0.45, lookY: -0.05 },
  { x: 0.05, y: -0.45, z: 9.2, lookX: 0.1, lookY: -0.25 },
];

function scrollProgress() {
  return THREE.MathUtils.clamp(window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1), 0, 1);
}

function cameraAt(progress: number) {
  const scaled = progress * (waypoints.length - 1);
  const i = Math.min(Math.floor(scaled), waypoints.length - 2);
  const t = scaled - i;
  const a = waypoints[i];
  const b = waypoints[Math.min(i + 1, waypoints.length - 1)];
  return {
    x: THREE.MathUtils.lerp(a.x, b.x, t),
    y: THREE.MathUtils.lerp(a.y, b.y, t),
    z: THREE.MathUtils.lerp(a.z, b.z, t),
    lookX: THREE.MathUtils.lerp(a.lookX, b.lookX, t),
    lookY: THREE.MathUtils.lerp(a.lookY, b.lookY, t),
  };
}

function NeuralCore() {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const nodes = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const r = 2.1 + (i % 4) * 0.25;
    return new THREE.Vector3(Math.cos(a) * r, Math.sin(a * 1.9) * (1.15 + (i % 3) * .16), Math.sin(a) * (1.6 + (i % 2) * .3));
  }), []);
  const labels = ['LLM', 'RAG', 'MCP', 'VOICE', 'TOOLS', 'EMBED'];

  useFrame((state) => {
    if (!root.current || !core.current) return;
    const p = scrollProgress();
    const c = cameraAt(p);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, c.x + state.pointer.x * .22, .055);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, c.y + state.pointer.y * .14, .055);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, c.z, .055);
    camera.lookAt(c.lookX + state.pointer.x * .05, c.lookY + state.pointer.y * .04, 0);
    root.current.rotation.y += .0022;
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, state.pointer.y * .08 + p * .22, .03);
    core.current.rotation.y -= .006;
    core.current.rotation.z += .003;
  });

  return (
    <group ref={root} position={[1.15, .05, 0]}>
      <Float speed={1.05} rotationIntensity={.15} floatIntensity={.3}>
        <group ref={core}>
          <mesh>
            <icosahedronGeometry args={[1.22, 3]} />
            <meshStandardMaterial color="#101827" emissive="#4b2f96" emissiveIntensity={1.7} roughness={.2} metalness={.85} />
          </mesh>
          <mesh scale={1.06}>
            <icosahedronGeometry args={[1.22, 3]} />
            <meshBasicMaterial color={CYAN} wireframe transparent opacity={.16} />
          </mesh>
          <mesh scale={.48}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color={CYAN} transparent opacity={.18} />
          </mesh>
        </group>
      </Float>
      {[1.8, 2.25, 2.7, 3.1].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2 + i * .19, i * .43, i * .12]}>
          <torusGeometry args={[r, .008 + i * .003, 12, 140]} />
          <meshBasicMaterial color={i % 2 ? VIOLET : CYAN} transparent opacity={.2 - i * .025} />
        </mesh>
      ))}
      {nodes.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[i % 3 === 0 ? .07 : .035, 12, 12]} />
            <meshBasicMaterial color={i % 3 === 0 ? CYAN : WHITE} />
          </mesh>
          {i % 3 === 0 && <Text position={[.11, .08, 0]} fontSize={.085} color="#9aa4b8" anchorX="left">{labels[(i / 3) % labels.length]}</Text>}
        </group>
      ))}
      {nodes.filter((_, i) => i % 2 === 0).map((p, i) => (
        <Line key={i} points={[[0, 0, 0], [p.x, p.y, p.z]]} color={i % 2 ? VIOLET : CYAN} transparent opacity={.12} lineWidth={.7} />
      ))}
      <Text position={[0, -2.35, 0]} fontSize={.18} color="#7d8495" anchorX="center" letterSpacing={.12}>AI · SYSTEMS · VOICE</Text>
    </group>
  );
}

function Avatar3D() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const p = scrollProgress();
    group.current.position.x = THREE.MathUtils.lerp(3.0, -1.7, p) + state.pointer.x * .1;
    group.current.position.y = THREE.MathUtils.lerp(.55, -.35, p) + state.pointer.y * .06;
    group.current.rotation.y = THREE.MathUtils.lerp(-.16, .22, p) + state.pointer.x * .05;
    group.current.rotation.x = state.pointer.y * .025;
  });
  return (
    <group ref={group} position={[3, .55, -.35]}>
      <Float speed={1.25} rotationIntensity={.1} floatIntensity={.2}>
        {[.08, .03, 0].map((z, i) => (
          <group key={i} position={new THREE.Vector3(i * .025, i * .018, z)}>
            <DreiImage url="/naga-portrait.png" transparent opacity={i === 2 ? .96 : .12} scale={2.5} />
          </group>
        ))}
        <mesh position={[0, 0, -.05]}>
          <planeGeometry args={[2.5, 3.18]} />
          <meshBasicMaterial color={CYAN} transparent opacity={.045} side={THREE.DoubleSide} />
        </mesh>
        {[-1.2, -.4, .4, 1.2].map((y) => (
          <mesh key={y} position={[0, y, .06]}>
            <boxGeometry args={[2.25, .008, .008]} />
            <meshBasicMaterial color={CYAN} transparent opacity={.18} />
          </mesh>
        ))}
        <Text position={[0, -1.62, .08]} fontSize={.105} color={CYAN} anchorX="center">NAGA SAI / AI ENGINEER</Text>
      </Float>
    </group>
  );
}

function OrbitLabels() {
  const items = ['SALESFORCE', 'WALMART', 'TEKION', 'RAG', 'MCP', 'VOICE AI'];
  return <>{items.map((label, i) => {
    const a = (i / items.length) * Math.PI * 2;
    return <Text key={label} position={[Math.cos(a) * 4.2, Math.sin(a * 1.2) * 2.2, -1.2 + Math.sin(a) * 1.1]} fontSize={.085} color="#657086" anchorX="center" rotation={[0, 0, -.05]}>{label}</Text>;
  })}</>;
}

function Environment() {
  return <>
    <ambientLight intensity={.28} />
    <pointLight position={[4, 5, 5]} intensity={17} color={CYAN} />
    <pointLight position={[-4, -2, 4]} intensity={13} color={VIOLET} />
    <pointLight position={[0, 0, -4]} intensity={8} color="#ffffff" />
    <Stars radius={85} depth={48} count={2600} factor={2.1} saturation={0} fade speed={.4} />
    <fog attach="fog" args={['#050611', 8, 22]} />
  </>;
}

export default function Scene() {
  return <div className="scene" aria-hidden="true">
    <Canvas dpr={[1, 1.6]} camera={{ position: [0.35, 0.05, 7.4], fov: 35 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}>
      <Environment />
      <NeuralCore />
      <Avatar3D />
      <OrbitLabels />
    </Canvas>
  </div>;
}
