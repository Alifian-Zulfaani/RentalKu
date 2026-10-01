<template>
  <div class="floating-actions" aria-label="Aksi cepat">
    <button
      type="button"
      class="floating-action scroll-action"
      :class="{ visible: showScroll }"
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      @click="scrollToTop"
    >
      <ArrowUp :size="19" />
    </button>
    <a
      v-if="whatsAppUrl"
      class="floating-action whatsapp-action"
      :href="whatsAppUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tanya lewat WhatsApp"
      title="Tanya lewat WhatsApp"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.04 3A12.9 12.9 0 0 0 5.09 22.72L3 30l7.47-1.96A12.98 12.98 0 1 0 16.04 3Zm0 23.77c-1.91 0-3.78-.5-5.42-1.45l-.39-.23-4.43 1.16 1.18-4.32-.25-.4a10.73 10.73 0 1 1 9.31 5.24Zm5.88-8.04c-.32-.16-1.9-.94-2.2-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6a9.7 9.7 0 0 1-1.79-2.22c-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.18.22-.32.32-.53.11-.22.06-.4-.02-.57-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.22 0-.56.08-.86.4-.29.32-1.12 1.1-1.12 2.67 0 1.58 1.15 3.1 1.31 3.32.16.21 2.26 3.45 5.48 4.84.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.1 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z"
        />
      </svg>
    </a>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowUp } from "lucide-vue-next";

const props = defineProps({
  phone: { type: String, default: "" },
  businessName: { type: String, default: "Studio Senja" },
});
const showScroll = ref(false);
const whatsAppUrl = computed(() => {
  const phone = props.phone.replace(/\D/g, "").replace(/^0/, "62");
  if (!phone) return "";
  const message = `Halo ${props.businessName}, saya ingin bertanya mengenai reservasi.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
});
function handleScroll() {
  showScroll.value = window.scrollY > 300;
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
onMounted(() => {
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", handleScroll));
</script>
