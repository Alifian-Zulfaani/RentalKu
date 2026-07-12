<template>
  <section class="stats-section">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-item" v-for="(stat, idx) in stats" :key="idx">
          <div class="stat-icon" :style="{ background: stat.bg }">
            <component :is="stat.icon" :size="24" :color="stat.color" />
          </div>
          <div class="stat-value">{{ formatNum(animated[idx]) }}{{ stat.suffix }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { Users, ShoppingCart, ThumbsUp, Package } from 'lucide-vue-next'

const stats = [
  { icon: Users, value: 500, suffix: '+', label: 'Bisnis Rental Aktif', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  { icon: ShoppingCart, value: 50000, suffix: '+', label: 'Order Diproses', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { icon: ThumbsUp, value: 98, suffix: '%', label: 'Tingkat Kepuasan', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { icon: Package, value: 10000, suffix: '+', label: 'Barang Dikelola', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
]

const animated = reactive([0, 0, 0, 0])
const formatNum = n => n.toLocaleString('id-ID')

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stats.forEach((s, i) => {
          const start = performance.now()
          const dur = 2000
          const tick = (now) => {
            const p = Math.min((now - start) / dur, 1)
            animated[i] = Math.floor((1 - Math.pow(1 - p, 3)) * s.value)
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
        observer.disconnect()
      }
    })
  }, { threshold: 0.3 })
  const el = document.querySelector('.stats-section')
  if (el) observer.observe(el)
})
</script>

<style scoped>
.stats-section { padding: 40px 0; position: relative; }
.stats-section::before { content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, var(--border-accent), transparent); }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.stat-item { text-align: center; padding: 32px 20px; border-radius: var(--radius-lg); background: var(--bg-glass); border: 1px solid var(--border-color); transition: all 0.3s; }
.stat-item:hover { border-color: var(--border-accent); transform: translateY(-4px); box-shadow: var(--shadow-glow); }
.stat-icon { width: 56px; height: 56px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.stat-value { font-size: 2.5rem; font-weight: 800; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-label { font-size: 0.95rem; color: var(--text-secondary); margin-top: 4px; }
@media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } .stat-value { font-size: 1.8rem; } }
</style>
