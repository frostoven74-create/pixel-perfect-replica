import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";
import { CentralDisc } from "./CentralDisc";
import { IdeaStructure } from "./IdeaStructure";
import { Planet } from "./Planet";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function CameraRig() {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const p = sceneState.scroll;
    const close = smooth(0.02, 0.16, p) * (1 - smooth(0.18, 0.26, p));
    const z = 8.4 - close * 2.6;
    const k = 1 - Math.exp(-3 * Math.min(delta, 0.05));
    camera.position.x += (sceneState.pointerX * 0.35 - camera.position.x) * k;
    camera.position.y += (sceneState.pointerY * 0.2 - camera.position.y) * k;
    camera.position.z += (z - camera.position.z) * k;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function AccentLight() {
  const light = useRef<THREE.PointLight>(null);
  const colors = useMemo(
    () => ({
      none: new THREE.Color("#8eebff"),
      imagined: new THREE.Color("#c5a8ff"),
      earth: new THREE.Color("#9bbe83"),
    }),
    [],
  );
  useFrame((_, delta) => {
    if (!light.current) return;
    const target = colors[sceneState.focus ?? "none"];
    light.current.color.lerp(target, 1 - Math.exp(-4 * Math.min(delta, 0.05)));
    const x = sceneState.focus === "imagined" ? -3 : sceneState.focus === "earth" ? 3 : sceneState.pointerX * 2;
    light.current.position.x += (x - light.current.position.x) * 0.05;
  });
  return <pointLight ref={light} position={[0, 1.5, 3.5]} intensity={18} distance={12} />;
}

export default function SceneCanvas({ lite }: { lite: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene-range]"));
      const y = window.scrollY + window.innerHeight * 0.35;
      let next = 0;
      for (const node of nodes) {
        const top = node.getBoundingClientRect().top + window.scrollY;
        if (y < top) continue;
        const range = node.dataset["sceneRange"]?.split(",").map(Number);
        const from = range?.[0] ?? 0, to = range?.[1] ?? from;
        const t = Math.min(1, Math.max(0, (y - top) / node.offsetHeight));
        next = from + (to - from) * t;
      }
      sceneState.scroll = next;
    };
    const onMove = (e: PointerEvent) => {
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={wrap} className="tv-canvas" aria-hidden>
      <Canvas
        dpr={lite ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 8.4], fov: 38 }}
        gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => wrap.current?.setAttribute("data-scene-ready", "true")}
      >
        <fog attach="fog" args={["#050608", 9, 22]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} color="#f5f6f2" />
        <directionalLight position={[-5, -2, -3]} intensity={0.8} color="#d8c49a" />
        <AccentLight />
        <Environment resolution={lite ? 64 : 256}>
          <Lightformer intensity={2.4} position={[0, 5, -2]} scale={[10, 2, 1]} color="#dde3e8" />
          <Lightformer intensity={1.4} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[12, 1, 1]} color="#8eebff" />
          <Lightformer intensity={1.1} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[12, 1, 1]} color="#d8c49a" />
          <Lightformer form="ring" intensity={1.5} position={[0, 0, 6]} scale={3} color="#ffffff" />
        </Environment>
        <CameraRig />
        <CentralDisc lite={lite} />
        <IdeaStructure />
        <Planet lite={lite} />
      </Canvas>
    </div>
  );
}