importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDghbp0khgqvvJJHHQsNjf1wirOXhPiGwQ",
  authDomain: "dogsandjoys-37499.firebaseapp.com",
  projectId: "dogsandjoys-37499",
  storageBucket: "dogsandjoys-37499.appspot.com",
  messagingSenderId: "576016011046",
  appId: "1:576016011046:web:f40f15f761acd2cfa0fbe7",
  measurementId: "G-68D47GCD5S"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
