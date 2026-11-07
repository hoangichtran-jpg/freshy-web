import { useCallback, useState } from "react";

import { createAddress, deactivateAddressById, updateAddress } from "../api";

function useAddressMutations(
  managerPhone,
  { onCreated, onUpdated, onDeactivated } = {},
) {
  const [mutationAction, setMutationAction] = useState(null);

  const [mutationAddressId, setMutationAddressId] = useState(null);

  /* ========================================
     Create
  ======================================== */

  const createManagedAddress = useCallback(
    async (values) => {
      if (!managerPhone) {
        throw new Error("Không xác định được tài khoản quản lý.");
      }

      const unit = String(values?.unit || "").trim();

      const addressName = String(values?.addressName || "").trim();

      if (!unit) {
        throw new Error("Vui lòng nhập đơn vị.");
      }

      if (!addressName) {
        throw new Error("Vui lòng nhập địa chỉ.");
      }

      setMutationAction("create");

      try {
        const response = await createAddress({
          unit,

          addressName,

          managerPhone,

          addressType: values?.addressType || "NORMAL",
        });

        if (typeof onCreated === "function") {
          await onCreated(response, values);
        }

        return response;
      } finally {
        setMutationAction(null);
      }
    },
    [managerPhone, onCreated],
  );

  /* ========================================
     Update
  ======================================== */

  const updateManagedAddress = useCallback(
    async (address, values) => {
      const addressId = address?.addressId;

      if (addressId == null) {
        throw new Error("Không xác định được địa chỉ cần cập nhật.");
      }

      const unit = String(values?.unit || "").trim();

      const addressName = String(values?.addressName || "").trim();

      if (!unit) {
        throw new Error("Vui lòng nhập đơn vị.");
      }

      if (!addressName) {
        throw new Error("Vui lòng nhập địa chỉ.");
      }

      const currentUnit = String(address?.unit || "").trim();

      const currentAddressName = String(address?.addressName || "").trim();

      /*
       * Giữ behavior legacy:
       * nếu không thay gì thì không gọi API.
       */
      if (unit === currentUnit && addressName === currentAddressName) {
        return {
          status: "unchanged",

          response: null,
        };
      }

      setMutationAction("update");

      setMutationAddressId(addressId);

      try {
        const response = await updateAddress({
          addressId,

          unit,

          addressName,
        });

        if (typeof onUpdated === "function") {
          await onUpdated(response, address, values);
        }

        return {
          status: "updated",

          response,
        };
      } finally {
        setMutationAction(null);

        setMutationAddressId(null);
      }
    },
    [onUpdated],
  );

  /* ========================================
     Deactivate
  ======================================== */

  const deactivateManagedAddress = useCallback(
    async (address) => {
      const addressId = address?.addressId;

      if (addressId == null) {
        throw new Error("Không xác định được địa chỉ cần vô hiệu hoá.");
      }

      setMutationAction("deactivate");

      setMutationAddressId(addressId);

      try {
        const response = await deactivateAddressById(addressId);

        if (typeof onDeactivated === "function") {
          await onDeactivated(addressId, address, response);
        }

        return response;
      } finally {
        setMutationAction(null);

        setMutationAddressId(null);
      }
    },
    [onDeactivated],
  );

  return {
    mutationAction,

    mutationAddressId,

    isMutating: mutationAction !== null,

    isCreating: mutationAction === "create",

    isUpdating: mutationAction === "update",

    isDeactivating: mutationAction === "deactivate",

    createManagedAddress,

    updateManagedAddress,

    deactivateManagedAddress,
  };
}

export default useAddressMutations;
