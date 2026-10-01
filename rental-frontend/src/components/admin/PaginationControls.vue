<template>
  <div v-if="totalPages > 1" class="pagination-controls">
    <p>
      Halaman <strong>{{ page }}</strong> dari <strong>{{ totalPages }}</strong
      ><span v-if="total"> · {{ total }} data</span>
    </p>
    <div>
      <button
        class="btn btn-secondary btn-sm"
        type="button"
        :disabled="page <= 1"
        @click="$emit('change', page - 1)"
      >
        <ChevronLeft :size="16" /> Sebelumnya
      </button>
      <button
        class="btn btn-secondary btn-sm"
        type="button"
        :disabled="page >= totalPages"
        @click="$emit('change', page + 1)"
      >
        Berikutnya <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
defineProps({
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
});
defineEmits(["change"]);
</script>

<style scoped>
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 18px;
  border-top: 1px solid var(--border-color);
  background: var(--surface);
}
.pagination-controls p {
  color: var(--text-muted);
  font-size: 0.8rem;
}
.pagination-controls div {
  display: flex;
  gap: 8px;
}
@media (max-width: 580px) {
  .pagination-controls {
    align-items: stretch;
    flex-direction: column;
  }
  .pagination-controls div {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
