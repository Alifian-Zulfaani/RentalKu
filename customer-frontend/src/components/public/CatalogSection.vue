<template>
  <section id="katalog" class="section">
    <div class="container">
      <div class="section-header text-center">
        <h2>Katalog Peralatan</h2>
        <p>Pilih dan sewa perlengkapan terbaik untuk kebutuhan Anda.</p>
      </div>

      <div class="category-filters">
        <button
          class="filter-btn"
          :class="{ active: !selectedCategory }"
          @click="selectedCategory = ''"
        >
          Semua
        </button>
        <button
          class="filter-btn"
          v-for="c in categories"
          :key="c.id"
          :class="{ active: selectedCategory === c.id }"
          @click="selectedCategory = c.id"
        >
          {{ c.name }}
        </button>
      </div>

      <div class="product-grid">
        <div
          class="product-card glass-card"
          v-for="p in filteredProducts"
          :key="p.id"
        >
          <div class="product-img-wrapper">
            <div
              class="product-img-placeholder"
              :style="{
                background: `${config.primary_color}15`,
                color: config.primary_color,
              }"
            >
              <Package size="40" />
            </div>
            <div
              class="stock-badge"
              :class="{ 'bg-danger': p.available_stock === 0 }"
            >
              {{
                p.available_stock > 0 ? `Sisa ${p.available_stock}` : "Habis"
              }}
            </div>
          </div>
          <div class="product-info">
            <div class="product-cat">{{ p.category_name }}</div>
            <h3 class="product-name">{{ p.name }}</h3>
            <div class="product-desc">
              {{ p.description || "Tidak ada deskripsi" }}
            </div>
            <div class="product-price">
              <strong :style="{ color: config.primary_color }">{{
                formatRp(p.rate_daily)
              }}</strong
              ><span>/hari</span>
            </div>
          </div>
        </div>
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <Package size="48" color="var(--text-muted)" />
          <p>Belum ada produk di kategori ini.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { Package } from "lucide-vue-next";

const props = defineProps({
  config: Object,
  products: Array,
  categories: Array,
});
const selectedCategory = ref("");

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return props.products;
  return props.products.filter(
    (p) =>
      p.category_id === selectedCategory.value ||
      p.category_name ===
        props.categories.find((c) => c.id === selectedCategory.value)?.name,
  );
});

const formatRp = (v) => "Rp" + (v || 0).toLocaleString("id-ID");
</script>

<style scoped>
.section {
  padding: 100px 0;
  background: var(--bg-color);
}
.section-header {
  margin-bottom: 50px;
}
.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 16px;
}
.section-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}
.category-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
}
.filter-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 20px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}
.filter-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}
.filter-btn.active {
  background: var(--brand-primary, #16a34a);
  color: white;
  border-color: transparent;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s;
}
.product-card:hover {
  transform: translateY(-5px);
}
.product-img-wrapper {
  height: 200px;
  position: relative;
}
.product-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--success);
  color: white;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}
.bg-danger {
  background: var(--danger) !important;
}
.product-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.product-cat {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  font-weight: 600;
}
.product-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.3;
}
.product-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-price strong {
  font-size: 1.3rem;
  font-weight: 800;
}
.product-price span {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
}
.empty-state p {
  margin-top: 16px;
  font-size: 1.1rem;
}
</style>
