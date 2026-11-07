import {
  request,
} from "../../../shared/api/httpClient";

export { getAgenciesByPhone } from "../../../shared/api/manager.api";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

/* ========================================
   Delete agency
======================================== */

export const removeAgency = async (phoneNumber) => {
  try {
    const response = await request.put(
      "agency/delete-agency",
      {},
      {
        params: {
          phoneNumber,
        },

        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};
