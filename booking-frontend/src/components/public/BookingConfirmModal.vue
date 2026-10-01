<template>
  <Teleport to="body">
    <div class="booking-confirm-overlay" @click.self="close">
      <section
        ref="dialog"
        class="booking-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-confirm-title"
        aria-describedby="booking-confirm-description"
        tabindex="-1"
      >
        <p class="section-index">PERIKSA RESERVASI</p>
        <h2 id="booking-confirm-title">Sudah sesuai dengan rencana Anda?</h2>
        <p id="booking-confirm-description">
          Pastikan jadwal dan kontak benar. Reservasi baru dikirim setelah Anda
          menekan tombol konfirmasi.
        </p>
        <dl class="booking-confirm-details">
          <div>
            <dt>Layanan</dt>
            <dd>{{ service.name }}</dd>
          </div>
          <div>
            <dt>Fotografer</dt>
            <dd>{{ professional.name }}</dd>
          </div>
          <div>
            <dt>Jadwal</dt>
            <dd>{{ longDate(date) }} · {{ time }}</dd>
          </div>
          <div>
            <dt>Estimasi biaya</dt>
            <dd>{{ money(service.price) }}</dd>
          </div>
          <div>
            <dt>Atas nama</dt>
            <dd>{{ customer.customer_name }}</dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd>{{ customer.customer_whatsapp }}</dd>
          </div>
        </dl>
        <div class="booking-confirm-actions">
          <button
            type="button"
            class="button secondary"
            :disabled="submitting"
            @click="close"
          >
            Ubah detail
          </button>
          <button
            type="button"
            class="button primary"
            :disabled="submitting"
            @click="$emit('confirm')"
          >
            {{ submitting ? "Mengirim reservasi…" : "Ya, kirim reservasi" }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { longDate, money } from "../../utils/formatters";

const props = defineProps({
  customer: { type: Object, required: true },
  service: { type: Object, required: true },
  professional: { type: Object, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  submitting: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "confirm"]);
const dialog = ref(null);
let previousOverflow = "";
function close() {
  if (!props.submitting) emit("close");
}
function onKeydown(event) {
  if (event.key === "Escape") close();
  if (event.key !== "Tab" || !dialog.value) return;
  const controls = [...dialog.value.querySelectorAll("button:not(:disabled)")];
  if (!controls.length) return;
  const first = controls[0];
  const last = controls.at(-1);
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
onMounted(() => {
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", onKeydown);
  dialog.value?.focus();
});
onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow;
  document.removeEventListener("keydown", onKeydown);
});
</script>
