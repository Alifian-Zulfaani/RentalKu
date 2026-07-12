<template>
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-brand">
        <h3 :style="{ color: config.primary_color }">{{ config.business_name }}</h3>
        <p>{{ config.tagline }}</p>
      </div>
      <div class="footer-links">
        <h4>Tautan</h4>
        <a href="#">Beranda</a>
        <a href="#katalog">Katalog</a>
        <a href="#tentang">Tentang Kami</a>
      </div>
      <div class="footer-contact">
        <h4>Kontak</h4>
        <p v-if="config.whatsapp">WA: {{ config.whatsapp }}</p>
        <p v-if="config.email">Email: {{ config.email }}</p>
        <p v-if="config.address">{{ config.address }}</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} {{ config.business_name }}. All rights reserved.</p>
      <p class="powered-by">Powered by <a href="http://localhost:5173" target="_blank" style="color:#7c3aed;font-weight:bold;">RentalKu</a></p>
    </div>
  </footer>
</template>

<script setup>
defineProps({ config: Object })
</script>

<style scoped>
.footer { background: var(--bg-surface); border-top: 1px solid var(--border-color); padding-top: 60px; }
.footer-content { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.footer-brand h3 { font-size: 1.5rem; margin-bottom: 12px; }
.footer-brand p { color: var(--text-secondary); max-width: 300px; }
.footer-links, .footer-contact { display: flex; flex-direction: column; gap: 12px; }
.footer-links h4, .footer-contact h4 { font-size: 1.1rem; margin-bottom: 8px; color: var(--text-primary); }
.footer-links a, .footer-contact p { color: var(--text-secondary); font-size: 0.95rem; }
.footer-links a:hover { color: var(--text-primary); }
.footer-bottom { border-top: 1px solid var(--border-color); padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.9rem; display: flex; flex-direction: column; gap: 8px; }
.powered-by { font-size: 0.8rem; }
@media (max-width: 768px) { .footer-content { grid-template-columns: 1fr; gap: 32px; } }
</style>
