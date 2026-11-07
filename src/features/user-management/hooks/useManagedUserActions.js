import { useCallback, useState } from "react";

import { removeAgency, removeShipper } from "../api";

import { USER_MANAGEMENT_TYPES } from "../constants";

const DELETE_ACTIONS = {
  [USER_MANAGEMENT_TYPES.AGENCY]: removeAgency,

  [USER_MANAGEMENT_TYPES.SHIPPER]: removeShipper,
};

function useManagedUserActions(type, { onDeleted } = {}) {
  const [deletingPhone, setDeletingPhone] = useState(null);

  const deleteAction = DELETE_ACTIONS[type];

  const deleteUser = useCallback(
    async (user) => {
      const phoneNumber = user?.phoneNumber;

      if (!phoneNumber) {
        throw new Error("Không xác định được số điện thoại người dùng.");
      }

      if (typeof deleteAction !== "function") {
        throw new Error("Không hỗ trợ thao tác xóa cho loại người dùng này.");
      }

      if (deletingPhone !== null) {
        throw new Error("Một thao tác xóa khác đang được xử lý.");
      }

      setDeletingPhone(phoneNumber);

      try {
        const response = await deleteAction(phoneNumber);

        if (typeof onDeleted === "function") {
          await onDeleted(phoneNumber, user);
        }

        return response;
      } finally {
        setDeletingPhone((current) =>
          current === phoneNumber ? null : current,
        );
      }
    },
    [deleteAction, deletingPhone, onDeleted],
  );

  return {
    deletingPhone,

    isDeleting: deletingPhone !== null,

    deleteUser,
  };
}

export default useManagedUserActions;
