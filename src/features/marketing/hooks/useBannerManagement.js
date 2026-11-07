import { useCallback, useEffect, useRef, useState } from "react";

import {
  createBanner as createBannerRequest,
  deleteBanner as deleteBannerRequest,
  fetchBanners,
  setBannerVisibility,
} from "../api";

/* ========================================
   Helpers
======================================== */

const normalizeBanners = (data) => {
  return Array.isArray(data) ? data : [];
};

const hasValidBannerId = (bannerId) => {
  return bannerId !== null && bannerId !== undefined && bannerId !== "";
};

/* ========================================
   Hook
======================================== */

function useBannerManagement() {
  /* ========================================
     Data
  ======================================== */

  const [banners, setBanners] = useState([]);

  /* ========================================
     Fetch state
  ======================================== */

  const [loading, setLoading] = useState(false);

  const [loadError, setLoadError] = useState(null);

  /* ========================================
     Create state
  ======================================== */

  const [creating, setCreating] = useState(false);

  /* ========================================
     Row mutation state
  ======================================== */

  const [processingBannerId, setProcessingBannerId] = useState(null);

  const [processingAction, setProcessingAction] = useState(null);

  /* ========================================
     Request guards
  ======================================== */

  const requestIdRef = useRef(0);

  const creatingRef = useRef(false);

  const processingRef = useRef(false);

  /* ========================================
     Refresh
  ======================================== */

  const refresh = useCallback(async ({ reportError = true } = {}) => {
    const requestId = ++requestIdRef.current;

    setLoading(true);

    if (reportError) {
      setLoadError(null);
    }

    try {
      const data = await fetchBanners();

      /*
       * Có request mới hơn rồi.
       * Response này không được overwrite state.
       */
      if (requestId !== requestIdRef.current) {
        return {
          ok: false,
          stale: true,
          error: null,
        };
      }

      const nextBanners = normalizeBanners(data);

      setBanners(nextBanners);

      return {
        ok: true,
        stale: false,
        data: nextBanners,
        error: null,
      };
    } catch (error) {
      /*
       * Request stale không report
       * lỗi ra UI.
       */
      if (requestId !== requestIdRef.current) {
        return {
          ok: false,
          stale: true,
          error,
        };
      }

      if (reportError) {
        setLoadError(error);
      }

      return {
        ok: false,
        stale: false,
        error,
      };
    } finally {
      /*
       * Request cũ không được
       * tắt loading request mới.
       */
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /* ========================================
     Initial load
  ======================================== */

  useEffect(() => {
    refresh();

    return () => {
      /*
       * Invalidate request đang chạy
       * khi component unmount.
       */
      requestIdRef.current += 1;
    };
  }, [refresh]);

  /* ========================================
     Clear fetch error
  ======================================== */

  const clearLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  /* ========================================
     Create
  ======================================== */

  const createBanner = useCallback(async ({ title, file, sortOrder }) => {
    if (creatingRef.current) {
      return {
        ok: false,
        skipped: true,
      };
    }

    creatingRef.current = true;

    setCreating(true);

    try {
      const data = await createBannerRequest({
        title,
        file,
        sortOrder,
      });

      return {
        ok: true,
        skipped: false,
        data,
      };
    } finally {
      creatingRef.current = false;

      setCreating(false);
    }
  }, []);

  /* ========================================
     Toggle visibility

     Quan trọng:
     KHÔNG refresh toàn bộ list.

     Backend thành công
     → patch đúng record local.
  ======================================== */

  const toggleBannerVisibility = useCallback(async (banner) => {
    if (processingRef.current) {
      return null;
    }

    if (!hasValidBannerId(banner?.id)) {
      throw new Error("Không xác định được quảng cáo cần cập nhật.");
    }

    const nextActive = !Boolean(banner.active);

    processingRef.current = true;

    setProcessingBannerId(banner.id);

    setProcessingAction("toggle");

    try {
      await setBannerVisibility(banner.id, nextActive);

      /*
       * Server đã update thành công.
       *
       * Chỉ patch record vừa thay đổi.
       * Không fetch lại cả table.
       */
      setBanners((previous) =>
        previous.map((item) =>
          item.id === banner.id
            ? {
                ...item,
                active: nextActive,
              }
            : item,
        ),
      );

      return {
        bannerId: banner.id,

        active: nextActive,
      };
    } finally {
      processingRef.current = false;

      setProcessingBannerId(null);

      setProcessingAction(null);
    }
  }, []);

  /* ========================================
     Delete
  ======================================== */

  const deleteBanner = useCallback(async (banner) => {
    if (processingRef.current) {
      return null;
    }

    if (!hasValidBannerId(banner?.id)) {
      throw new Error("Không xác định được quảng cáo cần xóa.");
    }

    processingRef.current = true;

    setProcessingBannerId(banner.id);

    setProcessingAction("delete");

    try {
      await deleteBannerRequest(banner.id);

      return {
        bannerId: banner.id,
      };
    } finally {
      processingRef.current = false;

      setProcessingBannerId(null);

      setProcessingAction(null);
    }
  }, []);

  /* ========================================
     Public API
  ======================================== */

  return {
    banners,

    loading,
    loadError,

    creating,

    processingBannerId,
    processingAction,

    refresh,
    clearLoadError,

    createBanner,
    toggleBannerVisibility,
    deleteBanner,
  };
}

export default useBannerManagement;
