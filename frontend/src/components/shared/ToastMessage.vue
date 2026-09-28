<template>
  <Transition name="toast">
    <div
      v-if="message"
      class="toast-message"
      :class="`toast-${type}`"
      role="status"
    >
      <component :is="icon" :size="18" />
      <span>{{ message }}</span>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        @click="$emit('close')"
      >
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from "vue";
import { CheckCircle2, AlertCircle, X } from "lucide-vue-next";

const props = defineProps({
  message: { type: String, default: "" },
  type: { type: String, default: "success" },
});

defineEmits(["close"]);

const icon = computed(() =>
  props.type === "success" ? CheckCircle2 : AlertCircle,
);
</script>

<style scoped>
.toast-message {
  position: fixed;
  right: 24px;
  top: 24px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(380px, calc(100vw - 32px));
  padding: 13px 14px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--surface-raised);
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  font-size: 0.9rem;
}
.toast-success {
  border-left: 3px solid var(--success);
}
.toast-error {
  border-left: 3px solid var(--danger);
}
.toast-message button {
  display: grid;
  place-items: center;
  margin-left: auto;
  color: var(--text-muted);
  background: transparent;
}
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (max-width: 560px) {
  .toast-message {
    top: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
}
</style>
