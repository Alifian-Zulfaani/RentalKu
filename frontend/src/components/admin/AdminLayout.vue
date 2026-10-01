<template>
  <div class="admin-shell">
    <aside
      class="sidebar"
      :class="{ open: mobileOpen, collapsed: sidebarCollapsed }"
      id="admin-sidebar"
    >
      <router-link to="/admin/dashboard" class="sidebar-brand" @click="mobileOpen = false"
        ><span>R.</span
        ><strong v-if="showSidebarLabels">RentalKu</strong></router-link
      >
      <p v-if="showSidebarLabels" class="workspace-label">Panel platform</p>
      <nav class="sidebar-nav" aria-label="Navigasi admin">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          @click="mobileOpen = false"
        >
          <component :is="item.icon" :size="19" /><span
            v-if="showSidebarLabels"
            >{{ item.label }}</span
          >
        </router-link>
      </nav>
      <button
        class="nav-item logout"
        type="button"
        @click="showLogoutModal = true"
      >
        <LogOut :size="19" /><span v-if="showSidebarLabels">Keluar</span>
      </button>
    </aside>
    <div
      v-if="isCompactViewport && mobileOpen"
      class="mobile-overlay"
      @click="mobileOpen = false"
    ></div>

    <div class="admin-main" :class="{ expanded: sidebarCollapsed }">
      <header class="admin-header">
        <div class="header-left">
          <button
            class="header-icon"
            type="button"
            :aria-label="isCompactViewport ? (mobileOpen ? 'Tutup navigasi' : 'Buka navigasi') : (sidebarCollapsed ? 'Perluas navigasi' : 'Ringkas navigasi')"
            :aria-expanded="isCompactViewport ? mobileOpen : undefined"
            aria-controls="admin-sidebar"
            @click="toggleSidebar"
          >
            <PanelLeft :size="19" />
          </button>
          <div>
            <p class="breadcrumb">RentalKu / Admin</p>
            <h1>{{ currentPageTitle }}</h1>
          </div>
        </div>
        <div class="header-right">
          <button
            class="header-icon"
            type="button"
            :aria-label="themeLabel"
            @click="themeStore.toggleTheme"
          >
            <Sun v-if="themeStore.isDark" :size="18" /><Moon
              v-else
              :size="18"
            />
          </button>
          <div class="admin-profile">
            <span>{{ adminInitial }}</span>
            <div class="hide-mobile">
              <strong>{{ auth.admin?.name || "Administrator" }}</strong
              ><small>Administrator</small>
            </div>
          </div>
        </div>
      </header>
      <main class="content-area"><router-view /></main>
    </div>

    <ConfirmModal
      :isOpen="showLogoutModal"
      title="Keluar dari dashboard?"
      message="Sesi admin pada perangkat ini akan diakhiri."
      confirmText="Keluar"
      confirmClass="btn-danger"
      @cancel="showLogoutModal = false"
      @confirm="executeLogout"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeft,
  Sun,
  Users,
} from "lucide-vue-next";
import ConfirmModal from "./ConfirmModal.vue";
import { useAuthStore } from "../../stores/auth";
import { useThemeStore } from "../../stores/theme";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const themeStore = useThemeStore();
const sidebarCollapsed = ref(false);
const mobileOpen = ref(false);
const isCompactViewport = ref(window.innerWidth < 1200);
const showSidebarLabels = computed(
  () => isCompactViewport.value || !sidebarCollapsed.value,
);
const showLogoutModal = ref(false);
const navItems = [
  { path: "/admin/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { path: "/admin/rental", label: "Pendaftar Rental", icon: Users },
  { path: "/admin/booking", label: "Pendaftar Booking", icon: CalendarDays },
];
const currentPageTitle = computed(
  () => navItems.find((item) => item.path === route.path)?.label || "Admin",
);
const adminInitial = computed(() =>
  (auth.admin?.name || "A").charAt(0).toUpperCase(),
);
const themeLabel = computed(() =>
  themeStore.isDark ? "Gunakan mode terang" : "Gunakan mode gelap",
);

function toggleSidebar() {
  if (isCompactViewport.value) mobileOpen.value = !mobileOpen.value;
  else sidebarCollapsed.value = !sidebarCollapsed.value;
}
function syncViewport() {
  isCompactViewport.value = window.innerWidth < 1200;
  if (!isCompactViewport.value) mobileOpen.value = false;
}
function onKeydown(event) {
  if (event.key === "Escape") mobileOpen.value = false;
}
watch(() => route.fullPath, () => { mobileOpen.value = false; });
watch(mobileOpen, (open) => {
  document.body.style.overflow = open && isCompactViewport.value ? "hidden" : "";
});
onMounted(() => {
  syncViewport();
  window.addEventListener("resize", syncViewport, { passive: true });
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  document.body.style.overflow = "";
  window.removeEventListener("resize", syncViewport);
  window.removeEventListener("keydown", onKeydown);
});
function executeLogout() {
  showLogoutModal.value = false;
  auth.logout();
  router.push("/admin/login");
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: var(--admin-bg);
}
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  display: flex;
  width: 244px;
  flex-direction: column;
  padding: 20px 12px 12px;
  background: var(--admin-sidebar);
  color: var(--text-primary);
  border-right: 1px solid var(--sidebar-border);
  transition:
    width 0.2s,
    transform 0.2s;
}
.sidebar.collapsed {
  width: 68px;
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  padding: 0 8px;
  font-family: var(--font-display);
  font-size: 1.1rem;
}
.sidebar-brand > span {
  display: grid;
  width: 29px;
  height: 29px;
  flex: 0 0 29px;
  place-items: center;
  border-radius: 5px;
  background: var(--sidebar-brand);
  color: var(--sidebar-brand-text);
}
.workspace-label {
  margin: 22px 8px 8px;
  color: var(--sidebar-muted);
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.sidebar-nav {
  display: grid;
  gap: 4px;
}
.sidebar.collapsed .sidebar-nav {
  margin-top: 26px;
}
.nav-item {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 11px;
  padding: 0 10px;
  border-radius: 5px;
  color: var(--sidebar-text);
  font-size: 0.88rem;
  font-weight: 700;
  text-align: left;
  background: transparent;
}
.nav-item:hover {
  color: var(--text-primary);
  background: var(--sidebar-hover);
}
.nav-item.router-link-active {
  color: var(--sidebar-active-text);
  background: var(--sidebar-active);
}
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0;
}
.logout {
  width: 100%;
  margin-top: auto;
  color: var(--sidebar-logout);
}
.admin-main {
  min-height: 100vh;
  min-width: 0;
  margin-left: 244px;
  transition: margin-left 0.2s;
}
.admin-main.expanded {
  margin-left: 68px;
}
.admin-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  min-height: 70px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 32px;
  border-bottom: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--admin-bg) 92%, transparent);
  backdrop-filter: blur(10px);
}
.header-left,
.header-right,
.admin-profile {
  display: flex;
  align-items: center;
}
.header-left {
  gap: 13px;
  min-width: 0;
}
.header-right {
  gap: 15px;
}
.header-icon {
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--surface);
  color: var(--text-secondary);
}
.breadcrumb {
  color: var(--text-muted);
  font-size: 0.71rem;
}
.admin-header h1 {
  margin-top: 1px;
  font-size: 1.05rem;
  overflow-wrap: anywhere;
}
.admin-profile {
  gap: 8px;
}
.admin-profile > span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 50%;
  background: #e7c8ad;
  color: #6b3a22;
  font-size: 0.78rem;
  font-weight: 800;
}
.admin-profile strong,
.admin-profile small {
  display: block;
}
.admin-profile strong {
  font-size: 0.78rem;
}
.admin-profile small {
  color: var(--text-muted);
  font-size: 0.67rem;
}
.content-area {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 32px;
}
.mobile-overlay {
  display: none;
}
@media (max-width: 1199px) {
  .sidebar {
    width: min(280px, calc(100vw - 48px));
    transform: translateX(-100%);
  }
  .sidebar.collapsed {
    width: min(280px, calc(100vw - 48px));
  }
  .sidebar.collapsed .sidebar-nav {
    margin-top: 0;
  }
  .sidebar.collapsed .nav-item {
    justify-content: flex-start;
    padding: 0 10px;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 29;
    display: block;
    background: rgba(16, 27, 24, 0.44);
  }
  .admin-main,
  .admin-main.expanded {
    margin-left: 0;
  }
  .admin-header {
    padding: 10px 16px;
  }
  .content-area {
    padding: 20px 16px;
  }
}
@media (max-width: 480px) {
  .admin-header {
    gap: 8px;
    padding: 10px 12px;
  }
  .header-left,
  .header-right {
    gap: 8px;
  }
  .breadcrumb {
    font-size: 0.65rem;
  }
  .admin-header h1 {
    font-size: 0.95rem;
  }
  .content-area {
    padding: 16px 12px 28px;
  }
}
</style>
