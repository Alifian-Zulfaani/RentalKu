<template>
  <div class="order-page">
    <div class="order-bg">
      <div class="order-orb order-orb-1"></div>
      <div class="order-orb order-orb-2"></div>
    </div>

    <div class="container order-container">
      <router-link to="/" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        Kembali ke Beranda
      </router-link>

      <!-- Progress Steps -->
      <div class="stepper">
        <div class="step" v-for="(s, i) in stepLabels" :key="i" :class="{ active: step >= i + 1, done: step > i + 1 }">
          <div class="step-circle">
            <svg v-if="step > i + 1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="step-label">{{ s }}</span>
          <div class="step-line" v-if="i < stepLabels.length - 1"></div>
        </div>
      </div>

      <div class="order-layout">
        <!-- Main Form -->
        <div class="order-form glass-card">
          <!-- Step 1: Data Diri -->
          <div v-if="step === 1">
            <h2>Data Diri & Bisnis</h2>
            <p class="form-desc">Lengkapi data berikut untuk mendaftarkan bisnis rental kamu</p>
            <div class="form-group">
              <label class="form-label">Nama Lengkap</label>
              <input type="text" class="form-input" v-model="form.name" placeholder="Masukkan nama lengkap">
            </div>
            <div class="form-group">
              <label class="form-label">Nama Bisnis Rental</label>
              <input type="text" class="form-input" v-model="form.business_name" placeholder="Contoh: Summit Gear">
            </div>
            <div class="form-group">
              <label class="form-label">Jenis Bisnis</label>
              <select class="form-input" v-model="form.business_type">
                <option value="">Pilih jenis bisnis</option>
                <option value="Outdoor Equipment">Peralatan Outdoor</option>
                <option value="Kamera & Videografi">Kamera & Videografi</option>
                <option value="Sound System">Sound System</option>
                <option value="Tenda & Dekorasi">Tenda & Dekorasi</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Meja & Kursi">Meja & Kursi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor WhatsApp</label>
              <input type="tel" class="form-input" v-model="form.whatsapp" placeholder="08xxxxxxxxxx">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" v-model="form.email" placeholder="email@contoh.com">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" v-model="form.password" placeholder="Minimal 6 karakter">
            </div>
            <div class="form-group">
              <label class="form-label">Konfirmasi Password</label>
              <input type="password" class="form-input" v-model="form.confirmPassword" placeholder="Ulangi password">
            </div>
            <button class="btn btn-primary btn-block btn-lg" @click="nextStep" :disabled="!isStep1Valid">Lanjutkan</button>
          </div>

          <!-- Step 2: Pembayaran -->
          <div v-if="step === 2">
            <h2>Metode Pembayaran</h2>
            <p class="form-desc">Pilih cara bayar yang paling mudah</p>
            <div class="payment-options">
              <label class="payment-option glass-card" :class="{ selected: form.payment === 'qris' }">
                <input type="radio" v-model="form.payment" value="qris">
                <div class="payment-info">
                  <strong>QRIS</strong>
                  <span>Scan QR dari e-wallet atau mobile banking</span>
                </div>
                <div class="payment-check"></div>
              </label>
              <label class="payment-option glass-card" :class="{ selected: form.payment === 'transfer' }">
                <input type="radio" v-model="form.payment" value="transfer">
                <div class="payment-info">
                  <strong>Transfer Bank</strong>
                  <span>BCA, BRI, Mandiri, atau bank lainnya</span>
                </div>
                <div class="payment-check"></div>
              </label>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary btn-lg" @click="step = 1">Kembali</button>
              <button class="btn btn-primary btn-lg" @click="submitOrder" :disabled="!form.payment || loading">
                {{ loading ? 'Memproses...' : 'Bayar Sekarang' }}
              </button>
            </div>
          </div>

          <!-- Step 3: Selesai -->
          <div v-if="step === 3" class="success-step">
            <div class="success-icon">✅</div>
            <h2>Order Berhasil Dibuat!</h2>
            <p class="form-desc">Silakan lakukan pembayaran sesuai instruksi berikut</p>
            <div class="payment-info-box glass-card" v-if="form.payment === 'transfer'">
              <h4>Transfer ke Rekening:</h4>
              <div class="bank-item" v-for="b in banks" :key="b.name">
                <strong>{{ b.name }}</strong>
                <span>{{ b.number }} a.n. {{ b.holder }}</span>
              </div>
            </div>
            <div class="payment-info-box glass-card" v-else>
              <h4>Scan QRIS:</h4>
              <p style="color:var(--text-secondary)">QR Code akan dikirim ke WhatsApp Anda</p>
            </div>
            <div class="amount-box">
              <span>Total Pembayaran</span>
              <strong>Rp249.000</strong>
            </div>
            <router-link to="/" class="btn btn-primary btn-lg btn-block mt-3">Kembali ke Beranda</router-link>
          </div>
        </div>

        <!-- Sidebar Summary -->
        <div class="order-summary glass-card" v-if="step < 3">
          <h3>Ringkasan Order</h3>
          <div class="summary-plan">
            <div class="plan-badge">LIFETIME DEAL</div>
            <div class="plan-name">RentalKu — Lifetime Access</div>
          </div>
          <ul class="summary-features">
            <li v-for="f in summaryFeatures" :key="f">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
              {{ f }}
            </li>
          </ul>
          <div class="summary-divider"></div>
          <div class="summary-price">
            <div class="price-row"><span>Harga Normal</span><span class="line-through">Rp499.000</span></div>
            <div class="price-row discount"><span>Diskon 50%</span><span class="text-success">-Rp250.000</span></div>
            <div class="price-row total"><span>Total</span><span>Rp249.000</span></div>
          </div>
        </div>
      </div>
    </div>
    <ScrollToTop />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import api from '../../services/api'
