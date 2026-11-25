import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};

const LAYERS = [
  { y: -0.7, color: "#557bff", label: "process", s: 1.55 },
  { y: -0.25, color: "#dde3e8", label: "mechanism", s: 1.3 },
  { y: 0.2, color: "#c5a8ff", label: "material", s: 1.05 },
  { y: 0.65, color: "#d8c49a", label: "component", s: 0.78 },
];

export function IdeaStructure() {
  const root = useRef<THREE.Group>(null);
  const spark = useRef<THREE.Mesh>(null);
  const layers = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const p = sceneState.scroll;
    const enter = ease((p - 0.2) / 0.08);
    const exit = ease((p - 0.42) / 0.07);
    const vis = enter * (1 - exit);
    const expand = 0.65 + ease((p - 0.25) / 0.08) * 0.35;
    const explode = 0.35 + ease((p - 0.31) / 0.08) * 0.65;
    if (!root.current) return;
    root.current.visible = vis > 0.01;
    root.current.scale.setScalar(Math.max(0.001, vis * (window.innerWidth > 768 ? 1.35 : 0.85)));
    root.current.position.x = window.innerWidth > 768 ? 1.75 : 0;
    root.current.position.y = window.innerWidth > 768 ? 0 : 0.9;
    if (!sceneState.reducedMotion) root.current.rotation.y += Math.min(delta, 0.05) * 0.18;
    root.current.rotation.x = 0.35;
    if (spark.current) {
      spark.current.scale.setScalar(0.075 + (1 - expand) * 0.15 + (sceneState.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 2) * 0.006));
    }
    layers.current.forEach((g, i) => {
      if (!g) return;
      const layer = LAYERS[i];
      if (!layer) return;
      g.scale.setScalar(Math.max(0.001, expand));
      g.position.y = layer.y * (0.35 + explode * 1.25);
      g.rotation.y = explode * (i - 1.5) * 0.24;
    });
  });

  return (
    <group ref={root}>
      <mesh ref={spark}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#ffffff" emissive="#c5a8ff" emissiveIntensity={3} />
      </mesh>
      {LAYERS.map((layer, i) => (
        <group key={layer.label} ref={(g) => { layers.current[i] = g; }}>
          <mesh>
            <boxGeometry args={[layer.s, 0.06, layer.s]} />
            <meshPhysicalMaterial color={layer.color} metalness={0.25} roughness={0.12} transmission={0.55} thickness={0.4} transparent opacity={0.82} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(layer.s * 1.04, 0.07, layer.s * 1.04)]} />
            <lineBasicMaterial color={layer.color} transparent opacity={0.8} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}