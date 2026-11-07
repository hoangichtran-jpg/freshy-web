import { request } from "./httpClient";

/* ========================================
   Register account
======================================== */

export const registerAccount = async (formData) => {
  try {
    const response = await request.post("auth/register", formData, {
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

/* ========================================
   Get user information
======================================== */

export const getUserInfo = async (phoneNumber, role) => {
  const encodedPhone = encodeURIComponent(phoneNumber);

  try {
    const response = await request.get(
      `user/info?phoneNumber=${encodedPhone}&role=${role}`,
      {
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

/* ========================================
   Update user profile
======================================== */

export const updateUserProfile = async (phoneNumber, profile) => {
  try {
    const response = await request.put("user/update", profile, {
      params: {
        phoneNumber,
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
