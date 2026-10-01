<template>
  <div class="admin-shell">
    <aside
      id="admin-sidebar"
      class="admin-sidebar"
      :class="{ open: menuOpen, collapsed: isSidebarCompact }"
    >
      <router-link
        to="/admin/dashboard"
        class="sidebar-brand"
        @click="menuOpen = false"
      >
        <span class="admin-brand-mark">S.</span>
        <strong v-if="showSidebarLabels">{{ tenantName }}</strong>
      </router-link>
      <p v-if="showSidebarLabels" class="side-caption">
        {{ isCompany ? "Panel studio" : "Ruang fotografer" }}
      </p>
      <nav class="sidebar-nav" aria-label="Menu pengelola">
        <router-link
          v-for="item in navItems"
          :key="item.key"
          :to="`/admin/${item.path}`"
          :class="{ active: activeTab === item.key }"
          :title="isSidebarCompact ? item.label : undefined"
          @click="menuOpen = false"
        >
          <component :is="item.icon" :size="19" />
          <span v-if="showSidebarLabels">{{ item.label }}</span>
        </router-link>
      </nav>
      <button
        type="button"
        class="sidebar-logout"
        :title="isSidebarCompact ? 'Keluar' : undefined"
        @click="showLogoutConfirmation = true"
      >
        <LogOut :size="19" />
        <span v-if="showSidebarLabels">Keluar</span>
      </button>
    </aside>

    <div
      v-if="isMobile && menuOpen"
      class="admin-overlay"
      @click="menuOpen = false"
    ></div>

    <div class="admin-main-shell" :class="{ expanded: isSidebarCompact }">
      <header class="admin-header">
        <div class="admin-header-left">
          <button
            type="button"
            class="header-icon"
            :aria-label="navigationButtonLabel"
            :aria-expanded="isMobile ? menuOpen : undefined"
            aria-controls="admin-sidebar"
            @click="toggleNavigation"
          >
            <PanelLeft :size="19" />
          </button>
          <div>
            <p class="admin-breadcrumb">{{ tenantName }} / Admin</p>
            <h1>{{ headerTitle }}</h1>
          </div>
        </div>
        <div class="admin-header-actions">
          <ThemeToggle />
          <a
            :href="publicHref"
            class="header-site-link"
            target="_blank"
            rel="noopener"
          >
            <ExternalLink :size="16" /> <span>Lihat situs</span>
          </a>
          <div class="admin-profile" :title="account.email">
            <span>{{ account.email?.charAt(0).toUpperCase() || "A" }}</span>
            <div class="admin-profile-copy">
              <strong>{{
                isCompany ? "Administrator" : accountProfessionalName
              }}</strong>
              <small>{{ isCompany ? "Admin studio" : "Fotografer" }}</small>
            </div>
          </div>
        </div>
      </header>

      <main class="admin-content">
        <p v-if="loadingWorkspace" class="loading-banner" role="status">
          Memuat data studio…
        </p>
        <ToastMessage
          :message="message"
          :type="messageType"
          @close="message = ''"
        />
        <router-view />
      </main>
    </div>

    <Transition name="modal-fade">
      <div
        v-if="selectedBooking"
        class="booking-dialog-backdrop"
        @click.self="selectedBooking = null"
      >
        <section
          ref="dialogElement"
          class="booking-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-dialog-title"
          tabindex="-1"
        >
          <div class="booking-dialog-head">
            <div>
              <p class="section-index">
                DETAIL RESERVASI #{{ selectedBooking.id }}
              </p>
              <h2 id="booking-dialog-title">
                {{ selectedBooking.customer_name }}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Tutup detail"
              @click="selectedBooking = null"
            >
              <X :size="20" />
            </button>
          </div>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{{ bookingStatusLabel(selectedBooking.status) }}</dd>
            </div>
            <div>
              <dt>Layanan</dt>
              <dd>{{ selectedBooking.service_name }}</dd>
            </div>
            <div>
              <dt>Fotografer</dt>
              <dd>{{ selectedBooking.professional_name }}</dd>
            </div>
            <div>
              <dt>Jadwal</dt>
              <dd>
                {{ selectedBooking.date }} · {{ selectedBooking.start_time }}–{{
                  selectedBooking.end_time
                }}
              </dd>
            </div>
            <div>
              <dt>Nilai</dt>
              <dd>{{ money(selectedBooking.total) }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ selectedBooking.customer_email }}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{{ selectedBooking.customer_whatsapp }}</dd>
            </div>
            <div>
              <dt>Catatan</dt>
              <dd>{{ selectedBooking.notes || "Tidak ada catatan" }}</dd>
            </div>
          </dl>
          <div class="dialog-actions">
            <button
              type="button"
              class="button secondary"
              @click="selectedBooking = null"
            >
              Tutup
            </button>
          </div>
        </section>
      </div>
    </Transition>

    <ConfirmModal
      :open="Boolean(pendingStatusChange)"
      :title="statusConfirmation.title"
      :message="statusConfirmation.message"
      :confirm-label="statusConfirmation.label"
      :confirm-tone="statusConfirmation.tone"
      @close="pendingStatusChange = null"
      @confirm="confirmStatusChange"
    />
    <ConfirmModal
      :open="Boolean(pendingBlockRemoval)"
      title="Hapus blokir jadwal?"
      :message="
        pendingBlockRemoval
          ? `Blokir ${pendingBlockRemoval.professional_name} pada ${pendingBlockRemoval.date} akan dihapus sehingga waktu tersebut dapat tersedia kembali.`
          : ''
      "
      confirm-label="Ya, hapus blokir"
      confirm-tone="danger"
      @close="pendingBlockRemoval = null"
      @confirm="confirmBlockRemoval"
    />
    <ConfirmModal
      :open="showLogoutConfirmation"
      title="Keluar dari panel?"
      message="Sesi pengelola pada perangkat ini akan diakhiri."
      confirm-label="Keluar"
      confirm-tone="danger"
      @close="showLogoutConfirmation = false"
      @confirm="handleLogout"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ExternalLink, LogOut, PanelLeft, X } from "lucide-vue-next";
