export const MAX_PERSON_NAME_LENGTH = 50;

/* ========================================
   Patterns
======================================== */

const VIETNAM_MOBILE_PATTERN = /^\+84[35789]\d{8}$/;

const PERSON_NAME_PATTERN = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

/* ========================================
   Vietnamese phone
======================================== */

export function normalizeVietnamPhoneInput(value) {
  const raw = String(value || "");

  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  /*
   * +84xxxxxxxxx / 84xxxxxxxxx
   *
   * 84 + 9 chữ số subscriber
   * = tối đa 11 digit.
   */
  if (digits.startsWith("84")) {
    return `+${digits.slice(0, 11)}`;
  }

  /*
   * 0xxxxxxxxx
   * = tối đa 10 digit.
   */
  if (digits.startsWith("0")) {
    return digits.slice(0, 10);
  }

  /*
   * Cho phép nhập trực tiếp:
   * 961437205
   */
  return digits.slice(0, 9);
}

export function normalizeVietnamPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("84")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+84${digits.slice(1)}`;
  }

  return `+84${digits}`;
}

export function isValidVietnamMobilePhone(value) {
  const normalized = normalizeVietnamPhoneNumber(value);

  return VIETNAM_MOBILE_PATTERN.test(normalized);
}

export function getVietnamPhoneValidationError(value) {
  const normalized = normalizeVietnamPhoneNumber(value);

  if (!normalized || normalized === "+84") {
    return "Vui lòng nhập số điện thoại.";
  }

  if (!VIETNAM_MOBILE_PATTERN.test(normalized)) {
    return "Số điện thoại Việt Nam chưa hợp lệ.";
  }

  return "";
}

/* ========================================
   Person name
======================================== */

export function normalizePersonName(value) {
  if (value == null) {
    return value;
  }

  return String(value)
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "");
}

export function isValidPersonName(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return false;
  }

  if (normalized.length > MAX_PERSON_NAME_LENGTH) {
    return false;
  }

  return PERSON_NAME_PATTERN.test(normalized);
}

export function getPersonNameValidationError(value, fieldLabel = "Tên") {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return `Vui lòng nhập ${fieldLabel}.`;
  }

  if (normalized.length > MAX_PERSON_NAME_LENGTH) {
    return `${fieldLabel} không được vượt quá ${MAX_PERSON_NAME_LENGTH} ký tự.`;
  }

  if (!PERSON_NAME_PATTERN.test(normalized)) {
    return `${fieldLabel} chỉ được chứa chữ cái, khoảng trắng, dấu ' hoặc dấu -.`;
  }

  return "";
}