import ScrollToTop from '../../components/public/ScrollToTop.vue'

const step = ref(1)
const loading = ref(false)
const stepLabels = ['Data Diri', 'Pembayaran', 'Selesai']

const form = reactive({ name: '', email: '', whatsapp: '', password: '', confirmPassword: '', payment: 'transfer', business_name: '', business_type: '' })

const isStep1Valid = computed(() => form.name && form.business_name && form.email && form.whatsapp && form.password && form.password.length >= 6 && form.password === form.confirmPassword)

const summaryFeatures = ['Unlimited order & pelanggan', 'Manajemen inventaris lengkap', 'Halaman booking online', 'Laporan keuangan otomatis', 'Support WhatsApp']
const banks = [
  { name: 'BCA', number: '1234567890', holder: 'PT RentalKu Indonesia' },
  { name: 'BRI', number: '0987654321', holder: 'PT RentalKu Indonesia' },
  { name: 'Mandiri', number: '1122334455', holder: 'PT RentalKu Indonesia' }
]

function nextStep() { if (isStep1Valid.value) step.value = 2 }

async function submitOrder() {
  loading.value = true
  try {
    await api.post('/public/checkout', {
      name: form.name, email: form.email, whatsapp: form.whatsapp,
      password: form.password, business_name: form.business_name, business_type: form.business_type,
      plan: 'lifetime', payment_method: form.payment
    })
    step.value = 3
  } catch (err) {
    alert(err.response?.data?.message || 'Terjadi kesalahan')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.order-page { min-height: 100vh; position: relative; padding: 40px 0 80px; }
.order-bg { position: fixed; inset: 0; pointer-events: none; }
.order-orb { position: absolute; border-radius: 50%; filter: blur(100px); }
.order-orb-1 { width: 400px; height: 400px; background: #7c3aed; top: -100px; right: -100px; opacity: 0.1; }
.order-orb-2 { width: 300px; height: 300px; background: #3b82f6; bottom: -50px; left: -50px; opacity: 0.08; }
.order-container { position: relative; z-index: 2; }
.back-link { display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 32px; transition: color 0.3s; }
.back-link:hover { color: var(--text-primary); }

/* Stepper */
.stepper { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 40px; }
.step { display: flex; align-items: center; gap: 8px; }
.step-circle { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-glass); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: var(--text-muted); transition: all 0.3s; }
.step.active .step-circle { background: var(--accent-gradient); border-color: transparent; color: white; }
.step.done .step-circle { background: var(--success); border-color: transparent; color: white; }
.step-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
.step.active .step-label { color: var(--text-primary); }
.step-line { width: 60px; height: 2px; background: var(--border-color); margin: 0 12px; }
.step.active .step-line { background: var(--accent-primary); }

/* Layout */
.order-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
.order-form { padding: 40px; }
.order-form h2 { font-size: 1.5rem; margin-bottom: 8px; }
.form-desc { color: var(--text-secondary); margin-bottom: 28px; }
.form-actions { display: flex; gap: 12px; margin-top: 8px; }
.form-actions .btn { flex: 1; }

/* Payment Options */
.payment-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
.payment-option { display: flex; align-items: center; gap: 16px; padding: 20px; cursor: pointer; transition: all 0.3s; }
.payment-option input { display: none; }
.payment-option.selected { border-color: var(--accent-primary); background: var(--accent-soft); }
.payment-info strong { display: block; font-size: 1rem; margin-bottom: 2px; }
.payment-info span { font-size: 0.85rem; color: var(--text-secondary); }
.payment-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--border-color); margin-left: auto; transition: all 0.3s; flex-shrink: 0; }
.payment-option.selected .payment-check { background: var(--accent-primary); border-color: var(--accent-primary); }

/* Success */
.success-step { text-align: center; }
.success-icon { font-size: 3rem; margin-bottom: 16px; }
.payment-info-box { padding: 24px; text-align: left; margin: 24px 0; }
.payment-info-box h4 { margin-bottom: 16px; font-size: 1rem; }
.bank-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
.bank-item:last-child { border-bottom: none; }
.bank-item span { color: var(--text-secondary); }
.amount-box { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; background: var(--accent-soft); border: 1px solid var(--border-accent); border-radius: var(--radius-md); margin-top: 16px; }
.amount-box strong { font-size: 1.5rem; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

/* Sidebar */
.order-summary { padding: 32px; position: sticky; top: 100px; }
.order-summary h3 { font-size: 1.15rem; margin-bottom: 20px; }
.plan-badge { display: inline-block; padding: 4px 12px; background: var(--accent-soft); color: var(--text-accent); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; }
.plan-name { font-weight: 600; font-size: 1rem; }
.summary-features { margin: 20px 0; }
.summary-features li { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 0.9rem; color: var(--text-secondary); }
.summary-divider { height: 1px; background: var(--border-color); margin: 8px 0; }
.price-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.9rem; color: var(--text-secondary); }
.line-through { text-decoration: line-through; }
.price-row.total { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); padding-top: 12px; border-top: 1px solid var(--border-color); margin-top: 4px; }

@media (max-width: 768px) {
  .order-layout { grid-template-columns: 1fr; }
  .order-summary { position: static; order: -1; }
  .order-form { padding: 24px; }
  .stepper { flex-wrap: wrap; gap: 4px; }
  .step-line { width: 30px; margin: 0 6px; }
  .step-label { display: none; }
}
</style>
