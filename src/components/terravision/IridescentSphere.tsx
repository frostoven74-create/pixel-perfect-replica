import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";

const vertex = /* glsl */ `
uniform float uTime; uniform float uDistort;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){
  vec3 p = position;
  float w = sin(p.x*2.1+uTime*.7)*sin(p.y*2.6+uTime*.55)*sin(p.z*1.9+uTime*.6);
  p += normal * w * uDistort;
  vec4 mv = modelViewMatrix * vec4(p,1.);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = p;
  gl_Position = projectionMatrix * mv;
}`;

// Soft matte iridescence: coral/red core, pale-yellow crown, cyan-blue rim, lavender underside.
const fragment = /* glsl */ `
uniform float uTime; uniform float uHover; uniform vec2 uPointer; uniform float uOpacity;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){
  vec3 n = normalize(vN);
  float f = 1. - max(dot(n, vV), 0.);
  float drift = sin(vP.y*2.4 + uTime*.3)*.08 + sin(vP.x*2.+uTime*.22)*.06;
  vec3 red = vec3(.88,.33,.27), coral = vec3(.96,.55,.42), yellow = vec3(.97,.88,.6), cyan = vec3(.42,.68,.86), lav = vec3(.82,.76,.92);
  vec3 col = mix(red, coral, smoothstep(-.6,.4,n.y+drift));
  col = mix(col, yellow, smoothstep(.25,.95,n.y+n.x*.2+drift));
  col = mix(col, cyan, smoothstep(.35,1.,n.x-n.y*.15)*.9);
  col = mix(col, lav, smoothstep(.3,1.,-n.y+n.x*.3)*.7);
  vec3 L = normalize(vec3(uPointer.x*.9 - .3, uPointer.y*.7 + .8, 1.));
  float diff = max(dot(n, L), 0.);
  col *= .78 + diff*.32;
  float spec = pow(max(dot(reflect(-L, n), vV), 0.), 24.) * (.35 + uHover*.5);
  col += spec + f*f*.18;
  gl_FragColor = vec4(col, (.93 + spec) * uOpacity);
}`;

/** Signature translucent sphere; travels through the story and returns for the connection finale. */
export function IridescentSphere({ lite }: { lite: boolean }) {
  const root = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const hover = useRef(0);
  const appear = useRef(0);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uDistort: { value: 0.03 }, uHover: { value: 0 },
    uPointer: { value: new THREE.Vector2() }, uOpacity: { value: 0 },
  }), []);

  useFrame((_, raw) => {
    const delta = Math.min(raw, 0.1);
    elapsed.current += delta;
    const t = elapsed.current, p = sceneState.scroll, reduced = sceneState.reducedMotion;
    if (!root.current || !shell.current) return;
    const mobile = window.innerWidth <= 768;
    const final = sceneState.activeSection === "explore";
    root.current.visible = mobile ? sceneState.activeSection === "top" || final : p < 0.23 || p > 0.91;
    appear.current = Math.min(1, appear.current + delta * (reduced ? 10 : 0.6));
    const a = 1 - Math.pow(1 - appear.current, 3);
    uniforms.uOpacity.value = a;
    hover.current += ((sceneState.focus ? 1 : 0) - hover.current) * (1 - Math.exp(-4 * delta));
    uniforms.uHover.value = hover.current;
    uniforms.uTime.value = reduced ? 0 : t;
    uniforms.uPointer.value.set(sceneState.pointerX, sceneState.pointerY);
    const depth = final ? 0 : Math.min(1, p / 0.2);
    const base = mobile ? 1.15 : Math.min(1, window.innerWidth / window.innerHeight / 1.5) * 1.3;
    root.current.scale.setScalar(base * (0.82 + a * 0.18) * (1 - depth * 0.35));
    root.current.position.z = -depth * 2.5;
    root.current.position.y = (final && !mobile ? -0.9 : 0) + (reduced ? 0 : Math.sin(t * 0.9) * 0.08);
    const k = 1 - Math.exp(-3 * delta);
    root.current.position.x += ((reduced ? 0 : sceneState.pointerX * 0.18) - root.current.position.x) * k;
    shell.current.rotation.y = reduced ? 0.4 : t * 0.12 + p * 3;
    shell.current.rotation.x += ((reduced ? 0 : -sceneState.pointerY * 0.25) - shell.current.rotation.x) * k;
    root.current.userData["angle"] = shell.current.rotation.y;
  });

  return <group ref={root} name="connection-sculpture">
    <mesh ref={shell}>
      <icosahedronGeometry args={[1.35, lite ? 24 : 48]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  </group>;
}
