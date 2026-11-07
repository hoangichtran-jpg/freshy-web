/* ========================================
   Notification audience

   Backend hiện nhận field:
   type

   Legacy frontend đang dùng:
   1 → toàn bộ
   2 → thực khách
   3 → đại lý
   4 → bếp
   5 → giao hàng

   Đây vẫn là contract cần backend confirm.
   PROJECT_BACKLOG.md có note riêng.
======================================== */

export const NOTIFICATION_AUDIENCE = Object.freeze({
  ALL: "1",

  CUSTOMER: "2",

  AGENCY: "3",

  KITCHEN: "4",

  DELIVERY: "5",
});

/* ========================================
   Audience options

   Đây là source of truth duy nhất cho UI.

   Không viết lại switch(role) ở table,
   modal, filter...
======================================== */

export const NOTIFICATION_AUDIENCE_OPTIONS = Object.freeze([
  {
    value: NOTIFICATION_AUDIENCE.ALL,

    label: "Toàn bộ hệ thống",
  },

  {
    value: NOTIFICATION_AUDIENCE.CUSTOMER,

    label: "Thực khách",
  },

  {
    value: NOTIFICATION_AUDIENCE.AGENCY,

    label: "Đại lý",
  },

  {
    value: NOTIFICATION_AUDIENCE.KITCHEN,

    label: "Bếp",
  },

  {
    value: NOTIFICATION_AUDIENCE.DELIVERY,

    label: "Giao hàng",
  },
]);

/* ========================================
   Default audience

   Legacy bug:

   role: "all"

   trong khi backend contract hiện tại
   dùng "1".

   Feature mới dùng đúng value ngay từ đầu.
======================================== */

export const DEFAULT_NOTIFICATION_AUDIENCE = NOTIFICATION_AUDIENCE.ALL;

/* ========================================
   Helpers
======================================== */

export const isValidNotificationAudience = (value) => {
  return NOTIFICATION_AUDIENCE_OPTIONS.some(
    (option) => option.value === String(value ?? ""),
  );
};

export const getNotificationAudienceLabel = (value) => {
  const normalizedValue = String(value ?? "");

  const option = NOTIFICATION_AUDIENCE_OPTIONS.find(
    (item) => item.value === normalizedValue,
  );

  return option?.label || "Không xác định";
};
