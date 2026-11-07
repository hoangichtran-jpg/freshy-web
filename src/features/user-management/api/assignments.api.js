import {
  request,
} from "../../../shared/api/httpClient";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const normalizePosId = (posId) => {
  const normalized = Number(posId);

  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new Error("POS ID không hợp lệ.");
  }

  return normalized;
};

/* ========================================
   Agency ↔ POS
======================================== */

export const addPosForAgency = async (agencyPhone, posId) => {
  if (!agencyPhone) {
    throw new Error("Không xác định được số điện thoại đại lý.");
  }

  const normalizedPosId = normalizePosId(posId);

  const encodedPhone = encodeURIComponent(agencyPhone);

  try {
    const response = await request.post(
      `pos-agency/assign?posIds=${normalizedPosId}&agencyPhone=${encodedPhone}`,
      {},
      {
        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};

export const removePosForAgency = async (agencyPhone, posId) => {
  if (!agencyPhone) {
    throw new Error("Không xác định được số điện thoại đại lý.");
  }

  const normalizedPosId = normalizePosId(posId);

  const encodedPhone = encodeURIComponent(agencyPhone);

  try {
    const response = await request.post(
      `pos-agency/remove?posId=${normalizedPosId}&agencyPhone=${encodedPhone}`,
      {},
      {
        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};

/* ========================================
   Shipper ↔ POS
======================================== */

export const addPosForShipper = async (shipperPhone, posId) => {
  if (!shipperPhone) {
    throw new Error("Không xác định được số điện thoại giao hàng.");
  }

  const normalizedPosId = normalizePosId(posId);

  const encodedPhone = encodeURIComponent(shipperPhone);

  try {
    /*
     * Backend hiện dùng query param
     * "agencyPhone" kể cả endpoint shipper.
     *
     * Không đổi thành shipperPhone nếu chưa
     * có backend contract xác nhận.
     */
    const response = await request.post(
      `pos-shipper/assign?posId=${normalizedPosId}&agencyPhone=${encodedPhone}`,
      {},
      {
        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};

export const removePosForShipper = async (shipperPhone, posId) => {
  if (!shipperPhone) {
    throw new Error("Không xác định được số điện thoại giao hàng.");
  }

  const normalizedPosId = normalizePosId(posId);

  const encodedPhone = encodeURIComponent(shipperPhone);

  try {
    /*
     * Giữ nguyên query param kỳ lạ của
     * backend hiện tại: agencyPhone.
     */
    const response = await request.post(
      `pos-shipper/remove?posId=${normalizedPosId}&agencyPhone=${encodedPhone}`,
      {},
      {
        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message);

    throw error;
  }
};
