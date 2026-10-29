import * as THREE from "three";

export const CharacterVertexShader = /* glsl */ `
  uniform sampler2D uDepthMap;
  uniform float uDisplacementScale;
  uniform float uTime;
  uniform vec2 uMouse;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDepth;

  void main() {
    vUv = uv;
    
    // Sample depth map for subtle 2.5D volumetric relief
    vec4 depthTex = texture2D(uDepthMap, uv);
    float depth = depthTex.r * depthTex.a;
    vDepth = depth;

    // Anatomical regions based on vertical UV coordinates:
    float isHead = smoothstep(0.68, 0.96, uv.y);
    float isTorso = smoothstep(0.44, 0.68, uv.y) * smoothstep(0.74, 0.58, uv.y);

    // 1. Organic Respiration Cycle
    float breathWave = sin(uTime * 1.4);
    float naturalBreathZ = breathWave * 0.035 * isTorso;
    float naturalBreathY = breathWave * 0.012 * isTorso;

    // 2. Natural Parallax Head Sway based on cursor
    float headSwayX = (uMouse.x * 0.05) * isHead;
    float headSwayY = (uMouse.y * 0.03) * isHead;

    // Displaced vertex position
    vec3 displacedPosition = position;
    displacedPosition.z += (depth * uDisplacementScale) + naturalBreathZ;
    displacedPosition.y += naturalBreathY + headSwayY;
    displacedPosition.x += headSwayX;

    vec4 modelViewPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    vViewPosition = -modelViewPosition.xyz;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

export const CharacterFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uNormalMap;
  uniform vec3 uLightPosition;
  uniform float uLightIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Clean Alpha discard (eliminates transparent fringe)
    if (texColor.a < 0.08) {
      discard;
    }

    // Normal mapping for subtle studio lighting relief
    vec4 normalTex = texture2D(uNormalMap, vUv);
    vec3 unpackedNormal = normalize(normalTex.rgb * 2.0 - 1.0);
    vec3 normal = normalize(vNormal + unpackedNormal * 0.28);

    // Directional Key Light
    vec3 lightDir = normalize(uLightPosition - vViewPosition);
    float diff = max(dot(normal, lightDir), 0.0);

    // Balanced studio lighting
    vec3 litColor = texColor.rgb * (0.96 + diff * 0.12 * uLightIntensity);

    gl_FragColor = vec4(litColor, texColor.a);
  }
`;

export function createCharacterShaderMaterial(
  texture: THREE.Texture,
  depthMap: THREE.Texture,
  normalMap: THREE.Texture
) {
  return new THREE.ShaderMaterial({
    vertexShader: CharacterVertexShader,
    fragmentShader: CharacterFragmentShader,
    uniforms: {
      uTexture: { value: texture },
      uDepthMap: { value: depthMap },
      uNormalMap: { value: normalMap },
      uDisplacementScale: { value: 0.26 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uLightPosition: { value: new THREE.Vector3(1.2, 2.4, 3.0) },
      uLightIntensity: { value: 1.0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}

export { createCharacterShaderMaterial as createCharacterMaterial };
