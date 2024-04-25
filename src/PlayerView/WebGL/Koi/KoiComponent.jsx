import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import CSM from "three-custom-shader-material/vanilla";
import { patchShaders } from "gl-noise/build/glNoise.m";
import { Noise } from "noisejs";
import KoiModel from "../../../Assets/Models/Koi/koifish_notexture.glb";
import KoiTexture from "../../../Assets/Models/Koi/textures/Basecolor_0.jpeg";
import maskTexture from "../../../Assets/Models/Koi/textures/mask.png";
import scalesTexture from "../../../Assets/Models/Koi/textures/scales.jpg";

const noise = new Noise(Math.random());

export default function KoiFish() {
  const meshRef = useRef();
  const texture = useTexture(KoiTexture);
  const mask = useTexture(maskTexture);
  const scales = useTexture(scalesTexture);

  const model = useGLTF(KoiModel);
  const { actions } = useAnimations(model.animations, meshRef);

  useEffect(() => {
    if (model) {
      const material = new CSM({
        baseMaterial: THREE.MeshStandardMaterial,
        uniforms: uniforms,
        vertexShader: patchShaders(vertexShader),
        fragmentShader: patchShaders(fragmentShader),
        // patchMap: {
        //   csm_FragNormal: {
        //     "#include <normal_fragment_maps>": /* glsl */ `
        //       normal = csm_FragNormal;
        //     `,
        //   },
        // },
      });

      for (const node in model.nodes) {
        if (model.nodes[node].material) {
          model.nodes[node].material = material;
        }
      }
    }
  }, [model]);

  useEffect(() => {
    for (const action of Object.values(actions)) {
      action.play();
    }
  }, [actions]);

  const uniforms = useMemo(() => {
    return {
      baseTexture: { value: texture },
      maskTexture: { value: mask },
      scalesTexture: { value: scales },
      uTime: { value: 0 },
      tintColour: { value: new THREE.Color(0xff0000) },
      tintStrength: { value: 0.5 },
      hueVariation: { value: 0 },
      warpPatternMixRatio: { value: 0.25 },
      warpScale: { value: 0.5 },
      warpStrength: { value: 0 },
      uAmplitude: { value: 0.5 },
      uFrequency: { value: 0.75 },
      resolution: { value: new THREE.Vector2() },
    };
  }, []);

  const vertexShader = useMemo(() => {
    return /* glsl */ `
        varying vec2 vUv;
        uniform float uTime; // Pass the time uniform to the shader
        uniform float uAmplitude; // Example starting amplitude value
        uniform float uFrequency; // Example starting frequency value

        void main() {
          vUv = uv;

          // swimming through water
          // float wave = sin(uTime + position.z * uFrequency) * uAmplitude;
          // floating on the wave
        // float wave = sin(uTime * uFrequency + position.y) * uAmplitude;

          vec3 pos = position;
          // pos.x += wave; // Apply the wave offset to the x-axis

          csm_Position = pos * vec3(1.0);
        }
      `;
  }, []);

  const fragmentShader = useMemo(() => {
    return /* glsl */ `
    uniform sampler2D baseTexture; // The texture map
    uniform sampler2D maskTexture; // Black and white mask texture
    uniform sampler2D scalesTexture; // Procedural scales texture
    uniform vec2 resolution; // The resolution of the screen

    // uniform vec3 tintColour; // The color to tint the texture with
    // uniform float tintStrength; // The strength of the tint, between 0 and 1
    uniform float hueVariation;
    uniform float warpPatternMixRatio;
    uniform float warpScale;
    uniform float warpStrength;
    
    varying vec2 vUv;
    uniform float uTime; // Pass the time uniform to the shader

    vec3 proceduralColor(vec2 uv) {
      // Simple procedural color using sine wave and time
      float r = sin(uv.x * 10.0 + uTime) * 0.5 + 0.5;
      float g = sin(uv.y * 10.0 + uTime) * 0.5 + 0.5;
      float b = sin((uv.x + uv.y) * 5.0 + uTime) * 0.5 + 0.5;
      return vec3(r, g, b);
    }
  
  vec3 adjustHue(vec3 color, float hueAdjustment) {
    float angle = hueAdjustment * 2.0 * 3.14159265; // Convert to radians
    float cosA = cos(angle);
    float sinA = sin(angle);
    vec3 k = vec3(0.57735, 0.57735, 0.57735); // Grey constant for rotation
    float oneMinusCosA = 1.0 - cosA;

    // Construct a rotation matrix in YIQ space, rotate, then convert back to RGB
    mat3 rotMat = mat3(
        cosA + k.x * k.x * oneMinusCosA, k.x * k.y * oneMinusCosA + k.z * sinA, k.x * k.z * oneMinusCosA - k.y * sinA,
        k.x * k.y * oneMinusCosA - k.z * sinA, cosA + k.y * k.y * oneMinusCosA, k.y * k.z * oneMinusCosA + k.x * sinA,
        k.x * k.z * oneMinusCosA + k.y * sinA, k.y * k.z * oneMinusCosA - k.x * sinA, cosA + k.z * k.z * oneMinusCosA
    );

    // RGB to YIQ and YIQ to RGB conversion matrices
    mat3 rgbToYiq = mat3(
        0.299, 0.587, 0.114,
        0.596, -0.274, -0.321,
        0.211, -0.523, 0.311
    );
    mat3 yiqToRgb = mat3(
        1.0, 0.956, 0.621,
        1.0, -0.272, -0.647,
        1.0, -1.107, 1.705
    );

    color = rgbToYiq * color; // Convert to YIQ
    color = rotMat * color; // Rotate the hue
    color = yiqToRgb * color; // Convert back to RGB

    return color;
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

float N21(vec2 p)
{	// Dave Hoskins - https://www.shadertoy.com/view/4djSRW
	vec3 p3  = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

vec4 scaleData(vec2 p){
    vec2 ptA = vec2(floor(p.x) + 0.5, round(p.y));
    vec2 ptB = vec2(round(p.x), floor(p.y) + 0.5);
    
	float mixer1 = 0.;
    if (round(p.y) < p.y) mixer1 = 1.;
    
    vec2 tmpMixA = mix(ptB, ptA, mixer1);
    vec2 tmpMixB = mix(ptA, ptB, mixer1);
    
    vec2 subMixA = p - tmpMixA;
    vec2 subMixB = p - tmpMixB;
    
    float dA = distance(tmpMixA, p); 
    float dB = distance(tmpMixB, p);    
    
    float mixer2 = 0.;
    if (dB < 0.5) mixer2 = 1.;
    
    vec2 uv = mix(subMixA, subMixB, mixer2) * vec2(1., -1.) + vec2(0., 0.5);    
    float dist = mix(dA, dB, mixer2) * 2.; // 0 to 1
    float id = N21( mix(tmpMixA, tmpMixB, mixer2));
      
    return vec4(uv, dist, id);
}
    
    void main() {
      vec4 baseTexColor = texture2D(baseTexture, vUv);

      // // Apply hue variation
      baseTexColor.rgb = adjustHue(baseTexColor.rgb, hueVariation);
    
      // // Pattern warping with noise
      // vec2 warpedUV = vUv + noise(vUv * warpScale) * warpStrength;
      // vec4 warpedTexColor = texture2D(baseTexture, warpedUV);
      // warpedTexColor.rgb = adjustHue(warpedTexColor.rgb, hueVariation);
    
      // // Combine base texture with warped texture based on a mix ratio
      // vec4 finalTexColor = mix(baseTexColor, warpedTexColor, warpPatternMixRatio);

      vec2 scaledUv = vUv;

      vec4 baseTexel = texture2D(baseTexture, scaledUv);
      vec4 maskTexel = texture2D(maskTexture, vUv);
      vec4 scaleTexel = texture2D(scalesTexture, vUv);

      vec4 combinedTexel = mix(baseTexel, vec4(0.0,0.0,0.0, 1.0), maskTexel.r * 0.5);

      vec2 repeats = vec2(20.);
      // vec2 scaledUv = vUv * repeats;
      vec4 col = scaleData(scaledUv);

      csm_FragColor = baseTexColor;
    }
      `;
  }, []);

  const cameraOffset = useRef(new THREE.Vector3(0, 50, 0));

  const wanderAngle = useRef(0);
  const influenceDirection = useRef(0);
  const prevHitBoundary = useRef(false);

  useFrame((state, delta) => {
    const { scene, gl, camera, size, viewport, clock } = state;

    uniforms.resolution.value.x = size.width;
    uniforms.resolution.value.y = size.height;

    uniforms.uTime.value = clock.getElapsedTime();

    const time = clock.getElapsedTime();

    const bounds = {
      minX: -43.75 / 2, // Assuming the center of the water is at (0, 0, 0)
      maxX: 43.75 / 2,
      minZ: -43.75 / 2,
      maxZ: 43.75 / 2,
    };

    const boundaryThreshold = 2;
    const currentPos = meshRef.current.position.clone();
    const turnSpeed = 0.5; // How quickly the fish turns, adjust as needed

    // Fish position and movement
    let direction = new THREE.Vector3(
      Math.sin(wanderAngle.current),
      0,
      Math.cos(wanderAngle.current)
    );

    // Boundary avoidance
    if (currentPos.x > bounds.maxX - boundaryThreshold) {
      wanderAngle.current -= turnSpeed * delta;
    } else if (currentPos.x < bounds.minX + boundaryThreshold) {
      wanderAngle.current += turnSpeed * delta;
    }

    if (currentPos.z > bounds.maxZ - boundaryThreshold) {
      wanderAngle.current -= turnSpeed * delta;
    } else if (currentPos.z < bounds.minZ + boundaryThreshold) {
      wanderAngle.current += turnSpeed * delta;
    }

    // Apply wandering behavior with some randomness
    wanderAngle.current +=
      noise.simplex2(time * 0.2, wanderAngle.current) * 0.05;
    // Calculate the new velocity
    direction.set(
      Math.sin(wanderAngle.current),
      0,
      Math.cos(wanderAngle.current)
    );

    // Update fish position
    const speed = 2; // Fish speed
    currentPos.addScaledVector(direction.normalize(), speed * delta);
    currentPos.x = THREE.MathUtils.clamp(
      currentPos.x,
      bounds.minX,
      bounds.maxX
    );
    currentPos.z = THREE.MathUtils.clamp(
      currentPos.z,
      bounds.minZ,
      bounds.maxZ
    );
    meshRef.current.position.copy(currentPos);

    // Update fish orientation
    const forwardVector = new THREE.Vector3(-1, 0, 0);
    meshRef.current.quaternion.setFromUnitVectors(
      forwardVector,
      direction.clone().normalize()
    );

    // const targetCameraPosition = meshRef.current.position
    //   .clone()
    //   .add(cameraOffset.current);

    // // Smoothly interpolate the camera's position towards the target position
    // camera.position.lerp(targetCameraPosition, 0.1); // '0.1' is the lerp factor, adjust for smoother or more rigid camera movement

    // // Make the camera look directly at the fish
    // camera.lookAt(meshRef.current.position);

    // camera.updateProjectionMatrix();
  });

  return (
    <primitive object={model.nodes.mesh_0} position={[0, 3, 0]} ref={meshRef} />
  );
}
