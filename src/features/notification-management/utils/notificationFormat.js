/* ========================================
   Sent time

   History timestamp hiện được tạo bởi
   browser sau khi API send thành công.

   Vì vậy formatter dùng timezone local
   của thiết bị đang mở manager web.
======================================== */

export const formatNotificationSentAt = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Không xác định";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",

    month: "2-digit",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  }).format(date);
};
