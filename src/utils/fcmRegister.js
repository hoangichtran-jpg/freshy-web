import { getToken, messaging } from "../firebase";

import { subscribeToPushTopic } from "../shared/api/pushNotifications.api";

/* ========================================
   Register browser FCM token
======================================== */

export const registerFCMToken = async ({ phone }) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("Notification permission not granted.");

      return false;
    }

    const swReg = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    const fcmToken = await getToken(messaging, {
      vapidKey:
        "BG9GUIuvy4bfrsN3-1H90loZKPJ7nnswQLVXlpWgkZyr0O8x7aOYPNYKthJexIdc1IOnEto1C8mGyd6nhGT0-ig",

      serviceWorkerRegistration: swReg,
    });

    if (!fcmToken) {
      console.warn("FCM token is unavailable.");

      return false;
    }

    const subscribed = await subscribeToPushTopic({
      fcmToken,
      phone,
    });

    if (!subscribed) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error registering FCM token:", error);

    return false;
  }
};
