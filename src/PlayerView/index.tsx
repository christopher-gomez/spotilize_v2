/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import RoutesView from "../Components/RoutesView.tsx";
import LoadSpinner from "../Components/LoadSpinner.tsx";
import AnimationManager from "../utils/AnimationManager.ts";
import { SpotifyAudioAnalysisResponse } from "../Spotify/index.ts";
import SpotifyPlayer, {
  ISpotifyPlayer,
  ISpotifyState,
  PLAYER_CONTROLS_ZINDEX as PLAYER_CONTROLS_ZINDEX,
} from "../Spotify/PlayerComponent.tsx";
import Dropdown from "../Components/Dropdown.tsx";
// import Cards from "./Cards";
import Shader from "./Shader.tsx";
import "./index.css";
import VideoCrossfader from "./VideoCrossfader.tsx";
import Capsules from "./Capsules.tsx";
// import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import InactivityFader from "../Components/InactivityFader.tsx";
import Particles from "./WebGL/Particles";
import Koi from "./WebGL/Koi/index.tsx";

export default () => {
  const [authenticateOpen, setAuthenticateOpen] = React.useState<boolean>(true);

  const [link, setLink] = React.useState(null);

  const [bgLoaded, setBgLoaded] = React.useState(false);

  const handleRefreshToken = async () => {
    try {
      const response = await fetch(
        "https://spotilize.uc.r.appspot.com/spotify/access_token/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: localStorage.getItem("refresh_token"),
            app: "CloudPlayer",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.access_token;
      } else {
        localStorage.removeItem("refresh_token");
        setAuthenticateOpen(true);
        throw new Error("Could not refresh");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLink = async () => {
    try {
      const response = await fetch(
        "https://spotilize.uc.r.appspot.com/spotify/link",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            app: "CloudPlayer",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.statusText}`);
      }

      const data = await response.json();

      setLink(data.link);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [tokenFunc, setTokenFunc] = useState<(() => Promise<string>) | null>(
    null
  );

  React.useEffect(() => {
    if (localStorage.getItem("refresh_token")) {
      setAuthenticateOpen(false);
      setTokenFunc(() => handleRefreshToken);
    } else if (link === null) {
      handleLink();
    }
  }, [bgLoaded]);

  const [playerReady, setPlayerReady] = React.useState(false);

  const [playerState, setPlayerState] = React.useState<ISpotifyState | null>(
    null
  );

  const playerStateRef = React.useRef(playerState);
  const [player, setPlayer] = useState<ISpotifyPlayer | null>(null);
  const playerRef = useRef<ISpotifyPlayer | null>(null);
  useEffect(() => {
    if (player) playerRef.current = player;
  }, [player]);

  const [hasChangedTokenFuncs, setHasChangedTokenFuncs] = useState(false);

  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  useEffect(() => {
    if (playerReady && !hasChangedTokenFuncs) {
      setHasChangedTokenFuncs(true);
    }
  }, [playerReady]);

  useEffect(() => {
    if (hasChangedTokenFuncs) {
      setTokenFunc(() => handleRefreshToken);
    }
  }, [hasChangedTokenFuncs]);

  const [shouldRenderControls, setShouldRenderControls] = React.useState(true);
  const [shouldRenderMenus, setShouldRenderMenus] = React.useState(false);
  const shouldRenderMenusRef = React.useRef(shouldRenderMenus);

  useEffect(() => {
    shouldRenderMenusRef.current = shouldRenderMenus;
    setShouldRenderControls(!shouldRenderMenus);
  }, [shouldRenderMenus]);

  const [animManager, setAnimManager] = React.useState<AnimationManager | null>(
    null
  );

  useEffect(() => {
    if (animManager) {
      setBgLoaded(true);
    }
  }, [animManager]);

  const [currentAnalysis, setCurrentAnalysis] =
    useState<SpotifyAudioAnalysisResponse>(null);
  const currentAnalysisRef = useRef<SpotifyAudioAnalysisResponse>(null);

  useEffect(() => {
    if (currentAnalysis) currentAnalysisRef.current = currentAnalysis;
  }, [currentAnalysis]);

  const bgLoadedRef = useRef(bgLoaded);
  useEffect(() => {
    bgLoadedRef.current = bgLoaded;
  }, [bgLoaded]);

  const [visualizer, setVisualizer] = useState<
    "shader" | "video" | "capsules" | "particles" | "koi"
  >("capsules");
  const envTypeChangedTORef = useRef<number | undefined>();
  const [canLoadView, setCanLoadView] = useState(false);

  useEffect(() => {
    window.clearTimeout(envTypeChangedTORef.current);

    setBgLoaded(false);
    setCanLoadView(false);

    envTypeChangedTORef.current = window.setTimeout(() => {
      setCanLoadView(true);
      if (
        visualizer === "video" ||
        visualizer === "capsules" ||
        visualizer === "koi"
      )
        setBgLoaded(true);
    }, 1000);

    return () => {
      window.clearTimeout(envTypeChangedTORef.current);
    };
  }, [visualizer]);

  const envTypes: Array<"shader" | "video" | "capsules" | "particles" | "koi"> =
    [
      "capsules",
      "shader",
      "particles",
      "koi",
      // "video",
    ];

  const _envToggles: Array<{ label: string; onClick: () => void }> =
    envTypes.map((env) => ({
      label: env.toUpperCase(),
      onClick: () => setVisualizer(env),
    }));

  const envToggles = _envToggles.filter(
    (t) => t.label !== visualizer.toUpperCase()
  );

  const [displayPlayerControls, setDisplayPlayerControls] = useState(true);

  return (
    <div className="App" style={{ zIndex: PLAYER_CONTROLS_ZINDEX + 1 }}>
      {/* {visualizer === "card" &&
        bgLoaded &&
        beatLights &&
        beatLights.length === analysisFeatures.length && (
          <Cards objs={beatLights} />
        )} */}
      {visualizer === "shader" && canLoadView && (
        <Shader
          onLoad={() => setBgLoaded(true)}
          currentAnalysis={currentAnalysis}
          player={player!}
        />
      )}
      {visualizer === "particles" && canLoadView && (
        // <Particles
        //   canvas2D={undefined}
        //   onWebGLUnavailable={undefined}
        //   onSceneCreated={setBgLoaded(true)}
        // />
        <></>
      )}
      {visualizer === "video" && canLoadView && <VideoCrossfader videos={[]} />}
      {visualizer === "capsules" && canLoadView && (
        <Capsules
          trackAnalysis={currentAnalysis}
          player={player!}
          togglePlayerControls={(toggled?: boolean) => {
            if (toggled !== undefined) setDisplayPlayerControls(toggled);
            else setDisplayPlayerControls(!displayPlayerControls);
          }}
        />
      )}
      {visualizer === "koi" && canLoadView && <Koi />}
      <>
        {authenticateOpen === false && (
          <InactivityFader>
            <div
              id="cloud-player-top-sticky-buttons"
              style={{
                zIndex: PLAYER_CONTROLS_ZINDEX + 2,
                position: "fixed",
                top: 20,
                left: 10,
                right: 20,
                display: "flex",
                justifyContent: "flex-end",
                pointerEvents:
                  bgLoaded && shouldRenderControls ? "all" : "none",
                opacity: bgLoaded && shouldRenderControls ? 1 : 0,
                transition: "opacity 1s",
              }}
            >
              <Dropdown
                toggleText={visualizer.toUpperCase()}
                options={envToggles}
              />
              {/* <TextCarousel texts={envToggles.map(e => e.label)}/> */}
            </div>
          </InactivityFader>
        )}
        {authenticateOpen === true && (
          <RoutesView
            overlayBlur={true}
            overlayBackground={true}
            containerBackground={true}
            containerBlur={true}
            title="Spotilize"
            defaultDescription={"An audio visualizer for Spotify."}
            loading={link === null}
            routes={
              link !== null
                ? [
                    {
                      description: "Log in with Spotify",
                      label: "Log In",
                      href: link,
                      newTab: false,
                    },
                  ]
                : undefined
            }
          />
        )}
        {tokenFunc !== null && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              pointerEvents: bgLoaded ? "all" : "none",
              opacity: bgLoaded && playerReady ? 1 : 0,
            }}
          >
            <SpotifyPlayer
              displayControls={displayPlayerControls}
              onPlayer={(p) => {
                if (p !== undefined) {
                  setPlayer(p);
                  // console.log("on player");
                }
              }}
              tokenFetch={tokenFunc}
              onPlayerReady={(ready) => {
                // console.log("On Player Ready", ready);
                setPlayerReady(ready);
              }}
              onPlayerStateChange={(state) => setPlayerState(state)}
              shouldRenderControls={shouldRenderControls}
              onCurrentTrackAnalyzed={(data) => {
                // console.log("on Current Track Analyzed");
                setCurrentAnalysis(data);
                // console.log(data);
              }}
            />
          </div>
        )}
        {playerReady && (
          <div
            className="cloud-player container"
            style={{
              zIndex: 1,
              pointerEvents: bgLoaded ? "all" : "none",
              opacity: bgLoaded ? 1 : 0,
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                position: "absolute",
                top: "2em",
                flexFlow: "column",
              }}
            >
              <div className="track-info-text">
                <div
                  style={{
                    opacity: !shouldRenderMenus && playerState?.track ? 1 : 0,
                    transition: "opacity 2s",
                    color: "white",
                    pointerEvents: shouldRenderMenus ? "none" : "all",
                  }}
                >
                  <small
                    style={{
                      fontWeight: "bolder",
                      marginLeft: "-1em",
                      textDecoration: "underline solid white 1px",
                      textShadow: "none",
                      color: "white",
                    }}
                  >
                    {playerState?.isPaused ? "Paused" : "Now Playing"}
                  </small>
                  <h1
                    style={{
                      marginTop: 0,
                      marginBottom: 0,
                      color: "white",
                    }}
                  >
                    {playerState?.track?.trackTitle}
                  </h1>
                  <h2 style={{ marginTop: 0, color: "white" }}>
                    {playerState?.track?.trackArtist}
                  </h2>
                </div>
              </div>
            </div>

            {/* {shouldRenderMenus && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(0,0,0,.25)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {playerState?.track && (
                    <HoverCardMenu menus={menus} curMenu={curMenu} />
                    // <HoverCard
                    //   canRotate={false}
                    //   open
                    //   mediaWindowStyle="cover"
                    //   orient="horizontal"
                    //   title={playerState.track.trackTitle}
                    //   body={playerState.track.trackArtist}
                    //   image={
                    //     currentTrackInfo?.album?.images[0]?.url ?? undefined
                    //   }
                    //   animationManager={animManager}
                    // />
                  )}
                </div>
              )} */}
          </div>
        )}
      </>
      <LoadSpinner
        loading={
          (authenticateOpen === true && link === null) ||
          (authenticateOpen === false &&
            (playerReady === false || bgLoaded === false))
        }
        hasBackground={true}
      />
    </div>
  );
};
