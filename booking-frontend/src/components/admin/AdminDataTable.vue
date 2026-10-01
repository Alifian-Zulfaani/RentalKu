<template>
  <div class="admin-table-wrap">
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
