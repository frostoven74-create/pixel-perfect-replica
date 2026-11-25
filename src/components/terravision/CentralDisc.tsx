import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { sceneState } from "@/lib/scene-state";
import { createOpticalMaterial } from "./OpticalMaterial";

const ease = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

function makeBody() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1.86, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.65, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.025, bevelSegments: 3, curveSegments: 96, steps: 1 });
  g.translate(0, 0, -0.08);
  return g;
}

function makeTicks() {
  const geos = Array.from({ length: 96 }, (_, i) => {
    const a = i / 96 * Math.PI * 2;
    const g = new THREE.BoxGeometry(i % 8 === 0 ? 0.065 : 0.025, 0.006, 0.008);
    g.rotateZ(a);
    g.translate(Math.cos(a)*1.72,Math.sin(a)*1.72,0.123);
    return g;
  });
  const merged = mergeGeometries(geos);
  geos.forEach(g => g.dispose());
  return merged ?? new THREE.BufferGeometry();
}

export function CentralDisc({ lite }: { lite: boolean }) {
  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Group>(null);
  const lower = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const material = useMemo(createOpticalMaterial, []);
  const body = useMemo(makeBody, []);
  const ticks = useMemo(makeTicks, []);
  useEffect(() => () => { material.dispose(); body.dispose(); ticks.dispose(); }, [material,body,ticks]);

  useFrame((_,rawDelta) => {
    elapsed.current += rawDelta;
    const d = Math.min(rawDelta,0.05);
    const reduced = sceneState.reducedMotion;
    const t = elapsed.current;
    const p = sceneState.scroll;
    const enter = reduced ? 1 : 0.75+ease(t / 1.8)*0.25;
    const reveal = ease((p-0.08)/0.08)*(1-ease((p-0.21)/0.07));
    const vis = Math.max(1-ease((p-0.22)/0.07),ease((p-0.79)/0.11));
    const end = ease((p-0.82)/0.1);
    const timeUniform = material.uniforms['uTime'];
    const focusUniform = material.uniforms['uFocus'];
    if (timeUniform) timeUniform.value = reduced ? 0 : t;
    const focus = sceneState.focus==='imagined' ? -1 : sceneState.focus==='earth' ? 1 : 0;
    if (focusUniform) focusUniform.value += (focus-focusUniform.value)*0.05;
    if (root.current) {
      root.current.visible = vis > 0.05 && (p < 0.235 || p > 0.91);
      const aspect = Math.min(1,window.innerWidth / Math.min(window.innerHeight,1040)/1.25);
      root.current.scale.setScalar(Math.max(0.001,vis*enter*(lite?0.52:0.78*aspect)));
      root.current.position.y = (lite?0.05:-0.75) - end*(lite?1.6:0.5) + (reduced?0:Math.sin(t*0.65)*0.07);
      root.current.position.x += (focus*0.1-root.current.position.x)*0.04;
    }
    if (tilt.current) {
      tilt.current.rotation.x += ((0.48+reveal*0.25-sceneState.pointerY*0.08)-tilt.current.rotation.x)*0.05;
      tilt.current.rotation.y += ((-0.35+reveal*0.8+sceneState.pointerX*0.14)-tilt.current.rotation.y)*0.05;
      tilt.current.rotation.z = -0.23+(reduced?0:Math.sin(t*0.25)*0.03);
    }
    if (upper.current) upper.current.position.z = 0.24+reveal*0.58;
    if (lower.current) lower.current.position.z = -0.22-reveal*0.32;
    if (core.current && !reduced) { core.current.rotation.y += d*0.15; core.current.rotation.z -= d*0.1; }
    if (orbit.current && !reduced) orbit.current.rotation.z += d*0.015;
  });

  return <group ref={root}>
    <group ref={tilt} rotation={[0.48,-0.35,-0.23]}>
      <mesh geometry={body} material={material} />
      <mesh geometry={ticks}><meshBasicMaterial color="#c7d4df" transparent opacity={0.7} /></mesh>
      {[0.76,0.88,1.03,1.22,1.52,1.79].map((r,i)=><mesh key={r} position={[0,0,0.12]}>
        <torusGeometry args={[r,i%2?0.004:0.008,8,160]} />
        <meshStandardMaterial color={i%2?'#b8c6d4':'#d8c49a'} metalness={0.9} roughness={0.26} />
      </mesh>)}
      <mesh position={[0,0,0.09]}><torusGeometry args={[1.88,0.045,20,160]} /><meshPhysicalMaterial color="#cddbe7" metalness={1} roughness={0.12} clearcoat={1} /></mesh>
      <mesh position={[0,0,-0.09]}><torusGeometry args={[1.88,0.035,16,160]} /><meshPhysicalMaterial color="#a3b8c8" metalness={1} roughness={0.2} /></mesh>
      <group ref={upper} position={[0,0,0.24]}>
        <mesh><torusGeometry args={[1.99,0.042,20,180]} /><meshPhysicalMaterial color="#d4f4f4" transmission={0.65} thickness={0.2} metalness={0.35} roughness={0.06} ior={1.45} iridescence={1} transparent opacity={0.85} /></mesh>
        <mesh><ringGeometry args={[1.89,2.03,160]} /><meshPhysicalMaterial color="#b9dcdf" metalness={0.4} roughness={0.13} iridescence={1} transparent opacity={0.45} side={THREE.DoubleSide} /></mesh>
      </group>
      <group ref={lower} position={[0,0,-0.22]}>
        <mesh><torusGeometry args={[2.06,0.025,12,160]} /><meshStandardMaterial color="#d8c49a" metalness={0.9} roughness={0.2} /></mesh>
        <mesh><ringGeometry args={[1.75,2.07,160]} /><meshPhysicalMaterial color="#172529" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} /></mesh>
      </group>
      <mesh><torusGeometry args={[0.64,0.055,20,100]} /><meshPhysicalMaterial color="#dbe8f0" metalness={1} roughness={0.08} /></mesh>
      <mesh position={[0,0,0.13]}><torusGeometry args={[0.56,0.009,10,100]} /><meshBasicMaterial color="#8eebff" /></mesh>
      <group ref={core}>
        <mesh rotation={[0.6,0.3,0]}><octahedronGeometry args={[0.38,0]} /><meshPhysicalMaterial color="#9ce6e8" metalness={0.45} roughness={0.05} transmission={0.5} thickness={0.4} iridescence={1} /></mesh>
        <mesh><torusGeometry args={[0.39,0.006,8,70]} /><meshBasicMaterial color="#c5a8ff" /></mesh>
        <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.39,0.006,8,70]} /><meshBasicMaterial color="#8eebff" /></mesh>
      </group>
      <group ref={orbit}>
        <mesh rotation={[0.1,0.15,0]}><torusGeometry args={[2.45,0.003,6,180]} /><meshBasicMaterial color="#879da4" transparent opacity={0.35} /></mesh>
        <mesh rotation={[-0.2,0.25,0]}><torusGeometry args={[2.7,0.002,6,180,Math.PI*1.6]} /><meshBasicMaterial color="#a8997d" transparent opacity={0.35} /></mesh>
        <mesh position={[2.45,0,0]}><sphereGeometry args={[0.026,12,12]} /><meshBasicMaterial color="#8eebff" /></mesh>
        <mesh position={[-2.15,1.18,0]}><sphereGeometry args={[0.025,12,12]} /><meshBasicMaterial color="#d8c49a" /></mesh>
      </group>
    </group>
  </group>;
}
