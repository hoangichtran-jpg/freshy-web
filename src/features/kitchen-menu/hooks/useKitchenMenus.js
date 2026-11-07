import { useCallback, useEffect, useRef, useState } from "react";

import { getKitchenMenus } from "../api";

/* ========================================
   Constants
======================================== */

const DEFAULT_PAGE_SIZE = 10;

/*
 * Chỉ dùng khi mở ca.
 *
 * Không fetch toàn bộ lịch sử menu.
 * Vì backend sort active trước nên ta fetch
 * tới khi gặp inactive là dừng.
 */
const SHIFT_FETCH_PAGE_SIZE = 50;

/* ========================================
   Helpers
======================================== */

const hasValidPosId = (posId) => {
  return posId !== null && posId !== undefined && posId !== "";
};

const getContent = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data?.content) ? data.content : [];
};

const getTotalElements = (data, content) => {
  if (Array.isArray(data)) {
    return content.length;
  }

  const value = Number(data?.totalElements);

  return Number.isFinite(value) ? value : content.length;
};

const getTotalPages = (data, totalElements, pageSize) => {
  if (Array.isArray(data)) {
    return totalElements > 0 ? 1 : 0;
  }

  const value = Number(data?.totalPages);

  if (Number.isFinite(value)) {
    return value;
  }

  return Math.ceil(totalElements / pageSize);
};

/* ========================================
   Hook
======================================== */

