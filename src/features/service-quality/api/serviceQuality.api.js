import { request } from "../../../shared/api/httpClient";

/* ========================================
   Fetch service quality reviews
======================================== */

/**
 * Lấy toàn bộ đánh giá dịch vụ thuộc manager.
 *
 * Feature API giữ naming theo domain frontend:
 *
 * service-quality
 * review
 *
 * thay vì để page/component phụ thuộc trực tiếp
 * vào naming legacy:
 *
 * requestRate
 */
export const fetchServiceQualityReviews = async (managerPhone) => {
  if (!managerPhone) {
    throw new Error("Không xác định được tài khoản quản lý.");
  }

  try {
    const response = await request.get("rate/manager", {
      params: {
        managerPhone,
      },

      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};
