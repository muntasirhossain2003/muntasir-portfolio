import * as THREE from "three";

/** A4 proportions in world units. */
export const SHEET_W = 1;
export const SHEET_H = 1.414;

let geo: THREE.PlaneGeometry | null = null;
export function sheetGeometry() {
  if (!geo) geo = new THREE.PlaneGeometry(SHEET_W, SHEET_H, 40, 56);
  return geo;
}

const vertex = /* glsl */ `
  uniform float uCurl;
  uniform float uRadius;
  uniform float uTime;
  uniform float uWave;
  varying vec2 vUv;
  varying float vShade;
  const float PI = 3.14159265;

  void main() {
    vUv = uv;
    vec3 p = position;

    // idle breathing of the paper
    p.z += (sin(p.x * 2.3 + uTime * 0.9) + 0.6 * sin(p.y * 1.7 + uTime * 0.7)) * uWave;

    // page curl around a slanted cylinder sweeping right -> left
    vec2 dir = normalize(vec2(1.0, 0.28));
    float s = dot(p.xy, dir);
    float c = mix(0.72, -0.78, uCurl);
    float d = s - c;
    float shade = 1.0;
    if (uCurl > 0.0001 && d > 0.0) {
      float th = d / uRadius;
      float ns;
      float nz;
      if (th < PI) {
        ns = c + uRadius * sin(th);
        nz = uRadius * (1.0 - cos(th));
        shade = 1.0 - 0.38 * sin(th) + 0.12 * cos(th) * step(th, PI * 0.5);
      } else {
        ns = c - (d - PI * uRadius);
        nz = 2.0 * uRadius;
        shade = 0.9;
      }
      p.xy += dir * (ns - s);
      p.z += nz;
    }
    // soft shadow cast by the curl onto the flat part just ahead of it
    if (uCurl > 0.0001 && d <= 0.0) shade = 1.0 - 0.22 * exp(d * 14.0) * uCurl * 4.0 * (1.0 - uCurl);

    vShade = clamp(shade, 0.45, 1.1);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uBack;
  uniform float uOpacity;
  uniform float uTint;
  varying vec2 vUv;
  varying float vShade;

  void main() {
    vec3 col = gl_FrontFacing ? texture2D(uMap, vUv).rgb : uBack * (0.92 + 0.08 * vUv.y);
    float edge = smoothstep(0.0, 0.012, vUv.x) * smoothstep(1.0, 0.988, vUv.x)
               * smoothstep(0.0, 0.009, vUv.y) * smoothstep(1.0, 0.991, vUv.y);
    col *= mix(0.86, 1.0, edge) * vShade * uTint;
    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }
`;

export function makeSheetMaterial(map: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uBack: { value: new THREE.Color("#ece5d6") },
      uCurl: { value: 0 },
      uRadius: { value: 0.09 },
      uTime: { value: 0 },
      uWave: { value: 0.006 },
      uOpacity: { value: 1 },
      uTint: { value: 1 },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    side: THREE.DoubleSide,
    transparent: true,
  });
}

/** Soft rectangular drop-shadow texture (shared). */
let shadowTex: THREE.CanvasTexture | null = null;
export function shadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 340;
  const ctx = c.getContext("2d")!;
  ctx.filter = "blur(22px)";
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(48, 48, 160, 244);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}
