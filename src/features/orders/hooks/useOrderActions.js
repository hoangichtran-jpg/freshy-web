import { useCallback } from "react";

import { changeOrderStatus, sendOrderToPos } from "../api";

import { ORDER_STATUS } from "../constants/order.constants";

export const useOrderActions = ({ phoneNumber, moveOrder, removeOrder }) => {
  const confirmOrder = useCallback(
    async (orderId) => {
      await sendOrderToPos(orderId, phoneNumber);

      moveOrder(orderId, ORDER_STATUS.CHECKING, ORDER_STATUS.MAKING);
    },
    [phoneNumber, moveOrder],
  );

  const finishOrder = useCallback(
    async (orderId, fromStatus) => {
      await changeOrderStatus(orderId, ORDER_STATUS.FINISHED);

      moveOrder(orderId, fromStatus, ORDER_STATUS.FINISHED);
    },
    [moveOrder],
  );

  const cancelOrder = useCallback(
    async (orderId, fromStatus) => {
      await changeOrderStatus(orderId, ORDER_STATUS.CANCELED);

      removeOrder(orderId, fromStatus);
    },
    [removeOrder],
  );

  return {
    confirmOrder,
    finishOrder,
    cancelOrder,
  };
};
