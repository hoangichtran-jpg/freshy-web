import { useEffect, useMemo, useRef } from "react";

import { createOrderRealtimeClient } from "../realtime/orderRealtime";

export const useOrderRealtime = ({ token, posIds, onOrderStatusChanged }) => {
  /*
   * Callback có thể thay đổi theo render,
   * nhưng không vì thế mà reconnect socket.
   */
  const onOrderStatusChangedRef = useRef(onOrderStatusChanged);

  useEffect(() => {
    onOrderStatusChangedRef.current = onOrderStatusChanged;
  }, [onOrderStatusChanged]);

  /*
   * Primitive dependency ổn định.
   *
   * [2, 1] và [1, 2]
   * đều trở thành "1,2".
   */
  const posIdsKey = useMemo(() => {
    return Array.from(
      new Set(
        (posIds || [])
          .filter(
            (posId) => posId !== null && posId !== undefined && posId !== "",
          )
          .map(String),
      ),
    )
      .sort()
      .join(",");
  }, [posIds]);

  useEffect(() => {
    if (!token || !posIdsKey) {
      return undefined;
    }

    const subscribedPosIds = posIdsKey.split(",");

    const client = createOrderRealtimeClient({
      token,

      posIds: subscribedPosIds,

      onEvent: (event) => {
        if (event?.type !== "ORDER_STATUS_CHANGED") {
          return;
        }

        /*
         * Chỉ nhận event của POS
         * mà màn hình này đang quản lý.
         */
        if (!subscribedPosIds.includes(String(event?.posId))) {
          return;
        }

        onOrderStatusChangedRef.current?.(event);
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [token, posIdsKey]);
};
