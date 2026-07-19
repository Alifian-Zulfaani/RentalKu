import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: () => import("../views/public/LandingPage.vue"),
  },
  {
    path: "/order",
    name: "Order",
    component: () => import("../views/public/OrderPage.vue"),
  },
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("../views/admin/LoginPage.vue"),
  },
  {
    path: "/admin",
    component: () => import("../components/admin/AdminLayout.vue"),
    meta: { requiresAuth: true },
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
  else next();
});

export default router;
