export const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value, options = {}) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(value));
};

export const getApiError = (error, fallback = "Terjadi kesalahan. Coba lagi.") => {
  const response = error.response?.data;
  const errors = Array.isArray(response?.errors) ? response.errors : [];
  const firstFieldError = errors.find((item) => item?.message);

  return firstFieldError?.message || response?.message || fallback;
};
