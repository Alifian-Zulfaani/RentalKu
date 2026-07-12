<template>
  <section class="section extra-section">
    <div class="container">
      <h2 class="section-title">Fitur Tambahan yang <span class="text-gradient">Powerful</span></h2>
      <p class="section-subtitle">Tools ekstra yang membuat bisnis rental kamu selangkah lebih maju</p>
      <div class="bento-grid">
        <div class="bento-item bento-large glass-card" v-for="(f, i) in features.slice(0, 2)" :key="'l'+i">
          <div class="bento-icon" :style="{ background: f.bg }">
            <component :is="f.icon" :size="28" :color="f.color" />
          </div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
        <div class="bento-item glass-card" v-for="(f, i) in features.slice(2)" :key="'s'+i">
          <div class="bento-icon" :style="{ background: f.bg }">
            <component :is="f.icon" :size="24" :color="f.color" />
          </div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Globe, CalendarDays, CreditCard, FileText } from 'lucide-vue-next'

const features = [
  { icon: Globe, title: 'Booking Page Builder', desc: 'Buat halaman booking online kustom dengan subdomain sendiri. Pelanggan bisa order langsung dari link yang kamu share.', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  { icon: CalendarDays, title: 'Kalender Jadwal', desc: 'Visualisasi jadwal sewa dalam format kalender. Lihat ketersediaan barang dan hindari double booking.', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { icon: CreditCard, title: 'Multi Rekening', desc: 'Dukung banyak rekening bank untuk pembayaran. Pelanggan bisa transfer ke rekening yang paling mudah.', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { icon: FileText, title: 'Persyaratan Dokumen', desc: 'Wajibkan KTP, KK, atau dokumen lain sebagai jaminan sewa. Upload dan simpan digital.', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
]
</script>

<style scoped>
.bento-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.bento-item { padding: 32px; transition: all 0.3s; }
.bento-item:hover { transform: translateY(-4px); }
.bento-icon { width: 56px; height: 56px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.bento-item h3 { font-size: 1.15rem; margin-bottom: 10px; }
.bento-item p { color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; }
@media (max-width: 768px) { .bento-grid { grid-template-columns: 1fr; } }
</style>
