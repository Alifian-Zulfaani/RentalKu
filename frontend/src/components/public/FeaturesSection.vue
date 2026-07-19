<template>
  <section id="fitur" class="section">
    <div class="container">
      <h2 class="section-title">
        Semua yang Kamu Butuhkan<br /><span class="text-gradient"
          >dalam Satu Platform</span
        >
      </h2>
      <p class="section-subtitle">
        Fitur lengkap yang dirancang khusus untuk membantu bisnis rental kamu
        tumbuh lebih cepat
      </p>
      <div class="features-grid">
        <div
          class="feature-card glass-card"
          v-for="(f, i) in features"
          :key="i"
        >
          <div class="feature-icon" :style="{ background: f.bg }">
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
import {
  ClipboardList,
  Users,
  Package,
  BarChart3,
  Bell,
} from "lucide-vue-next";

const features = [
  {
    icon: ClipboardList,
    title: "Kelola Order Sewa",
    desc: "Catat & lacak semua order masuk, aktif, terlambat, hingga selesai. Otomatis hitung biaya sewa & denda keterlambatan.",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
  },
  {
    icon: Users,
    title: "CRM Pelanggan",
    desc: "Database pelanggan lengkap dengan riwayat sewa, kontak WhatsApp, dan sistem blacklist untuk pelanggan bermasalah.",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  {
    icon: Package,
    title: "Inventaris Barang",
    desc: "Kelola stok barang, kategori, tarif harian/mingguan/bulanan, dan pantau ketersediaan secara real-time.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
  {
    icon: BarChart3,
    title: "Laporan Keuangan",
    desc: "Laporan pendapatan, piutang, dan statistik bisnis yang mudah dipahami. Pantau performa bisnis rental kamu.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  {
    icon: Bell,
    title: "Reminder & Notifikasi",
    desc: "Pengingat otomatis untuk pengembalian barang, pembayaran jatuh tempo, dan notifikasi order baru via WhatsApp.",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
];
</script>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.features-grid .feature-card:nth-child(4) {
  grid-column: 1 / 2;
}
.features-grid .feature-card:nth-child(5) {
  grid-column: 2 / 3;
}
.feature-card {
  padding: 32px;
  transition: all 0.3s;
}
.feature-card:hover {
  transform: translateY(-6px);
}
.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: var(--text-primary);
}
.feature-card p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.7;
}
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  .features-grid .feature-card:nth-child(4),
  .features-grid .feature-card:nth-child(5) {
    grid-column: auto;
  }
}
</style>
