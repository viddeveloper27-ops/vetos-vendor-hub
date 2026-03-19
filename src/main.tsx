import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// --- Flutter Bridge Handlers ---
// Define these globally as early as possible so that even if Flutter injects
// the token before the React app is fully hydrated, we don't miss it.
const fcmHandler = (token: string) => {
  console.log("Global Capture: Received FCM Token from native bridge:", token);
  localStorage.setItem("pending_fcm_token", token);
  window.dispatchEvent(new CustomEvent("fcmTokenReceived", { detail: token }));
};

(window as any).setFCMToken = fcmHandler;
(window as any).setFcmTokenFromNative = fcmHandler;
(window as any).updateFCMToken = fcmHandler; // Common alias for some libraries
// ------------------------------

createRoot(document.getElementById("root")!).render(<App />);
