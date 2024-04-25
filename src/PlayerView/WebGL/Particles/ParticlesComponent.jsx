import React, { useEffect, useRef } from "react";
import Scene from "./fractalScene";

export default ({
  canvas2D,
  dontUse2D = true,
  onWebGLUnavailable,
  onSceneCreated,
  shouldRender = true,
  usePostProcessing = true,
  xDriftFactor = 0,
  yDriftFactor = 0,
  noiseScale = 0,
  distortion = 0,
}) => {
  const canvas3DRef = React.useRef(null);
  const scene = useRef(new Scene());

  useEffect(() => {
    scene.current.setParams(
      xDriftFactor,
      yDriftFactor,
      noiseScale,
      distortion,
      shouldRender,
      usePostProcessing
    );
  }, [
    xDriftFactor,
    yDriftFactor,
    noiseScale,
    distortion,
    shouldRender,
    usePostProcessing,
  ]);

  useEffect(() => {
    if (!canvas3DRef.current) {
      onWebGLUnavailable();
    }

    if (canvas3DRef.current) {
      const gl = canvas3DRef.current.getContext("webgl2");
      if (!gl) {
        onWebGLUnavailable();
      }
    }
  }, [canvas3DRef.current]);

  useEffect(() => {
    if (!canvas3DRef.current) {
      return;
    }

    if (canvas3DRef.current) {
      const gl = canvas3DRef.current.getContext("webgl2");
      if (!gl) {
        return;
      }

      if (canvas2D || dontUse2D) {
        console.log('creating scene')
        scene.current.dispose();
        scene.current.initScene(canvas2D, canvas3DRef.current, onSceneCreated);
      }
    }

    return () => {
      // dispose
      scene.current.dispose();
    };
  }, [canvas2D, canvas3DRef.current, dontUse2D]);

  useEffect(() => {
    return () => {
      // dispose
      scene.current.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvas3DRef}
        id="canvas3D"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0)',
          display: shouldRender ? "block" : "none",
        }}
      ></canvas>
    </>
  );
};
