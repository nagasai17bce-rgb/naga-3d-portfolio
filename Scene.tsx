import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Waypoint = {
  position: THREE.Vector3;
  target: THREE.Vector3;
};

const CYAN = 0x72f6ff;
const VIOLET = 0x9d7cff;
const WHITE = 0xf5f7ff;
const BG = 0x050611;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

function makeMaterial(color: number, emissive = 0, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emissive ? 1.2 : 0,
    roughness: 0.42,
    metalness: 0.55,
    transparent: opacity < 1,
    opacity,
  });
}

function addCharacter(root: THREE.Group) {
  const character = new THREE.Group();
  character.position.set(1.9, -0.65, 0.1);
  character.rotation.y = -0.16;

  const skin = makeMaterial(0x9f806b, 0x080808, 1);
  const shirt = makeMaterial(0x111827, 0x16213b, 1);
  const dark = makeMaterial(0x05070d, 0x121b2d, 1);
  const eye = new THREE.MeshBasicMaterial({ color: WHITE });
  const eyeGlow = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.45 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.82, 1.35, 8, 20), shirt);
  torso.scale.set(1.05, 1.1, 0.7);
  torso.position.y = -0.65;
  character.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.33, 0.42, 20), skin);
  neck.position.y = 0.42;
  character.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.86, 40, 28), skin);
  head.scale.set(0.82, 1.04, 0.78);
  head.position.set(0, 1.18, 0);
  character.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.88, 40, 24), dark);
  hair.scale.set(0.84, 0.58, 0.8);
  hair.position.set(0, 1.72, -0.02);
  character.add(hair);

  const earGeo = new THREE.SphereGeometry(0.15, 16, 12);
  for (const x of [-0.72, 0.72]) {
    const ear = new THREE.Mesh(earGeo, skin);
    ear.scale.set(0.7, 1, 0.55);
    ear.position.set(x, 1.2, 0);
    character.add(ear);
  }

  const eyeGeo = new THREE.SphereGeometry(0.075, 16, 12);
  for (const x of [-0.28, 0.28]) {
    const e = new THREE.Mesh(eyeGeo, eye);
    e.position.set(x, 1.27, 0.65);
    character.add(e);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), eyeGlow);
    glow.position.copy(e.position);
    glow.position.z += 0.02;
    character.add(glow);
  }

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 16), skin);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.14, 0.67);
  character.add(nose);

  const shoulders = new THREE.Group();
  for (const x of [-0.8, 0.8]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.1, 8, 14), shirt);
    arm.rotation.z = x < 0 ? 0.12 : -0.12;
    arm.position.set(x, -0.45, 0);
    shoulders.add(arm);
  }
  character.add(shoulders);

  const frame = new THREE.Mesh(
    new THREE.RingGeometry(1.55, 1.59, 96),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.28 }),
  );
  frame.rotation.x = Math.PI / 2;
  frame.position.set(0, 0.3, -0.55);
  character.add(frame);

  root.add(character);
  return character;
}

function addNeuralSystem(root: THREE.Group) {
  const system = new THREE.Group();
  system.position.set(-0.95, 0.15, -0.25);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 3),
    new THREE.MeshStandardMaterial({
      color: 0x0d1020,
      emissive: VIOLET,
      emissiveIntensity: 1.35,
      roughness: 0.18,
      metalness: 0.9,
    }),
  );
  system.add(core);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.12, 2),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.16, wireframe: true }),
  );
  system.add(wire);

  const nodePositions: THREE.Vector3[] = [];
  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2;
    const radius = 1.9 + (i % 3) * 0.25;
    nodePositions.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.7) * (1.1 + (i % 2) * 0.18),
        Math.sin(angle) * 1.3,
      ),
    );
  }

  const nodeGeometry = new THREE.SphereGeometry(0.045, 12, 12);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: CYAN });

  for (let i = 0; i < nodePositions.length; i += 1) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.copy(nodePositions[i]);
    system.add(node);

    if (i % 2 === 0) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        nodePositions[i],
      ]);
      const line = new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: i % 4 === 0 ? CYAN : VIOLET, transparent: true, opacity: 0.14 }),
      );
      system.add(line);
    }
  }

  for (let i = 0; i < 4; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.7 + i * 0.42, 0.008, 10, 128),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? CYAN : VIOLET, transparent: true, opacity: 0.17 - i * 0.02 }),
    );
    ring.rotation.set(Math.PI / 2 + i * 0.16, i * 0.37, i * 0.08);
    system.add(ring);
  }

  root.add(system);
  return { system, core, wire };
}

