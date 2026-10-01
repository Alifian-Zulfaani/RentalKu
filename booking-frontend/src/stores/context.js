import { inject } from "vue";

export const adminContextKey = Symbol("admin-workspace");
export const publicContextKey = Symbol("public-booking-page");

export function useAdminContext() {
  const context = inject(adminContextKey);
  if (!context)
    throw new Error("Halaman admin harus berada di dalam AdminLayout");
  return context;
}

export function usePublicContext() {
  const context = inject(publicContextKey);
  if (!context) throw new Error("Bagian publik harus berada di halaman publik");
  return context;
}
