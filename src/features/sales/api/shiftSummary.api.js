import { request } from "../../../shared/api/httpClient";

/* ========================================
   Current shift summary
======================================== */

export const getShiftSummary = async (posId) => {
  const response = await request.get(`/shifts/summary/${posId}`);

  return response.data;
};

/* ========================================
   Update current shift inventory
======================================== */

export const getCurrentShift = async (posId) => {
  const response = await request.get("/shifts/current", {
    params: { posId },
  });
  return response.data;
};

export const updateShiftInventory = async (
  shiftId,
  body,
  idempotencyKey,
) => {
  const response = await request.put(
    `/shifts/${shiftId}/inventory`,
    body,
    {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    },
  );

  return response.data;
};

/* ========================================
   Shift history
======================================== */

export const getShiftHistory = async ({ posId, page = 0, size = 20 }) => {
  const response = await request.get("/shifts/history", {
    params: {
      posId,
      page,
      size,
    },
  });

  return response.data;
};

/* ========================================
   Shift history detail
======================================== */

export const getShiftHistoryDetail = async (shiftId) => {
  const response = await request.get(`/shifts/history/${shiftId}`);

  return response.data;
};

/* ========================================
   Step 2 — Inventory Edit Context

   Read only.
   Uses shiftId, not posId.
======================================== */

export const getShiftInventoryEditContext = async (shiftId) => {
  if (!shiftId) {
    throw new Error("Thiếu shiftId để tải dữ liệu chỉnh sửa");
  }

  const response = await request.get(`/shifts/${shiftId}/inventory/edit`);

  return response.data;
};
