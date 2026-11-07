import {
  request,
} from "../../../shared/api/httpClient";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

/* ========================================
   Assign address to POS
======================================== */

export const assignAddressToPos = async ({ posId, agencyAddressFee }) => {
  try {
    /*
     * Endpoint này cũng được User Management
     * sử dụng nhưng với contract khác.
     *
     * Address Management:
     *
     * POST pos-agency/assign
     *
     * body:
     * {
     *   posId,
     *   agencyAddressFee: {
     *     agencyAddressId,
     *     feeShip
     *   }
     * }
     */
    const response = await request.post(
      "pos-agency/assign",
      {
        posId,
        agencyAddressFee,
      },
      {
        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   POS addresses
======================================== */

export const getPosAddresses = async ({ posId }) => {
  try {
    const response = await request.get(`pos-agency/get-list-address/${posId}`);

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Deactivate assignment
======================================== */

export const deactivatePosAddressAssignment = async ({ posAgencyId }) => {
  try {
    const response = await request.put(
      `pos-agency/deactivate/${posAgencyId}`,
      {},
      {
        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Update shipping fee
======================================== */

export const updatePosAddressShippingFee = async ({
  posAgencyId,
  newFeeShip,
}) => {
  try {
    const response = await request.put(
      `pos-agency/update-feeship/${posAgencyId}?newFeeShip=${encodeURIComponent(
        newFeeShip,
      )}`,
      {},
      {
        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};
