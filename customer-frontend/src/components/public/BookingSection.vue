<template>
  <main id="booking" class="rental-workflow">
    <div class="container">
      <header class="workflow-header">
        <p class="section-kicker">Sewa perlengkapan</p>
        <h1>Pilih gear, lalu lengkapi data pemesanan</h1>
        <p>Stok dan estimasi harga langsung diperbarui saat Anda mengatur jumlah barang.</p>
        <ol class="stepper" aria-label="Tahapan pemesanan">
          <li :class="{ active: step === 1, done: step > 1 }"><span>1</span><div><strong>Pilih barang</strong><small>Atur kebutuhan dan jumlah</small></div></li>
          <li :class="{ active: step === 2 }"><span>2</span><div><strong>Data penyewa</strong><small>Tanggal dan kontak</small></div></li>
        </ol>
      </header>

      <section v-if="step === 1" class="selection-layout">
        <div class="product-browser">
          <div class="catalog-controls">
            <label class="search-control"><Search :size="18" /><input v-model.trim="search" type="search" placeholder="Cari tenda, carrier, alat masak..." /></label>
            <select v-model="category" class="form-input" aria-label="Filter kategori"><option value="">Semua kategori</option><option v-for="item in categories" :key="item.id" :value="String(item.id)">{{ item.name }}</option></select>
          </div>
          <div class="rental-product-grid">
            <article v-for="product in filteredProducts" :key="product.id" class="rental-product-card">
              <div class="product-image">
                <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
                <TentTree v-else :size="38" />
                <span :class="{ empty: product.available_stock < 1 }">{{ product.available_stock }} tersedia</span>
              </div>
              <div class="product-content"><small>{{ product.category_name || "Perlengkapan" }}</small><h2>{{ product.name }}</h2><p>{{ formatCurrency(product.rate_daily) }} <span>/ hari</span></p>
                <div class="product-actions"><button class="detail-link" type="button" @click="detailProduct = product">Lihat detail</button>
                  <div v-if="quantityFor(product.id)" class="qty-control"><button type="button" :aria-label="`Kurangi ${product.name}`" @click="decrement(product)"><Minus :size="15" /></button><strong>{{ quantityFor(product.id) }}</strong><button type="button" :disabled="quantityFor(product.id) >= product.available_stock" :aria-label="`Tambah ${product.name}`" @click="increment(product)"><Plus :size="15" /></button></div>
                  <button v-else class="btn btn-secondary btn-sm" type="button" :disabled="product.available_stock < 1" @click="increment(product)"><Plus :size="15" /> Pilih</button>
                </div>
              </div>
            </article>
            <div v-if="!filteredProducts.length" class="empty-state">Tidak ada barang yang cocok dengan pencarian.</div>
          </div>
        </div>
        <aside class="cart-card">
          <p class="cart-kicker">Pilihan Anda</p><h2>{{ cart.length }} jenis gear</h2>
          <div v-if="cart.length" class="cart-items"><div v-for="item in selectedItems" :key="item.id"><span>{{ item.name }} <small>× {{ item.quantity }}</small></span><strong>{{ formatCurrency(item.rate_daily * item.quantity) }}</strong></div></div>
          <p v-else class="cart-empty">Belum ada barang dipilih. Tambahkan gear dari katalog di sebelah kiri.</p>
          <div class="cart-subtotal"><span>Tarif per hari</span><strong>{{ formatCurrency(dailyTotal) }}</strong></div>
          <button class="btn btn-primary btn-lg btn-block" type="button" :disabled="!cart.length" @click="goToDetails">Lanjut isi data <ArrowRight :size="18" /></button>
        </aside>
      </section>

      <section v-else class="details-layout">
        <form ref="formElement" class="booking-form glass-card" novalidate @submit.prevent="submitBooking">
          <div class="form-title"><button type="button" class="back-button" @click="step = 1"><ArrowLeft :size="17" /> Ubah pilihan</button><h2>Data pemesanan</h2><p>Kolom bertanda wajib harus diisi sebelum booking dikirim.</p></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label" for="booking-name">Nama lengkap *</label><input id="booking-name" v-model.trim="form.name" class="form-input" :class="{ 'is-invalid': errors.name }" autocomplete="name" maxlength="100" placeholder="Nama sesuai identitas" @blur="validateField('name')" @input="clearError('name')" /><small v-if="errors.name" class="field-error">{{ errors.name }}</small></div>
            <div class="form-group"><label class="form-label" for="booking-whatsapp">Nomor WhatsApp *</label><input id="booking-whatsapp" v-model.trim="form.whatsapp" class="form-input" :class="{ 'is-invalid': errors.whatsapp }" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="08xxxxxxxxxx" @blur="validateField('whatsapp')" @input="clearError('whatsapp')" /><small v-if="errors.whatsapp" class="field-error">{{ errors.whatsapp }}</small></div>
          </div>
          <div class="form-group"><label class="form-label" for="booking-email">Email <span>(opsional)</span></label><input id="booking-email" v-model.trim="form.email" class="form-input" :class="{ 'is-invalid': errors.email }" type="email" autocomplete="email" maxlength="120" placeholder="nama@email.com" @blur="validateField('email')" @input="clearError('email')" /><small v-if="errors.email" class="field-error">{{ errors.email }}</small></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label" for="start-date">Tanggal mulai *</label><input id="start-date" v-model="form.start_date" class="form-input" :class="{ 'is-invalid': errors.start_date }" type="date" :min="today" @blur="validateField('start_date')" @change="clearError('start_date')" /><small v-if="errors.start_date" class="field-error">{{ errors.start_date }}</small></div>
            <div class="form-group"><label class="form-label" for="end-date">Tanggal selesai *</label><input id="end-date" v-model="form.end_date" class="form-input" :class="{ 'is-invalid': errors.end_date }" type="date" :min="form.start_date || today" @blur="validateField('end_date')" @change="clearError('end_date')" /><small v-if="errors.end_date" class="field-error">{{ errors.end_date }}</small></div>
          </div>
          <div class="form-group"><label class="form-label" for="booking-notes">Catatan <span>(opsional)</span></label><textarea id="booking-notes" v-model.trim="form.notes" class="form-input" :class="{ 'is-invalid': errors.notes }" rows="4" maxlength="1000" placeholder="Ukuran, waktu pengambilan, atau kebutuhan khusus..." @blur="validateField('notes')" @input="clearError('notes')"></textarea><small v-if="errors.notes" class="field-error">{{ errors.notes }}</small></div>
          <button class="btn btn-primary btn-lg btn-block" type="submit" :disabled="loading"><LoaderCircle v-if="loading" class="spin" :size="18" />{{ loading ? "Mengirim booking..." : "Kirim booking" }}</button>
          <p class="submit-note"><ShieldCheck :size="16" /> Booking belum merupakan pembayaran. Tim kami akan mengonfirmasi lewat WhatsApp.</p>
        </form>
        <aside class="order-summary glass-card"><p class="cart-kicker">Ringkasan pemesanan</p><h2>{{ rentalDays || 0 }} hari penyewaan</h2><div class="summary-date"><CalendarDays :size="18" /> {{ dateLabel }}</div><div class="cart-items"><div v-for="item in selectedItems" :key="item.id"><span>{{ item.name }} <small>× {{ item.quantity }}</small></span><strong>{{ formatCurrency(item.rate_daily * item.quantity * rentalDays) }}</strong></div></div><div class="cart-subtotal"><span>Estimasi total</span><strong>{{ formatCurrency(estimatedTotal) }}</strong></div></aside>
      </section>
    </div>
    <ProductDetailModal :product="detailProduct" @close="detailProduct = null" />
    <ToastMessage :message="toast.message" :type="toast.type" @close="toast.message = ''" />
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ArrowLeft, ArrowRight, CalendarDays, LoaderCircle, Minus, Plus, Search, ShieldCheck, TentTree } from "lucide-vue-next";
import api from "../../services/api";
import ProductDetailModal from "./ProductDetailModal.vue";
import ToastMessage from "../shared/ToastMessage.vue";
import { formatCurrency, formatDate, getApiError, getApiFieldErrors } from "../../utils/formatters";

