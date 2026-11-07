import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useKitchens } from "../../../shared/hooks";

import {
  deactivatePosAddressAssignment,
  getPosAddresses,
  updatePosAddressShippingFee,
} from "../api";

const normalizeSearchValue = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("vi");

function usePosAddresses(managerPhone) {
  const {
    kitchens,

    selectedKitchenId,

    selectedKitchen,

    posName,

    loading: kitchensLoading,

    error: kitchensError,

    handleKitchenSelect,
  } = useKitchens(managerPhone);

  const [addresses, setAddresses] = useState([]);

  const [searchValue, setSearchValue] = useState("");

  const [addressesLoading, setAddressesLoading] = useState(false);

  const [addressesError, setAddressesError] = useState(null);

  const [mutationAction, setMutationAction] = useState(null);

  const [mutationPosAgencyId, setMutationPosAgencyId] = useState(null);

  const requestSequence = useRef(0);

  /* ========================================
     Fetch addresses
  ======================================== */

  const refreshAddresses = useCallback(async () => {
    const requestId = requestSequence.current + 1;

    requestSequence.current = requestId;

    if (selectedKitchenId == null) {
      setAddresses([]);

      setAddressesError(null);

      setAddressesLoading(false);

      return [];
    }

    setAddressesLoading(true);

    setAddressesError(null);

    try {
      const response = await getPosAddresses({
        posId: selectedKitchenId,
      });

      const nextAddresses = Array.isArray(response) ? response : [];

      if (requestSequence.current !== requestId) {
        return nextAddresses;
      }

      setAddresses(nextAddresses);

      return nextAddresses;
    } catch (requestError) {
      if (requestSequence.current === requestId) {
        setAddresses([]);

        setAddressesError(requestError);
      }

      throw requestError;
    } finally {
      if (requestSequence.current === requestId) {
        setAddressesLoading(false);
      }
    }
  }, [selectedKitchenId]);

  useEffect(() => {
    refreshAddresses().catch(() => {});

    return () => {
      requestSequence.current += 1;
    };
  }, [refreshAddresses]);

  /*
   * Đổi trung tâm
   * → reset search cũ.
   */
  useEffect(() => {
    setSearchValue("");
  }, [selectedKitchenId]);

  /* ========================================
     Search
  ======================================== */

  const normalizedSearch = useMemo(
    () => normalizeSearchValue(searchValue),
    [searchValue],
  );

  const filteredAddresses = useMemo(() => {
    if (!normalizedSearch) {
      return addresses;
    }

    return addresses.filter((item) => {
      const address = String(item?.address || "").toLocaleLowerCase("vi");

      const unit = String(item?.unit || "").toLocaleLowerCase("vi");

      return (
        address.includes(normalizedSearch) || unit.includes(normalizedSearch)
      );
    });
  }, [addresses, normalizedSearch]);

  const clearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  /* ========================================
     Update shipping fee
  ======================================== */

  const updateShippingFee = useCallback(
    async (record, newFeeShip) => {
      const posAgencyId = record?.posAgencyId;

      if (posAgencyId == null) {
        throw new Error("Không xác định được liên kết trung tâm và địa chỉ.");
      }

      const normalizedFee = Number(newFeeShip);

      if (!Number.isFinite(normalizedFee) || normalizedFee < 0) {
        throw new Error("Phí giao hàng không hợp lệ.");
      }

      setMutationAction("update-fee");

      setMutationPosAgencyId(posAgencyId);

      try {
        const response = await updatePosAddressShippingFee({
          posAgencyId,

          newFeeShip: normalizedFee,
        });

        /*
         * Mutation đã thành công.
         *
         * Refresh lỗi không được biến thành
         * "mutation thất bại".
         */
        let refreshError = null;

        try {
          await refreshAddresses();
        } catch (error) {
          refreshError = error;
        }

        return {
          response,

          refreshError,
        };
      } finally {
        setMutationAction(null);

        setMutationPosAgencyId(null);
      }
    },
    [refreshAddresses],
  );

  /* ========================================
     Deactivate mapping
  ======================================== */

  const deactivatePosAddress = useCallback(
    async (record) => {
      const posAgencyId = record?.posAgencyId;

      if (posAgencyId == null) {
        throw new Error("Không xác định được liên kết trung tâm và địa chỉ.");
      }

      setMutationAction("deactivate");

      setMutationPosAgencyId(posAgencyId);

      try {
        const response = await deactivatePosAddressAssignment({
          posAgencyId,
        });

        /*
         * Optimistic local removal:
         * user thấy kết quả ngay.
         */
        setAddresses((previous) =>
          previous.filter((item) => item?.posAgencyId !== posAgencyId),
        );

        let refreshError = null;

        try {
          await refreshAddresses();
        } catch (error) {
          refreshError = error;
        }

        return {
          response,

          refreshError,
        };
      } finally {
        setMutationAction(null);

        setMutationPosAgencyId(null);
      }
    },
    [refreshAddresses],
  );

  return {
    kitchens,

    selectedKitchenId,

    selectedKitchen,

    posName,

    handleKitchenSelect,

    kitchensLoading,

    kitchensError,

    addresses,

    filteredAddresses,

    total: addresses.length,

    filteredTotal: filteredAddresses.length,

    searchValue,

    hasSearch: Boolean(normalizedSearch),

    setSearchValue,

    clearSearch,

    addressesLoading,

    addressesError,

    loading: kitchensLoading || addressesLoading,

    error: kitchensError || addressesError,

    refreshAddresses,

    mutationAction,

    mutationPosAgencyId,

    isMutating: mutationAction !== null,

    updateShippingFee,

    deactivatePosAddress,
  };
}

export default usePosAddresses;
