<template>
  <section id="harga" class="section pricing-section">
    <div class="container">
      <h2 class="section-title">
        Harga Spesial <span class="text-gradient">Lifetime Deal</span>
      </h2>
      <p class="section-subtitle">
        Bayar sekali, pakai selamanya. Tanpa biaya bulanan.
      </p>
      <div class="pricing-wrapper">
        <div class="pricing-card glass-card">
          <div class="pricing-badge">🔥 BEST VALUE</div>
          <div class="pricing-header">
            <h3>Lifetime Access</h3>
            <div class="pricing-price">
              <span class="price-old">Rp499.000</span>
              <span class="price-current">Rp249.000</span>
              <span class="price-label">bayar sekali</span>
            </div>
          </div>
          <ul class="pricing-features">
            <li v-for="f in pricingFeatures" :key="f">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                stroke-width="2.5"
              >
                <path d="M20 6 9 17l-5-5" /></svg
              >{{ f }}
            </li>
          </ul>
          <router-link to="/order" class="btn btn-primary btn-lg btn-block"
            >Daftar Sekarang</router-link
          >
          <p class="pricing-note">
            ✨ Termasuk semua update fitur di masa depan
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const pricingFeatures = [
  "Unlimited order & pelanggan",
  "Manajemen inventaris lengkap",
  "Halaman booking online kustom",
  "Laporan keuangan otomatis",
  "Reminder WhatsApp otomatis",
  "Kalender jadwal sewa",
  "Multi rekening pembayaran",
  "Subdomain gratis",
  "Upload dokumen jaminan",
  "Support via WhatsApp",
];
</script>

<style scoped>
.pricing-section {
  background: radial-gradient(
    ellipse at center,
    rgba(124, 58, 237, 0.08) 0%,
    transparent 70%
  );
}
.pricing-wrapper {
  max-width: 480px;
  margin: 0 auto;
}
.pricing-card {
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.pricing-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-gradient);
}
.pricing-badge {
  display: inline-block;
  padding: 6px 20px;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 24px;
}
.pricing-header h3 {
  font-size: 1.5rem;
  margin-bottom: 16px;
}
.price-old {
  text-decoration: line-through;
  color: var(--text-muted);
  font-size: 1.1rem;
  display: block;
  margin-bottom: 4px;
}
.price-current {
  font-size: 3.5rem;
  font-weight: 800;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
}
.price-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.pricing-features {
  margin: 32px 0;
  text-align: left;
}
.pricing-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  border-bottom: 1px solid var(--border-color);
}
.pricing-features li:last-child {
  border-bottom: none;
}
.pricing-note {
  margin-top: 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
