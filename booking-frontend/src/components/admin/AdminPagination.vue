<template>
  <div class="pagination">
    <span
      >Halaman <strong>{{ page }}</strong> dari
      <strong>{{ totalPages }}</strong> · {{ total }} data</span
    >
    <div>
      <button
        type="button"
        :disabled="page <= 1"
        @click="$emit('change', page - 1)"
      >
        <ChevronLeft :size="16" /> Sebelumnya
      </button>
      <button
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
