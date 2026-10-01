<template>
  <section id="katalog" class="section catalog-section">
    <div class="container">
      <div class="section-header text-center">
        <p class="section-kicker">Peralatan terawat, harga jelas</p>
        <h2>Pilih perlengkapan perjalananmu</h2>
        <p>
          Kenali pilihan perlengkapannya, lalu susun pesanan di halaman sewa
          khusus.
        </p>
      </div>

      <div class="catalog-toolbar">
        <div class="category-filters" aria-label="Filter kategori">
          <button
            class="filter-btn"
            :class="{ active: selectedCategory === null }"
            type="button"
            @click="selectedCategory = null"
          >
            Semua
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            class="filter-btn"
            :class="{ active: selectedCategory === Number(category.id) }"
            type="button"
            @click="selectedCategory = Number(category.id)"
          >
            {{ category.name }}
          </button>
        </div>
        <label class="search-box">
          <Search :size="17" />
          <input
            v-model.trim="search"
            type="search"
            placeholder="Cari barang..."
            aria-label="Cari barang"
          />
        </label>
      </div>

      <div class="product-grid">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
        >
          <div class="product-visual">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              loading="lazy"
            />
            <div v-else class="product-placeholder">
              <span class="terrain-ring" aria-hidden="true"></span>
              <component
                :is="categoryIcon(product.category_name)"
                :size="42"
                stroke-width="1.6"
              />
              <small>{{ product.category_name || "Peralatan outdoor" }}</small>
            </div>
            <span
              class="stock-badge"
              :class="{ empty: !product.available_stock }"
            >
              {{
                product.available_stock
                  ? `${product.available_stock} tersedia`
                  : "Stok habis"
              }}
            </span>
          </div>
          <div class="product-info">
            <span class="product-category">{{
              product.category_name || "Lainnya"
            }}</span>
            <h3>{{ product.name }}</h3>
            <p>
              {{
                product.description ||
                "Peralatan siap pakai dan diperiksa sebelum disewakan."
              }}
            </p>
            <div class="product-footer">
              <div class="price">
                <strong>{{ formatCurrency(product.rate_daily) }}</strong
                ><span>/ hari</span>
              </div>
              <button
                class="btn btn-secondary btn-sm"
                type="button"
                @click="detailProduct = product"
              >
                Lihat detail <ArrowRight :size="15" />
              </button>
            </div>
          </div>
        </article>

        <div v-if="!filteredProducts.length" class="empty-state catalog-empty">
          <PackageSearch :size="42" />
          <strong>Barang tidak ditemukan</strong>
          <p>Coba kata kunci atau kategori yang berbeda.</p>
        </div>
      </div>
      <div class="catalog-cta">
        <router-link to="/sewa" class="btn btn-primary btn-lg"
          >Lihat semua dan mulai sewa <ArrowRight :size="18"
        /></router-link>
      </div>
    </div>
    <ProductDetailModal
      :product="detailProduct"
      @close="detailProduct = null"
    />
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  ArrowRight,
  Backpack,
  CookingPot,
  LampDesk,
  PackageOpen,
  PackageSearch,
  Search,
  ShieldCheck,
  TentTree,
} from "lucide-vue-next";
import { formatCurrency } from "../../utils/formatters";
import ProductDetailModal from "./ProductDetailModal.vue";

const props = defineProps({
  config: { type: Object, required: true },
  products: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
});
const selectedCategory = ref(null);
const search = ref("");
const detailProduct = ref(null);
const categoryIcons = [
  { words: ["tenda", "shelter"], icon: TentTree },
  { words: ["carrier", "tas", "pack"], icon: Backpack },
  { words: ["masak", "stove", "dapur"], icon: CookingPot },
  { words: ["safety", "aman"], icon: ShieldCheck },
  { words: ["lamp", "aksesori", "aksesoris"], icon: LampDesk },
];

function categoryIcon(name = "") {
  const normalized = name.toLocaleLowerCase("id-ID");
  return (
    categoryIcons.find((entry) =>
      entry.words.some((word) => normalized.includes(word)),
    )?.icon || PackageOpen
  );
}

