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

const notificationHandler = (payload: any) => {
  console.log("Global Capture: Received Notification from native bridge:", payload);
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    window.dispatchEvent(new CustomEvent("nativeNotificationReceived", { detail: data }));
  } catch (e) {
    window.dispatchEvent(new CustomEvent("nativeNotificationReceived", { detail: payload }));
  }
};

(window as any).setFCMToken = fcmHandler;
(window as any).setFcmTokenFromNative = fcmHandler;
(window as any).updateFCMToken = fcmHandler; 
(window as any).onMessageReceived = notificationHandler;
(window as any).onNotificationReceived = notificationHandler;
(window as any).onNativeNotification = notificationHandler;
(window as any).showNotification = notificationHandler;

// Listen for message events (common way for some webview bridges to communicate)
window.addEventListener("message", (event) => {
  if (event.data && (event.data.type === "notification" || event.data.type === "push")) {
    console.log("Global Capture: Received notification via postMessage:", event.data);
    notificationHandler(event.data.payload || event.data);
  }
});
// ------------------------------

createRoot(document.getElementById("root")!).render(<App />);
