<template>
  <div class="admin-page-header">
    <div>
      <p v-if="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <span>{{ description }}</span>
    </div>
    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  eyebrow: { type: String, default: "Panel pengelola" },
});
</script>

<style scoped>
.admin-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 24px;
}
.admin-page-header p {
  margin-bottom: 6px;
  color: var(--brand-primary);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.admin-page-header h1 {
  font-size: clamp(1.55rem, 3vw, 2rem);
  letter-spacing: -0.03em;
}
.admin-page-header span {
  display: block;
  margin-top: 7px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.page-actions {
  flex: 0 0 auto;
}
@media (max-width: 620px) {
  .admin-page-header {
    align-items: stretch;
    flex-direction: column;
  }
  .page-actions :deep(.btn) {
    width: 100%;
  }
}
</style>
