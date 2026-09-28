<template>
  <button
    type="button"
    class="admin-action"
    :class="`admin-action--${tone}`"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot name="icon" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  tone: { type: String, default: "neutral" },
  disabled: { type: Boolean, default: false },
});
defineEmits(["click"]);
</script>

<style scoped>
.admin-action {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 750;
  white-space: nowrap;
  transition: 0.16s ease;
}
.admin-action:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--border-strong);
  background: var(--surface-subtle);
}
.admin-action--positive {
  border-color: color-mix(in srgb, var(--success) 26%, var(--border-color));
  color: var(--success);
}
.admin-action--info {
  border-color: color-mix(in srgb, var(--info) 26%, var(--border-color));
  color: var(--info);
}
.admin-action--warning {
  border-color: color-mix(in srgb, var(--warning) 28%, var(--border-color));
  color: var(--warning);
}
.admin-action--danger {
  border-color: color-mix(in srgb, var(--danger) 26%, var(--border-color));
  color: var(--danger);
}
.admin-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
