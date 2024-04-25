import * as React from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import "./index.css";
import { Water } from "./Water";
// @ts-ignore
import hdr from "../../../Assets/Textures/animestyled_hdr.hdr";
import { Leva, useControls } from "leva";
import {
  EffectComposer,
  N8AO,
  Vignette,
  Autofocus,
} from "@react-three/postprocessing";
// import { Creds } from "./Creds";
import wood from "../../../Assets/Textures/wood.jpg";
import { useTexture } from "@react-three/drei";
import WoodenBox from "./WoodenBox";
import KoiFish from "./KoiComponent";

function Lights() {
  return (
    <>
      <Environment files={hdr} background />
      <hemisphereLight intensity={0.5} color="white" groundColor="#f88" />
      <directionalLight
        color="orange"
        intensity={2}
        // @ts-ignore
        angle={0.3}
        penumbra={1}
        position={[-30, 20, -30]}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={-0.0004}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-40, 40, 40, -40, 1, 1000]}
        />
      </directionalLight>
    </>
  );
}

function Table() {
//   const woodTexture = useTexture(wood);

  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial  color={new THREE.Color(0x99BCBA)} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function Koi() {
  const { blur, AO, PostProcessing } = useControls({
    PostProcessing: {
      value: false,
    },
    blur: {
      value: false,
    },
    AO: {
      value: false,
    },
  });

  // Assuming the water mesh is centered at [0, 0, 0] and has a size of [100, 100]
  const waterSize = { length: 50, width: 50 };
  const waterPosition = [0, 2, 0]; // This should match your water mesh position

  return (
    <>
      <Canvas shadows>
        <PerspectiveCamera position={[0, 60, 40]} fov={40} makeDefault />
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2 - 0.1} // Prevent the camera from going below the horizon (water level)
          minPolarAngle={0} // Prevent the camera from going above the vertical
          minDistance={1} // Minimum distance to the target (prevent zooming in too close)
          maxDistance={100} // Maximum distance from the target (prevent zooming out too far)
        />

        <Lights />

        <Water />
        <KoiFish />
        <Table />
        <WoodenBox position={waterPosition} size={waterSize} />

        {PostProcessing && (
          <EffectComposer>
            <Vignette offset={0.4} darkness={0.4} />
            {AO ? (
              <N8AO aoRadius={20} intensity={8} screenSpaceRadius />
            ) : (
              <></>
            )}
            {blur ? <Autofocus bokehScale={8} focusRange={0.01} /> : <></>}
          </EffectComposer>
        )}
      </Canvas>
      <Leva collapsed />
      {/* <Creds /> */}
    </>
  );
}
