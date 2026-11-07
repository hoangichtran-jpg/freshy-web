import {
  request,
} from "../../../shared/api/httpClient";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

/* ========================================
   Assign agency to address
======================================== */

export const assignAgencyAddress = async ({ agencyPhone, addresses }) => {
  /*
   * Giữ nguyên contract backend hiện tại:
   *
   * {
   *   agencyPhone,
   *   addressIds: [...]
   * }
   *
   * Dù field tên addressIds nhưng thực tế
   * là array object chứa cả order info.
   */
  const addressIds = addresses.map((address) => ({
    addressId: address.addressId,

    orderName: address.orderName,

    orderPhone: address.orderPhone,

    time: address.time,

    note: address.note,

    paymentType: address.paymentType,
  }));

  try {
    const response = await request.post(
      "agency-address/assign",
      {
        agencyPhone,
        addressIds,
      },
      {
        headers: JSON_HEADERS,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};

/* ========================================
   Update agency/address order info
======================================== */

export const changeAgencyAddressInfo = async (params) => {
  const {
    agencyAddressId,
    oldAgencyPhone,
    newAgencyPhone,
    orderNameNew,
    orderPhoneNew,
    timeReceive,
    note,
    paymentType,
  } = params;

  /*
   * Giữ nguyên việc gửi null cho
   * các field optional.
   *
   * Riêng chuỗi rỗng được giữ nguyên,
   * ví dụ user muốn xóa ghi chú.
   */
  const body = {
    agencyAddressId,

    oldAgencyPhone,

    newAgencyPhone: newAgencyPhone ?? null,

    orderNameNew: orderNameNew ?? null,

    orderPhoneNew: orderPhoneNew ?? null,

    timeReceive: timeReceive ?? null,

    note: note ?? null,

    paymentType: paymentType ?? null,
  };

  try {
    const response = await request.put("agency-address/change-info", body, {
      headers: JSON_HEADERS,
    });

    return response.data;
  } catch (error) {
    console.error(error?.response || error?.message || error);

    throw error;
  }
};