import ConfirmModal from "./ConfirmModal.vue";
import ToastMessage from "../shared/ToastMessage.vue";
import ThemeToggle from "../shared/ThemeToggle.vue";
import { useAdminStore } from "../../stores/admin";
import { adminContextKey } from "../../stores/context";
import "../../admin.css";

const route = useRoute();
const router = useRouter();
const workspace = useAdminStore();
provide(adminContextKey, workspace);
const sidebarCollapsed = ref(
  localStorage.getItem("booking_sidebar_collapsed") === "true",
);
const isMobile = ref(window.innerWidth < 1200);
const showLogoutConfirmation = ref(false);
const isSidebarCompact = computed(
  () => sidebarCollapsed.value && !isMobile.value,
);
const showSidebarLabels = computed(
  () => isMobile.value || !sidebarCollapsed.value,
);

const {
  tenantName,
  account,
  activeTab,
  menuOpen,
  isCompany,
  accountProfessionalName,
  publicHref,
  navItems,
  currentTitle,
  loadingWorkspace,
  message,
  messageType,
  selectedBooking,
  dialogElement,
  pendingStatusChange,
  pendingBlockRemoval,
  confirmStatusChange,
  confirmBlockRemoval,
  money,
  bookingStatusLabel,
} = workspace;

const navigationButtonLabel = computed(() => {
  if (isMobile.value)
    return menuOpen.value ? "Tutup navigasi" : "Buka navigasi";
  return sidebarCollapsed.value ? "Perluas navigasi" : "Ringkas navigasi";
});
const headerTitle = computed(() => route.meta.title || currentTitle.value);
const statusConfirmation = computed(() => {
  const pending = pendingStatusChange.value;
  if (!pending)
    return { title: "", message: "", label: "Lanjutkan", tone: "primary" };
  const copy = {
    confirmed: {
      title: "Konfirmasi reservasi?",
      label: "Ya, konfirmasi",
      message: "Jadwal akan ditandai telah disetujui dan siap dilayani.",
    },
    completed: {
      title: "Tandai reservasi selesai?",
      label: "Ya, selesaikan",
      message: "Reservasi akan dipindahkan ke status selesai.",
    },
    cancelled: {
      title: "Batalkan reservasi?",
      label: "Ya, batalkan",
      tone: "danger",
      message:
        "Jadwal akan kembali tersedia dan reservasi ditandai dibatalkan.",
    },
    pending: {
      title: "Aktifkan kembali reservasi?",
      label: "Ya, aktifkan",
      message:
        "Sistem akan memeriksa ulang ketersediaan jadwal sebelum mengaktifkannya.",
    },
  }[pending.status];
  return {
    ...copy,
    tone: copy.tone || "primary",
    message: `${pending.item.customer_name} · ${pending.item.date}. ${copy.message}`,
  };
});

watch(
  () => route.meta.menuKey,
  (key) => {
    if (key) activeTab.value = key;
  },
  { immediate: true },
);
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);
watch(sidebarCollapsed, (collapsed) =>
  localStorage.setItem("booking_sidebar_collapsed", String(collapsed)),
);
function toggleNavigation() {
  if (isMobile.value) menuOpen.value = !menuOpen.value;
  else sidebarCollapsed.value = !sidebarCollapsed.value;
}
function syncViewport() {
  isMobile.value = window.innerWidth < 1200;
  if (!isMobile.value) menuOpen.value = false;
}
function handleKeydown(event) {
  if (event.key === "Escape" && showLogoutConfirmation.value) {
    showLogoutConfirmation.value = false;
  }
}
function handleLogout() {
  showLogoutConfirmation.value = false;
  workspace.logout();
  router.replace("/admin/login");
}
onMounted(() => {
  window.addEventListener("resize", syncViewport, { passive: true });
  window.addEventListener("keydown", handleKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", syncViewport);
  window.removeEventListener("keydown", handleKeydown);
});
</script>
