import * as THREE from 'https://unpkg.com/three@0.169.0/build/three.module.js'

const sceneHost = document.getElementById('scene')
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x0a0e16, 0.035)

const camera = new THREE.PerspectiveCamera(31, innerWidth / innerHeight, 0.1, 100)
camera.position.set(0, 1.4, 12.5)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8))
renderer.setSize(innerWidth, innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15
sceneHost.appendChild(renderer.domElement)

const root = new THREE.Group()
root.position.set(-1.15, -0.15, 0)
scene.add(root)

const hemi = new THREE.HemisphereLight(0xddeaff, 0x141820, 1.7)
scene.add(hemi)
const key = new THREE.DirectionalLight(0xffd8c2, 3.3)
key.position.set(5, 6, 6)
scene.add(key)
const fill = new THREE.DirectionalLight(0x93c5ff, 2.4)
fill.position.set(-5, 3, -4)
scene.add(fill)

const avatar = new THREE.Group()
root.add(avatar)

const skin = new THREE.MeshStandardMaterial({ color: 0xb59a84, roughness: 0.68, metalness: 0.05 })
const dark = new THREE.MeshStandardMaterial({ color: 0x11151d, roughness: 0.5, metalness: 0.22 })
const suit = new THREE.MeshStandardMaterial({ color: 0x1f2733, roughness: 0.58, metalness: 0.08 })
const glow = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.8 })

function mesh(g, m, p, s = 1, parent = avatar) {
  const o = new THREE.Mesh(g, m)
  o.position.set(...p)
  if (Array.isArray(s)) o.scale.set(...s)
  else o.scale.setScalar(s)
  parent.add(o)
  return o
}

mesh(new THREE.SphereGeometry(1.15, 48, 32), skin, [0, 1.8, 0], 1.0)
mesh(new THREE.SphereGeometry(1.2, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), dark, [0, 2.18, -0.02], [1.02, 0.72, 1.04])
mesh(new THREE.BoxGeometry(0.38, 0.56, 0.34), skin, [0, 0.78, 0])
mesh(new THREE.BoxGeometry(2.25, 2.5, 0.95), suit, [0, -0.45, 0], [1, 1, 0.92])
mesh(new THREE.SphereGeometry(0.33, 28, 20), skin, [-1.34, -0.35, 0])
mesh(new THREE.SphereGeometry(0.33, 28, 20), skin, [1.34, -0.35, 0])
mesh(new THREE.CapsuleGeometry(0.22, 1.25, 8, 18), suit, [-1.32, -0.9, 0.02], [1, 1, 1])
mesh(new THREE.CapsuleGeometry(0.22, 1.25, 8, 18), suit, [1.32, -0.9, 0.02], [1, 1, 1])
mesh(new THREE.SphereGeometry(0.13, 20, 12), glow, [-0.39, 1.95, 1.03], 1)
mesh(new THREE.SphereGeometry(0.13, 20, 12), glow, [0.39, 1.95, 1.03], 1)

const chest = mesh(new THREE.BoxGeometry(1.2, 0.55, 0.08), glow, [0, -0.32, 0.51], [1, 0.72, 1])
const chestFrame = new THREE.EdgesGeometry(chest.geometry)
chest.add(new THREE.LineSegments(chestFrame, new THREE.LineBasicMaterial({ color: 0x9de7ff, transparent: true, opacity: 0.65 })))

const halo = new THREE.Group()
root.add(halo)
for (let i = 0; i < 4; i++) {
  const tor = new THREE.Mesh(
    new THREE.TorusGeometry(1.75 + i * 0.22, 0.015 + i * 0.005, 16, 120),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0x6ee7f9 : 0xf8cfa3, transparent: true, opacity: 0.45 - i * 0.07 })
  )
  tor.rotation.set(Math.PI * 0.32 + i * 0.4, i * 0.55, i * 0.25)
  halo.add(tor)
}

const nodes = new THREE.Group()
root.add(nodes)
for (let i = 0; i < 26; i++) {
  const a = (i / 26) * Math.PI * 2
  const r = 3.0 + 0.35 * Math.sin(i * 2.3)
  const y = 0.2 + 1.1 * Math.sin(i * 1.7)
  const n = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 4) * 0.006, 12, 12), new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xffd9b3 : 0x7dd3fc, transparent: true, opacity: 0.72 }))
  n.position.set(Math.cos(a) * r, y, Math.sin(a) * r * 0.6)
  nodes.add(n)
}

const grid = new THREE.GridHelper(28, 28, 0x294057, 0x162131)
grid.position.set(0, -1.7, -1)
grid.material.transparent = true
grid.material.opacity = 0.35
scene.add(grid)

const particles = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({ color: 0x8bd3ff, size: 0.028, transparent: true, opacity: 0.55 })
)
const pts = []
for (let i = 0; i < 220; i++) {
  const radius = 9 + Math.random() * 12
  const theta = Math.random() * Math.PI * 2
  pts.push(Math.cos(theta) * radius, (Math.random() - 0.5) * 12, Math.sin(theta) * radius)
}
particles.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
scene.add(particles)

let scrollTarget = 0
let scrollSmooth = 0
let mouseX = 0
let mouseY = 0
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight
  scrollTarget = max > 0 ? scrollY / max : 0
}, { passive: true })
addEventListener('pointermove', (e) => {
  mouseX = e.clientX / innerWidth * 2 - 1
  mouseY = -(e.clientY / innerHeight * 2 - 1)
}, { passive: true })

const works = document.getElementById('works')
const worksTrack = document.getElementById('worksTrack')
const worksCount = document.getElementById('worksCount')

function animate() {
  requestAnimationFrame(animate)
  scrollSmooth += (scrollTarget - scrollSmooth) * 0.075

  const intro = Math.min(scrollSmooth / 0.17, 1)
  const resumeProgress = THREE.MathUtils.clamp((scrollSmooth - 0.13) / 0.46, 0, 1)
  const worksProgress = THREE.MathUtils.clamp((scrollSmooth - 0.53) / 0.27, 0, 1)

  const targetZ = 12.5 - resumeProgress * 2.8 - worksProgress * 2.0
  const targetY = 1.4 - resumeProgress * 0.9 - worksProgress * 0.4
  const targetX = -1.15 + resumeProgress * 1.0 + worksProgress * 0.3
  camera.position.x += (targetX + mouseX * 0.33 - camera.position.x) * 0.055
  camera.position.y += (targetY + mouseY * 0.18 - camera.position.y) * 0.055
  camera.position.z += (targetZ - camera.position.z) * 0.055
  camera.lookAt(0, 0.6, 0)

  avatar.rotation.y += (mouseX * 0.13 - avatar.rotation.y) * 0.04
  avatar.rotation.x += (-mouseY * 0.05 - avatar.rotation.x) * 0.04
  root.position.y = -0.15 + Math.sin(performance.now() * 0.0006) * 0.045
  halo.rotation.y += 0.0017
  halo.rotation.x = Math.sin(performance.now() * 0.0004) * 0.12
  nodes.rotation.y -= 0.0011
  particles.rotation.y += 0.00025
  grid.position.z = -1 - scrollSmooth * 2.4

  const x = worksProgress * (worksTrack.scrollWidth - innerWidth + 1)
  worksTrack.style.transform = `translate3d(${-x}px,0,0)`
  const cardIndex = Math.min(3, Math.floor(worksProgress * 4))
  worksCount.textContent = `0${cardIndex + 1} / 04`
  works.classList.toggle('active', worksProgress > 0.02)

  renderer.render(scene, camera)
}
animate()

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})
