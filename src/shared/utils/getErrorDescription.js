export default function getErrorDescription(
  error,
  fallback = "Vui lòng thử lại.",
) {
  const data =
    error?.response?.data;

  if (
    typeof data ===
    "string"
  ) {
    return data;
  }

  if (
    typeof data?.message ===
    "string"
  ) {
    return data.message;
  }

  if (
    typeof error?.message ===
    "string"
  ) {
    return error.message;
  }

  return fallback;
}