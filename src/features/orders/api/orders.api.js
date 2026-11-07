import { request } from "../../../shared/api/httpClient";

/* ========================================
   Get orders by status
======================================== */

export const getOrdersByStatus = async (status, posIds) => {
  try {
    const response = await request.post(`orders/manager/${status}`, posIds, {
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
   Change order status
======================================== */

export const changeOrderStatus = async (orderId, status) => {
  try {
    const response = await request.post(
      `orders/change-status?orderId=${orderId}&status=${status}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",

          Accept: "*/*",
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
   Send order to POS
======================================== */

export const sendOrderToPos = async (orderId, shipperPhone) => {
  try {
    const response = await request.post(
      "orders/send-to-pos",
      {
        orderId,
        shipperPhone,
      },
      {
        headers: {
          "Content-Type": "application/json",

          Accept: "*/*",
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
   Update order
======================================== */

export const updateOrder = async (orderId, updatedFields) => {
  try {
    const response = await request.put(
      `orders/${orderId}/update`,
      updatedFields,
      {
        headers: {
          "Content-Type": "application/json",

          Accept: "*/*",
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
   Cancel order request
======================================== */

export const cancelOrderRequest = async (requestId, customerPhone) => {
  try {
    const response = await request.post(`/request/${requestId}/status`, null, {
      params: {
        status: "CANCELED",

        customerPhone,
      },

      headers: {
        "Content-Type": "application/json",
      },
    });

    /*
     * Giữ nguyên contract cũ của
     * updateRequestStatus:
     *
     * trả nguyên Axios response,
     * không phải response.data.
     */
    return response;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};
