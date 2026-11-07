import { useCallback, useEffect, useState } from "react";

import { getMenuByManager } from "../api";

const DEFAULT_PAGE_SIZE = 10;

/*
 * Đây là batch size để lấy dữ liệu phục vụ
 * frontend search + frontend pagination.
 *
 * Không phải số row hiển thị trên table.
 */
const FETCH_PAGE_SIZE = 500;

/* ========================================
   Helpers
======================================== */

const normalizeMenuResponse = (response) => {
  if (Array.isArray(response)) {
    return {
      content: response,

      totalPages: 1,

      last: true,
    };
  }

  return {
    content: Array.isArray(response?.content) ? response.content : [],

    totalPages: Number(response?.totalPages) || 1,

    last: Boolean(response?.last),
  };
};

const dedupeMenus = (menus) => {
  const map = new Map();

  menus.forEach((menu) => {
    if (menu?.menuId === null || menu?.menuId === undefined) {
      return;
    }

    map.set(menu.menuId, menu);
  });

  return Array.from(map.values());
};

/* ========================================
   Hook
======================================== */

export default function useMenus(managerPhone) {
  const [menus, setMenus] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /*
   * Pagination bây giờ là presentation state
   * của frontend table.
   *
   * Dataset `menus` chứa toàn bộ menu đã load.
   */
  const [pagination, setPagination] = useState({
    current: 1,

    pageSize: DEFAULT_PAGE_SIZE,

    total: 0,
  });

  /* ========================================
     Fetch all menus

     Backend vẫn paginated.

     FE đọc lần lượt các backend page để
     đảm bảo không bị giới hạn nếu sau này
     số menu > FETCH_PAGE_SIZE.
  ======================================== */

  const fetchMenus = useCallback(
    async ({
      page = 1,

      pageSize = DEFAULT_PAGE_SIZE,
    } = {}) => {
      if (!managerPhone) {
        setMenus([]);

        setPagination({
          current: 1,

          pageSize,

          total: 0,
        });

        setError(null);

        setLoading(false);

        return [];
      }

      setLoading(true);

      setError(null);

      try {
        const allMenus = [];

        let backendPage = 0;

        let hasNextPage = true;

        while (hasNextPage) {
          const response = await getMenuByManager(managerPhone, {
            page: backendPage,

            size: FETCH_PAGE_SIZE,
          });

          const {
            content,

            totalPages,

            last,
          } = normalizeMenuResponse(response);

          allMenus.push(...content);

          /*
           * Array response:
           * backend không pagination.
           */
          if (Array.isArray(response)) {
            hasNextPage = false;

            continue;
          }

          /*
           * Ưu tiên metadata `last`.
           */
          if (response?.last === true) {
            hasNextPage = false;

            continue;
          }

          /*
           * Nếu backend không trả `last`
           * thì dùng totalPages.
           */
          hasNextPage = backendPage + 1 < totalPages;

          /*
           * Defensive stop:
           * empty page thì không fetch tiếp.
           */
          if (content.length === 0) {
            hasNextPage = false;
          }

          /*
           * Defensive stop cho response
           * có last nhưng value không boolean.
           */
          if (last === true) {
            hasNextPage = false;
          }

          backendPage += 1;
        }

        const uniqueMenus = dedupeMenus(allMenus);

        setMenus(uniqueMenus);

        const totalPages = Math.max(
          1,

          Math.ceil(uniqueMenus.length / pageSize),
        );

        setPagination({
          current: Math.min(Math.max(1, page), totalPages),

          pageSize,

          total: uniqueMenus.length,
        });

        return uniqueMenus;
      } catch (requestError) {
        setError(requestError);

        setMenus([]);

        setPagination({
          current: 1,

          pageSize,

          total: 0,
        });

        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [managerPhone],
  );

  /* ========================================
     Initial load
  ======================================== */

  useEffect(() => {
    if (!managerPhone) {
      setMenus([]);

      setPagination({
        current: 1,

        pageSize: DEFAULT_PAGE_SIZE,

        total: 0,
      });

      return;
    }

    fetchMenus({
      page: 1,

      pageSize: DEFAULT_PAGE_SIZE,
    }).catch(() => {});
  }, [managerPhone, fetchMenus]);

  /* ========================================
     Client pagination
  ======================================== */
  const paginationCurrent = pagination.current;

  const paginationPageSize = pagination.pageSize;

  const changePage = useCallback((page, pageSize = DEFAULT_PAGE_SIZE) => {
    setPagination((previous) => {
      const nextPageSize = pageSize || previous.pageSize || DEFAULT_PAGE_SIZE;

      const totalPages = Math.max(
        1,

        Math.ceil(previous.total / nextPageSize),
      );

      return {
        ...previous,

        current: Math.min(Math.max(1, page), totalPages),

        pageSize: nextPageSize,
      };
    });

    return Promise.resolve();
  }, []);

  /* ========================================
     Refresh
  ======================================== */

  const refresh = useCallback(
    () =>
      fetchMenus({
        page: paginationCurrent,

        pageSize: paginationPageSize,
      }),
    [fetchMenus, paginationCurrent, paginationPageSize],
  );

  /* ========================================
     Local updates
  ======================================== */

  const updateMenuLocal = useCallback((menuId, patch) => {
    setMenus((previous) =>
      previous.map((menu) =>
        menu.menuId === menuId
          ? {
              ...menu,

              ...patch,
            }
          : menu,
      ),
    );
  }, []);

  const prependMenu = useCallback((menu) => {
    if (!menu) {
      return;
    }

    setMenus((previous) => [menu, ...previous]);

    setPagination((previous) => ({
      ...previous,

      current: 1,

      total: previous.total + 1,
    }));
  }, []);

  return {
    menus,

    loading,
    error,

    pagination,

    fetchMenus,
    changePage,
    refresh,

    setMenus,

    updateMenuLocal,
    prependMenu,
  };
}
