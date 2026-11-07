import { useCallback, useEffect, useRef, useState } from "react";

import { fetchServiceQualityReviews } from "../api";

/* ========================================
   Helpers
======================================== */

const normalizeScore = (value) => {
  const score = Number(value);

  /*
   * Không biến invalid score thành 0.
   *
   * Nếu convert thành 0:
   *
   * malformed backend data
   * → frontend hiểu thành đánh giá rất thấp
   * → stats "Cần chú ý" bị sai.
   */
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return null;
  }

  return score;
};

const normalizeImages = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => typeof item === "string" && item.trim());
};

const buildClientKey = (review, index) => {
  /*
   * Nếu backend có stable ID thì dùng.
   */
  const serverId =
    review?.id ?? review?.rateId ?? review?.requestRateId ?? null;

  if (serverId !== null && serverId !== undefined && serverId !== "") {
    return String(serverId);
  }

  /*
   * Backend hiện tại chưa chứng minh
   * có stable review ID.
   *
   * Đây chỉ là React rendering key,
   * không phải domain identifier.
   */
  const phone = String(review?.customerPhone || "unknown");

  return ["service-quality", phone, index].join("-");
};

const normalizeReview = (review, index) => {
  return {
    ...review,

    clientKey: buildClientKey(review, index),

    customerPhone:
      typeof review?.customerPhone === "string" ? review.customerPhone : "",

    rateScore: normalizeScore(review?.rateScore),

    rateNote: typeof review?.rateNote === "string" ? review.rateNote : "",

    imagePaths: normalizeImages(review?.imagePaths),
  };
};

const normalizeReviews = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeReview);
};

/* ========================================
   Hook
======================================== */

function useServiceQuality(managerPhone) {
  /* ========================================
     Data
  ======================================== */

  const [reviews, setReviews] = useState([]);

  /* ========================================
     Request state
  ======================================== */

  const [loading, setLoading] = useState(false);

  const [loadError, setLoadError] = useState(null);

  /* ========================================
     Stale request protection
  ======================================== */

  const requestIdRef = useRef(0);

  /* ========================================
     Refresh
  ======================================== */

  const refresh = useCallback(
    async ({ reportError = true } = {}) => {
      /*
       * Auth chưa resolve manager phone.
       *
       * Chưa request.
       */
      if (!managerPhone) {
        setReviews([]);

        setLoading(false);

        return {
          ok: false,
          skipped: true,
          stale: false,
          error: null,
        };
      }

      const requestId = ++requestIdRef.current;

      setLoading(true);

      if (reportError) {
        setLoadError(null);
      }

      try {
        const data = await fetchServiceQualityReviews(managerPhone);

        /*
         * Request cũ không được overwrite
         * response của request mới.
         */
        if (requestId !== requestIdRef.current) {
          return {
            ok: false,
            skipped: false,
            stale: true,
            error: null,
          };
        }

        const nextReviews = normalizeReviews(data);

        setReviews(nextReviews);

        return {
          ok: true,
          skipped: false,
          stale: false,
          data: nextReviews,
          error: null,
        };
      } catch (error) {
        /*
         * Request stale không được
         * báo lỗi lên UI.
         */
        if (requestId !== requestIdRef.current) {
          return {
            ok: false,
            skipped: false,
            stale: true,
            error,
          };
        }

        if (reportError) {
          setLoadError(error);
        }

        return {
          ok: false,
          skipped: false,
          stale: false,
          error,
        };
      } finally {
        /*
         * Request cũ không được
         * tắt loading của request mới.
         */
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [managerPhone],
  );

  /* ========================================
     Initial load / manager change
  ======================================== */

  useEffect(() => {
    refresh();

    return () => {
      /*
       * Invalid request đang chạy
       * khi component unmount
       * hoặc manager thay đổi.
       */
      requestIdRef.current += 1;
    };
  }, [refresh]);

  /* ========================================
     Clear error
  ======================================== */

  const clearLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  /* ========================================
     Public API
  ======================================== */

  return {
    reviews,

    loading,
    loadError,

    refresh,
    clearLoadError,
  };
}

export default useServiceQuality;
