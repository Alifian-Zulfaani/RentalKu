import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: () => import("../views/public/LandingPage.vue"),
    meta: {
      seo: {
        title: "Summit Gear | Rental Peralatan Outdoor",
        description:
          "Sewa peralatan outdoor yang terawat dengan proses booking yang ringkas.",
      },
    },
  },
  {
    path: "/sewa",
    name: "Rental",
    component: () => import("../views/public/RentalPage.vue"),
    meta: {
      seo: {
        title: "Sewa Perlengkapan | Summit Gear",
        description:
          "Pilih gear outdoor dan lakukan booking dalam dua langkah.",
      },
    },
  },
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("../views/admin/LoginPage.vue"),
    meta: {
      guestOnly: true,
      seo: { title: "Login Admin | Summit Gear", noindex: true },
    },
  },
  {
    path: "/admin",
    component: () => import("../components/admin/AdminLayout.vue"),
    meta: {
      requiresAuth: true,
      seo: { title: "Panel Admin | Summit Gear", noindex: true },
    },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../views/admin/DashboardPage.vue"),
      },
      {
        path: "inventory",
        name: "Inventory",
        component: () => import("../views/admin/InventoryPage.vue"),
      },
      {
        path: "customers",
        name: "Customers",
        component: () => import("../views/admin/CustomersPage.vue"),
      },
      {
        path: "orders",
        name: "Orders",
        component: () => import("../views/admin/OrdersPage.vue"),
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("../views/admin/SettingsPage.vue"),
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

router.beforeEach((to) => {
  const token = localStorage.getItem("customer_rentalku_token");
  if (to.matched.some((record) => record.meta.requiresAuth) && !token) {
    return { path: "/admin/login", query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && token) return "/admin/dashboard";
  return true;
});

export default router;