export default function useKitchenMenus(posId) {
  const [kitchenMenus, setKitchenMenus] = useState([]);

  /*
   * Loading lớn.
   *
   * Dùng khi:
   * - lần đầu load màn hình
   * - đổi trung tâm
   * - retry toàn bộ table
   */
  const [loading, setLoading] = useState(false);

  /*
   * Loading riêng khi chuyển page.
   *
   * Không xóa table hiện tại.
   * Table chỉ hiện loading overlay.
   */
  const [pageLoading, setPageLoading] = useState(false);

  /*
   * Error chính của table.
   *
   * Nếu initial load thất bại thì
   * table có thể render error state.
   */
  const [error, setError] = useState(null);

  /*
   * Error riêng khi chuyển page.
   *
   * Không thay table bằng error screen,
   * vì data page cũ vẫn còn hợp lệ.
   */
  const [pageError, setPageError] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,

    pageSize: DEFAULT_PAGE_SIZE,

    total: 0,

    totalPages: 0,
  });

  /*
   * Tách primitive value khỏi pagination object.
   *
   * Mục đích:
   * - dependency của useCallback rõ ràng
   * - tránh exhaustive-deps hiểu nhầm
   *   pagination.current như mutable ref .current
   */
  const paginationCurrent = pagination.current;

  const paginationPageSize = pagination.pageSize;

  /*
   * Request của table.
   *
   * Dùng request id để tránh race condition:
   *
   * user click page 2
   * rồi rất nhanh click page 3
   *
   * nếu page 2 response về sau page 3
   * thì không được ghi đè data page 3.
   */
  const pageRequestIdRef = useRef(0);

  /*
   * Request riêng cho flow mở ca.
   *
   * Không dùng chung request id với table,
   * tránh hai flow hủy nhau.
   */
  const shiftRequestIdRef = useRef(0);

  /* ========================================
     Load one server page
  ======================================== */

  const fetchPage = useCallback(
    async (
      requestedPage = 1,

      requestedPageSize = DEFAULT_PAGE_SIZE,

      {
        silent = false,

        clearBeforeLoad = false,

        paginationRequest = false,
      } = {},
    ) => {
      /* ========================================
           Invalid kitchen
        ======================================== */

      if (!hasValidPosId(posId)) {
        pageRequestIdRef.current += 1;

        setKitchenMenus([]);

        setPagination({
          current: 1,

          pageSize: requestedPageSize,

          total: 0,

          totalPages: 0,
        });

        setError(null);

        setPageError(null);

        setLoading(false);

        setPageLoading(false);

        return [];
      }

      const requestId = ++pageRequestIdRef.current;

      const safePage = Math.max(
        1,

        Number(requestedPage) || 1,
      );

      const safePageSize = Math.max(
        1,

        Number(requestedPageSize) || DEFAULT_PAGE_SIZE,
      );

      /* ========================================
           Loading type
        ======================================== */

      if (!silent) {
        if (paginationRequest) {
          /*
           * Chuyển page:
           *
           * giữ nguyên table hiện tại.
           */
          setPageLoading(true);
        } else {
          /*
           * Initial load / retry:
           *
           * có thể hiện full loading state.
           */
          setLoading(true);
        }
      }

      /*
       * Request mới bắt đầu
       * → clear error tương ứng.
       */
      if (paginationRequest) {
        setPageError(null);
      } else {
        setError(null);
      }

      if (clearBeforeLoad) {
        setKitchenMenus([]);
      }

      try {
        /*
         * Ant Design Table:
         * page bắt đầu từ 1.
         *
         * Backend:
         * page bắt đầu từ 0.
         *
         * UI page 1
         * → backend page 0
         *
         * UI page 2
         * → backend page 1
         */
        let data = await getKitchenMenus(
          posId,

          safePage - 1,

          safePageSize,
        );

        /*
         * Có request mới hơn rồi
         * → bỏ response cũ.
         */
        if (requestId !== pageRequestIdRef.current) {
          return [];
        }

        let content = getContent(data);

        let totalElements = getTotalElements(data, content);

        let totalPages = getTotalPages(
          data,

          totalElements,

          safePageSize,
        );

        /*
         * Ví dụ:
         *
         * total = 21
         * đang ở page 3
         *
         * xóa record cuối
         *
         * total = 20
         * backend giờ chỉ còn 2 pages
         *
         * request page 3 sẽ không còn hợp lệ.
         *
         * → tự resolve về page 2.
         */
        const resolvedPage =
          totalPages > 0
            ? Math.min(
                safePage,

                totalPages,
              )
            : 1;

        if (resolvedPage !== safePage && totalElements > 0) {
          data = await getKitchenMenus(
            posId,

            resolvedPage - 1,

            safePageSize,
          );

          if (requestId !== pageRequestIdRef.current) {
            return [];
          }

          content = getContent(data);

          totalElements = getTotalElements(
            data,

            content,
          );

          totalPages = getTotalPages(
            data,

            totalElements,

            safePageSize,
          );
        }

        /*
         * Chỉ update rows SAU KHI
         * request mới đã thành công.
         *
         * Vì vậy trong lúc chuyển page,
         * rows cũ vẫn còn trên màn hình.
         */
        setKitchenMenus(content);

        setPagination({
          current: resolvedPage,

          pageSize: safePageSize,

          total: totalElements,

          totalPages,
        });

        return content;
      } catch (err) {
        /*
         * Request đã stale
         * → không làm gì nữa.
         */
        if (requestId !== pageRequestIdRef.current) {
          return [];
        }

        /*
         * Chuyển page thất bại:
         *
         * giữ data/page hiện tại,
         * chỉ expose pageError.
         */
        if (paginationRequest) {
          setPageError(err);

          return [];
        }

        /*
         * Initial / retry thất bại:
         *
         * đây là error của cả table.
         */
        setError(err);

        throw err;
      } finally {
        if (requestId === pageRequestIdRef.current && !silent) {
          if (paginationRequest) {
            setPageLoading(false);
          } else {
            setLoading(false);
          }
        }
      }
    },
    [posId],
  );

  /* ========================================
     Initial load / change kitchen
  ======================================== */

  useEffect(() => {
    /*
     * Đổi bếp
     * → luôn quay về page 1.
     */
    setPagination({
      current: 1,

      pageSize: DEFAULT_PAGE_SIZE,

      total: 0,

      totalPages: 0,
    });

    /*
     * Request page cũ có thể đang loading.
     *
     * Khi đổi bếp thì reset trạng thái đó.
     */
    setPageLoading(false);

    setPageError(null);

    if (!hasValidPosId(posId)) {
      pageRequestIdRef.current += 1;

      shiftRequestIdRef.current += 1;

      setKitchenMenus([]);

      setError(null);

      setPageError(null);

      setLoading(false);

      setPageLoading(false);

      return undefined;
    }

    fetchPage(
      1,

      DEFAULT_PAGE_SIZE,

      {
        clearBeforeLoad: true,
      },
    ).catch(() => {});

    return () => {
      /*
       * Invalidate request cũ.
       */
      pageRequestIdRef.current += 1;

      shiftRequestIdRef.current += 1;
    };
  }, [posId, fetchPage]);

  /* ========================================
     Server pagination
  ======================================== */

  const changePage = useCallback(
    (page, pageSize) => {
      const nextPageSize = pageSize || paginationPageSize || DEFAULT_PAGE_SIZE;

      /*
       * Nếu sau này bật đổi pageSize:
       *
       * 10 -> 20 -> 50
       *
       * thì quay lại page 1.
       */
      const pageSizeChanged = nextPageSize !== paginationPageSize;

      return fetchPage(
        pageSizeChanged ? 1 : page,

        nextPageSize,

        {
          /*
           * QUAN TRỌNG:
           *
           * đây là pagination loading,
           * không phải initial loading.
           */
          paginationRequest: true,
        },
      );
    },
    [fetchPage, paginationPageSize],
  );

  /* ========================================
     Refresh current page
  ======================================== */

  const refresh = useCallback(
    ({ silent = false } = {}) => {
      return fetchPage(
        paginationCurrent,

        paginationPageSize,

        {
          silent,
        },
      );
    },
    [fetchPage, paginationCurrent, paginationPageSize],
  );

  /* ========================================
     Fetch active menus for shift

     QUAN TRỌNG:
     kitchenMenus chỉ là current table page.

     Khi mở ca cần tất cả active menu.

     Backend đã sort:
     active trước
     -> managerMenuPosId DESC

     Vì vậy:
     fetch page từng batch nhỏ
     và dừng ngay khi gặp inactive.
  ======================================== */

  const fetchActiveKitchenMenus = useCallback(async () => {
    if (!hasValidPosId(posId)) {
      return [];
    }

    const requestId = ++shiftRequestIdRef.current;

    const activeMenus = [];

    let backendPage = 0;

    let hasNextPage = true;

    while (hasNextPage) {
      const data = await getKitchenMenus(
        posId,

        backendPage,

        SHIFT_FETCH_PAGE_SIZE,
      );

      if (requestId !== shiftRequestIdRef.current) {
        return [];
      }

      const content = getContent(data);

      const activeOnPage = content.filter((menu) => Boolean(menu?.isActive));

      activeMenus.push(...activeOnPage);

      /*
       * Backend active-first.
       *
       * Vừa gặp inactive nghĩa là
       * các page phía sau cũng không còn
       * active menu nữa.
       */
      const hasInactive = content.some((menu) => !Boolean(menu?.isActive));

      if (
        Array.isArray(data) ||
        content.length === 0 ||
        hasInactive ||
        data?.last === true
      ) {
        hasNextPage = false;

        continue;
      }

      const totalPages = Number(data?.totalPages);

      if (Number.isFinite(totalPages)) {
        hasNextPage = backendPage + 1 < totalPages;
      } else {
        hasNextPage = content.length === SHIFT_FETCH_PAGE_SIZE;
      }

      backendPage += 1;
    }

    return activeMenus;
  }, [posId]);

  /* ========================================
     Optimistic local status
  ======================================== */

  const updateMenuStatus = useCallback((menuId, isActive) => {
    setKitchenMenus((previous) =>
      previous.map((menu) =>
        menu.managerMenuPosDayId === menuId
          ? {
              ...menu,

              isActive,
            }
          : menu,
      ),
    );
  }, []);

  /* ========================================
     Optimistic local remove
  ======================================== */

  const removeMenu = useCallback((menuId) => {
    setKitchenMenus((previous) =>
      previous.filter((menu) => menu.managerMenuPosDayId !== menuId),
    );

    setPagination((previous) => {
      const nextTotal = Math.max(
        0,

        previous.total - 1,
      );

      return {
        ...previous,

        total: nextTotal,

        totalPages: Math.ceil(nextTotal / previous.pageSize),
      };
    });
  }, []);

  /* ========================================
     Public API
  ======================================== */

  return {
    kitchenMenus,

    /*
     * Initial / full table loading.
     */
    loading,

    /*
     * Pagination loading.
     */
    pageLoading,

    /*
     * Initial / full table error.
     */
    error,

    /*
     * Pagination error.
     */
    pageError,

    pagination,

    changePage,

    refresh,

    fetchActiveKitchenMenus,

    updateMenuStatus,

    removeMenu,
  };
}
