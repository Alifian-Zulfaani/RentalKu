<template>
  <section class="hero">
    <!-- Background effects -->
    <div class="hero-bg">
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>
      <div class="hero-grid"></div>
    </div>

    <div class="container hero-content">
      <div class="hero-text">
        <div class="hero-badge animate-fadeInUp">
          <span class="badge-dot"></span>
          Platform #1 Manajemen Rental Indonesia
        </div>

        <h1 class="hero-title animate-fadeInUp" style="animation-delay: 0.1s">
          Kelola Bisnis Rental<br />
          <span class="text-gradient">Lebih Mudah & Efisien</span>
        </h1>

        <p class="hero-desc animate-fadeInUp" style="animation-delay: 0.2s">
          Platform all-in-one untuk mengelola order sewa, inventaris, pelanggan,
          dan keuangan bisnis rental Anda. Buat halaman booking online kustom
          dalam hitungan menit.
        </p>

        <div
          class="hero-actions animate-fadeInUp"
          style="animation-delay: 0.3s"
        >
          <router-link to="/order" class="btn btn-primary btn-lg">
            Mulai Sekarang
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </router-link>
          <a href="#fitur" class="btn btn-secondary btn-lg"> Lihat Fitur </a>
        </div>

        <div class="hero-trust animate-fadeInUp" style="animation-delay: 0.4s">
          <div class="trust-avatars">
            <div
              class="trust-avatar"
              v-for="i in 4"
              :key="i"
              :style="{ background: avatarColors[i - 1] }"
            >
              {{ avatarInitials[i - 1] }}
            </div>
          </div>
          <div class="trust-text">
            <strong>500+</strong> pengusaha rental sudah bergabung
          </div>
        </div>
      </div>

      <div class="hero-visual animate-fadeInUp" style="animation-delay: 0.3s">
        <div class="dashboard-mockup">
          <div class="mockup-header">
            <div class="mockup-dots">
              <span></span><span></span><span></span>
            </div>
            <div class="mockup-title">Dashboard RentalKu</div>
          </div>
          <div class="mockup-body">
            <div class="mockup-stats">
              <div
                class="mockup-stat"
                v-for="(stat, idx) in mockStats"
                :key="idx"
              >
                <div class="mockup-stat-value" :style="{ color: stat.color }">
                  {{ stat.value }}
                </div>
                <div class="mockup-stat-label">{{ stat.label }}</div>
              </div>
            </div>
            <div class="mockup-chart">
              <div class="chart-bars">
                <div
                  class="chart-bar"
                  v-for="(h, i) in chartData"
                  :key="i"
                  :style="{ height: h + '%' }"
                ></div>
              </div>
            </div>
            <div class="mockup-table">
              <div class="table-row" v-for="i in 3" :key="i">
                <div class="table-cell name"></div>
                <div class="table-cell status"></div>
                <div class="table-cell amount"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const avatarColors = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b"];
const avatarInitials = ["B", "S", "A", "D"];
const mockStats = [
  { value: "128", label: "Order Aktif", color: "#7c3aed" },
  { value: "456", label: "Total Barang", color: "#3b82f6" },
  { value: "Rp12.5M", label: "Pendapatan", color: "#10b981" },
  { value: "89", label: "Pelanggan", color: "#f59e0b" },
];
const chartData = [45, 65, 55, 80, 70, 90, 60, 75, 85, 50, 70, 95];
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.hero-orb-1 {
  width: 500px;
  height: 500px;
  background: #7c3aed;
  top: -100px;
  right: -100px;
  opacity: 0.15;
}

.hero-orb-2 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  bottom: -50px;
  left: -100px;
  opacity: 0.12;
}

.hero-orb-3 {
  width: 300px;
  height: 300px;
  background: #06b6d4;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.08;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: var(--accent-soft);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-accent);
  margin-bottom: 24px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
  animation: pulse-glow 2s infinite;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
}

.hero-desc {
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 36px;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-trust {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trust-avatars {
  display: flex;
}

.trust-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  border: 2px solid var(--bg-primary);
  margin-left: -8px;
}

.trust-avatar:first-child {
  margin-left: 0;
}

.trust-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.trust-text strong {
  color: var(--text-primary);
}

/* Dashboard Mockup */
.dashboard-mockup {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  animation: float 6s ease-in-out infinite;
}

.mockup-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border-color);
}

.mockup-dots {
  display: flex;
  gap: 6px;
}

.mockup-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.mockup-dots span:nth-child(1) {
  background: #ef4444;
}
.mockup-dots span:nth-child(2) {
  background: #f59e0b;
}
.mockup-dots span:nth-child(3) {
  background: #10b981;
}

.mockup-title {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.mockup-body {
  padding: 20px;
}

.mockup-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.mockup-stat {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 12px;
  text-align: center;
}

.mockup-stat-value {
  font-size: 1.1rem;
  font-weight: 800;
}

.mockup-stat-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.mockup-chart {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 16px;
  margin-bottom: 16px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 80px;
}

.chart-bar {
  flex: 1;
  background: var(--accent-gradient);
  border-radius: 3px 3px 0 0;
  min-height: 8px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.chart-bar:hover {
  opacity: 1;
}

.mockup-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-glass);
  border-radius: var(--radius-sm);
}

.table-cell {
  height: 10px;
  border-radius: 5px;
  background: rgba(148, 163, 184, 0.12);
}

.table-cell.name {
  flex: 3;
}
.table-cell.status {
  flex: 1;
  background: rgba(16, 185, 129, 0.2);
}
.table-cell.amount {
  flex: 2;
}

@media (max-width: 768px) {
  .hero {
    min-height: auto;
    padding: 120px 0 60px;
  }
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  .hero-title {
    font-size: 2.2rem;
  }
  .hero-desc {
    margin-left: auto;
    margin-right: auto;
  }
  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  .hero-trust {
    justify-content: center;
  }
  .mockup-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .dashboard-mockup {
    animation: none;
  }
}
</style>
