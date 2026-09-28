export const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value, options = {}) => {
  if (!value) return "-";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(normalized));
};

export const getApiError = (
  error,
  fallback = "Terjadi kesalahan. Coba lagi.",
) => {
  const response = error.response?.data;
  const errors = Array.isArray(response?.errors) ? response.errors : [];
  const firstFieldError = errors.find((item) => item?.message);

  return firstFieldError?.message || response?.message || fallback;
};

export const getApiFieldErrors = (error) => {
  const errors = error.response?.data?.errors;
  if (!Array.isArray(errors)) return {};
  return errors.reduce((result, item) => {
    const field = String(item?.field || "").replace(
      /^items\.\d+\..+$/,
      "items",
    );
    if (field && !result[field]) result[field] = item.message;
    return result;
  }, {});
};

export const orderStatusLabel = (status) =>
  ({
    booking: "Menunggu",
    active: "Sedang disewa",
    late: "Terlambat",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  })[status] ||
  status ||
  "-";

export const inventoryStatusLabel = (status) =>
  ({ active: "Aktif", maintenance: "Perawatan", inactive: "Nonaktif" })[
    status
  ] ||
  status ||
  "-";

export const toWhatsAppUrl = (value, message = "") => {
  const digits = String(value || "").replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  if (!normalized) return "#";
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${normalized}${query}`;
};
