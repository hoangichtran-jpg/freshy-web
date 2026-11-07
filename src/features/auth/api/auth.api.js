import { request } from "../../../shared/api/httpClient";

/* ========================================
   Manager login
======================================== */

export const loginManager = async ({ phoneNumber, password }) => {
  try {
    const response = await request.post(
      "auth/authenticate",
      {
        phoneNumber,
        password,
      },
      {
        /*
         * Login là public request.
         *
         * Không inject access token cũ
         * và không trigger refresh nếu
         * backend trả 401.
         */
        skipAuth: true,

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
