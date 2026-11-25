import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const band = (p: number, a: number, b: number, c: number, d: number) =>
  ease((p - a) / (b - a)) * (1 - ease((p - c) / (d - c)));

/** Deterministic pseudo-random values (module-scope Math.random is disallowed in the Worker). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeEngraving() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d");
  if (!g) return new THREE.Texture();
  g.fillStyle = "#b5c0c8";
  g.fillRect(0, 0, 1024, 1024);
  for (let r = 20; r < 512; r += 3) {
    g.strokeStyle = r % 9 === 0 ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.13)";
    g.lineWidth = r % 27 === 0 ? 2 : 1;
    g.beginPath();
    g.arc(512, 512, r, 0, Math.PI * 2);
    g.stroke();
  }
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    g.strokeStyle = "rgba(255,255,255,0.18)";
    g.beginPath();
    g.moveTo(512 + Math.cos(a) * 455, 512 + Math.sin(a) * 455);
    g.lineTo(512 + Math.cos(a) * (i % 10 === 0 ? 500 : 475), 512 + Math.sin(a) * (i % 10 === 0 ? 500 : 475));
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function CentralDisc({ lite }: { lite: boolean }) {
  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const outerGlass = useRef<THREE.Mesh>(null);
  const innerGlass = useRef<THREE.Mesh>(null);
  const orbitA = useRef<THREE.Mesh>(null);
  const orbitB = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const outline = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const elapsed = useRef(0);

  const engraving = useMemo(() => makeEngraving(), []);
  useEffect(() => () => engraving.dispose(), [engraving]);
  const count = lite ? 450 : 1400;
  const particles = useMemo(() => {
    const rand = seeded(42);
    const start = new Float32Array(count * 3);
    const end = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = 5 + rand() * 7;
      start.set([Math.cos(a) * r, (rand() - 0.5) * 7, Math.sin(a) * r - 2], i * 3);
      const ra = 2.25 + rand() * 1.4;
      end.set([Math.cos(a) * ra, (rand() - 0.5) * 0.14, Math.sin(a) * ra], i * 3);
    }
    return { start, end, current: start.slice() };
  }, [count]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const reduced = sceneState.reducedMotion;
    elapsed.current += rawDelta;
    const t = reduced ? 10 : elapsed.current;
    const p = sceneState.scroll;

    const gather = ease(t / 2.2);
    const outlineIn = ease((t - 0.6) / 1.1);
    const assemble = ease((t - 1.2) / 1.6);
    const glow = ease((t - 2.2) / 1.2);

    if (points.current) {
      const pos = points.current.geometry.attributes["position"] as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length; i++) {
        const start = particles.start[i] ?? 0;
        arr[i] = start + ((particles.end[i] ?? 0) - start) * gather;
      }
      pos.needsUpdate = true;
      points.current.rotation.y += delta * 0.04;
    }

    if (outline.current) {
      outline.current.scale.setScalar(0.6 + outlineIn * 0.4);
      (outline.current.material as THREE.MeshBasicMaterial).opacity = outlineIn * (1 - assemble * 0.65);
    }
    body.current?.scale.setScalar(Math.max(0.001, assemble));
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = glow * (2.2 + Math.sin(t * 1.4) * 0.35 + band(p, 0.82, 0.95, 2, 3) * 2);
    }

    const speed = reduced ? 0 : 1;
    if (outerGlass.current) outerGlass.current.rotation.z += delta * 0.12 * speed;
    if (innerGlass.current) innerGlass.current.rotation.z -= delta * 0.22 * speed;
    if (orbitA.current) orbitA.current.rotation.z += delta * 0.08 * speed;
    if (orbitB.current) orbitB.current.rotation.z -= delta * 0.05 * speed;

    // Visible in the hero, the connection close-up and the final return.
    const vis = Math.max(1 - ease((p - 0.22) / 0.08), ease((p - 0.78) / 0.12));
    if (root.current) {
      const focusX = sceneState.focus === "imagined" ? -0.18 : sceneState.focus === "earth" ? 0.18 : 0;
      const returnShift = ease((p - 0.82) / 0.09) * (lite ? -1.65 : -0.8);
      root.current.position.y = (lite ? 0 : -0.55) + returnShift + (reduced ? 0 : Math.sin(t * 0.7) * 0.06) + (1 - vis) * 2.5;
      root.current.position.x += (focusX - root.current.position.x) * 0.04;
      const aspectFit = Math.min(1, window.innerWidth / Math.min(window.innerHeight, 1040) / 1.35);
      root.current.scale.setScalar(Math.max(0.001, vis * (lite ? 0.46 : 0.61 * aspectFit) * (1 + band(p, 0.82, 0.96, 2, 3) * 0.12)));
      root.current.visible = vis > 0.12;
    }
    if (tilt.current) {
      const reveal = band(p, 0.03, 0.16, 0.2, 0.28);
      const tx = 0.72 - reveal * 0.35 - sceneState.pointerY * 0.12;
      const ty = sceneState.pointerX * 0.24 + reveal * 0.35;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * 0.05;
      tilt.current.rotation.y += (ty - tilt.current.rotation.y) * 0.05;
      innerGlass.current?.position.set(0, 0, reveal * 0.55);
      outerGlass.current?.position.set(0, 0, -reveal * 0.32);
    }
  });

  return (
    <group ref={root}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles.current, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.018} color="#dde3e8" transparent opacity={0.65} depthWrite={false} sizeAttenuation />
      </points>
      <group ref={tilt} rotation={[0.72, 0, 0]}>
        <mesh ref={outline}>
          <ringGeometry args={[2.04, 2.055, 160]} />
          <meshBasicMaterial color="#8eebff" transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
        <group ref={body}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.82, 1.82, 0.13, lite ? 96 : 192, 1, true]} />
            <meshPhysicalMaterial color="#c8d0d6" metalness={1} roughness={0.18} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0, 0.066]}>
            <ringGeometry args={[0.48, 1.82, lite ? 96 : 192]} />
            <meshPhysicalMaterial map={engraving} metalness={0.72} roughness={0.3} clearcoat={0.8} emissive="#17232b" emissiveIntensity={0.22} iridescence={0.8} iridescenceIOR={1.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, -0.066]} rotation={[Math.PI, 0, 0]}>
            <ringGeometry args={[0.48, 1.82, 96]} />
            <meshStandardMaterial color="#171c22" metalness={0.9} roughness={0.35} />
          </mesh>
          <mesh ref={innerGlass}>
            <torusGeometry args={[1.12, 0.055, 24, lite ? 96 : 180]} />
            <meshPhysicalMaterial color="#e8fbff" transmission={1} thickness={0.6} roughness={0.04} ior={1.45} iridescence={1} dispersion={lite ? 0 : 3} transparent />
          </mesh>
          {[0.66, 0.74, 0.95, 1.35, 1.48, 1.6, 1.72].map((r, i) => (
            <mesh key={r} position={[0, 0, 0.072 + i * 0.001]}>
              <ringGeometry args={[r, r + (i % 3 === 0 ? 0.006 : 0.002), lite ? 96 : 160]} />
              <meshBasicMaterial color={i % 2 ? "#d8c49a" : "#dde3e8"} transparent opacity={i % 2 ? 0.22 : 0.3} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {Array.from({ length: lite ? 36 : 72 }, (_, i) => {
            const a = i / (lite ? 36 : 72) * Math.PI * 2;
            return <mesh key={i} position={[Math.cos(a) * 1.67, Math.sin(a) * 1.67, 0.082]} rotation={[0, 0, a]}>
              <planeGeometry args={[i % 6 === 0 ? 0.065 : 0.03, 0.004]} />
              <meshBasicMaterial color="#dde3e8" transparent opacity={0.45} side={THREE.DoubleSide} />
            </mesh>;
          })}
          <mesh ref={outerGlass}>
            <torusGeometry args={[2.2, 0.075, 28, lite ? 120 : 220]} />
            <meshPhysicalMaterial color="#f5f6f2" transmission={1} thickness={0.8} roughness={0.03} ior={1.5} iridescence={0.9} dispersion={lite ? 0 : 4} transparent />
          </mesh>
          <mesh ref={core}>
            <sphereGeometry args={[0.32, 48, 48]} />
            <meshPhysicalMaterial color="#071015" emissive="#8eebff" emissiveIntensity={0} roughness={0.12} metalness={0.45} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.47, 0.025, 16, 96]} />
            <meshPhysicalMaterial color="#d8c49a" metalness={1} roughness={0.15} />
          </mesh>
          <mesh ref={orbitA} rotation={[0.18, 0.12, 0]}>
            <torusGeometry args={[2.72, 0.005, 6, 220]} />
            <meshBasicMaterial color="#8eebff" transparent opacity={0.45} />
          </mesh>
          <mesh ref={orbitB} rotation={[-0.25, -0.18, 0.6]}>
            <torusGeometry args={[3.08, 0.004, 6, 220]} />
            <meshBasicMaterial color="#d8c49a" transparent opacity={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}