const props = defineProps({ config: { type: Object, required: true }, products: { type: Array, default: () => [] }, categories: { type: Array, default: () => [] } });
const emit = defineEmits(["booked"]);
const step = ref(1); const search = ref(""); const category = ref(""); const cart = ref([]); const detailProduct = ref(null); const loading = ref(false); const errors = reactive({}); const toast = reactive({ message: "", type: "success" }); const formElement = ref(null);
const localDateString = (date = new Date()) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const today = localDateString();
const form = reactive({ name: "", whatsapp: "", email: "", start_date: "", end_date: "", notes: "" });
const filteredProducts = computed(() => props.products.filter((product) => (!category.value || String(product.category_id) === category.value) && (!search.value || `${product.name} ${product.category_name || ""} ${product.description || ""}`.toLocaleLowerCase("id-ID").includes(search.value.toLocaleLowerCase("id-ID")))));
const selectedItems = computed(() => cart.value.map((entry) => ({ ...props.products.find((product) => Number(product.id) === entry.inventory_id), quantity: entry.quantity })).filter((item) => item.id));
const dailyTotal = computed(() => selectedItems.value.reduce((sum, item) => sum + Number(item.rate_daily || 0) * item.quantity, 0));
const rentalDays = computed(() => (!form.start_date || !form.end_date || form.end_date < form.start_date) ? 0 : Math.floor((new Date(`${form.end_date}T00:00:00`) - new Date(`${form.start_date}T00:00:00`)) / 86_400_000) + 1);
const estimatedTotal = computed(() => dailyTotal.value * rentalDays.value);
const dateLabel = computed(() => form.start_date && form.end_date ? `${formatDate(form.start_date)} — ${formatDate(form.end_date)}` : "Tanggal belum dipilih");
const quantityFor = (id) => cart.value.find((item) => item.inventory_id === Number(id))?.quantity || 0;
function increment(product) { const item = cart.value.find((entry) => entry.inventory_id === Number(product.id)); if (item) item.quantity = Math.min(item.quantity + 1, Number(product.available_stock)); else if (product.available_stock > 0) cart.value.push({ inventory_id: Number(product.id), quantity: 1 }); }
function decrement(product) { const index = cart.value.findIndex((entry) => entry.inventory_id === Number(product.id)); if (index < 0) return; if (cart.value[index].quantity <= 1) cart.value.splice(index, 1); else cart.value[index].quantity -= 1; }
function goToDetails() { if (!cart.value.length) return; step.value = 2; window.scrollTo({ top: 0, behavior: "smooth" }); }
function clearError(field) { delete errors[field]; }
function fieldMessage(field) {
  const value = form[field];
  if (field === "name" && (!value || value.length < 2)) return "Nama lengkap minimal 2 karakter.";
  if (field === "whatsapp" && !/^(?:\+62|62|0)8\d{7,12}$/.test(value)) return "Masukkan nomor WhatsApp Indonesia yang valid.";
  if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email belum valid.";
  if (field === "start_date" && (!value || value < today)) return "Pilih tanggal mulai hari ini atau setelahnya.";
  if (field === "end_date" && (!value || !form.start_date || value < form.start_date)) return "Tanggal selesai harus sama atau setelah tanggal mulai.";
  if (field === "notes" && value.length > 1000) return "Catatan maksimal 1.000 karakter.";
  return "";
}
function validateField(field) { const message = fieldMessage(field); if (message) errors[field] = message; else delete errors[field]; return !message; }
function validateForm() { Object.keys(errors).forEach((field) => delete errors[field]); ["name", "whatsapp", "email", "start_date", "end_date", "notes"].forEach(validateField); if (!cart.value.length) errors.items = "Pilih setidaknya satu barang."; return !Object.keys(errors).length; }
watch(() => form.start_date, (value) => { if (value && form.end_date && form.end_date < value) form.end_date = value; clearError("end_date"); });
async function submitBooking() {
  toast.message = "";
  if (!validateForm()) { toast.type = "error"; toast.message = "Periksa kembali kolom yang ditandai."; requestAnimationFrame(() => formElement.value?.querySelector(".is-invalid")?.focus()); return; }
  loading.value = true;
  try {
    const { data } = await api.post("/public/booking", { ...form, items: cart.value });
    toast.type = "success"; toast.message = `${data.message}. Nomor referensi ${data.data.order_number}.`;
    Object.assign(form, { name: "", whatsapp: "", email: "", start_date: "", end_date: "", notes: "" }); cart.value = []; step.value = 1; emit("booked");
  } catch (error) {
    Object.assign(errors, getApiFieldErrors(error)); toast.type = "error"; toast.message = getApiError(error, "Booking belum dapat dikirim. Silakan coba lagi.");
  } finally { loading.value = false; }
}
</script>

