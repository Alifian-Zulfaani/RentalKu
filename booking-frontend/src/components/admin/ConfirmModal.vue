<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <AdminDialog
        v-if="open"
        role="alertdialog"
        dialog-class="confirmation-dialog"
        :title-id="titleId"
        :description-id="`${titleId}-message`"
        close-label="Tutup konfirmasi"
        @close="$emit('close')"
      >
        <template #header>
          <p class="section-index">KONFIRMASI</p>
          <h2 :id="titleId">{{ title }}</h2>
        </template>
        <p :id="`${titleId}-message`">{{ message }}</p>
        <template #footer>
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
        </template>
      </AdminDialog>
    </Transition>
  </Teleport>
</template>

<script setup>
import AdminDialog from "./AdminDialog.vue";

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
