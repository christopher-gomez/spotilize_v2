import { folder, useControls } from "leva";

export function useWaterControls(uniforms) {
  useControls({
    Water: folder({
      uWaterDepth: {
        label: "Depth",
        value: 0.4,
        min: 0.0,
        max: 10.0,
        step: 0.1,
        onChange: (value) => {
          uniforms.uWaterDepth.value = value;
        },
      },
      Colors: folder({
        Shallow: folder({
          uWaterShallowColor: {
            label: "Color",
            value: "#56aacb",
            onChange: (value) => {
              uniforms.uWaterShallowColor.value.set(value);
            },
          },
          uWaterShallowColorAlpha: {
            label: "Alpha",
            value: 0.38,
            min: 0.0,
            max: 1.0,
            step: 0.01,
            onChange: (value) => {
              uniforms.uWaterShallowColorAlpha.value = value;
            },
          },
        }),
        Deep: folder({
          uWaterDeepColor: {
            label: "Color",
            value: "#00252e",
            onChange: (value) => {
              uniforms.uWaterDeepColor.value.set(value);
            },
          },
          uWaterDeepColorAlpha: {
            label: "Alpha",
            value: 0.6,
            min: 0.0,
            max: 1.0,
            step: 0.01,
            onChange: (value) => {
              uniforms.uWaterDeepColorAlpha.value = value;
            },
          },
        }),
      }),
    }),

    Horizon: folder({
      uHorizonDistance: {
        label: "Distance",
        value: 2,
        min: 0.0,
        max: 10,
        step: 1.0,
        onChange: (value) => {
          uniforms.uHorizonDistance.value = value;
        },
      },
      uHorizonColor: {
        label: "Color",
        value: "#abeaff",
        onChange: (value) => {
          uniforms.uHorizonColor.value.set(value);
        },
      },
    }),

    Refraction: folder({
      uRefractionScale: {
        label: "Scale",
        value: 0.02,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uRefractionScale.value = value;
        },
      },
      uRefractionSpeed: {
        label: "Speed",
        value: 0.1,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uRefractionSpeed.value = value;
        },
      },
      uRefractionStrength: {
        label: "Strength",
        value: 0.0,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uRefractionStrength.value = value;
        },
      },
    }),

    Reflection: folder({
      uReflectionFresnelPower: {
        label: "Distance",
        value: 3.59,
        min: 0.0,
        max: 10.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uReflectionFresnelPower.value = value;
        },
      },
      uReflectionStrength: {
        label: "Strength",
        value: 2.06,
        min: 0.0,
        max: 10.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uReflectionStrength.value = value;
        },
      },
      uReflectionMix: {
        label: "Blend",
        value: 0.5,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uReflectionMix.value = value;
        },
      },
    }),

    Foam: folder({
      Color: folder({
        uFoamColor: {
          label: "Color",
          value: "#c1e6ff",
          onChange: (value) => {
            uniforms.uFoamColor.value.set(value);
          },
        },
        uFoamAlpha: {
          label: "Alpha",
          value: 0.11,
          min: 0.0,
          max: 1.0,
          step: 0.01,
          onChange: (value) => {
            uniforms.uFoamAlpha.value = value;
          },
        },
        uFoamBlend: {
          label: "Blend",
          value: 0.63,
          min: 0.0,
          max: 1.0,
          step: 0.01,
          onChange: (value) => {
            uniforms.uFoamBlend.value = value;
          },
        },
      }),

      Rendering: folder({
        uFoamAngle: {
          label: "Direction",
          value: 445,
          min: 0.0,
          max: 360,
          step: 0.01,
          onChange: (value) => {
            uniforms.uFoamAngle.value = value;
          },
        },
        uFoamSpeed: {
          label: "Speed",
          value: 0.1,
          min: 0.0,
          max: 5.0,
          step: 0.01,
          onChange: (value) => {
            uniforms.uFoamSpeed.value = value;
          },
        },
        uFoamTiling: {
          label: "Scale",
          value: 4.63,
          min: 0.0,
          max: 5.0,
          step: 0.01,
          onChange: (value) => {
            uniforms.uFoamTiling.value = value;
          },
        },
        uFoamDistortion: {
          label: "Distortion",
          value: 1.41,
          min: 0.0,
          max: 5.0,
          step: 0.01,
          onChange: (value) => {
            uniforms.uFoamDistortion.value = value;
          },
        },
      }),

      Intersection: folder({
        uFoamIntersectionFade: {
          label: "Fade",
          value: 0.75,
          min: 0.0,
          max: 1.0,
          step: 0.01,
          onChange: (value) => {
            uniforms.uFoamIntersectionFade.value = value;
          },
        },
        uFoamIntersectionCutoff: {
          label: "Cutoff",
          value: 0.29,
          min: 0.0,
          max: 1.0,
          step: 0.01,
          onChange: (value) => {
            uniforms.uFoamIntersectionCutoff.value = value;
          },
        },
      }),
    }),

    Normals: folder({
      uNormalsScale: {
        label: "Scale",
        value: 0.61,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uNormalsScale.value = value;
        },
      },
      uNormalsSpeed: {
        label: "Speed",
        value: 0.05,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uNormalsSpeed.value = value;
        },
      },
      uNormalsStrength: {
        label: "Strength",
        value: .63,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uNormalsStrength.value = value;
        },
      },
    }),

    Waves: folder({
      uWaveCrestColor: {
        label: "Crest Color",
        value: "#10667c",
        onChange: (value) => {
          uniforms.uWaveCrestColor.value.set(value);
        },
      },
      uWaveFalloff: {
        label: "Crest Blend",
        value: 0.1,
        min: 0.0,
        max: 1.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uWaveFalloff.value = value;
        },
      },
      uWaveSteepness: {
        label: "Steepness",
        value: 0.01,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uWaveSteepness.value = value;
        },
      },
      uWaveLength: {
        label: "Wavelength",
        value: 5.0,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uWaveLength.value = value;
        },
      },
      uWaveSpeed: {
        label: "Speed",
        value: 0.15,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uWaveSpeed.value = value;
        },
      },
      uWaveDirection: {
        label: "Directions (deg)",
        value: [10.0, 20, 30],
        min: 0.0,
        max: 360.0,
        step: 0.01,
        onChange: (value) => {
          uniforms.uWaveDirection.value.x = value[0];
          uniforms.uWaveDirection.value.y = value[1];
          uniforms.uWaveDirection.value.z = value[2];
        },
      },
    }),
  });
}
