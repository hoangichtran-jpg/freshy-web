import { request } from "../../../shared/api/httpClient";

/* ========================================
   Request headers

   Authentication is intentionally NOT
   handled here.

   shared/api/httpClient injects the
   current access token automatically.
======================================== */

const getRequestHeaders = ({ download = false, json = false } = {}) => {
  return {
    ...(download
      ? {
          Accept: "application/octet-stream",
        }
      : {
          Accept: "*/*",
        }),

    ...(json
      ? {
          "Content-Type": "application/json",
        }
      : {}),
  };
};

/*
 * Backend có thể trả filename theo:
 *
 * filename*=UTF-8''abc.xlsx
 *
 * hoặc:
 *
 * filename="abc.xlsx"
 */
const getDownloadFileName = (disposition, fallbackFileName) => {
  if (!disposition) {
    return fallbackFileName;
  }

  if (disposition.includes("filename*")) {
    const encodedFileName = disposition.split("filename*=")[1]?.split("''")[1];

    if (encodedFileName) {
      return decodeURIComponent(encodedFileName);
    }
  }

  if (disposition.includes("filename=")) {
    const fileName = disposition
      .split("filename=")[1]
      ?.split(";")[0]
      ?.replace(/"/g, "");

    if (fileName) {
      return fileName;
    }
  }

  return fallbackFileName;
};

/*
 * Private helper dùng chung
 * cho tất cả Excel export.
 *
 * Trước đây 4 API export đều
 * duplicate toàn bộ logic này.
 */
const downloadExcelFile = async (url, fallbackFileName) => {
  try {
    const response = await request.get(url, {
      /*
       * Authorization is injected
       * automatically by httpClient.
       *
       * This header exists only for
       * the download response format.
       */
      headers: getRequestHeaders({
        download: true,
      }),

      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"];

    const fileName = getDownloadFileName(disposition, fallbackFileName);

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = blobUrl;

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Lỗi khi export Excel:", error);

    throw error;
  }
};

/* ========================================
   Report
======================================== */

export const getOrdersSummaryByStatus = async (
  status,
  posId,
  page = 0,
  size = 10,
) => {
  try {
    const response = await request.get(
      `orders/status?posId=${posId}&status=${status}&page=${page}&size=${size}`,
    );

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

export const getOrderSummaryDetail = async (orderId, posId) => {
  const response = await request.get(
    `orders/${encodeURIComponent(orderId)}/detail`,
    { params: { posId } },
  );
  return response.data;
};

/* ========================================
   Units used by export
======================================== */

export const getOrderSummaryUnits = async (posId) => {
  try {
    const response = await request.get(`pos-agency/units?posId=${posId}`, {
      headers: getRequestHeaders({
        json: true,
      }),
    });

    return response.data;
  } catch (error) {
    console.error(error.response || error.message);

    throw error;
  }
};

/* ========================================
   Export by unit + date
======================================== */

export const exportOrdersByUnitAndDate = async ({
  status,
  unit,
  posId,
  date,
}) => {
  const encodedStatus = encodeURIComponent(status);

  const encodedUnit = encodeURIComponent(unit);

  const url =
    `orders/export/by-unit-date` +
    `?status=${encodedStatus}` +
    `&unit=${encodedUnit}` +
    `&posId=${posId}` +
    `&date=${date}`;

  await downloadExcelFile(url, `export_${unit}.xlsx`);
};

/* ========================================
   Export by unit + date range
======================================== */

export const exportOrdersByUnitAndDateRange = async ({
  status,
  unit,
  posId,
  startDate,
  endDate,
}) => {
  const encodedStatus = encodeURIComponent(status);

  const encodedUnit = encodeURIComponent(unit);

  const url =
    `orders/export/by-unit-date-range` +
    `?status=${encodedStatus}` +
    `&unit=${encodedUnit}` +
    `&posId=${posId}` +
    `&startDate=${startDate}` +
    `&endDate=${endDate}`;

  await downloadExcelFile(url, `export_${unit}.xlsx`);
};

/* ========================================
   Export all + date
======================================== */

export const exportAllOrdersByDate = async ({ status, posId, date }) => {
  const encodedStatus = encodeURIComponent(status);

  const url =
    `orders/export/all-orders/date` +
    `?status=${encodedStatus}` +
    `&posId=${posId}` +
    `&date=${date}`;

  await downloadExcelFile(url, "export_all.xlsx");
};

/* ========================================
   Export all + date range
======================================== */

export const exportAllOrdersByDateRange = async ({
  status,
  posId,
  startDate,
  endDate,
}) => {
  const encodedStatus = encodeURIComponent(status);

  const url =
    `orders/export/all-orders/date-range` +
    `?status=${encodedStatus}` +
    `&posId=${posId}` +
    `&startDate=${startDate}` +
    `&endDate=${endDate}`;

  await downloadExcelFile(url, "export_all.xlsx");
};
