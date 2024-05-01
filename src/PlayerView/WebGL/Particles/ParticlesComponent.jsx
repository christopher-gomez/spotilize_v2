import * as React from "react";
import { useRef, useEffect } from "react";
import Scene from "./fractalScene.js";

export default ({
  canvas2D = undefined,
  // dontUse2D = true,
  // onWebGLUnavailable = undefined,
  onSceneCreated,
  // shouldRender = true,
  // usePostProcessing = true,
  // xDriftFactor = 0,
  // yDriftFactor = 0,
  // noiseScale = 0,
  // distortion = 0,
  player,
  trackAnalysis,
}) => {
  const canvas3DRef = React.useRef(null);
  const scene = useRef(new Scene());

  // useEffect(() => {
  //   scene.current.setParams(
  //     xDriftFactor,
  //     yDriftFactor,
  //     noiseScale,
  //     distortion,
  //     shouldRender,
  //     usePostProcessing
  //   );
  // }, [
  //   xDriftFactor,
  //   yDriftFactor,
  //   noiseScale,
  //   distortion,
  //   shouldRender,
  //   usePostProcessing,
  // ]);

  useEffect(() => {
    if (scene.current) scene.current.setTrackAnalysis(trackAnalysis);
  }, [trackAnalysis]);

  useEffect(() => {
    if (!canvas3DRef.current) {
      // onWebGLUnavailable();
    }

    if (canvas3DRef.current) {
      const gl = canvas3DRef.current.getContext("webgl2");
      if (!gl) {
        // onWebGLUnavailable();
        return;
      }
    }
  }, [canvas3DRef.current]);

  const timeout = useRef(null);

  useEffect(() => {
    if (!canvas3DRef.current) {
      return;
    }

    if (canvas3DRef.current && player !== null) {
      window.clearTimeout(timeout.current);
      const gl = canvas3DRef.current.getContext("webgl2");
      if (!gl) {
        return;
      }

      timeout.current = window.setTimeout(() => {
        // if (canvas2D || dontUse2D) {
        scene.current.dispose();
        scene.current.initScene(canvas2D, canvas3DRef.current, onSceneCreated, player);
        // }
      }, 1000);
    }

    return () => {
      // dispose
      window.clearTimeout(timeout.current);
      scene.current.dispose();
    };
  }, [canvas3DRef.current, player]);

  useEffect(() => {
    return () => {
      // dispose
      window.clearTimeout(timeout.current);
      scene.current.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvas3DRef}
        id="canvas3D"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0)",
          // display: shouldRender ? "block" : "none",
        }}
      ></canvas>
    </>
  );
};