const filteredProducts = computed(() => {
  const keyword = search.value.toLocaleLowerCase("id-ID");
  return props.products.filter((product) => {
    const matchesCategory =
      selectedCategory.value === null ||
      Number(product.category_id) === selectedCategory.value;
    const matchesSearch =
      !keyword ||
      `${product.name} ${product.category_name || ""} ${product.description || ""}`
        .toLocaleLowerCase("id-ID")
        .includes(keyword);
    return matchesCategory && matchesSearch;
  });
});
</script>

<style scoped>
.catalog-section {
  position: relative;
  background: var(--bg-primary);
}
.section-kicker {
  margin-bottom: 9px;
  color: var(--brand-primary) !important;
  font-size: 0.77rem !important;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.catalog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 28px;
}
.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-btn {
  min-height: 35px;
  padding: 7px 13px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
}
.filter-btn:hover,
.filter-btn.active {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}
.filter-btn.active {
  background: color-mix(in srgb, var(--brand-primary) 10%, var(--surface));
}
.search-box {
  display: flex;
  width: min(250px, 100%);
  min-height: 39px;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-muted);
}
.search-box:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--brand-primary) 14%, transparent);
}
.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.product-card {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.18s,
    box-shadow 0.18s;
}
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.product-visual {
  position: relative;
  height: 194px;
  overflow: hidden;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-subtle);
}
.product-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-placeholder {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  place-content: center;
  gap: 10px;
  overflow: hidden;
  color: var(--brand-primary);
  text-align: center;
  background: color-mix(
    in srgb,
    var(--brand-lichen) 52%,
    var(--surface-subtle)
  );
}
.product-placeholder::before {
  position: absolute;
  inset: 0;
  content: "";
  opacity: 0.52;
  background-image:
    radial-gradient(
      circle at 20% 110%,
      transparent 0 55px,
      color-mix(in srgb, var(--brand-moss) 16%, transparent) 56px 57px,
      transparent 58px 76px,
      color-mix(in srgb, var(--brand-moss) 12%, transparent) 77px 78px,
      transparent 79px
    ),
    radial-gradient(
      circle at 100% 0,
      transparent 0 70px,
      color-mix(in srgb, var(--brand-secondary) 13%, transparent) 71px 72px,
      transparent 73px 95px,
      color-mix(in srgb, var(--brand-secondary) 10%, transparent) 96px 97px,
      transparent 98px
    );
}
.product-placeholder svg,
.product-placeholder small {
  position: relative;
  z-index: 1;
  margin: 0 auto;
}
.product-placeholder small {
  color: var(--text-secondary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.terrain-ring {
  position: absolute;
  width: 126px;
  height: 126px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  border-radius: 50%;
}
.stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 5px 8px;
  border-radius: var(--radius-full);
  background: var(--surface-raised);
  box-shadow: var(--shadow-sm);
  color: var(--success);
  font-size: 0.69rem;
  font-weight: 800;
}
.stock-badge.empty {
  color: var(--danger);
}
.product-info {
  padding: 19px;
}
.product-category {
  color: var(--brand-primary);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.product-info h3 {
  margin: 7px 0 8px;
  font-size: 1.06rem;
}
.product-info > p {
  display: -webkit-box;
  min-height: 61px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: var(--text-secondary);
  font-size: 0.84rem;
}
.product-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 17px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}
.price strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.08rem;
}
.price span {
  color: var(--text-muted);
  font-size: 0.72rem;
}
.catalog-empty {
  grid-column: 1 / -1;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
}
.catalog-empty strong {
  display: block;
  color: var(--text-primary);
}
.catalog-empty p {
  margin-top: 4px;
}
.catalog-cta {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
@media (max-width: 920px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .catalog-toolbar {
    align-items: flex-start;
    flex-direction: column-reverse;
  }
  .search-box {
    width: 100%;
  }
}
@media (max-width: 580px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  .product-visual {
    height: 215px;
  }
  .product-footer .btn {
    padding-inline: 12px;
  }
}
</style>
