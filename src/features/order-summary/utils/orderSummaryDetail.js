export const normalizeOrderSummaryDetail = (data) => ({
  ...data,
  requests: (data.requests || []).map((req) => {
    if (typeof req.requestData === "string") return req;

    const requestId = req.id ?? req.requestId;

    return {
      ...req,
      requestId,
      requestData: JSON.stringify({
        requestId,
        requestItem: req.requestItem || [],
        numberItems: (req.requestItem || []).reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0,
        ),
        totalPrice: req.totalPrice,
        dateTime: /^\d{4}-\d{2}-\d{2}$/.test(data.dateTime || "")
          ? data.dateTime.split("-").map(Number)
          : data.dateTime,
        customerOrderName: req.customerOrderName,
        customerOrderPhone: req.customerOrderPhone,
        paymentStatus: req.paymentStatus,
        note: req.note,
      }),
    };
  }),
});
