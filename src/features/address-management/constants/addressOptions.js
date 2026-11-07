export const ADDRESS_TYPES = {
  NORMAL: "NORMAL",
  SPECIAL: "SPECIAL",
};

export const ADDRESS_TYPE_LABELS = {
  [ADDRESS_TYPES.NORMAL]: "Bình thường",

  [ADDRESS_TYPES.SPECIAL]: "Đặc biệt",
};

export const ADDRESS_TYPE_OPTIONS = Object.entries(ADDRESS_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

export const PAYMENT_TYPE_LABELS = {
  CASH: "Tiền mặt",

  CUSTOMER_TRANSFER: "Khách hàng chuyển khoản",

  AGENCY_TRANSFER: "Đại lý chuyển khoản",

  LATER: "Trả sau",
};

export const PAYMENT_TYPE_OPTIONS = Object.entries(PAYMENT_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);
