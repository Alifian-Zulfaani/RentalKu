<template>
  <div ref="root" class="admin-account-menu">
    <button
      ref="trigger"
      type="button"
      class="admin-profile"
      aria-label="Menu akun"
      aria-haspopup="menu"
      :aria-expanded="open"
      aria-controls="admin-account-popover"
      @click="toggle"
    >
      <span>{{ email?.charAt(0).toUpperCase() || "A" }}</span>
      <span class="admin-profile-copy"
        ><strong>{{ name }}</strong
        ><small>{{ roleLabel }}</small></span
      >
      <ChevronDown :size="15" class="admin-profile-chevron" />
    </button>
    <div
      v-if="open"
      id="admin-account-popover"
      class="admin-account-popover"
      role="menu"
      aria-label="Akun pengelola"
      @keydown="onMenuKeydown"
    >
      <div class="admin-account-identity">
        <strong>{{ name }}</strong
        ><small>{{ email }}</small>
      </div>
      <router-link
        to="/admin/settings"
        role="menuitem"
        @click="close"
        ><Settings :size="17" /> Pengaturan akun</router-link
      >
      <button
        type="button"
        role="menuitem"
        class="admin-account-logout"
        @click="requestLogout"
      >
        <LogOut :size="17" /> Keluar
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ChevronDown, LogOut, Settings } from "lucide-vue-next";
defineProps({ email: String, name: String, roleLabel: String });
const emit = defineEmits(["logout"]);
const open = ref(false);
const root = ref(null);
const trigger = ref(null);
function close() {
  open.value = false;
}
async function toggle() {
  open.value = !open.value;
  if (open.value) {
    await nextTick();
    root.value?.querySelector('[role="menuitem"]')?.focus();
  }
}
function requestLogout() {
  close();
  emit("logout");
}
function onPointerDown(event) {
  if (open.value && !root.value?.contains(event.target)) close();
}
function onMenuKeydown(event) {
  if (event.key === "Escape") {
    close();
    nextTick(() => trigger.value?.focus());
    return;
  }
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  const items = [...root.value.querySelectorAll('[role="menuitem"]')];
  const current = items.indexOf(document.activeElement);
  const step = event.key === "ArrowDown" ? 1 : -1;
  items[(current + step + items.length) % items.length]?.focus();
  event.preventDefault();
}
onMounted(() => document.addEventListener("pointerdown", onPointerDown));
onBeforeUnmount(() =>
  document.removeEventListener("pointerdown", onPointerDown),
);
</script>
