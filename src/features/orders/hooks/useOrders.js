import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getOrdersByStatus } from "../api";
import { ORDER_TABS } from "../constants/order.constants";

export const useOrders = ({
  activeTab,
  posIds,
}) => {
  const [ordersByTab, setOrdersByTab] =
    useState({});

  const [loadingByTab, setLoadingByTab] =
    useState({});

  const [error, setError] = useState(null);

  const currentStatus =
    ORDER_TABS[activeTab].status;

  /**
   * Tạo primitive key ổn định từ danh sách POS.
   *
   * Ví dụ:
   * [2, 1] -> "1,2"
   * [1]    -> "1"
   *
   * Dùng key này để biết kitchen/POS
   * thực sự có thay đổi hay không.
   */
  const posIdsKey = useMemo(() => {
    return [...(posIds || [])]
      .map(String)
      .sort()
      .join(",");
  }, [posIds]);

  /**
   * Lưu kitchen/POS trước đó.
   */
  const previousPosIdsKeyRef =
    useRef(posIdsKey);

  /**
   * Version của request hiện tại.
   *
   * Request nào có version cũ hơn
   * sẽ không được update state.
   */
  const requestVersionRef = useRef(0);

  /**
   * Khi kitchen/POS thay đổi:
   * - vô hiệu hóa request cũ
   * - xóa cache tab của kitchen cũ
   * - reset loading/error
   */
  useEffect(() => {
    if (
      previousPosIdsKeyRef.current ===
      posIdsKey
    ) {
      return;
    }

    previousPosIdsKeyRef.current =
      posIdsKey;

    requestVersionRef.current += 1;

    setOrdersByTab({});
    setLoadingByTab({});
    setError(null);
  }, [posIdsKey]);

  /**
   * Fetch orders của tab hiện tại.
   *
   * requestVersion giúp tránh race condition
   * khi user đổi tab/kitchen quá nhanh.
   */
  const fetchOrders = useCallback(
    async () => {
      const requestVersion =
        ++requestVersionRef.current;

      if (
        !Array.isArray(posIds) ||
        posIds.length === 0
      ) {
        return;
      }

      const currentTab =
        ORDER_TABS[activeTab];

      const statusKey =
        currentTab.status;

      setLoadingByTab((prev) => ({
        ...prev,
        [statusKey]: true,
      }));

      setError(null);

      try {
        let data = [];

        if (
          Array.isArray(
            currentTab.status,
          )
        ) {
          const promises =
            currentTab.status.map(
              (status) =>
                getOrdersByStatus(
                  status,
                  posIds,
                ),
            );

          const results =
            await Promise.all(
              promises,
            );

          data = results.flat();
        } else {
          data =
            await getOrdersByStatus(
              currentTab.status,
              posIds,
            );
        }

        /**
         * Nếu trong lúc chờ API đã có
         * request mới hơn thì bỏ response này.
         */
        if (
          requestVersion !==
          requestVersionRef.current
        ) {
          return;
        }

        setOrdersByTab((prev) => ({
          ...prev,
          [statusKey]: data,
        }));
      } catch (fetchError) {
        /**
         * Không hiện lỗi của request cũ.
         */
        if (
          requestVersion !==
          requestVersionRef.current
        ) {
          return;
        }

        console.error(
          "Lỗi khi lấy đơn hàng:",
          fetchError,
        );

        setError(fetchError);
      } finally {
        /**
         * Request cũ không được phép
         * tắt loading của request mới.
         */
        if (
          requestVersion ===
          requestVersionRef.current
        ) {
          setLoadingByTab((prev) => ({
            ...prev,
            [statusKey]: false,
          }));
        }
      }
    },
    [activeTab, posIds],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * Orders của tab hiện tại.
   */
  const orders = useMemo(() => {
    const list = Array.isArray(
      currentStatus,
    )
      ? currentStatus.flatMap(
          (status) =>
            ordersByTab[status] || [],
        )
      : ordersByTab[currentStatus] ||
        [];

    return list.map(
      (order, index) => ({
        ...order,
        key: order.orderId,
        index,
      }),
    );
  }, [
    ordersByTab,
    currentStatus,
  ]);

  /**
   * Di chuyển order từ status này
   * sang status khác trong cache.
   */
  const moveOrder = useCallback(
    (
      orderId,
      fromStatus,
      toStatus,
    ) => {
      setOrdersByTab((prev) => {
        const sourceOrders =
          prev[fromStatus] || [];

        const targetOrders =
          prev[toStatus] || [];

        const orderToMove =
          sourceOrders.find(
            (order) =>
              order.orderId ===
              orderId,
          );

        if (!orderToMove) {
          return prev;
        }

        const movedOrder = {
          ...orderToMove,
          status: toStatus,
        };

        return {
          ...prev,

          [fromStatus]:
            sourceOrders.filter(
              (order) =>
                order.orderId !==
                orderId,
            ),

          [toStatus]: [
            movedOrder,
            ...targetOrders,
          ],
        };
      });
    },
    [],
  );

  /**
   * Xóa order khỏi cache của status.
   */
  const removeOrder = useCallback(
    (orderId, fromStatus) => {
      setOrdersByTab((prev) => {
        const sourceOrders =
          prev[fromStatus] || [];

        return {
          ...prev,

          [fromStatus]:
            sourceOrders.filter(
              (order) =>
                order.orderId !==
                orderId,
            ),
        };
      });
    },
    [],
  );

  const loading = Boolean(
    loadingByTab[currentStatus],
  );

  return {
    orders,
    ordersByTab,
    loading,
    error,
    refetchOrders: fetchOrders,
    moveOrder,
    removeOrder,
  };
};