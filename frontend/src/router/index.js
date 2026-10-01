import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: () => import("../views/public/LandingPage.vue"),
    meta: {
      seo: {
        title: "RentalKu | Aplikasi Rental dan Booking untuk Bisnis Indonesia",
        description:
          "Dua aplikasi untuk bisnis rental dan jasa berbasis jadwal: kelola barang, reservasi, pelanggan, dan operasional dalam ekosistem RentalKu.",
      },
    },
  },
  {
    path: "/order",
    name: "Order",
    component: () => import("../views/public/OrderPage.vue"),
    meta: {
      seo: {
        title: "Daftarkan Bisnis Rental atau Booking | RentalKu",
        description:
          "Pilih aplikasi Rental atau Booking dan daftarkan bisnis Anda ke RentalKu.",
      },
    },
  },
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("../views/admin/LoginPage.vue"),
    meta: { seo: { title: "Admin RentalKu", noindex: true } },
  },
  {
    path: "/admin",
    component: () => import("../components/admin/AdminLayout.vue"),
    meta: { requiresAuth: true, seo: { title: "Admin RentalKu", noindex: true } },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../views/admin/DashboardPage.vue"),
      },
      {
        path: "rental",
        name: "RentalSubscribers",
        component: () => import("../views/admin/SubscriberPage.vue"),
      },
      {
        path: "booking",
        name: "BookingSubscribers",
        component: () => import("../views/admin/SubscriberPage.vue"),
      },
      { path: "subscribers", redirect: "/admin/rental" },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return savedPosition || { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("rentalku_token");
  if (to.matched.some((r) => r.meta.requiresAuth) && !token)
    next("/admin/login");
  else if (to.path === "/admin/login" && token) next("/admin/dashboard");
  else next();
});

export default router;
