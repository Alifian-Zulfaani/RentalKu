<template>
  <section class="section how-section">
    <div class="container">
      <h2 class="section-title">Mulai dalam <span class="text-gradient">3 Langkah Mudah</span></h2>
      <p class="section-subtitle">Setup bisnis rental online kamu kurang dari 10 menit</p>
      <div class="steps-grid">
        <div class="step-card" v-for="(s, i) in steps" :key="i">
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-icon" :style="{ background: s.bg }">
            <component :is="s.icon" :size="28" :color="s.color" />
          </div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
          <div class="step-connector" v-if="i < steps.length - 1"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { UserPlus, Settings, Rocket } from 'lucide-vue-next'
const steps = [
  { icon: UserPlus, title: 'Daftar & Setup', desc: 'Buat akun, masukkan data bisnis, dan tambahkan inventaris barang rental kamu.', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  { icon: Settings, title: 'Konfigurasi Booking', desc: 'Atur halaman booking online, metode pembayaran, dan syarat penyewaan.', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { icon: Rocket, title: 'Mulai Terima Order', desc: 'Share link booking kamu dan mulai terima pesanan dari pelanggan secara online.', color: '#10b981', bg: 'rgba(16,185,129,0.12)' }
]
</script>

<style scoped>
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; position: relative; }
.step-card { text-align: center; position: relative; padding: 40px 24px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-lg); transition: all 0.3s; }
.step-card:hover { border-color: var(--border-accent); transform: translateY(-4px); }
.step-number { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); width: 32px; height: 32px; background: var(--accent-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: white; }
.step-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 16px auto 20px; }
.step-card h3 { font-size: 1.15rem; margin-bottom: 10px; }
.step-card p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7; }
.step-connector { display: none; }
@media (min-width: 769px) {
  .step-connector { display: block; position: absolute; top: 50%; right: -24px; width: 40px; height: 2px; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); }
}
@media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; gap: 32px; } }
</style>
