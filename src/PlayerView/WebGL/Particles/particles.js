import * as THREE from "three";
import { hslToRgb } from "./color.js";

export function CreateParticles(camera) {
  // Vertex shader for particles
  const particleVertexShader = `
uniform float uTime;
attribute float size; // Add a size attribute
attribute float phase; // Add a phase attribute
varying vec3 vColor;
varying float vPhase;
varying vec3 modPos;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float sNoise(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

void main() {
    vColor = color; // Pass color to fragment shader
    vPhase = phase; // Pass the phase to the fragment shader

    // Use noise to modify the position
    // modPos.x += noise(position + vec3(uTime * .025, 0.0, 0.0)) * 10.0;
    // modPos.y += noise(position + vec3(0.0, uTime * .025, 0.0)) * 10.0;
    // modPos.z += noise(position + vec3(0.0, 0.0, uTime * .05)) * 10.0;    

    // modPos = position + noiseValue * 2.5;

    // Fluid-like movement
    // vec3 noiseDirection = vec3(-1.0, 1.0, 1.0); // Adjust to change the movement direction and proportion
    // float timeFactor = uTime * 0.05; // Adjust time scaling for speed

    // // Create a 3D noise position offset based on position and time
    // // Adding time to the different dimensions gives a swirling effect
    // vec4 noisePosTimeX = vec4(position.x, position.y, position.z, timeFactor);
    // vec4 noisePosTimeY = vec4(position.x, position.y, position.z, timeFactor); // Offset time for different noise results
    // vec4 noisePosTimeZ = vec4(position.x, position.y, position.z, timeFactor + 200.0); // Offset time for different noise results


    // // Calculate noise values for each axis
    // float noiseValueX = sNoise(noisePosTimeX);
    // float noiseValueY = sNoise(noisePosTimeY);
    
    // vec4 posTime = vec4(position, sin(timeOffset * .5) * .5 + cos(timeOffset * .5) * .5);
    // float noiseValueZ = sNoise(posTime);

    // // Apply the noise to the particle positions
    // vec3 modPos = position;
    // modPos.x += noiseValueX * noiseDirection.x;
    // modPos.y += noiseValueY * noiseDirection.y;
    // modPos.z += position.z + noiseValueZ * .5;
    float timeOffset = uTime * .15 + vPhase;
    vec4 posTime = vec4(position, timeOffset * .025);
    float noiseValue = sNoise(posTime);
    modPos = position;
    modPos.x += noiseValue * 2.75; // Apply noise uniformly.
    modPos.y += noiseValue * .15; // Apply noise uniformly.
    modPos.z += noiseValue * .025; // Apply noise uniformly.

    // Buoyancy effect - particles slowly rise up.
    float buoyancy = sin(timeOffset + modPos.y) * .15;

    // Horizontal wave movement.
    float wave = sin(timeOffset + modPos.x) * .1;

    // Apply noise and buoyancy to modify position.
    modPos.y += buoyancy; // Apply buoyancy to y-axis.
    modPos.x += wave; // Apply wave to x-axis.

    // Breathing size effect
    float breathAmplitude = .25;
    // float breath = size * (1.0 + breathAmplitude * sin(uTime));
    
    // Independent breathing rates for each particle
    // Create a random speed factor for each particle, this can be passed as an attribute or uniform if varying for each
    float breathingRate = vPhase * 0.15; // just as an example
    
    // Apply the breathing effect
    float breath = (1.0 + breathAmplitude * sin(uTime + vPhase)) * size;

    // Calculate distance from the camera along z-axis
    float distanceFromCamera = cameraPosition.z - modPos.z;
    float zFadeStart = cameraPosition.z - 10.0; // Adjusted to start fading 10 units in front of the camera
    float zFadeEnd = cameraPosition.z; // End fading exactly at the camera
    float fadeFactor = clamp((distanceFromCamera - 10.0) / 10.0, 0.0, 1.0);

    // Compute point size
    gl_PointSize = breath + (100.0 / size) * fadeFactor; // Adjust the 300.0 factor to scale the points
    gl_Position = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
}
`;

  // Fragment shader for particles
  const particleFragmentShader = `
uniform sampler2D pointTexture;
uniform float uTime;
varying vec3 vColor;
varying float vPhase; // The phase shift of each particle
uniform float uElapsedTime; // Time since the particles started
varying vec3 modPos;
out vec4 fragColor;

void main() {
  float fadeInDuration = 5.0; // Duration of the fade-in effect in seconds
  float maxAlpha = 0.8; // Maximum alpha value

  // Calculate base alpha based on fade-in time
  float alpha = maxAlpha * clamp(uElapsedTime / fadeInDuration, 0.0, 1.0);

  // Apply the flickering effect after the fade-in is complete
  // if (uElapsedTime >= fadeInDuration) {
  //     float flickerFrequency = 0.85; // Adjust frequency for a slower flicker
  //     float flickerAmplitude = 1.0; // Reduce amplitude for subtle flickering

  //     // Ensuring the flicker starts at maximum alpha and oscillates around it
  //     float flicker = sin(uTime * flickerFrequency + vPhase * 6.28318) * flickerAmplitude + 1.0;
  //     alpha = maxAlpha * flicker; // Scale alpha by the flickering effect, ensuring it starts at maxAlpha
  // }

  float distance = length(gl_PointCoord - vec2(0.5, 0.5));
  float alphaGradient = 1.0 - smoothstep(0.4, 0.5, distance); // Soft edges

  vec4 texColor = texture2D(pointTexture, gl_PointCoord);
  fragColor = vec4(vColor * texColor.rgb, texColor.a * alpha * alphaGradient);
}
`;

  const size = 128; // Texture size. Can be changed to suit your needs.
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  // Create radial gradient
  const center = size / 2;
  // Create radial gradient with smoother transitions
  const gradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)"); // Solid white in the center
  gradient.addColorStop(0.1, "rgba(255,255,255,0.9)"); // Almost solid
  gradient.addColorStop(0.25, "rgba(255,255,255,0.5)"); // Half transparency
  gradient.addColorStop(0.5, "rgba(255,255,255,0.1)"); // Mostly transparent
  gradient.addColorStop(1, "rgba(255,255,255,0)"); // Fully transparent at the edges

  // Apply the gradient to the canvas
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  var pointTex = new THREE.CanvasTexture(canvas);
  pointTex.minFilter = THREE.LinearFilter;
  pointTex.magFilter = THREE.LinearFilter;
  //   pointTex.colorSpace = THREE.SRGBColorSpace;

  const N = 2000;

  var position = new THREE.BufferAttribute(new Float32Array(3 * N), 3),
    color = new THREE.BufferAttribute(new Float32Array(3 * N), 3),
    v = new THREE.Vector3(),
    sizes = new THREE.BufferAttribute(new Float32Array(N), 1),
    phases = new THREE.BufferAttribute(new Float32Array(N), 1);
  // Define a base hue for your particles
  const colorVariation = 0; // Variation in hue for each particle
  const baseHue = 0; // For completely random base hues

  for (var i = 0; i < N; i++) {
    const theta = Math.random() * Math.PI * 2;
		const u = Math.random() * 2 - 1;
		const c = Math.sqrt( 1 - u * u );

		v.x = c * Math.cos( theta );
		v.y = u;
		v.z = c * Math.sin( theta );

    v.setLength(10 * Math.pow(Math.random(), 1));
    position.setXYZ(i, v.x, 0, v.z);
    // position.setZ(i, Math.min(camera.position.z + 5, position.getZ(i)));

    const hue = (baseHue + colorVariation * Math.random()) % 1.0;
    const saturation = 0; // Adjust for desired saturation
    const lightness = 0.9; // Adjust for desired lightness

    let { r, g, b } = hslToRgb(hue, saturation, lightness);
    color.setXYZ(i, r / 255, g / 255, b / 255); // Ensure colors are normalized between 0 and 1
    sizes.setX(i, 5.5 + Math.random() * 20.25);
    phases.setX(i, Math.random() * 2 * Math.PI);
  }

  var pointGeom = new THREE.BufferGeometry();
  pointGeom.setAttribute("position", position);
  pointGeom.setAttribute("color", color);
  pointGeom.setAttribute("size", sizes);
  pointGeom.setAttribute("phase", phases);

  //   console.log('cam pos: '+camera.position.clone().toArray().toString())

  // Create a shader material for the particles
  const pointMat = new THREE.ShaderMaterial({
    uniforms: {
      pointTexture: { value: pointTex },
      uTime: { value: 0 },
      uElapsedTime: { value: 0 },
      cameraPosition: { value: new THREE.Vector3(0, 0, 12) },
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    vertexColors: true,
    sizeAttenuation: true,
    glslVersion: THREE.GLSL3,
  });

  return new THREE.Points(pointGeom, pointMat);
}
