<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="product"
        class="product-modal-backdrop"
        @click.self="$emit('close')"
      >
        <article
          class="product-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`product-title-${product.id}`"
        >
          <button
            class="modal-close"
            type="button"
            aria-label="Tutup detail barang"
            @click="$emit('close')"
          >
            <X :size="20" />
          </button>
          <div class="modal-visual">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
            />
            <div v-else class="modal-placeholder">
              <TentTree :size="58" /><span>Perlengkapan outdoor</span>
            </div>
          </div>
          <div class="modal-copy">
            <p class="modal-category">
              {{ product.category_name || "Perlengkapan" }}
            </p>
            <h2 :id="`product-title-${product.id}`">{{ product.name }}</h2>
            <p class="modal-description">
              {{
                product.description ||
                "Peralatan terawat yang siap mendampingi perjalanan Anda."
              }}
            </p>
            <dl class="rate-list">
              <div>
                <dt>Harian</dt>
                <dd>{{ formatCurrency(product.rate_daily) }}</dd>
              </div>
              <div>
                <dt>Mingguan</dt>
                <dd>{{ formatCurrency(product.rate_weekly) }}</dd>
              </div>
              <div>
                <dt>Bulanan</dt>
                <dd>{{ formatCurrency(product.rate_monthly) }}</dd>
              </div>
            </dl>
            <div class="availability">
              <PackageCheck :size="18" /><span
                ><strong>{{ product.available_stock }}</strong> unit
                tersedia</span
              >
            </div>
            <div class="modal-actions">
              <router-link
                to="/sewa"
                class="btn btn-primary"
                @click="$emit('close')"
                >Pilih untuk disewa <ArrowRight :size="17"
              /></router-link>
              <button
                class="btn btn-secondary"
                type="button"
                @click="$emit('close')"
              >
                Tutup
              </button>
            </div>
          </div>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ArrowRight, PackageCheck, TentTree, X } from "lucide-vue-next";
import { formatCurrency } from "../../utils/formatters";

defineProps({ product: { type: Object, default: null } });
defineEmits(["close"]);
</script>

<style scoped>
.product-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  padding: 24px;
  place-items: center;
  background: rgba(12, 23, 18, 0.7);
  backdrop-filter: blur(5px);
}
.product-modal {
  position: relative;
  display: grid;
  width: min(880px, 100%);
  max-height: min(680px, calc(100vh - 48px));
  grid-template-columns: minmax(280px, 0.9fr) minmax(340px, 1.1fr);
  overflow: auto;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--surface-raised);
  box-shadow: var(--shadow-lg);
}
.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: var(--surface-raised);
  color: var(--text-primary);
}
.modal-visual {
  min-height: 470px;
  background: var(--surface-subtle);
}
.modal-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.modal-placeholder {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 470px;
  place-content: center;
  gap: 12px;
  color: var(--brand-primary);
  text-align: center;
  background: linear-gradient(
    145deg,
    var(--brand-lichen),
    var(--surface-subtle)
  );
}
.modal-placeholder span {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.modal-copy {
  padding: 48px 40px 36px;
}
.modal-category {
  color: var(--brand-primary);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.modal-copy h2 {
  margin: 9px 0 15px;
  font-size: clamp(1.75rem, 4vw, 2.45rem);
}
.modal-description {
  color: var(--text-secondary);
  line-height: 1.75;
}
.rate-list {
  margin: 25px 0 20px;
  border-block: 1px solid var(--border-color);
}
.rate-list div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}
.rate-list div:last-child {
  border-bottom: 0;
}
.rate-list dt {
  color: var(--text-muted);
  font-size: 0.82rem;
}
.rate-list dd {
  font-weight: 800;
}
.availability {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--success);
  font-size: 0.85rem;
}
.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
@media (max-width: 720px) {
  .product-modal-backdrop {
    padding: 12px;
  }
  .product-modal {
    grid-template-columns: 1fr;
    max-height: calc(100vh - 24px);
  }
  .modal-visual,
  .modal-placeholder {
    min-height: 260px;
    max-height: 300px;
  }
  .modal-copy {
    padding: 30px 22px 24px;
  }
}
</style>
