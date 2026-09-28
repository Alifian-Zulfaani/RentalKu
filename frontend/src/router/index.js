import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: () => import("../views/public/LandingPage.vue"),
    meta: {
      seo: {
        title: "RentalKu | Platform Manajemen Rental untuk Bisnis Indonesia",
        description:
          "Kelola order, inventaris, dan pelanggan rental dalam satu workspace yang rapi. Akses lifetime untuk bisnis rental Indonesia.",
      },
    },
  },
  {
    path: "/order",
    name: "Order",
    component: () => import("../views/public/OrderPage.vue"),
    meta: {
      seo: {
        title: "Daftarkan Bisnis Rental | RentalKu",
        description:
          "Daftarkan bisnis rental Anda dan mulai kelola operasional, inventaris, serta pelanggan dalam RentalKu.",
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
        path: "subscribers",
        name: "Subscribers",
        component: () => import("../views/admin/SubscriberPage.vue"),
      },
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
