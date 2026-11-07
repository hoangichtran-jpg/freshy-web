import { useCallback, useRef, useState } from "react";

import { sendNotificationNow } from "../api";

import {
  DEFAULT_NOTIFICATION_AUDIENCE,
  isValidNotificationAudience,
} from "../constants";

/* ========================================
   Helpers
======================================== */

const normalizeText = (value) => {
  return String(value ?? "").trim();
};

/* ========================================
   Hook
======================================== */

function useNotificationManagement(managerPhone) {
  /* ========================================
     Mutation state
  ======================================== */

  const [sending, setSending] = useState(false);

  /* ========================================
     Duplicate submission guard

     React state alone không đủ nhanh để
     chặn double-click trong cùng frame.
  ======================================== */

  const sendingRef = useRef(false);

  /* ========================================
     Send now
  ======================================== */

  const sendNow = useCallback(
    async ({
      audience = DEFAULT_NOTIFICATION_AUDIENCE,

      title,

      body,
    }) => {
      /*
       * User double-click / double submit.
       */
      if (sendingRef.current) {
        return {
          ok: false,

          skipped: true,

          error: null,
        };
      }

      /* ========================================
           Normalize
        ======================================== */

      const normalizedManagerPhone = normalizeText(managerPhone);

      const normalizedAudience = String(
        audience ?? DEFAULT_NOTIFICATION_AUDIENCE,
      );

      const normalizedTitle = normalizeText(title);

      const normalizedBody = normalizeText(body);

      /* ========================================
           Frontend correctness guards

           Đây không thay backend validation.

           Mục đích:
           không gửi request rõ ràng invalid.
        ======================================== */

      if (!normalizedManagerPhone) {
        return {
          ok: false,

          skipped: false,

          error: new Error("Không xác định được tài khoản quản lý."),
        };
      }

      if (!isValidNotificationAudience(normalizedAudience)) {
        return {
          ok: false,

          skipped: false,

          error: new Error("Nhóm người nhận không hợp lệ."),
        };
      }

      if (!normalizedTitle) {
        return {
          ok: false,

          skipped: false,

          error: new Error("Vui lòng nhập tiêu đề thông báo."),
        };
      }

      if (!normalizedBody) {
        return {
          ok: false,

          skipped: false,

          error: new Error("Vui lòng nhập nội dung thông báo."),
        };
      }

      /* ========================================
           Lock mutation
        ======================================== */

      sendingRef.current = true;

      setSending(true);

      try {
        const data = await sendNotificationNow({
          managerPhone: normalizedManagerPhone,

          audience: normalizedAudience,

          title: normalizedTitle,

          body: normalizedBody,
        });

        return {
          ok: true,

          skipped: false,

          data,

          error: null,

          /*
           * Trả lại normalized payload
           * để presentation layer có thể
           * cập nhật local history sau khi
           * SERVER ĐÃ thành công.
           */
          payload: {
            audience: normalizedAudience,

            title: normalizedTitle,

            body: normalizedBody,
          },
        };
      } catch (error) {
        return {
          ok: false,

          skipped: false,

          error,
        };
      } finally {
        sendingRef.current = false;

        setSending(false);
      }
    },
    [managerPhone],
  );

  /* ========================================
     Public API
  ======================================== */

  return {
    sending,

    sendNow,
  };
}

export default useNotificationManagement;
