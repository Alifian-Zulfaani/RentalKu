<template>
  <div
    class="admin-table-wrap"
    role="region"
    aria-label="Daftar data"
    tabindex="0"
  >
    <table class="admin-table" :class="{ 'has-actions': actions, wide }">
      <slot />
    </table>
  </div>
</template>

<script setup>
defineProps({
  actions: { type: Boolean, default: false },
  wide: { type: Boolean, default: false },
});
</script>
