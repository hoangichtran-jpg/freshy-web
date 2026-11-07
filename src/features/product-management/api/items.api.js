import { request } from "../../../shared/api/httpClient";

/* ========================================
   Create item
======================================== */

export const createItem = async (item, file) => {
  try {
    const formData = new FormData();

    formData.append(
      "dto",
      JSON.stringify({
        name: item.name || "string",

        taPrice: item.taPrice || 0,

        otsPrice: item.otsPrice || 0,

        text: item.text || "string",

        /*
         * Existing behavior is intentionally
         * preserved for now.
         *
         * NOTE:
         * `item.isActive || true`
         * makes false become true.
         *
         * This is a separate behavior bug,
         * not part of the current
         * architecture cleanup.
         */
        isActive: item.isActive || true,

        managerPhone: item.managerPhone || "string",

        toppingGroupIds: item.toppingGroupIds || [78, 79],
      }),
    );

    formData.append("file", file);

    const response = await request.post(
      "item-topping-groups/create-item",
      formData,
      {
        headers: {
          Accept: "*/*",

          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Update item
======================================== */

export const updateItem = async (item, file) => {
  try {
    const formData = new FormData();

    formData.append(
      "dto",
      JSON.stringify({
        name: item.name || "",

        taPrice: item.taPrice || 0,

        otsPrice: item.otsPrice || 0,

        text: item.text || "",

        isActive: item.isActive ?? true,

        managerPhone: item.managerPhone || "",

        toppingGroupIds: item.toppingGroupIds || [],
      }),
    );

    if (file) {
      formData.append("file", file);
    }

    const response = await request.put(
      `item-topping-groups/update-item/${item.itemId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Deactivate item
======================================== */

export const deactivateItem = async (name) => {
  try {
    const response = await request.post(
      "item/deactivate",
      {
        name,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Get active items
======================================== */

export const getItemActive = async () => {
  try {
    const response = await request.get("item/active", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};
