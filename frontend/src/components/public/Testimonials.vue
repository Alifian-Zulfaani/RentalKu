<template>
  <section id="testimoni" class="section">
    <div class="container">
      <h2 class="section-title">Dipercaya Oleh <span class="text-gradient">Pengusaha Rental</span></h2>
      <p class="section-subtitle">Cerita sukses dari mereka yang sudah merasakan manfaat RentalKu</p>
      <div class="testimonials-grid">
        <div class="testimonial-card glass-card" v-for="(t, i) in testimonials" :key="i">
          <div class="stars">★★★★★</div>
          <p class="testimonial-text">"{{ t.text }}"</p>
          <div class="testimonial-author">
            <div class="author-avatar" :style="{ background: t.color }">{{ t.initial }}</div>
            <div>
              <div class="author-name">{{ t.name }}</div>
              <div class="author-biz">{{ t.business }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = [
  { name: 'Budi Santoso', initial: 'B', business: 'Sewa Tenda Jakarta', text: 'Dulu catat di buku, sering keliru stok. Sejak pakai RentalKu, semua rapi dan bisa dipantau dari HP. Order naik 40% dalam 3 bulan!', color: '#7c3aed' },
  { name: 'Siti Rahayu', initial: 'S', business: 'Rental Kamera Bandung', text: 'Fitur booking online-nya game changer. Pelanggan bisa langsung order tanpa harus chat bolak-balik. Hemat waktu banget!', color: '#3b82f6' },
  { name: 'Ahmad Fauzi', initial: 'A', business: 'Sound System Surabaya', text: 'Laporan keuangan otomatis bikin saya tahu persis berapa profit tiap bulan. Nggak perlu lagi recap manual di Excel.', color: '#10b981' },
  { name: 'Dewi Lestari', initial: 'D', business: 'Rental Mobil Yogyakarta', text: 'Sistem reminder-nya sangat membantu. Pelanggan jadi jarang telat kembaliin. Dan harganya bayar sekali, murah banget!', color: '#f59e0b' }
]
</script>

<style scoped>
.testimonials-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.testimonial-card { padding: 32px; }
.stars { color: #f59e0b; font-size: 1.1rem; margin-bottom: 16px; letter-spacing: 2px; }
.testimonial-text { font-size: 1rem; color: var(--text-secondary); line-height: 1.8; margin-bottom: 24px; font-style: italic; }
.testimonial-author { display: flex; align-items: center; gap: 14px; }
.author-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 1rem; }
.author-name { font-weight: 600; font-size: 0.95rem; }
.author-biz { font-size: 0.85rem; color: var(--text-muted); }
@media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr; } }
</style>
