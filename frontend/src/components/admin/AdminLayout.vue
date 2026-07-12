<template>
  <div class="admin-layout">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileOpen }">
      <div class="sidebar-header">
        <router-link to="/admin/dashboard" class="sidebar-brand">
          <span class="brand-full" v-if="!sidebarCollapsed">Rental<span class="text-gradient">Ku</span></span>
          <span class="brand-short text-gradient" v-else>RK</span>
        </router-link>
        <div class="sidebar-badge" v-if="!sidebarCollapsed">Company</div>
      </div>
      <nav class="sidebar-nav">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" :class="{ active: $route.path === item.path }" @click="mobileOpen = false">
          <component :is="item.icon" :size="20" />
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="handleLogout">
          <LogOut :size="20" />
          <span v-if="!sidebarCollapsed">Keluar</span>
        </button>
      </div>
    </aside>
    <div class="sidebar-overlay" v-if="mobileOpen" @click="mobileOpen = false"></div>
    <div class="main-content" :class="{ expanded: sidebarCollapsed }">
      <header class="top-header">
        <div class="header-left">
          <button class="toggle-btn" @click="toggleSidebar"><Menu :size="22" /></button>
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <button class="theme-toggle" @click="themeStore.toggleTheme" aria-label="Toggle theme">
            <Sun v-if="themeStore.isDark" :size="20" />
            <Moon v-else :size="20" />
          </button>
          <div class="admin-info">
            <div class="admin-avatar">{{ adminInitial }}</div>
            <span class="admin-name hide-mobile">{{ auth.admin?.name || 'Admin' }}</span>
          </div>
        </div>
      </header>
      <main class="content-area"><router-view /></main>
    </div>

    <ConfirmModal 
      :isOpen="showLogoutModal"
      title="Konfirmasi Keluar"
      message="Apakah Anda yakin ingin keluar dari halaman admin?"
      confirmText="Ya, Keluar"
      confirmClass="btn-danger"
      @cancel="showLogoutModal = false"
      @confirm="executeLogout"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { LayoutDashboard, Users, LogOut, Menu, Sun, Moon } from 'lucide-vue-next'
import ConfirmModal from './ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const themeStore = useThemeStore()
const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
const showLogoutModal = ref(false)

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/subscribers', label: 'Subscriber', icon: Users }
]

const currentPageTitle = computed(() => navItems.find(n => n.path === route.path)?.label || 'Admin')
const adminInitial = computed(() => (auth.admin?.name || 'A').charAt(0).toUpperCase())

function toggleSidebar() {
  if (window.innerWidth <= 768) mobileOpen.value = !mobileOpen.value
  else sidebarCollapsed.value = !sidebarCollapsed.value
}

function handleLogout() {
  showLogoutModal.value = true
}

function executeLogout() {
  showLogoutModal.value = false
  auth.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; background: var(--admin-bg); }
.sidebar { width: 260px; background: var(--admin-sidebar); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0; left: 0; z-index: 100; transition: width 0.3s; }
.sidebar.collapsed { width: 72px; }
.sidebar-header { padding: 20px; border-bottom: 1px solid var(--border-color); text-align: center; }
.sidebar-brand { font-size: 1.5rem; font-weight: 800; display: block; }
.brand-short { font-size: 1.3rem; font-weight: 800; }
.sidebar-badge { display: inline-block; margin-top: 6px; padding: 2px 10px; background: var(--accent-soft); color: var(--text-accent); border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
.sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 0.95rem; font-weight: 500; transition: all 0.2s; text-decoration: none; cursor: pointer; background: none; border: none; width: 100%; text-align: left; font-family: inherit; }
.nav-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.nav-item.active { background: var(--accent-soft); color: var(--text-accent); }
.sidebar.collapsed .nav-item { justify-content: center; padding: 12px; }
.sidebar-footer { padding: 12px; border-top: 1px solid var(--border-color); }
.logout-btn { color: var(--danger) !important; }
.main-content { flex: 1; margin-left: 260px; transition: margin-left 0.3s; }
.main-content.expanded { margin-left: 72px; }
.top-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; border-bottom: 1px solid var(--border-color); background: var(--admin-sidebar); position: sticky; top: 0; z-index: 50; }
.header-left { display: flex; align-items: center; gap: 16px; }
.toggle-btn { background: none; color: var(--text-secondary); padding: 8px; border-radius: var(--radius-sm); transition: all 0.2s; }
.toggle-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.page-title { font-size: 1.15rem; font-weight: 700; }
.header-right { display: flex; align-items: center; gap: 16px; }
.theme-toggle { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); cursor: pointer; transition: all 0.3s; }
.theme-toggle:hover { background: var(--bg-glass-hover); color: var(--accent-primary); }
.admin-info { display: flex; align-items: center; gap: 10px; padding-left: 16px; border-left: 1px solid var(--border-color); }
.admin-avatar { width: 36px; height: 36px; background: var(--accent-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; color: white; }
.admin-name { font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); }
.content-area { padding: 32px; }
.sidebar-overlay { display: none; }
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); width: 260px !important; }
  .sidebar.mobile-open { transform: translateX(0); }
  .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
  .main-content { margin-left: 0 !important; }
  .top-header { padding: 12px 16px; }
  .content-area { padding: 16px; }
}
</style>
