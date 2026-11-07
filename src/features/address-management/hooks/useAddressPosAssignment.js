import { useCallback, useState } from "react";

import { assignAddressToPos as assignAddressToPosApi } from "../api";

function useAddressPosAssignment({ onAssigned } = {}) {
  const [assigningAddressId, setAssigningAddressId] = useState(null);

  const assignAddressToPos = useCallback(
    async (address, { posId, shippingFee }) => {
      const addressId = address?.addressId;

      if (addressId == null) {
        throw new Error("Không xác định được địa chỉ.");
      }

      const agencyAddressId = address?.agencyAddressId;

      if (agencyAddressId == null) {
        throw new Error(
          "Địa chỉ cần được gán đại lý trước khi thêm vào trung tâm.",
        );
      }

      if (posId == null || posId === "") {
        throw new Error("Vui lòng chọn trung tâm.");
      }

      const normalizedFee = Number(shippingFee);

      if (!Number.isFinite(normalizedFee) || normalizedFee < 0) {
        throw new Error("Phí giao hàng không hợp lệ.");
      }

      setAssigningAddressId(addressId);

      try {
        const response = await assignAddressToPosApi({
          posId,

          agencyAddressFee: {
            agencyAddressId,

            feeShip: normalizedFee,
          },
        });

        if (typeof onAssigned === "function") {
          await onAssigned(response, address, {
            posId,

            shippingFee: normalizedFee,
          });
        }

        return response;
      } finally {
        setAssigningAddressId(null);
      }
    },
    [onAssigned],
  );

  return {
    assigningAddressId,

    isAssigning: assigningAddressId !== null,

    assignAddressToPos,
  };
}

export default useAddressPosAssignment;
