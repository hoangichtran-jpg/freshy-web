import { request } from "./httpClient";

/* ========================================
   Subscribe manager to FCM topic
======================================== */

export const subscribeToPushTopic = async ({ fcmToken, phone }) => {
  try {
    const response = await request.post(
      "manager/subscribe",
      {
        token: fcmToken,

        managerPhone: phone,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error(
      "Push notification registration failed:",
      error?.response || error?.message || error,
    );

    return false;
  }
};
