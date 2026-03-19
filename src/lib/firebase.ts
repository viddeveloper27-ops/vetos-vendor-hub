import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDghbp0khgqvvJJHHQsNjf1wirOXhPiGwQ",
  authDomain: "dogsandjoys-37499.firebaseapp.com",
  projectId: "dogsandjoys-37499",
  storageBucket: "dogsandjoys-37499.appspot.com",
  messagingSenderId: "576016011046",
  appId: "1:576016011046:web:f40f15f761acd2cfa0fbe7",
  measurementId: "G-68D47GCD5S"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.info("Standard Web Push not supported (expected in WebView). Native token injection will be used instead.");
    return null;
  }
  try {
    const currentToken = await getToken(messaging, {
      // Please provide your real VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web Configuration
      // vapidKey: "YOUR_VAPID_KEY_HERE", 
    });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("On Message Listener:", payload);
      resolve(payload);
    });
  });
