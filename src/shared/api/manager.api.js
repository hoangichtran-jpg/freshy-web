import { request } from "./httpClient";

/* ========================================
   Agencies managed by current manager
======================================== */

export const getAgenciesByPhone = async (phoneNumber) => {
  try {
    const response = await request.get("manager/agencies-by-phone", {
      params: {
        phoneNumber,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};

/* ========================================
   POS / kitchens managed by current user
======================================== */

export const getPosInfo = async (phone) => {
  const encodedPhone = encodeURIComponent(phone);

  try {
    const response = await request.get(
      `manager/pos-info?phone=${encodedPhone}`,
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};
