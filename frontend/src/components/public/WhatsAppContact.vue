<template>
  <a
    class="whatsapp-contact"
    :href="contactUrl"
    target="_blank"
    rel="noopener"
    aria-label="Chat WhatsApp untuk bertanya tentang RentalKu"
    title="Tanya lewat WhatsApp"
  >
    <WhatsAppIcon class="contact-icon" />
  </a>
</template>

<script setup>
import WhatsAppIcon from "../shared/WhatsAppIcon.vue";

const contactUrl = `https://wa.me/6285740636055?text=${encodeURIComponent("Halo tim RentalKu, saya ingin bertanya tentang aplikasi Rental dan Booking.")}`;
</script>

<style scoped>
.whatsapp-contact {
  position: fixed;
  right: var(--floating-action-right);
  bottom: var(--floating-action-bottom);
  z-index: 90;
  display: grid;
  width: var(--floating-action-size);
  height: var(--floating-action-size);
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  background: #21a66a;
  color: #fff;
  box-shadow: 0 8px 20px rgba(20, 104, 68, 0.24);
  transition:
    background-color 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease;
}
.contact-icon { font-size: 24px; }

.whatsapp-contact:hover {
  background: #188756;
  box-shadow: 0 12px 24px rgba(20, 104, 68, 0.3);
  transform: translateY(-2px);
}

.whatsapp-contact:focus-visible {
  outline: 3px solid #9fe0c0;
  outline-offset: 3px;
}

</style>
