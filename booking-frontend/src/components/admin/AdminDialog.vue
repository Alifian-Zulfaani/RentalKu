<template>
  <div class="booking-dialog-backdrop" @click.self="$emit('close')">
    <section
      ref="dialog"
      class="booking-dialog"
      :class="dialogClass"
      :role="role"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descriptionId || undefined"
      tabindex="-1"
      @keydown="handleKeydown"
    >
      <header class="booking-dialog-head">
        <div><slot name="header" /></div>
        <button type="button" :aria-label="closeLabel" @click="$emit('close')">
          <X :size="20" />
        </button>
      </header>
      <div class="booking-dialog-body"><slot /></div>
      <footer class="booking-dialog-footer"><slot name="footer" /></footer>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { X } from "lucide-vue-next";

defineProps({
  titleId: { type: String, required: true },
  descriptionId: { type: String, default: "" },
  role: { type: String, default: "dialog" },
  dialogClass: { type: String, default: "" },
  closeLabel: { type: String, default: "Tutup dialog" },
});
const emit = defineEmits(["close"]);

const dialog = ref(null);
const focus = () => dialog.value?.focus();
let previousFocus;
let previousOverflow;
onMounted(() => {
  previousFocus = document.activeElement;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  focus();
});
onBeforeUnmount(() => {
  if (document.body.style.overflow === "hidden") {
    document.body.style.overflow = previousOverflow;
  }
  if (previousFocus?.isConnected) previousFocus.focus();
});

function handleKeydown(event) {
  if (event.key === "Escape") {
    emit("close");
    return;
  }
  if (event.key !== "Tab") return;
  const elements = [
    ...dialog.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.getClientRects().length);
  if (!elements.length) {
    event.preventDefault();
    return;
  }
  const first = elements[0];
  const last = elements[elements.length - 1];
  if (
    event.shiftKey &&
    (document.activeElement === first ||
      document.activeElement === dialog.value)
  ) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
defineExpose({ focus });
</script>
