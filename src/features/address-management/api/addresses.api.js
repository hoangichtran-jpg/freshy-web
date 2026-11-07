import {
  request,
} from "../../../shared/api/httpClient";

const ALLOWED_ADDRESS_TYPES = ["NORMAL", "SPECIAL"];

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

/* ========================================
   Managed addresses
======================================== */

export const getAllAddressByManagerPhone = async (managerPhone) => {
  const managerPhoneEncoded = encodeURIComponent(managerPhone);

  try {
    const response = await request.get(
      `address/address-details?managerPhone=${managerPhoneEncoded}`,
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Create address
======================================== */

export const createAddress = async ({
  unit,
  addressName,
  managerPhone,
  addressType = "NORMAL",
}) => {
  const normalizedType = String(addressType).toUpperCase();

  if (!ALLOWED_ADDRESS_TYPES.includes(normalizedType)) {
    throw new Error(
      `Invalid addressType: ${normalizedType}. Allowed: ${ALLOWED_ADDRESS_TYPES.join(
        ", ",
      )}`,
    );
  }

  const payload = {
    unit: unit?.trim(),

    /*
     * Backend dùng field "name".
     */
    name: addressName?.trim(),

    managerPhone,

    addressType: normalizedType,
  };

  try {
    const response = await request.post("address/create", payload, {
      headers: JSON_HEADERS,
    });

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Update address
======================================== */

export const updateAddress = async ({ addressId, unit, addressName }) => {
  const payload = {};

  if (unit !== undefined) {
    payload.unit = unit;
  }

  if (addressName !== undefined) {
    /*
     * Backend dùng field "name".
     */
    payload.name = addressName;
  }

  try {
    const response = await request.put(
      `address/${addressId}/update`,
      payload,
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
   Deactivate address
======================================== */

export const deactivateAddressById = async (addressId) => {
  try {
    const response = await request.put(
      `address/${addressId}/deactivate`,
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
