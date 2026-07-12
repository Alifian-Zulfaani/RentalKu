import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/public/LandingPage.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/LoginPage.vue')
  },
  {
    path: '/admin',
    component: () => import('../components/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/admin/DashboardPage.vue') },
      { path: 'inventory', name: 'Inventory', component: () => import('../views/admin/InventoryPage.vue') },
      { path: 'customers', name: 'Customers', component: () => import('../views/admin/CustomersPage.vue') },
      { path: 'orders', name: 'Orders', component: () => import('../views/admin/OrdersPage.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../views/admin/SettingsPage.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('customer_rentalku_token')
  if (to.matched.some(r => r.meta.requiresAuth) && !token) next('/admin/login')
  else next()
})

export default router
