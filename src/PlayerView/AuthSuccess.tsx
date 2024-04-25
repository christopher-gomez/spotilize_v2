import * as React from "react";
import CountdownTimer from "../Components/CountdownTimer.tsx";
import { useNavigate } from "react-router-dom";
import { RouteMenuButton } from "../Components/RoutesView.tsx";
import LoadSpinner from "../Components/LoadSpinner.tsx";

export default () => {
  const [authorizing, setAuthorizing] = React.useState(true);
  const [gotToken, setGotToken] = React.useState(false);

  let navigate = useNavigate();
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");

    const handleAuthorize = async () => {
      try {
        const response = await fetch(
          "https://spotilize.uc.r.appspot.com/spotify/authorize",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: authCode,
              app: "CloudPlayer",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Network response was not ok ${response.statusText}`);
        }

        const data = await response.json();

        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
          setGotToken(true);
        }

        setAuthorizing(false);

        return data.access_token;
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (authCode && !gotToken) {
      handleAuthorize();
    } else {
    }
  }, []);

  const timeoutRef = React.useRef<number | undefined>();

  React.useEffect(() => {
    if (!authorizing) {
      timeoutRef.current = window.setTimeout(() => {
        navigate("/");
      }, 5000);
    }
  }, [authorizing]);

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  if (authorizing) return <LoadSpinner hasBackground={true} loading={true} />;

  return (
    <div>
      <h1>Success!</h1>
      {/* <p>Click the link to redirect</p> */}
      <RouteMenuButton to="/">Go to music player</RouteMenuButton>
      {/* <p>You can close this tab now.</p> */}
      <br />
      <br />
      <p>This page will automatically redirect in: </p>
      <CountdownTimer seconds={5} />
    </div>
  );
};
