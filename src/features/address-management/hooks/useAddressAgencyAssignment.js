import { useCallback, useState } from "react";

import { assignAgencyAddress, changeAgencyAddressInfo } from "../api";

function useAddressAgencyAssignment({ onSaved } = {}) {
  const [savingAddressId, setSavingAddressId] = useState(null);

  const saveAgencyInfo = useCallback(
    async ({ address, oldAgency, newAgency, orderInfo }) => {
      const addressId = address?.addressId;

      if (addressId == null) {
        throw new Error("Không xác định được địa chỉ.");
      }

      if (!newAgency?.phoneNumber) {
        throw new Error("Đại lý được chọn không có số điện thoại.");
      }

      const orderName = String(orderInfo?.orderName || "").trim();

      const orderPhone = String(orderInfo?.orderPhone || "").trim();

      const timeReceive = orderInfo?.timeReceive;

      if (!orderName) {
        throw new Error("Vui lòng nhập tên người nhận.");
      }

      if (!orderPhone) {
        throw new Error("Vui lòng nhập số điện thoại người nhận.");
      }

      if (!timeReceive) {
        throw new Error("Vui lòng chọn giờ nhận.");
      }

      if (!orderInfo?.paymentType) {
        throw new Error("Vui lòng chọn phương thức thanh toán.");
      }

      setSavingAddressId(addressId);

      try {
        let response;

        let mode;

        /*
         * Chưa có agency:
         * agency-address/assign
         */
        if (!address?.agencyId) {
          mode = "assign";

          response = await assignAgencyAddress({
            agencyPhone: newAgency.phoneNumber,

            addresses: [
              {
                addressId,

                orderName,

                orderPhone,

                time: timeReceive,

                note: orderInfo?.note ?? "",

                paymentType: orderInfo.paymentType,
              },
            ],
          });
        } else {
          /*
           * Đã có agency:
           * agency-address/change-info
           */
          if (!oldAgency?.phoneNumber) {
            throw new Error(
              "Không xác định được đại lý đang gán cho địa chỉ này.",
            );
          }

          if (address?.agencyAddressId == null) {
            throw new Error("Không xác định được liên kết đại lý và địa chỉ.");
          }

          mode = "update";

          response = await changeAgencyAddressInfo({
            agencyAddressId: address.agencyAddressId,

            oldAgencyPhone: oldAgency.phoneNumber,

            newAgencyPhone: newAgency.phoneNumber,

            orderNameNew: orderName,

            orderPhoneNew: orderPhone,

            timeReceive,

            /*
             * Giữ chuỗi rỗng.
             * User phải có thể xoá note cũ.
             */
            note: orderInfo?.note ?? "",

            paymentType: orderInfo.paymentType,
          });
        }

        const result = {
          mode,

          response,
        };

        if (typeof onSaved === "function") {
          await onSaved(result, address);
        }

        return result;
      } finally {
        setSavingAddressId(null);
      }
    },
    [onSaved],
  );

  return {
    savingAddressId,

    isSaving: savingAddressId !== null,

    saveAgencyInfo,
  };
}

export default useAddressAgencyAssignment;
