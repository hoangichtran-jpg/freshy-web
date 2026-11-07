import {
  ORDER_STATUS,
} from "../constants/order.constants";


const EDITABLE_ORDER_STATUSES =
  new Set([
    ORDER_STATUS.CHECKING,
    ORDER_STATUS.MAKING,
  ]);


export const canEditOrder = (
  status,
) => {
  return EDITABLE_ORDER_STATUSES.has(
    status,
  );
};