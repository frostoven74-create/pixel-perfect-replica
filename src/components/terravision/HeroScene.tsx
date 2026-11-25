import { ClientOnly } from "@tanstack/react-router";
import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { sceneState } from "@/lib/scene-state";
import { StaticDisc } from "./StaticDisc";

const SceneCanvas = lazy(() => import("./SceneCanvas"));

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? <StaticDisc /> : this.props.children; }
}

function BrowserScene() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [lite, setLite] = useState(true);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    setSupported(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    setLite(window.innerWidth < 768);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { sceneState.reducedMotion = mq.matches; };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!supported) return <StaticDisc />;
  return <SceneBoundary><Suspense fallback={<StaticDisc />}><SceneCanvas lite={lite} /></Suspense></SceneBoundary>;
}

export function HeroScene() {
  return (
    <div className="tv-scene-stage">
      <ClientOnly fallback={<StaticDisc />}><BrowserScene /></ClientOnly>
    </div>
  );
}