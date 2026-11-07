import { request } from "../../../shared/api/httpClient";

/* ========================================
   Send immediately

   Current backend contract chỉ chứng minh:
   - managerPhone
   - type
   - title
   - body

   Không đưa scheduling vào đây khi backend
   chưa có scheduling contract thật.
======================================== */

export const sendNotificationNow = async ({
  managerPhone,
  audience,
  title,
  body,
}) => {
  try {
    const response = await request.post(
      "sendToGroupUser",
      {},
      {
        params: {
          managerPhone,

          type: audience,

          title,

          body,
        },

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};
