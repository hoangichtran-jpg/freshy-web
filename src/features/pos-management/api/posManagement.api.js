import { request } from "../../../shared/api/httpClient";

/* ========================================
   List
======================================== */

export const getManagedPosList = async (managerPhone) => {
  try {
    const response = await request.get("manager/pos-info", {
      params: {
        phone: managerPhone,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

/* ========================================
   Create
======================================== */

export const createPos = async (managerPhone, data) => {
  try {
    const response = await request.post("pos/create", data, {
      params: {
        managerPhone,
      },

      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

/* ========================================
   Update
======================================== */

export const updatePos = async (posId, data) => {
  try {
    const response = await request.put(`pos/update-pos/${posId}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

/* ========================================
   Deactivate
======================================== */

export const deactivatePos = async (posName) => {
  try {
    const response = await request.put(
      `pos/${encodeURIComponent(posName)}/deactivate`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};
