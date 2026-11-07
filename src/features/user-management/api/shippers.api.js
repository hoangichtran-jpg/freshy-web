import {
  request,
} from "../../../shared/api/httpClient";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

/* ========================================
   Managed shippers
======================================== */

export const getShippersByPhone = async (phoneNumber) => {
  try {
    const response = await request.get("manager/shippers-by-phone", {
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
   Delete shipper
======================================== */

export const removeShipper = async (phoneNumber) => {
  try {
    const response = await request.delete("shipper/delete-shipper", {
      params: {
        phoneNumber,
      },

      headers: JSON_HEADERS,
    });

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};
