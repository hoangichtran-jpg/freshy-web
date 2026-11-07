import { request } from "../../../shared/api/httpClient";

/* ========================================
   Kitchen menus
======================================== */

export const getKitchenMenus = async (posId, page = 0, size = 10) => {
  if (posId == null) {
    throw new Error("posId is required");
  }

  try {
    const response = await request.get("menu-pos/api/pos-menu", {
      params: {
        posId,
        page,
        size,
      },
    });

    console.log("===== KITCHEN MENUS RAW =====");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

export const changeKitchenMenuStatus = async ({ id, isActive }) => {
  if (id == null) {
    throw new Error("menu id is required");
  }

  try {
    const response = await request.put(
      `menu-pos/${id}/change-status`,
      null,
      {
        params: {
          isActive,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

export const deleteKitchenMenu = async (id) => {
  if (id == null) {
    throw new Error("menu id is required");
  }

  try {
    const response = await request.delete(`menu-pos-days/${id}`);

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

/* ========================================
   Shift
======================================== */

export const openKitchenShift = async (posId, payload) => {
  if (posId == null) {
    throw new Error("posId is required");
  }

  try {
    const response = await request.post(`/shifts/${posId}/open`, payload, {
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

export const closeKitchenShift = async (posId, isSpecial) => {
  if (posId == null) {
    throw new Error("posId is required");
  }

  try {
    const response = await request.post(`/shifts/${posId}/close`, null, {
      params: {
        special: Boolean(isSpecial),
      },
    });

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

/* ========================================
   Shift ordering / safe close

   The backend is the authority. Never treat
   a UI preflight as a reservation to close.
======================================== */

export const getShiftOrdering = async (posId) => {
  if (!posId) throw new Error("Thiếu POS để đọc trạng thái nhận đơn.");
  const response = await request.get(`/shifts/${posId}/ordering`);
  return response.data;
};

export const updateShiftOrdering = async (posId, shiftId, status) => {
  if (!posId || !shiftId || !["ACCEPTING", "PAUSED"].includes(status)) {
    throw new Error("Thông tin thay đổi trạng thái ca không hợp lệ.");
  }
  const response = await request.put(`/shifts/${posId}/ordering`, {
    shiftId,
    status,
  });
  return response.data;
};

export const getShiftClosePreflight = async (posId, isSpecial = false) => {
  if (!posId) throw new Error("Thiếu POS để kiểm tra đóng ca.");
  const response = await request.get(`/shifts/${posId}/close-preflight`, {
    params: { special: Boolean(isSpecial) },
  });
  return response.data;
};


/** Loaded ONLY after management chooses to inspect outstanding requests. */
export const getShiftCloseBlockers = async (posId, special = false) => {
  if (!posId) throw new Error("Thiếu POS để tải đơn tồn.");
  const response = await request.get(`/shifts/${posId}/close-blockers`, {
    params: { special: Boolean(special) },
  });
  return response.data;
};

/** One request at a time. Backend revalidates the request is in this shift. */
export const getShiftCloseBlockerDetail = async (posId, shiftId, requestId, special = false) => {
  if (!posId || !shiftId || !requestId) throw new Error("Thiếu thông tin đơn hoặc ca.");
  const response = await request.get(
    `/shifts/${posId}/close-blockers/${encodeURIComponent(requestId)}`,
    { params: { special: Boolean(special), shiftId } },
  );
  return response.data;
};


/** Feature-gated manager action; backend rechecks shift, ledger, status and payment. */
export const cancelPendingRequestForClose = async (posId, shiftId, requestId) => {
  if (!posId || !shiftId || !requestId) throw new Error("Thiếu thông tin ca hoặc đơn.");
  const response = await request.post(
    `/shifts/${posId}/close-pending/${encodeURIComponent(requestId)}/cancel`,
    null, { params: { shiftId, special: false } },
  );
  return response.data;
};
