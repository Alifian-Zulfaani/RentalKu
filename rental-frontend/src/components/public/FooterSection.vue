<template>
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-brand">
        <BrandMark
          :name="config.business_name || 'RentalKu Outdoor'"
          :logo-url="config.logo_url"
          descriptor="Outdoor gear rental"
        />
        <p>{{ config.description || config.tagline }}</p>
      </div>
      <div class="footer-links">
        <h4>Tautan</h4>
        <router-link to="/">Beranda</router-link>
        <router-link to="/#katalog">Katalog</router-link>
        <router-link to="/#tentang">Tentang Kami</router-link>
        <router-link to="/sewa">Sewa perlengkapan</router-link>
      </div>
      <div class="footer-contact">
        <h4>Kontak</h4>
        <p v-if="config.whatsapp">WA: {{ config.whatsapp }}</p>
        <p v-if="config.email">Email: {{ config.email }}</p>
        <p v-if="config.address">{{ config.address }}</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>
        &copy; {{ new Date().getFullYear() }} {{ config.business_name }}. Semua
        hak dilindungi.
      </p>
      <p class="powered-by">
        Powered by
        <a
          :href="platformUrl"
          target="_blank"
          rel="noopener noreferrer"
          style="color: var(--brand-primary); font-weight: bold"
          >RentalKu</a
        >
      </p>
    </div>
  </footer>
</template>

<script setup>
import BrandMark from "../shared/BrandMark.vue";
defineProps({ config: Object });
const platformUrl =
  import.meta.env.VITE_PLATFORM_URL || "http://localhost:5173";
</script>

<style scoped>
.footer {
  background: var(--footer-bg);
  color: #eef3ef;
  border-top: 1px solid var(--border-color);
  padding-top: 60px;
}
.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}
.footer-brand p {
  margin-top: 17px;
  color: #aebdb5;
  max-width: 300px;
}
.footer-links,
.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.footer-links h4,
.footer-contact h4 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #eef3ef;
}
.footer-links a,
.footer-contact p {
  color: #aebdb5;
  font-size: 0.95rem;
}
.footer-links a:hover {
  color: #ffffff;
}
.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.powered-by {
  font-size: 0.8rem;
}
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