<style scoped>
.rental-workflow { min-height: calc(100vh - 76px); padding: 66px 0 88px; background: var(--bg-primary); }.workflow-header { max-width: 780px; margin-bottom: 38px; }.section-kicker,.cart-kicker { margin-bottom: 8px; color: var(--brand-primary); font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }.workflow-header h1 { font-size: clamp(2.15rem, 5vw, 3.7rem); letter-spacing: -.05em; }.workflow-header > p:not(.section-kicker) { margin-top: 12px; color: var(--text-secondary); }.stepper { display: flex; max-width: 620px; gap: 44px; margin-top: 30px; }.stepper li { position: relative; display: flex; align-items: center; gap: 11px; color: var(--text-muted); }.stepper li:first-child::after { position: absolute; top: 19px; left: calc(100% + 12px); width: 20px; height: 1px; content: ""; background: var(--border-strong); }.stepper li > span { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid var(--border-strong); border-radius: 50%; font-weight: 800; }.stepper .active,.stepper .done { color: var(--text-primary); }.stepper .active > span,.stepper .done > span { border-color: var(--brand-primary); background: var(--brand-primary); color: white; }.stepper strong,.stepper small { display: block; }.stepper small { margin-top: 1px; font-size: .7rem; }.selection-layout,.details-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; align-items: start; gap: 26px; }.catalog-controls { display: grid; grid-template-columns: 1fr 210px; gap: 12px; margin-bottom: 18px; }.search-control { display: flex; min-height: 43px; align-items: center; gap: 9px; padding: 0 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--surface); color: var(--text-muted); }.search-control:focus-within { border-color: var(--brand-primary); }.search-control input { width: 100%; border: 0; outline: 0; background: transparent; color: var(--text-primary); }.rental-product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }.rental-product-card { display: grid; grid-template-columns: 124px 1fr; min-height: 158px; overflow: hidden; border: 1px solid var(--border-color); border-radius: 11px; background: var(--surface); }.product-image { position: relative; display: grid; place-items: center; overflow: hidden; background: var(--surface-subtle); color: var(--brand-primary); }.product-image img { width: 100%; height: 100%; object-fit: cover; }.product-image > span { position: absolute; bottom: 8px; left: 8px; padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,.9); color: #286046; font-size: .64rem; font-weight: 800; }.product-image > span.empty { color: var(--danger); }.product-content { padding: 16px; }.product-content > small { color: var(--brand-primary); font-size: .65rem; font-weight: 800; text-transform: uppercase; }.product-content h2 { margin: 5px 0 9px; font-size: .98rem; }.product-content > p { font-weight: 800; }.product-content > p span { color: var(--text-muted); font-size: .7rem; font-weight: 500; }.product-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 13px; }.detail-link { padding: 0; background: transparent; color: var(--text-secondary); font-size: .72rem; text-decoration: underline; text-underline-offset: 3px; }.qty-control { display: flex; align-items: center; gap: 9px; }.qty-control button { display: grid; width: 28px; height: 28px; place-items: center; border: 1px solid var(--border-color); border-radius: 5px; background: var(--surface); color: var(--text-primary); }.qty-control button:disabled { opacity: .4; }.cart-card,.order-summary { position: sticky; top: 96px; padding: 26px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--surface); box-shadow: var(--shadow-sm); }.cart-card h2,.order-summary h2 { font-size: 1.25rem; }.cart-items { margin: 20px 0; padding-block: 4px; border-block: 1px solid var(--border-color); }.cart-items > div { display: flex; justify-content: space-between; gap: 12px; padding: 11px 0; font-size: .79rem; }.cart-items small { color: var(--text-muted); }.cart-items strong { white-space: nowrap; }.cart-empty { margin: 22px 0; color: var(--text-muted); font-size: .82rem; }.cart-subtotal { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin: 20px 0; }.cart-subtotal span { color: var(--text-secondary); font-size: .8rem; }.cart-subtotal strong { font-size: 1.08rem; }.booking-form { padding: 32px; }.form-title { margin-bottom: 27px; }.form-title h2 { margin-top: 18px; font-size: 1.55rem; }.form-title p { margin-top: 6px; color: var(--text-secondary); font-size: .85rem; }.back-button { display: inline-flex; align-items: center; gap: 6px; padding: 0; background: transparent; color: var(--brand-primary); font-size: .78rem; font-weight: 800; }.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }.form-label span { color: var(--text-muted); font-weight: 500; }.submit-note { display: flex; justify-content: center; gap: 7px; margin-top: 13px; color: var(--text-muted); font-size: .73rem; }.summary-date { display: flex; align-items: center; gap: 7px; margin-top: 14px; color: var(--text-secondary); font-size: .8rem; }.spin { animation: spin .8s linear infinite; }
@media (max-width: 1040px) { .rental-product-grid { grid-template-columns: 1fr; } }
@media (max-width: 820px) { .selection-layout,.details-layout { grid-template-columns: 1fr; }.cart-card,.order-summary { position: static; }.order-summary { order: -1; } }
@media (max-width: 580px) { .rental-workflow { padding-top: 42px; }.stepper { gap: 22px; }.stepper small,.stepper li:first-child::after { display: none; }.catalog-controls,.form-row { grid-template-columns: 1fr; }.rental-product-card { grid-template-columns: 100px 1fr; }.booking-form { padding: 22px; } }
</style>
