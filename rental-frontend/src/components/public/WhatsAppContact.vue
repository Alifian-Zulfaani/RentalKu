<template>
  <a
    v-if="config?.whatsapp"
    class="whatsapp-contact"
    :href="
      toWhatsAppUrl(
        config.whatsapp,
        `Halo ${config.business_name || ''}, saya ingin bertanya tentang penyewaan.`,
      )
    "
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Hubungi lewat WhatsApp"
  >
    <MessageCircle :size="20" />
    <span>Butuh bantuan?</span>
  </a>
</template>

<script setup>
import { MessageCircle } from "lucide-vue-next";
import { toWhatsAppUrl } from "../../utils/formatters";

defineProps({ config: { type: Object, default: null } });
</script>

<style scoped>
.whatsapp-contact {
  position: fixed;
  right: 24px;
  bottom: 30px;
  z-index: 90;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 9px 13px;
  border: 1px solid
    color-mix(in srgb, var(--brand-primary) 45%, var(--border-color));
  border-radius: var(--radius-full);
  background: var(--surface-raised);
  box-shadow: var(--shadow-md);
  color: var(--brand-primary);
  font-size: 0.82rem;
  font-weight: 700;
}
.whatsapp-contact:hover {
  transform: translateY(-2px);
}
@media (max-width: 768px) {
  .whatsapp-contact {
    right: 18px;
    bottom: 75px;
    width: 44px;
    padding: 0;
    justify-content: center;
  }
  .whatsapp-contact span {
    display: none;
  }
}
</style>
