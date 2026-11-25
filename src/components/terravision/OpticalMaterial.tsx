import * as THREE from "three";

/** A custom optical coating: machined radial grain, broad studio reflections and thin-film colour. */
const vertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vPosition = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const fragmentShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vView;
uniform float uTime;
uniform float uFocus;
const float PI = 3.14159265;
void main() {
  float angle = atan(vPosition.y, vPosition.x);
  float radius = length(vPosition.xy);
  float facing = abs(dot(normalize(vNormal), normalize(vView)));
  float film = sin(angle * 2.0 + radius * 1.8 + (1.0-facing)*4.0 + uTime*0.025)*0.5+0.5;
  vec3 silver = vec3(0.74,0.82,0.87);
  vec3 violet = vec3(0.58,0.38,0.80);
  vec3 cyan = vec3(0.31,0.81,0.87);
  vec3 gold = vec3(0.81,0.65,0.36);
  vec3 spectrum = mix(violet,cyan,smoothstep(0.0,0.55,film));
  spectrum = mix(spectrum,gold,smoothstep(0.55,1.0,film));
  vec3 color = mix(silver,spectrum,0.68);
  float reflection = pow(abs(sin(angle*1.0+0.65)),20.0);
  float reflection2 = pow(abs(sin(angle+2.0)),7.0);
  float radial = sin(radius*760.0)*0.018 + sin(radius*145.0)*0.01;
  float ridge = pow(sin(radius*42.0)*0.5+0.5,16.0)*0.075;
  color *= 0.27+reflection*1.65+reflection2*0.53+radial+ridge;
  color += pow(1.0-facing,3.0)*silver*0.26;
  color = mix(color,color+violet*0.09,clamp(-uFocus,0.0,1.0));
  color = mix(color,color+vec3(0.35,0.61,0.38)*0.12,clamp(uFocus,0.0,1.0));
  gl_FragColor = vec4(color,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function createOpticalMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uTime: { value: 0 }, uFocus: { value: 0 } },
    side: THREE.DoubleSide,
  });
}