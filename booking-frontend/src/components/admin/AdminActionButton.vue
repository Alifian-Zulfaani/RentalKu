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
