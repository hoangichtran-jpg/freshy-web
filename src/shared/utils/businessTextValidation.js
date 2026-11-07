/* ========================================
   Business text validation
======================================== */

/*
 * Text fields such as item names, menu names,
 * topping-group names, and topping names are
 * business data, not technical identifiers.
 *
 * IMPORTANT:
 * Do not sanitize or normalize a controlled
 * input value inside onChange.
 *
 * Vietnamese input methods such as UniKey use
 * IME composition. Rewriting the value while
 * composition is in progress can make characters
 * disappear on some browser / machine combinations.
 *
 * Correct flow:
 *
 * user types raw value
 *        ↓
 * Add / Save
 *        ↓
 * normalizeBusinessText()
 *        ↓
 * getBusinessTextValidationError()
 *        ↓
 * API payload
 */

const BUSINESS_TEXT_PATTERN = /^[\p{L}\p{M}\p{N}\s.,'’()&+\-/%:#]+$/u;

/* ========================================
   Normalize
======================================== */

export function normalizeBusinessText(value = "") {
  return (
    String(value ?? "")
      /*
       * Canonical Unicode normalization keeps
       * Vietnamese text consistent regardless of
       * how the IME produced combining characters.
       */
      .normalize("NFC")
      /*
       * Business names should not store repeated
       * whitespace or leading / trailing spaces.
       */
      .replace(/\s+/gu, " ")
      .trim()
  );
}

/* ========================================
   Validate
======================================== */

export function getBusinessTextValidationError(
  value,
  { fieldLabel = "Tên", maxLength = 150 } = {},
) {
  const normalized = normalizeBusinessText(value);

  const normalizedLabel = String(fieldLabel || "Tên").trim() || "Tên";

  const lowerLabel = `${normalizedLabel
    .charAt(0)
    .toLocaleLowerCase("vi")}${normalizedLabel.slice(1)}`;

  if (!normalized) {
    return `Vui lòng nhập ${lowerLabel}.`;
  }

  if (normalized.length > maxLength) {
    return `${normalizedLabel} không được vượt quá ${maxLength} ký tự.`;
  }

  if (!BUSINESS_TEXT_PATTERN.test(normalized)) {
    return `${normalizedLabel} chứa ký tự không được hỗ trợ.`;
  }

  return "";
}