function addBackdrop(scene: THREE.Scene) {
  const grid = new THREE.GridHelper(28, 28, CYAN, 0x20283a);
  grid.position.y = -2.5;
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMaterials.forEach((material) => {
    material.transparent = true;
    material.opacity = 0.11;
  });
  scene.add(grid);

  const stars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: WHITE, size: 0.022, transparent: true, opacity: 0.55 }),
  );
  const positions = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 28;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = -2 - Math.random() * 16;
  }
  stars.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(stars);
}

export default function Scene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog(BG, 8, 24);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0.55, 0.08, 7.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0x9aa8ff, 0x02040b, 1.2);
    scene.add(ambient);

    const cyanLight = new THREE.PointLight(CYAN, 30, 18, 2);
    cyanLight.position.set(4, 5, 5);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(VIOLET, 24, 16, 2);
    violetLight.position.set(-4, -2, 4);
    scene.add(violetLight);

    addBackdrop(scene);

    const world = new THREE.Group();
    scene.add(world);
    const character = addCharacter(world);
    const network = addNeuralSystem(world);

    const waypoints: Waypoint[] = [
      { position: new THREE.Vector3(0.55, 0.08, 7.4), target: new THREE.Vector3(0.4, 0.15, 0) },
      { position: new THREE.Vector3(-1.15, 0.35, 8.1), target: new THREE.Vector3(-0.25, 0.25, 0) },
      { position: new THREE.Vector3(1.0, -0.1, 8.7), target: new THREE.Vector3(0.45, -0.1, 0) },
      { position: new THREE.Vector3(0.0, -0.35, 9.2), target: new THREE.Vector3(0.1, -0.2, 0) },
    ];

    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();

    const handlePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      targetPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetPointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };
    renderer.domElement.addEventListener('pointermove', handlePointer, { passive: true });

    const getProgress = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      return clamp01(window.scrollY / max);
    };

    let frameId = 0;
    let disposed = false;

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    resize();
    window.addEventListener('resize', resize);

    const tick = (timeMs: number) => {
      if (disposed) return;
      const time = timeMs * 0.001;
      const progress = getProgress();
      const scaled = progress * (waypoints.length - 1);
      const index = Math.min(Math.floor(scaled), waypoints.length - 2);
      const localT = smooth(scaled - index);
      const a = waypoints[index];
      const b = waypoints[index + 1];

      const desiredPosition = a.position.clone().lerp(b.position, localT);
      desiredPosition.x += pointer.x * 0.22;
      desiredPosition.y += pointer.y * 0.14;

      camera.position.lerp(desiredPosition, 0.06);
      pointer.lerp(targetPointer, 0.08);

      const target = a.target.clone().lerp(b.target, localT);
      target.x += pointer.x * 0.06;
      target.y += pointer.y * 0.04;
      camera.lookAt(target);

      world.rotation.y = THREE.MathUtils.lerp(world.rotation.y, 0.08 * Math.sin(time * 0.35), 0.02);
      character.position.x = THREE.MathUtils.lerp(character.position.x, 1.9 - progress * 3.4 + pointer.x * 0.08, 0.045);
      character.position.y = THREE.MathUtils.lerp(character.position.y, -0.65 - progress * 0.55 + pointer.y * 0.05, 0.045);
      character.rotation.y = THREE.MathUtils.lerp(character.rotation.y, -0.16 + progress * 0.36 + pointer.x * 0.05, 0.045);

      network.system.rotation.y += 0.0025;
      network.system.rotation.x = Math.sin(time * 0.5) * 0.06;
      network.core.rotation.y -= 0.005;
      network.wire.rotation.z += 0.003;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointermove', handlePointer);
      renderer.dispose();
      mount.removeChild(renderer.domElement);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="scene" aria-hidden="true" />;
}
