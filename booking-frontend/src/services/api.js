import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3002/api",
});
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("booking_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const apiError = (error) =>
  error.response?.data?.message ||
  "Layanan sedang tidak tersedia. Coba lagi nanti.";

export function siteContext() {
  const host = window.location.hostname.toLowerCase();
  const root = (
    import.meta.env.VITE_BOOKING_DOMAIN || "booking.rentalku.id"
  ).toLowerCase();
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
  let labels = [];
  if (host.endsWith(".localhost"))
    labels = host.slice(0, -".localhost".length).split(".");
  else if (host.endsWith(`.${root}`))
    labels = host.slice(0, -root.length - 1).split(".");
  const params = new URLSearchParams(window.location.search);
  return {
    tenant:
      isLocal && params.has("tenant")
        ? params.get("tenant")
        : labels.length
          ? labels.at(-1)
          : isLocal
            ? "studio"
            : null,
    pro:
      isLocal && params.has("pro")
        ? params.get("pro")
        : labels.length > 1
          ? labels.at(-2)
          : null,
  };
}
