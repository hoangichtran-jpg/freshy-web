import { request } from "../../../shared/api/httpClient";

export const createGroupTopping = async (toppingGroup) => {
  try {
    const res = await request.post("topping-group/create", toppingGroup, {
      headers: {
        "Content-Type": "application/json",

        Accept: "*/*",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

export const updateGroupTopping = async (toppingGroup, id) => {
  try {
    const res = await request.put(`topping-group/update/${id}`, toppingGroup, {
      headers: {
        "Content-Type": "application/json",

        Accept: "*/*",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

export const toppingGroupGetAll = async () => {
  try {
    const res = await request.get("topping-group/get-all", {
      headers: {
        "Content-Type": "application/json",

        Accept: "*/*",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

export const updateAndDeleteToppings = async (payload) => {
  try {
    const res = await request.put("topping/update-topping", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    /*
     * Giữ nguyên contract legacy:
     *
     * EditTopping cần res.status
     * nên API này trả nguyên response.
     */
    return res;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};
