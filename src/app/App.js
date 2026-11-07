import { useEffect } from "react";

import { messaging, getToken, onMessage } from "../firebase";

import toast from "../shared/components/AppToast";

import "../styles/global.scss";

import AppRouter from "./routes/AppRouter";

function App() {
  /* ========================================
     Firebase foreground notifications
  ======================================== */

  useEffect(() => {
    let unsubscribeMessage;

    let cancelled = false;

    const initFCM = async () => {
      if (!("serviceWorker" in navigator)) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );

        if (cancelled) {
          return;
        }

        const permission = await Notification.requestPermission();

        if (cancelled) {
          return;
        }

        if (permission === "granted") {
          /*
           * FCM token là credential-like
           * application data.
           *
           * Không log token ra console.
           *
           * Việc register token với backend
           * sẽ được đưa về notification/session
           * architecture ở step sau.
           */
          await getToken(messaging, {
            vapidKey:
              "BG9GUIuvy4bfrsN3-1H90loZKPJ7nnswQLVXlpWgkZyr0O8x7aOYPNYKthJexIdc1IOnEto1C8mGyd6nhGT0-ig",

            serviceWorkerRegistration: registration,
          });
        }

        /* ========================================
             Foreground notification
          ======================================== */

        unsubscribeMessage = onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || payload.data || {};

          const notificationAudio = new Audio("/sounds/notification.mp3");

          notificationAudio.play().catch(() => {
            /*
             * Browser có thể chặn autoplay.
             *
             * Notification vẫn phải hoạt động
             * dù audio không phát được.
             */
          });

          toast.info({
            message: title || "Thông báo",

            description: body || "Bạn có thông báo mới!",

            duration: 2,
          });
        });
      } catch (error) {
        /*
         * FCM không phải dependency bắt buộc
         * để render toàn bộ application.
         *
         * Không crash app nếu notification
         * initialization thất bại.
         */
        console.error("Unable to initialize notifications:", error);
      }
    };

    initFCM();

    return () => {
      cancelled = true;

      if (typeof unsubscribeMessage === "function") {
        unsubscribeMessage();
      }
    };
  }, []);

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="app">
      <AppRouter />
    </div>
  );
}

export default App;
