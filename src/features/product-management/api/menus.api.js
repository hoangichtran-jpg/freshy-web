import {
  request,
} from "../../../shared/api/httpClient";

/* ========================================
   CRUD menu
======================================== */

export const createMenuByManager = async (menu) => {
  try {
    const res = await request.post("menu/create-menu", menu, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

export const updateMenuByManager = async (menu, menuId) => {
  try {
    const res = await request.put(`menu/update-menu/${menuId}`, menu, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

export const getMenuByManager = async (
  managerPhone,
  { page = 0, size = 10 } = {},
) => {
  const managerPhoneEncoded = encodeURIComponent(managerPhone);

  try {
    const res = await request.get(
      `menu/get-for-manager/${managerPhoneEncoded}`,
      {
        params: {
          page,
          size,
        },

        headers: {
          Accept: "application/json",
        },
      },
    );

    return res.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Menu status
======================================== */

export const changeMenuStatus = async ({
  menuId,
  managerPhone,
  currentStatus,
}) => {
  const managerPhoneEncoded = encodeURIComponent(managerPhone);

  try {
    const res = await request.put(
      [
        "manager-menu/update-isActive",
        `?menuId=${menuId}`,
        `&managerPhone=${managerPhoneEncoded}`,
        `&isActive=${!currentStatus}`,
      ].join(""),
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Assign menu to kitchen
======================================== */

export const addMenuToKitchen = async ({ managerPhone, menuId, posId }) => {
  const managerPhoneEncoded = encodeURIComponent(managerPhone);

  try {
    const res = await request.post(
      [
        "manager-menu/add-to-pos",
        `?managerPhone=${managerPhoneEncoded}`,
        `&menuId=${menuId}`,
        `&posId=${posId}`,
      ].join(""),
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};
