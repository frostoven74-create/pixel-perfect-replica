import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";

/** Intertwined paths unite engineered imagination and an organic planetary system. */
export function ConnectionSculpture({ lite }: { lite: boolean }) {
  const root = useRef<THREE.Group>(null);
  const weave = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current, p = sceneState.scroll;
    const reduced = sceneState.reducedMotion;
    if (!root.current || !weave.current) return;
    const mobile = window.innerWidth <= 768;
    const final = sceneState.activeSection === "explore";
    root.current.visible = mobile ? sceneState.activeSection === "top" || final : p < 0.23 || p > 0.91;
    const aspect = Math.min(1, window.innerWidth / Math.min(window.innerHeight,1040) / 1.3);
    root.current.scale.setScalar(mobile ? 1.4 : 0.82 * aspect);
    root.current.position.y = (mobile ? 0 : final ? -1.1 : -0.65) + (reduced ? 0 : Math.sin(t * 1.15) * 0.1);
    const damping = 1 - Math.exp(-5 * Math.min(delta,0.15));
    const rx = -0.35 + (reduced ? 0 : sceneState.pointerY * 0.3);
    const ry = (reduced ? 0.4 : t * 0.22 + sceneState.pointerX * 0.55) + p * 2;
    weave.current.rotation.x = reduced ? rx : weave.current.rotation.x + (rx - weave.current.rotation.x) * damping;
    weave.current.rotation.y = reduced ? ry : weave.current.rotation.y + (ry - weave.current.rotation.y) * damping;
    weave.current.rotation.z = reduced ? -0.15 : Math.sin(t * 0.45) * 0.12 - 0.15;
    root.current.userData['angle'] = weave.current.rotation.y;
  });
  return <group ref={root} name="connection-sculpture">
    <group ref={weave} rotation={[-0.35,0.4,-0.15]}>
      <mesh>
        <torusKnotGeometry args={[1.05,0.17,lite?160:260,lite?16:28,2,3]} />
        <meshPhysicalMaterial color="#c9dbe4" metalness={0.82} roughness={0.19} clearcoat={1} iridescence={0.5} />
      </mesh>
      <mesh rotation={[0,0,Math.PI]} scale={1.06}>
        <torusKnotGeometry args={[1.05,0.075,lite?160:260,16,2,3]} />
        <meshPhysicalMaterial color="#a8cb98" metalness={0.55} roughness={0.22} clearcoat={1} emissive="#476845" emissiveIntensity={0.2} />
      </mesh>
      <mesh rotation={[0,0,0.06]} scale={1.016}>
        <torusKnotGeometry args={[1.05,0.018,lite?160:260,8,2,3]} />
        <meshBasicMaterial color="#b9a5ed" />
      </mesh>
      <mesh rotation={[Math.PI/2,0.25,0]}>
        <torusGeometry args={[1.9,0.005,6,160,Math.PI*1.7]} />
        <meshBasicMaterial color="#8eebff" transparent opacity={0.45} />
      </mesh>
    </group>
  </group>;
}