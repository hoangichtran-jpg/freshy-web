import dayjs from "dayjs";

export const buildOrderUpdatePayload = (
  currentOrder,
  values,
  fallbackDate,
) => {
  const updatedFields = {};

  if (
    values.totalPrice !==
    currentOrder.totalPrice
  ) {
    updatedFields.totalPrice =
      values.totalPrice;
  }

  if (
    values.timeWanted &&
    (
      !currentOrder.timeWanted ||
      dayjs(values.timeWanted).format(
        "HH:mm",
      ) !==
        dayjs(
          currentOrder.timeWanted,
        ).format("HH:mm")
    )
  ) {
    const baseDate =
      currentOrder.timeWanted
        ? dayjs(currentOrder.timeWanted)
        : dayjs(fallbackDate);

    const newTime = baseDate
      .hour(values.timeWanted.hour())
      .minute(values.timeWanted.minute())
      .second(0);

    updatedFields.timeWanted =
      newTime.format(
        "YYYY-MM-DD HH:mm:ss",
      );
  }

  if (
    values.agencyOrderName !==
    currentOrder.agencyOrderName
  ) {
    updatedFields.agencyOrderName =
      values.agencyOrderName;
  }

  if (
    values.agencyOrderPhone !==
    currentOrder.agencyOrderPhone
  ) {
    updatedFields.agencyOrderPhone =
      values.agencyOrderPhone;
  }

  if (
    (values.note || "") !==
    (currentOrder.note || "")
  ) {
    updatedFields.note = values.note;
  }

  if (
    (values.specialNote || "") !==
    (currentOrder.specialNote || "")
  ) {
    updatedFields.specialNote =
      values.specialNote;
  }

  return updatedFields;
};

export const getRequestItemCount = (request) => {
  try {
    if (
      typeof request.requestData === "string"
    ) {
      const requestData = JSON.parse(
        request.requestData,
      );

      return requestData.numberItems || 0;
    }
  } catch (error) {
    console.error(
      "Lỗi khi parse requestData:",
      error,
      request,
    );
  }

  return request.requestItem?.length || 0;
};

export const getOrderTotalItems = (order) => {
  return (order?.requests || []).reduce(
    (total, request) =>
      total + getRequestItemCount(request),
    0,
  );
};