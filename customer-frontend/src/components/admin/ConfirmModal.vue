<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <div class="modal-icon" :class="`text-${type}`">
              <AlertTriangle v-if="type === 'warning'" :size="32" />
              <Info v-else-if="type === 'info'" :size="32" />
              <CheckCircle v-else-if="type === 'success'" :size="32" />
              <XCircle v-else-if="type === 'danger'" :size="32" />
            </div>
            <h3 class="modal-title">{{ title }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal" :disabled="isLoading">Batal</button>
            <button class="btn" :class="confirmBtnClass" @click="confirmAction" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: 'Apakah Anda yakin ingin melanjutkan tindakan ini?' },
  type: { type: String, default: 'warning' }, // warning, info, success, danger
  confirmText: { type: String, default: 'Ya, Lanjutkan' },
  confirmBtnClass: { type: String, default: 'btn-primary' },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:isOpen', 'confirm'])

function closeModal() {
  if (props.isLoading) return
  emit('update:isOpen', false)
}

function confirmAction() {
  emit('confirm')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 30px 24px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.modal-icon {
  background: rgba(255, 255, 255, 0.05);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-body {
  padding: 10px 24px 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.modal-footer {
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}
</style>
