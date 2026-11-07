import { initializeApp } from "firebase/app";

import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBJNc7N3O5_RwojAP_v0yn41bZ_Un6Dgkc",

  authDomain: "freshy-noti.firebaseapp.com",

  projectId: "freshy-noti",

  storageBucket: "freshy-noti.firebasestorage.app",

  messagingSenderId: "733108231099",

  appId: "1:733108231099:web:23e833a0cb8f6f9d62829e",

  measurementId: "G-K6D4TW11MZ",
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
