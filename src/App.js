/* eslint-disable */

import React from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./Router";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDv6-F5maApdmBtBO8qTUdtEL_1mkaNYIg",
  authDomain: "spotilizev2.firebaseapp.com",
  projectId: "spotilizev2",
  storageBucket: "spotilizev2.appspot.com",
  messagingSenderId: "683748491372",
  appId: "1:683748491372:web:cb9a7ff8a6262d7f0bd849",
  measurementId: "G-589L1LKMYD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const App = () => {
  const disconnectPlayer = () => {
    //@ts-ignore
    if (window.spotifyPlayer) {
      console.log("attempting disconnect");
      //@ts-ignore
      window.spotifyPlayer.disconnect();
    }
  };

  React.useEffect(() => {    
    if (window.spotifyPlayer) {
      window.addEventListener("loadstart", disconnectPlayer);
      window.addEventListener("beforeunload", disconnectPlayer);
    }

    return () => {
      window.removeEventListener("loadstart", disconnectPlayer);
      window.removeEventListener("beforeunload", disconnectPlayer);
    };
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
