import { createRouter, createWebHistory } from "vue-router";

const adminPages = [
  {
    path: "dashboard",
    name: "Dashboard",
    component: () => import("../views/admin/DashboardPage.vue"),
    meta: { menuKey: "overview", title: "Ringkasan" },
  },
  {
    path: "bookings",
    name: "Bookings",
    component: () => import("../views/admin/BookingsPage.vue"),
    meta: { menuKey: "bookings", title: "Reservasi" },
  },
  {
    path: "availability",
    name: "Availability",
    component: () => import("../views/admin/AvailabilityPage.vue"),
    meta: { menuKey: "availability", title: "Jadwal & ketersediaan" },
  },
  {
    path: "photographers",
    name: "Professionals",
    component: () => import("../views/admin/ProfessionalsPage.vue"),
    meta: { menuKey: "team", title: "Fotografer" },
  },
  {
    path: "photographers/new",
    name: "PhotographerCreate",
    component: () => import("../views/admin/PhotographerCreatePage.vue"),
    meta: { menuKey: "team", title: "Tambah fotografer", companyOnly: true },
  },
  {
    path: "photographers/:id/edit",
    name: "PhotographerEdit",
    component: () => import("../views/admin/PhotographerEditPage.vue"),
    meta: { menuKey: "team", title: "Edit fotografer" },
  },
  {
    path: "photographers/:id",
    name: "PhotographerDetail",
    component: () => import("../views/admin/PhotographerDetailPage.vue"),
    meta: { menuKey: "team", title: "Detail fotografer" },
  },
  {
    path: "services",
    name: "Services",
    component: () => import("../views/admin/ServicesPage.vue"),
    meta: { menuKey: "services", title: "Layanan studio", companyOnly: true },
  },
  {
    path: "settings",
    name: "Settings",
    component: () => import("../views/admin/SettingsPage.vue"),
    meta: { menuKey: "settings", title: "Pengaturan" },
  },
  { path: "blocks", redirect: "/admin/availability" },
  { path: "schedule", redirect: "/admin/availability" },
  { path: "professionals", redirect: "/admin/photographers" },
  { path: "offerings", redirect: "/admin/photographers" },
  { path: "site", redirect: "/admin/settings" },
  { path: "accounts", redirect: "/admin/settings" },
  { path: "security", redirect: "/admin/settings" },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Landing",
      component: () => import("../views/public/LandingPage.vue"),
    },
    {
      path: "/reservasi/berhasil",
      name: "booking-success",
      component: () => import("../views/public/BookingSuccessPage.vue"),
    },
    {
      path: "/admin/login",
      name: "AdminLogin",
      component: () => import("../views/admin/LoginPage.vue"),
      meta: { guestOnly: true, title: "Masuk Admin" },
    },
    {
      path: "/admin",
      component: () => import("../components/admin/AdminLayout.vue"),
      meta: { requiresAuth: true },
      children: [{ path: "", redirect: "/admin/dashboard" }, ...adminPages],
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return savedPosition || { top: 0 };
  },
});

router.beforeEach((to) => {
  const token = sessionStorage.getItem("booking_admin_token");
  if (to.matched.some((record) => record.meta.requiresAuth) && !token)
    return { name: "AdminLogin", query: { redirect: to.fullPath } };
  if (to.meta.guestOnly && token) return { name: "Dashboard" };
  if (to.meta.companyOnly) {
    const account = JSON.parse(
      sessionStorage.getItem("booking_admin_account") || "{}",
    );
    if (account.role !== "company") return { name: "Dashboard" };
  }
  return true;
});

router.afterEach((to) => {
  if (!to.meta.title) return;
  const tenant =
    sessionStorage.getItem("booking_tenant_name") || "Studio Senja";
  document.title = `${to.meta.title} | ${tenant}`;
});

export default router;
