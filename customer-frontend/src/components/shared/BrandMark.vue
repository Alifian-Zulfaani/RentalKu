<template>
  <span class="brand-lockup" :class="{ compact }">
    <img
      :src="logoUrl || '/favicon.svg?v=3'"
      :alt="logoUrl ? `Logo ${name}` : ''"
      class="brand-icon"
    />
    <span v-if="!compact" class="brand-copy">
      <strong>{{ name || "RentalKu Outdoor" }}</strong>
      <small v-if="descriptor">{{ descriptor }}</small>
    </span>
  </span>
</template>

<script setup>
defineProps({
  name: { type: String, default: "RentalKu Outdoor" },
  descriptor: { type: String, default: "Gear rental" },
  logoUrl: { type: String, default: "" },
  compact: { type: Boolean, default: false },
});
</script>

<style scoped>
.brand-lockup {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}
.brand-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 10px;
  object-fit: contain;
  box-shadow: 0 5px 16px rgba(8, 23, 17, 0.16);
}
.brand-copy {
  display: grid;
  min-width: 0;
  line-height: 1.1;
}
.brand-copy strong {
  overflow: hidden;
  color: inherit;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brand-copy small {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.compact .brand-icon {
  width: 36px;
  height: 36px;
}
</style>
