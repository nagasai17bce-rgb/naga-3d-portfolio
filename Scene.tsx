import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const CYAN = '#72f6ff'
const VIOLET = '#9d7cff'
const WHITE = '#f5f7ff'

const WAYPOINTS = [
  { x: 0.35, y: 0.05, z: 7.4, lx: 0.35, ly: 0.05 },
  { x: -1.25, y: 0.35, z: 8.2, lx: -0.25, ly: 0.2 },
  { x: 1.15, y: -0.1, z: 8.7, lx: 0.45, ly: -0.05 },
  { x: -0.4, y: -0.35, z: 8.4, lx: -0.1, ly: -0.2 },
  { x: 0.25, y: 0.1, z: 7.8, lx: 0.15, ly: 0.05 },
]

function progress() {
  if (typeof window === 'undefined') return 0
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
  return THREE.MathUtils.clamp(window.scrollY / max, 0, 1)
}

function CameraRig() {
  const { camera } = useThree()

  useFrame((state) => {
    const p = progress()
    const scaled = p * (WAYPOINTS.length - 1)
    const index = Math.min(Math.floor(scaled), WAYPOINTS.length - 2)
    const t = scaled - index
    const a = WAYPOINTS[index]
    const b = WAYPOINTS[index + 1]

    const x = THREE.MathUtils.lerp(a.x, b.x, t)
    const y = THREE.MathUtils.lerp(a.y, b.y, t)
    const z = THREE.MathUtils.lerp(a.z, b.z, t)
    const lx = THREE.MathUtils.lerp(a.lx, b.lx, t)
    const ly = THREE.MathUtils.lerp(a.ly, b.ly, t)

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x + state.pointer.x * 0.18, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y + state.pointer.y * 0.12, 0.06)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, 0.06)
    camera.lookAt(lx + state.pointer.x * 0.04, ly + state.pointer.y * 0.03, 0)
  })

  return null
}

function Avatar() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    const p = progress()
    group.current.position.x = THREE.MathUtils.lerp(2.8, -1.7, p) + state.pointer.x * 0.08
    group.current.position.y = THREE.MathUtils.lerp(0.45, -0.35, p) + state.pointer.y * 0.05
    group.current.rotation.y = THREE.MathUtils.lerp(-0.18, 0.2, p) + state.pointer.x * 0.04
  })

  return (
    <group ref={group} position={[2.8, 0.45, -0.2]}>
      {/* head */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.72, 32, 24]} />
        <meshStandardMaterial color="#d79a78" roughness={0.58} metalness={0.05} />
      </mesh>

      {/* hair */}
      <mesh position={[0, 1.62, -0.02]} scale={[1.02, 0.62, 1.02]}>
        <sphereGeometry args={[0.72, 32, 20]} />
        <meshStandardMaterial color="#17131a" roughness={0.82} />
      </mesh>

      {/* eyes */}
      {[-0.25, 0.25].map((x) => (
        <group key={x} position={[x, 1.32, 0.66]}>
          <mesh>
            <sphereGeometry args={[0.095, 16, 16]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
          <mesh position={[0, 0, 0.075]}>
            <sphereGeometry args={[0.043, 12, 12]} />
            <meshBasicMaterial color="#111522" />
          </mesh>
        </group>
      ))}

      {/* nose */}
      <mesh position={[0, 1.17, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.09, 0.25, 16]} />
        <meshStandardMaterial color="#c98468" roughness={0.7} />
      </mesh>

      {/* neck */}
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.55, 20]} />
        <meshStandardMaterial color="#d79a78" roughness={0.62} />
      </mesh>

      {/* torso / jacket */}
      <mesh position={[0, -0.15, 0]} scale={[1.15, 1.25, 0.62]} castShadow>
        <sphereGeometry args={[0.95, 32, 20]} />
        <meshStandardMaterial color="#111827" metalness={0.35} roughness={0.42} />
      </mesh>

      {/* shirt */}
      <mesh position={[0, 0.05, 0.61]} scale={[0.36, 0.55, 0.08]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.45} />
      </mesh>

      {/* shoulders */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.02, -0.12, 0]} rotation={[0, 0, side * 0.16]}>
          <capsuleGeometry args={[0.25, 1.15, 8, 16]} />
          <meshStandardMaterial color="#182235" metalness={0.3} roughness={0.45} />
        </mesh>
      ))}

      {/* holographic frame */}
      <mesh position={[0, 0.4, -0.2]} scale={[1.55, 2.35, 0.04]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.045} wireframe />
      </mesh>
    </group>
  )
}

function NeuralCore() {
  const root = useRef<THREE.Group>(null)
  const nodes = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2
      const radius = 1.8 + (i % 4) * 0.22
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.7) * 1.25,
        Math.sin(angle) * radius * 0.55,
      )
    })
  }, [])

  useFrame((_, delta) => {
    if (!root.current) return
    root.current.rotation.y += delta * 0.16
    root.current.rotation.z += delta * 0.04
  })

  return (
    <group ref={root} position={[-1.7, 0, 0]}>
      <mesh>
        <icosahedronGeometry args={[1.05, 3]} />
        <meshStandardMaterial color="#101827" emissive="#482d91" emissiveIntensity={1.8} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh scale={[1.07, 1.07, 1.07]}>
        <icosahedronGeometry args={[1.05, 3]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.17} />
      </mesh>

      {nodes.map((point, i) => (
        <group key={i} position={[point.x, point.y, point.z]}>
          <mesh>
            <sphereGeometry args={[i % 4 === 0 ? 0.075 : 0.035, 12, 12]} />
            <meshBasicMaterial color={i % 3 === 0 ? CYAN : VIOLET} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Orbit() {
  const labels = ['LLM', 'RAG', 'MCP', 'VOICE AI', 'TOOLS', 'EMBEDDINGS']
  return (
    <group position={[-1.7, 0, 0]}>
      {[1.8, 2.25, 2.7].map((radius, i) => (
        <mesh key={radius} rotation={[Math.PI / 2 + i * 0.2, i * 0.4, 0]}>
          <torusGeometry args={[radius, 0.008, 10, 100]} />
          <meshBasicMaterial color={i % 2 ? VIOLET : CYAN} transparent opacity={0.2} />
        </mesh>
      ))}
      {labels.map((_, i) => {
        const angle = (i / labels.length) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 3.15, Math.sin(angle) * 1.65, Math.sin(angle) * 0.8]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color={i % 2 ? VIOLET : CYAN} />
          </mesh>
        )
      })}
    </group>
  )
}

function Environment() {
  return (
    <>
      <ambientLight intensity={0.32} />
      <pointLight position={[4, 5, 5]} intensity={18} color={CYAN} />
      <pointLight position={[-4, -2, 4]} intensity={14} color={VIOLET} />
      <pointLight position={[0, 1, -4]} intensity={8} color="#ffffff" />
      <fog attach="fog" args={['#050611', 8, 22]} />
      <mesh scale={[80, 80, 80]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#050611" side={THREE.BackSide} />
      </mesh>
    </>
  )
}

export default function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={1.5}
        camera={{ position: [0.35, 0.05, 7.4], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Environment />
        <CameraRig />
        <NeuralCore />
        <Orbit />
        <Avatar />
      </Canvas>
    </div>
  )
}
