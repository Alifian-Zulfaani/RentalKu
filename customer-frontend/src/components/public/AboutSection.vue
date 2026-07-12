<template>
  <section id="tentang" class="section about-section">
    <div class="container">
      <div class="about-grid">
        <div class="about-content">
          <h2>Tentang {{ config.business_name }}</h2>
          <div class="divider" :style="{ background: config.primary_color }"></div>
          <p class="about-text">{{ config.about_text || 'Deskripsi tentang bisnis rental kami belum ditambahkan.' }}</p>
          <div class="features mt-3">
            <div class="feature-item">
              <CheckCircle :color="config.primary_color" />
              <span>Barang Terawat & Berkualitas</span>
            </div>
            <div class="feature-item">
              <CheckCircle :color="config.primary_color" />
              <span>Harga Kompetitif</span>
            </div>
            <div class="feature-item">
              <CheckCircle :color="config.primary_color" />
              <span>Proses Booking Mudah</span>
            </div>
          </div>
        </div>
        <div class="about-visual">
          <div class="visual-card glass-card" :style="{ borderTopColor: config.primary_color }">
            <h3>Hubungi Kami</h3>
            <p>Ada pertanyaan mengenai ketersediaan barang atau penyewaan jangka panjang?</p>
            <div class="contact-info mt-2">
              <div class="contact-item" v-if="config.whatsapp"><MessageCircle /> {{ config.whatsapp }}</div>
              <div class="contact-item" v-if="config.email"><Mail /> {{ config.email }}</div>
              <div class="contact-item" v-if="config.address"><MapPin /> {{ config.address }}</div>
            </div>
            <a v-if="config.whatsapp" :href="`https://wa.me/${config.whatsapp.replace(/^0/, '62')}`" target="_blank" class="btn btn-primary btn-block mt-3" :style="{ background: config.primary_color }">Chat WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { CheckCircle, MessageCircle, Mail, MapPin } from 'lucide-vue-next'
defineProps({ config: Object })
</script>

<style scoped>
.section { padding: 100px 0; background: var(--bg-surface); }
.about-grid { display: grid; grid-template-columns: 1fr 400px; gap: 60px; align-items: center; }
.about-content h2 { font-size: 2.5rem; margin-bottom: 16px; }
.divider { width: 60px; height: 4px; border-radius: 2px; margin-bottom: 24px; }
.about-text { font-size: 1.1rem; color: var(--text-secondary); line-height: 1.8; white-space: pre-line; }
.features { display: flex; flex-direction: column; gap: 16px; }
.feature-item { display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 1.05rem; }
.visual-card { padding: 40px; border-top-width: 4px; border-top-style: solid; }
.visual-card h3 { font-size: 1.5rem; margin-bottom: 12px; }
.visual-card p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; }
.contact-info { display: flex; flex-direction: column; gap: 16px; }
.contact-item { display: flex; align-items: flex-start; gap: 12px; color: var(--text-primary); font-size: 0.95rem; }
.contact-item svg { flex-shrink: 0; color: var(--text-muted); }
@media (max-width: 900px) { .about-grid { grid-template-columns: 1fr; gap: 40px; } }
</style>
