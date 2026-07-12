<template>
  <section id="booking" class="section">
    <div class="container">
      <div class="booking-wrapper glass-card">
        <div class="booking-header text-center">
          <h2>Formulir Booking Online</h2>
          <p>Isi form berikut untuk memesan peralatan. Kami akan segera menghubungi Anda untuk konfirmasi.</p>
        </div>
        
        <form @submit.prevent="submitBooking" class="booking-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Lengkap *</label>
              <input type="text" class="form-input" v-model="form.name" required placeholder="Nama Anda">
            </div>
            <div class="form-group">
              <label class="form-label">Nomor WhatsApp *</label>
              <input type="tel" class="form-input" v-model="form.whatsapp" required placeholder="08xxxxxxxxxx">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email (Opsional)</label>
              <input type="email" class="form-input" v-model="form.email" placeholder="email@contoh.com">
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Sewa</label>
              <div style="display:flex;gap:10px;">
                <input type="date" class="form-input" v-model="form.start_date" required>
                <input type="date" class="form-input" v-model="form.end_date" required>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Pilih Peralatan *</label>
            <div class="item-selection">
              <div class="selected-item" v-for="(item, i) in form.items" :key="i">
                <select class="form-input" v-model="item.inventory_id" required>
                  <option value="" disabled>Pilih Barang</option>
                  <option v-for="p in products" :key="p.id" :value="p.id" :disabled="p.available_stock < 1">
                    {{ p.name }} (Sisa {{ p.available_stock }}) - {{ formatRp(p.rate_daily) }}/hari
                  </option>
                </select>
                <input type="number" class="form-input qty-input" v-model.number="item.quantity" min="1" required placeholder="Qty">
                <button type="button" class="btn btn-danger btn-sm" @click="removeItem(i)" v-if="form.items.length > 1">X</button>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" @click="addItem" style="align-self:flex-start;">+ Tambah Barang</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Catatan Tambahan</label>
            <textarea class="form-input" v-model="form.notes" rows="3" placeholder="Tuliskan catatan atau pertanyaan khusus..."></textarea>
          </div>

          <div class="form-actions text-center mt-3">
            <button type="submit" class="btn btn-primary btn-lg" :disabled="loading" :style="{ background: config.primary_color, minWidth: '200px' }">
              {{ loading ? 'Mengirim...' : 'Kirim Booking' }}
            </button>
          </div>
          
          <div v-if="successMsg" class="alert alert-success mt-2">{{ successMsg }}</div>
          <div v-if="errorMsg" class="alert alert-danger mt-2">{{ errorMsg }}</div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '../../services/api'

defineProps({ config: Object, products: Array })
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = reactive({
  name: '', whatsapp: '', email: '', start_date: '', end_date: '', notes: '',
  items: [{ inventory_id: '', quantity: 1 }]
})

const formatRp = v => 'Rp' + (v || 0).toLocaleString('id-ID')
const addItem = () => form.items.push({ inventory_id: '', quantity: 1 })
const removeItem = i => form.items.splice(i, 1)

async function submitBooking() {
  if (!form.items.every(i => i.inventory_id && i.quantity > 0)) {
    errorMsg.value = 'Silakan lengkapi pilihan barang dan jumlahnya'; return;
  }
  loading.value = true; errorMsg.value = ''; successMsg.value = '';
  try {
    const { data } = await api.post('/public/booking', form)
    successMsg.value = data.message + ' Kami akan menghubungi Anda via WhatsApp.'
    form.name = ''; form.whatsapp = ''; form.email = ''; form.notes = ''; form.start_date = ''; form.end_date = ''; form.items = [{ inventory_id: '', quantity: 1 }];
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal mengirim booking.'
  } finally { loading.value = false }
}
</script>

<style scoped>
.section { padding: 100px 0; background: var(--bg-color); }
.booking-wrapper { max-width: 800px; margin: 0 auto; padding: 40px; }
.booking-header { margin-bottom: 40px; }
.booking-header h2 { font-size: 2rem; margin-bottom: 12px; }
.booking-header p { color: var(--text-secondary); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.item-selection { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(128,128,128,0.05); border-radius: var(--radius-sm); border: 1px solid var(--border-color); }
.selected-item { display: flex; gap: 10px; align-items: center; }
.qty-input { width: 80px; }
.alert { padding: 12px 16px; border-radius: var(--radius-sm); text-align: center; font-weight: 500; }
.alert-success { background: rgba(16,185,129,0.1); color: var(--success); border: 1px solid rgba(16,185,129,0.3); }
.alert-danger { background: rgba(239,68,68,0.1); color: var(--danger); border: 1px solid rgba(239,68,68,0.3); }
@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; gap: 0; }
  .booking-wrapper { padding: 24px; }
  .selected-item { flex-wrap: wrap; }
}
</style>
