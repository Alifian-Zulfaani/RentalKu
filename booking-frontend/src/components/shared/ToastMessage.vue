<template>
  <div v-if="message" class="feedback" :class="type" role="status">
    <span>{{ message }}</span>
    <button type="button" aria-label="Tutup notifikasi" @click="$emit('close')">
      <X :size="16" />
    </button>
  </div>
</template>

<script setup>
import { X } from "lucide-vue-next";
defineProps({
  message: { type: String, default: "" },
  type: { type: String, default: "success" },
});
defineEmits(["close"]);
</script>
