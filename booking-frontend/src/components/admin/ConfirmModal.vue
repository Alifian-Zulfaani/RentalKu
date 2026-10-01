<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="booking-dialog-backdrop"
        @click.self="$emit('close')"
      >
        <section
          class="booking-dialog confirmation-dialog"
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <button
            type="button"
            class="dialog-close"
            aria-label="Tutup konfirmasi"
            @click="$emit('close')"
          >
            <X :size="19" />
          </button>
          <p class="section-index">KONFIRMASI</p>
          <h2 :id="titleId">{{ title }}</h2>
          <p>{{ message }}</p>
          <div class="cancellation-actions">
            <button
              type="button"
              class="button secondary"
              @click="$emit('close')"
            >
              Kembali
            </button>
            <button
              type="button"
              class="button"
              :class="confirmTone === 'danger' ? 'danger' : 'primary'"
              @click="$emit('confirm')"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from "lucide-vue-next";

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: "Ya, lanjutkan" },
  confirmTone: { type: String, default: "primary" },
  titleId: { type: String, default: "confirm-modal-title" },
});
defineEmits(["close", "confirm"]);
</script>
