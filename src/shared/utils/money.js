const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

export function formatVnd(value, { fallback = "" } = {}) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return `${VND_FORMATTER.format(number)} VNĐ`;
}

export function formatMoneyInput(value) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const digits = String(value).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseMoneyInput(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return undefined;
  }

  return Number(digits);
}

export function getNonNegativeMoneyValidationError(
  value,
  {
    fieldLabel = "Phí giao hàng",

    required = true,
  } = {},
) {
  if (value === undefined || value === null || value === "") {
    return required
      ? `Vui lòng nhập ${fieldLabel.toLocaleLowerCase("vi")}.`
      : "";
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return `${fieldLabel} phải lớn hơn hoặc bằng 0.`;
  }

  return "";
}
