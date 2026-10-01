<template>
  <span class="brand-mark" :class="{ compact }">
    <span class="mark">S.</span>
    <span v-if="!compact" class="brand-copy">
      <strong>{{ name }}</strong>
      <small>{{ descriptor }}</small>
    </span>
  </span>
</template>

<script setup>
defineProps({
  name: { type: String, default: "Studio Senja" },
  descriptor: { type: String, default: "Photography house" },
  compact: { type: Boolean, default: false },
});
</script>
