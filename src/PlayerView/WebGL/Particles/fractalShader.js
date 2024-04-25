// Vertex shader
export const vertexShader = `
varying vec3 vPosition;

void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader
export const fragmentShader = `
precision highp float;

uniform sampler2D uFractalTexture;
uniform float uTime;
uniform vec2 uResolution;

uniform float uXDriftFactor;
uniform float uYDriftFactor;
uniform float uNoiseScale;
uniform float uDistortion;

out vec4 fragColor;

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec3 permute(vec3 x) {
    return mod289(((x*34.0)+10.0)*x);
  }
  
  float snoise(vec2 v)
    {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
  // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
  
  // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
  
  // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
  
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
  
  // Gradients: 41 points uniformly over a line, mapped onto a diamond.
  // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
  
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
  
  // Normalise gradients implicitly by scaling m
  // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  
  // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  vec2 curlNoise(vec2 p) {
    const float delta = 0.1;
    const float twoDelta = 2.0 * delta;
    
    // Compute the derivatives by finite differences
    float dNoise_dy = snoise(vec2(p.x, p.y + delta)) - snoise(vec2(p.x, p.y - delta));
    float dNoise_dx = snoise(vec2(p.x + delta, p.y)) - snoise(vec2(p.x - delta, p.y));
    
    // The "curl" is just the cross-derivative
    return vec2(dNoise_dy, -dNoise_dx) / twoDelta;
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    // vec4 texColor = texture(uFractalTexture, st);

    float xDriftFactor = 0.01; // Adjust for stronger or subtler drift
    float yDriftFactor = 0.05; // Adjust for stronger or subtler drift

    // Time-varying offset for the falling effect
    vec2 drift = vec2(uTime * uXDriftFactor, uTime * uYDriftFactor); // Adjust x for lateral drift, y for downward movement

    // Scale for the noise
    // float noiseScale = 1.75; // Adjust for wider or narrower noise patterns
    
    // Distortion intensity for the falling effect
    // float distortion = 0.01; // Adjust for stronger or subtler distortion
    
    // Apply a smooth noise pattern based on the fragment position and time
    float noiseValue = snoise((st + drift) * uNoiseScale);

    // Offset the texture coordinates slightly based on the noise to simulate flow
    vec2 flow = vec2(noiseValue * uDistortion, noiseValue * uDistortion * 0.03); // Anisotropic distortion
    
    // Fetch the color from the offset coordinates
    vec4 color = texture(uFractalTexture, st + flow);
    float originalAlpha = color.a * (1.0 - length(gl_PointCoord - vec2(0.5, 0.5)) * 100.0);
    fragColor = color; // Apply the fade to the color's alpha
}
`;

export default {
    vertexShader,
    fragmentShader
}