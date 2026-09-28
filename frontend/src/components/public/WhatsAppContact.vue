<template>
  <a
    class="whatsapp-contact"
    :href="contactUrl"
    target="_blank"
    rel="noopener"
    aria-label="Chat WhatsApp untuk bertanya tentang RentalKu"
    title="Tanya lewat WhatsApp"
  >
    <MessageCircle :size="23" />
  </a>
</template>

<script setup>
import { MessageCircle } from "lucide-vue-next";

const contactUrl = `https://wa.me/6285740636055?text=${encodeURIComponent("Halo Kak Alifian, saya ingin bertanya tentang RentalKu.")}`;
</script>

<style scoped>
.whatsapp-contact {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 90;
  display: grid;
  width: 48px;
  height: 48px;
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

.whatsapp-contact:hover {
  background: #188756;
  box-shadow: 0 12px 24px rgba(20, 104, 68, 0.3);
  transform: translateY(-2px);
}

.whatsapp-contact:focus-visible {
  outline: 3px solid #9fe0c0;
  outline-offset: 3px;
}

@media (max-width: 768px) {
  .whatsapp-contact {
    right: 16px;
    bottom: 76px;
    width: 46px;
    height: 46px;
  }
}
</style>
