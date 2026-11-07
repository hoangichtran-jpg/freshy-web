export const REGISTRATION_TYPES = Object.freeze({
  AGENCY: "agency",
  SHIPPER: "shipper",
});


export const REGISTRATION_TYPE_CONFIG = Object.freeze({
  [REGISTRATION_TYPES.AGENCY]: {
    type: REGISTRATION_TYPES.AGENCY,

    title: "Đăng ký đại lý",

    description:
      "Xem và xử lý các yêu cầu đăng ký trở thành đại lý.",

    subjectLabel: "đại lý",

    approveSuccessMessage:
      "Đã phê duyệt đăng ký đại lý.",

    rejectSuccessMessage:
      "Đã hủy yêu cầu đăng ký đại lý.",
  },


  [REGISTRATION_TYPES.SHIPPER]: {
    type: REGISTRATION_TYPES.SHIPPER,

    title: "Đăng ký giao hàng",

    description:
      "Xem và xử lý các yêu cầu đăng ký trở thành nhân viên giao hàng.",

    subjectLabel:
      "nhân viên giao hàng",

    approveSuccessMessage:
      "Đã phê duyệt đăng ký giao hàng.",

    rejectSuccessMessage:
      "Đã hủy yêu cầu đăng ký giao hàng.",
  },
});


export const getRegistrationTypeConfig = (
  type,
) =>
  REGISTRATION_TYPE_CONFIG[
    type
  ] || null;