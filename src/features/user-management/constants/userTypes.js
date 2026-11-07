export const USER_MANAGEMENT_TYPES = Object.freeze({
  AGENCY: "agency",

  SHIPPER: "shipper",
});

export const USER_MANAGEMENT_TYPE_CONFIG = Object.freeze({
  [USER_MANAGEMENT_TYPES.AGENCY]: {
    type: USER_MANAGEMENT_TYPES.AGENCY,

    role: "ROLE_AGENCY",

    title: "Quản lý đại lý",

    description: "Quản lý danh sách đại lý và các bếp được phân công.",

    entityLabel: "đại lý",

    createLabel: "Thêm đại lý",

    createTitle: "Thêm đại lý",

    createSuccessMessage: "Đã thêm đại lý thành công.",

    createErrorMessage: "Không thể thêm đại lý.",

    editTitle: "Chỉnh sửa đại lý",

    updateSuccessMessage: "Đã cập nhật đại lý.",

    updateErrorMessage: "Không thể cập nhật đại lý.",

    deleteTitle: "Xóa đại lý",

    deleteSuccessMessage: "Đã xóa đại lý thành công.",

    deleteErrorMessage: "Không thể xóa đại lý.",
  },

  [USER_MANAGEMENT_TYPES.SHIPPER]: {
    type: USER_MANAGEMENT_TYPES.SHIPPER,

    role: "ROLE_SHIPPER",

    title: "Quản lý giao hàng",

    description:
      "Quản lý danh sách nhân viên giao hàng và các bếp được phân công.",

    entityLabel: "nhân viên giao hàng",

    createLabel: "Thêm giao hàng",

    createTitle: "Thêm nhân viên giao hàng",

    createSuccessMessage: "Đã thêm nhân viên giao hàng.",

    createErrorMessage: "Không thể thêm nhân viên giao hàng.",

    editTitle: "Chỉnh sửa nhân viên giao hàng",

    updateSuccessMessage: "Đã cập nhật nhân viên giao hàng.",

    updateErrorMessage: "Không thể cập nhật nhân viên giao hàng.",

    deleteTitle: "Xóa nhân viên giao hàng",

    deleteSuccessMessage: "Đã xóa nhân viên giao hàng thành công.",

    deleteErrorMessage: "Không thể xóa nhân viên giao hàng.",
  },
});

export const getUserManagementTypeConfig = (type) =>
  USER_MANAGEMENT_TYPE_CONFIG[type] || null;
