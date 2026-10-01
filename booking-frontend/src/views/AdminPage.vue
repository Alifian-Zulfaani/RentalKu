<template>
  <div class="admin-shell">
    <header v-if="token" class="admin-header">
      <div>
        <a href="/">◉ {{ tenantName }}</a
        ><span>{{
          isCompany ? "Panel Studio" : `Ruang Kerja ${accountProfessionalName}`
        }}</span>
      </div>
      <div>
        <a :href="publicHref" target="_blank" rel="noopener">Lihat situs</a
        ><button v-if="token" class="button" @click="logout">Keluar</button>
      </div>
    </header>
    <div v-if="!token" class="admin-login-layout">
      <div class="login-intro">
        <a href="/" class="login-brand"
          ><span class="mark">S.</span> {{ tenantName }}</a
        >
        <div>
          <p class="section-index">BOOKING WORKSPACE</p>
          <h1>Ruang kerja untuk setiap cerita.</h1>
          <p>
            Kelola reservasi, ketersediaan, tim, dan layanan dari satu tempat.
          </p>
        </div>
        <a href="/">Kembali ke halaman publik</a>
      </div>
      <div class="admin-login">
        <p class="section-index">AKSES PENGELOLA</p>
        <h1>Selamat datang kembali</h1>
        <p>Masuk sebagai admin studio atau fotografer.</p>
        <p class="admin-message" v-if="error" role="alert">{{ error }}</p>
        <form @submit.prevent="login">
          <label
            >Email<input
              v-model.trim="credentials.email"
              type="email"
              required
              autocomplete="username" /></label
          ><label
            >Kata sandi<input
              v-model="credentials.password"
              type="password"
              required
              autocomplete="current-password" /></label
          ><button :disabled="busy">
            {{ busy ? "Memeriksa…" : "Masuk ke panel" }}
          </button>
        </form>
      </div>
    </div>
    <div v-else class="admin-workspace">
      <aside class="admin-sidebar">
        <p class="side-caption">{{ isCompany ? "STUDIO" : "FOTOGRAFER" }}</p>
        <nav aria-label="Menu pengelola">
          <button
            v-for="item in navItems"
            :key="item.key"
            type="button"
            :class="{ active: activeTab === item.key }"
            @click="activeTab = item.key"
          >
            {{ item.label }}
          </button>
        </nav>
        <div class="side-footer">
          <span>{{ account.email }}</span
          ><button type="button" @click="logout">Keluar</button>
        </div>
      </aside>
      <main class="admin-main">
        <div class="admin-title">
          <p class="section-index">
            {{ isCompany ? "STUDIO" : "FOTOGRAFER" }} / PANEL
          </p>
          <h1>{{ currentTitle }}</h1>
          <p>{{ currentDescription }}</p>
        </div>
        <div v-if="activeTab === 'overview'" class="admin-grid">
          <article class="admin-card">
            <span>Total reservasi</span
            ><strong>{{ overview.counts.total || 0 }}</strong>
          </article>
          <article class="admin-card">
            <span>Menunggu konfirmasi</span
            ><strong>{{ overview.counts.pending || 0 }}</strong>
          </article>
          <article class="admin-card">
            <span>Terkonfirmasi</span
            ><strong>{{ overview.counts.confirmed || 0 }}</strong>
          </article>
        </div>
        <section v-if="activeTab === 'overview'" class="admin-panel">
          <div class="section-top">
            <div>
              <p class="section-index">AKTIVITAS TERBARU</p>
              <h2>Reservasi masuk</h2>
            </div>
            <button
              type="button"
              class="button"
              @click="activeTab = 'bookings'"
            >
              Lihat semua
            </button>
          </div>
          <div v-if="overview.recent.length" class="recent-list">
            <div v-for="item in overview.recent" :key="item.id">
              <span
                ><strong>{{ item.customer_name }}</strong
                ><small
                  >{{ item.service_name }} · {{ item.professional_name }}</small
                ></span
              ><span>{{ item.date }} · {{ item.start_time }}</span
              ><strong>{{ money(item.total) }}</strong>
            </div>
          </div>
          <p v-else class="empty-time">Belum ada reservasi.</p>
        </section>
        <div v-if="message" class="feedback" :class="messageType" role="status">
          {{ message }}
        </div>
        <section v-if="activeTab === 'bookings'" class="admin-panel">
          <div class="section-top">
            <div>
              <p class="section-index">01 — PESANAN</p>
              <h2>Daftar reservasi</h2>
            </div>
            <div class="admin-controls">
              <select v-model="filterStatus" aria-label="Filter status">
                <option value="">Semua status</option>
                <option value="pending">Menunggu</option>
                <option value="confirmed">Terkonfirmasi</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option></select
              ><button type="button" @click="fetchBookings">Muat ulang</button>
            </div>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Pemesan</th>
                  <th>Layanan</th>
                  <th>Fotografer</th>
                  <th>Jadwal</th>
                  <th class="right">Nilai</th>
                  <th class="center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in bookings" :key="item.id">
                  <td>
                    <strong>{{ item.customer_name }}</strong
                    ><br /><small
                      >{{ item.customer_email }} ·
                      {{ item.customer_whatsapp }}</small
                    >
                  </td>
                  <td>{{ item.service_name }}</td>
                  <td>{{ item.professional_name }}</td>
                  <td>
                    {{ item.date }}<br />{{ item.start_time }}–{{
                      item.end_time
                    }}
                  </td>
                  <td class="right">{{ money(item.total) }}</td>
                  <td class="center">
                    <select
                      :value="item.status"
                      :aria-label="`Status reservasi ${item.customer_name}`"
                      @change="updateStatus(item, $event.target.value)"
                    >
                      <option value="pending">Menunggu</option>
                      <option value="confirmed">Terkonfirmasi</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </td>
                </tr>
                <tr v-if="!bookings.length">
                  <td colspan="6">Belum ada reservasi pada filter ini.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <span
              >Halaman {{ pagination.page }} dari
              {{ Math.max(1, pagination.totalPages) }} ·
              {{ pagination.total }} data</span
            ><button :disabled="pagination.page <= 1" @click="page--">
              Sebelumnya</button
            ><button
              :disabled="pagination.page >= pagination.totalPages"
              @click="page++"
            >
              Berikutnya
            </button>
          </div>
        </section>
        <section v-if="activeTab === 'blocks'" class="admin-panel">
          <p class="section-index">02 — KETERSEDIAAN</p>
          <h2>Blokir waktu</h2>
          <p style="margin-bottom: 16px; color: #707970; font-size: 0.82rem">
            Gunakan saat fotografer libur atau sedang menerima pekerjaan di luar
            sistem.
          </p>
          <form class="admin-form" @submit.prevent="addBlock">
            <select
              v-model.number="blockForm.professional_id"
              required
              aria-label="Fotografer"
            >
              <option :value="null" disabled>Pilih fotografer</option>
              <option
                v-for="person in professionals"
                :key="person.id"
                :value="person.id"
              >
                {{ person.name }}
              </option></select
            ><input
              v-model="blockForm.date"
              type="date"
              :min="today"
              required
              aria-label="Tanggal"
            /><input
              v-model="blockForm.start_time"
              type="time"
              required
              aria-label="Mulai"
            /><input
              v-model="blockForm.end_time"
              type="time"
              required
              aria-label="Selesai"
            /><input
              v-model.trim="blockForm.reason"
              maxlength="200"
              placeholder="Alasan (opsional)"
              aria-label="Alasan"
            /><button type="submit">Blokir jadwal</button>
          </form>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Fotografer</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Alasan</th>
                  <th class="center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="block in blocks" :key="block.id">
                  <td>{{ block.professional_name }}</td>
                  <td>{{ block.date }}</td>
                  <td>{{ block.start_time }}–{{ block.end_time }}</td>
                  <td>{{ block.reason || "—" }}</td>
                  <td class="center">
                    <button
                      type="button"
                      class="button"
                      @click="removeBlock(block.id)"
                    >
                      Hapus blokir
                    </button>
                  </td>
                </tr>
                <tr v-if="!blocks.length">
                  <td colspan="5">Tidak ada jadwal terblokir ke depan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section v-if="activeTab === 'schedule'" class="admin-panel">
          <p class="section-index">03 — JAM KERJA</p>
          <h2>Jadwal mingguan fotografer</h2>
          <div
            v-for="person in professionals"
            :key="person.id"
            class="schedule-person"
          >
            <h3>{{ person.name }}</h3>
            <div class="schedule-list">
              <label v-for="(day, index) in weekdays" :key="day"
                ><input
                  type="checkbox"
                  :checked="Boolean(scheduleDrafts[person.id]?.[index])"
                  @change="
                    toggleDay(person.id, index, $event.target.checked)
                  " />{{ day
                }}<template v-if="scheduleDrafts[person.id]?.[index]"
                  ><input
                    type="time"
                    v-model="
                      scheduleDrafts[person.id][index].start_time
                    " /><span>–</span
                  ><input
                    type="time"
                    v-model="
                      scheduleDrafts[person.id][index].end_time
                    " /></template
              ></label>
            </div>
            <button
              type="button"
              class="button primary"
              @click="saveSchedule(person.id)"
            >
              Simpan jam kerja
            </button>
          </div>
        </section>
        <section
          v-if="activeTab === 'team' || activeTab === 'profile'"
          class="admin-panel"
        >
          <p class="section-index">04 — TIM</p>
          <h2>{{ isCompany ? "Profil fotografer" : "Profil saya" }}</h2>
          <form
            v-if="isCompany"
            class="admin-form"
            @submit.prevent="addProfessional"
          >
            <input
              v-model.trim="newProfessional.name"
              required
              minlength="2"
              placeholder="Nama fotografer"
              aria-label="Nama fotografer"
            /><input
              v-model.trim="newProfessional.slug"
              required
              pattern="[a-z0-9-]{2,40}"
              placeholder="slug-subdomain"
              aria-label="Slug fotografer"
            /><input
              v-model.trim="newProfessional.title"
              required
              placeholder="Spesialisasi"
              aria-label="Spesialisasi"
            /><input
              v-model.trim="newProfessional.bio"
              required
              placeholder="Biografi singkat"
              aria-label="Biografi"
            /><input
              v-model.trim="newProfessional.photo_url"
              placeholder="URL foto (opsional)"
              aria-label="URL foto fotografer"
            /><input
              v-model.trim="newProfessional.headline"
              placeholder="Judul pendekatan (opsional)"
              aria-label="Judul pendekatan"
            /><input
              v-model.trim="newProfessional.approach"
              placeholder="Cerita pendekatan (opsional)"
              aria-label="Cerita pendekatan"
            /><button type="submit">Tambah fotografer</button>
          </form>
          <div
            v-for="person in professionals"
            :key="person.id"
            class="editable-row person-row"
          >
            <label
              >Nama<input
                v-model.trim="person.name"
                aria-label="Nama fotografer" /></label
            ><label v-if="isCompany"
              >Subdomain<input
                v-model.trim="person.slug"
                aria-label="Slug subdomain" /></label
            ><label
              >Spesialisasi<input
                v-model.trim="person.title"
                aria-label="Spesialisasi" /></label
            ><label
              >Biografi<textarea
                v-model.trim="person.bio"
                rows="3"
                aria-label="Biografi"
              ></textarea></label
            ><label
              >Judul pendekatan<input
                v-model.trim="person.headline"
                maxlength="140"
                aria-label="Judul pendekatan" /></label
            ><label
              >Cerita pendekatan<textarea
                v-model.trim="person.approach"
                rows="3"
                maxlength="1000"
                aria-label="Cerita pendekatan"
              ></textarea></label
            ><label
              >URL foto<input
                v-model.trim="person.photo_url"
                placeholder="/images/foto.png"
                aria-label="URL foto fotografer" /></label
            ><label v-if="isCompany"
              ><input
                type="checkbox"
                v-model="person.active"
                :true-value="1"
                :false-value="0"
              />
              Aktif</label
            ><button class="button primary" @click="saveProfessional(person)">
              Simpan profil</button
            ><button
              v-if="isCompany"
              class="button"
              type="button"
              @click="
                selectedOfferingPro = person.id;
                activeTab = 'offerings';
              "
            >
              Atur harga
            </button>
          </div>
        </section>
        <section v-if="activeTab === 'services'" class="admin-panel">
          <p class="section-index">05 — LAYANAN</p>
          <h2>Paket fotografi</h2>
          <form class="admin-form" @submit.prevent="addService">
            <input
              v-model.trim="newService.name"
              required
              placeholder="Nama layanan"
              aria-label="Nama layanan"
            /><input
              v-model.trim="newService.description"
              required
              placeholder="Deskripsi"
              aria-label="Deskripsi layanan"
            /><input
              v-model.number="newService.duration_minutes"
              type="number"
              min="30"
              max="480"
              step="30"
              required
              aria-label="Durasi menit"
            /><input
              v-model.number="newService.price"
              type="number"
              min="0"
              required
              aria-label="Harga rupiah"
            /><button type="submit">Tambah layanan</button>
          </form>
          <div
            v-for="service in services"
            :key="service.id"
            class="editable-row"
          >
            <input
              v-model.trim="service.name"
              aria-label="Nama layanan"
            /><input
              v-model.trim="service.description"
              aria-label="Deskripsi layanan"
            /><input
              v-model.number="service.duration_minutes"
              type="number"
              min="30"
              max="480"
              step="30"
              aria-label="Durasi menit"
            /><input
              v-model.number="service.price"
              type="number"
              min="0"
              aria-label="Harga rupiah"
            /><label
              ><input
                type="checkbox"
                v-model="service.active"
                :true-value="1"
                :false-value="0"
              />
              Aktif</label
            ><button class="button primary" @click="saveService(service)">
              Simpan layanan
            </button>
          </div>
        </section>
        <section v-if="activeTab === 'site'" class="admin-panel">
          <p class="section-index">06 — IDENTITAS</p>
          <h2>Profil studio</h2>
          <form class="site-form" @submit.prevent="saveSite">
            <label
              >Nama studio<input v-model.trim="siteForm.name" required /></label
            ><label
              >Tagline<input v-model.trim="siteForm.tagline" required /></label
            ><label
              >Lokasi<input v-model.trim="siteForm.location" required /></label
            ><label
              >Email<input
                v-model.trim="siteForm.email"
                type="email"
                required /></label
            ><label
              >WhatsApp<input
                v-model.trim="siteForm.whatsapp"
                required /></label
            ><label
              >URL foto hero (HTTPS atau /images/)<input
                v-model.trim="siteForm.hero_image_url"
                placeholder="/images/studio-senja-hero.png" /></label
            ><label class="wide"
              >Tentang studio<textarea
                v-model.trim="siteForm.about"
                rows="4"
                required
              ></textarea></label
            ><button type="submit" class="button primary">
              Simpan profil studio
            </button>
          </form>
        </section>
        <section v-if="activeTab === 'offerings'" class="admin-panel">
          <p class="section-index">PAKET PER FOTOGRAFER</p>
          <h2>Harga & layanan</h2>
          <p class="panel-description">
            Tentukan paket aktif dan harga yang tampil di halaman masing-masing
            fotografer.
          </p>
          <label v-if="isCompany" class="offering-select"
            >Fotografer<select v-model.number="selectedOfferingPro">
              <option
                v-for="person in professionals"
                :key="person.id"
                :value="person.id"
              >
                {{ person.name }}
              </option>
            </select></label
          >
          <div class="offering-list">
            <div v-for="item in offerings" :key="item.service_id">
              <span
                ><strong>{{ item.name }}</strong
                ><small
                  >{{ item.duration_minutes }} menit · harga dasar
                  {{ money(item.base_price) }}</small
                ></span
              ><label
                >Harga<input
                  v-model.number="item.price"
                  type="number"
                  min="0"
                  step="1000" /></label
              ><label class="check-label"
                ><input
                  v-model="item.active"
                  type="checkbox"
                  :true-value="1"
                  :false-value="0"
                />
                Aktif</label
              >
            </div>
          </div>
          <p v-if="!offerings.length" class="empty-time">
            Belum ada paket untuk dipilih.
          </p>
          <button
            v-if="offerings.length"
            class="button primary"
            type="button"
            @click="saveOfferings"
          >
            Simpan paket & harga
          </button>
        </section>
        <section v-if="activeTab === 'accounts'" class="admin-panel">
          <p class="section-index">AKSES TIM</p>
          <h2>Akun fotografer</h2>
          <p class="panel-description">
            Akun fotografer hanya dapat mengakses data dan jadwal miliknya.
          </p>
          <form class="account-create" @submit.prevent="createAccount">
            <label
              >Email<input
                v-model.trim="newAccount.email"
                type="email"
                required /></label
            ><label
              >Fotografer<select
                v-model.number="newAccount.professional_id"
                required
              >
                <option :value="null" disabled>Pilih fotografer</option>
                <option
                  v-for="person in professionals"
                  :key="person.id"
                  :value="person.id"
                >
                  {{ person.name }}
                </option>
              </select></label
            ><label
              >Kata sandi awal<input
                v-model="newAccount.password"
                type="password"
                minlength="8"
                required /></label
            ><button type="submit" class="button primary">Buat akun</button>
          </form>
          <div class="account-list">
            <div v-for="item in accounts" :key="item.id">
              <span
                ><strong>{{ item.email }}</strong
                ><small>{{ item.professional_name || tenantName }}</small></span
              ><span>{{
                item.role === "company" ? "Admin studio" : "Fotografer"
              }}</span>
            </div>
          </div>
        </section>
        <section v-if="activeTab === 'security'" class="admin-panel">
          <p class="section-index">AKUN SAYA</p>
          <h2>Ubah kata sandi</h2>
          <form class="password-form" @submit.prevent="changePassword">
            <label
              >Kata sandi saat ini<input
                v-model="passwordForm.current_password"
                type="password"
                required /></label
            ><label
              >Kata sandi baru<input
                v-model="passwordForm.new_password"
                type="password"
                minlength="8"
                required /></label
            ><button class="button primary" type="submit">
              Simpan kata sandi
            </button>
          </form>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { api, apiError } from "../services/api";
const token = ref(sessionStorage.getItem("booking_admin_token") || "");
const tenantName = ref(
  sessionStorage.getItem("booking_tenant_name") || "Studio Senja",
);
const account = ref(
  JSON.parse(sessionStorage.getItem("booking_admin_account") || "{}"),
);
const tenantSlug = ref(
  sessionStorage.getItem("booking_tenant_slug") || "studio",
);
const activeTab = ref("overview");
const isCompany = computed(() => account.value.role === "company");
const accountProfessionalName = computed(
  () =>
    professionals.value.find(
      (item) => item.id === account.value.professional_id,
    )?.name || "Fotografer",
);
const publicHref = computed(
  () =>
    `/?tenant=${encodeURIComponent(tenantSlug.value)}${!isCompany.value && professionals.value[0]?.slug ? `&pro=${encodeURIComponent(professionals.value[0].slug)}` : ""}`,
);
const navItems = computed(() =>
  isCompany.value
    ? [
        { key: "overview", label: "Ringkasan" },
        { key: "bookings", label: "Reservasi" },
        { key: "blocks", label: "Blokir waktu" },
        { key: "schedule", label: "Jam kerja" },
        { key: "team", label: "Fotografer" },
        { key: "services", label: "Layanan studio" },
        { key: "offerings", label: "Harga fotografer" },
        { key: "site", label: "Profil studio" },
        { key: "accounts", label: "Akun tim" },
        { key: "security", label: "Keamanan" },
      ]
    : [
        { key: "overview", label: "Ringkasan saya" },
        { key: "bookings", label: "Reservasi saya" },
        { key: "blocks", label: "Blokir waktu" },
        { key: "schedule", label: "Jam kerja saya" },
        { key: "profile", label: "Profil saya" },
        { key: "offerings", label: "Paket & harga" },
        { key: "security", label: "Keamanan" },
      ],
);
const currentTitle = computed(
  () =>
    navItems.value.find((item) => item.key === activeTab.value)?.label ||
    "Ringkasan",
);
const currentDescription = computed(
  () =>
    ({
      overview: "Pantau aktivitas dan reservasi terbaru.",
      bookings: "Tinjau dan perbarui status setiap reservasi.",
      blocks: "Tutup tanggal atau jam yang tidak menerima pesanan.",
      schedule: "Atur jam kerja mingguan yang dipakai kalender publik.",
      team: "Kelola profil dan kehadiran fotografer di situs.",
      profile: "Perbarui informasi yang tampil di landing page Anda.",
      services: "Susun katalog paket fotografi studio.",
      offerings: "Atur paket aktif dan harga per fotografer.",
      site: "Perbarui identitas dan informasi studio.",
      accounts: "Kelola akses tim fotografer.",
      security: "Jaga keamanan akun Anda.",
    })[activeTab.value],
);
const credentials = reactive({ email: "", password: "" });
const busy = ref(false);
const error = ref("");
const message = ref("");
const messageType = ref("success");
const overview = reactive({ counts: {}, recent: [] });
const bookings = ref([]);
const blocks = ref([]);
const professionals = ref([]);
const services = ref([]);
const offerings = ref([]);
const accounts = ref([]);
const selectedOfferingPro = ref(null);
const newAccount = reactive({ email: "", password: "", professional_id: null });
const passwordForm = reactive({ current_password: "", new_password: "" });
const siteForm = reactive({
  name: "",
  tagline: "",
  about: "",
  location: "",
  email: "",
  whatsapp: "",
  hero_image_url: "",
});
const newProfessional = reactive({
  name: "",
  slug: "",
  title: "",
  bio: "",
  photo_url: "",
  headline: "",
  approach: "",
});
const newService = reactive({
  name: "",
  description: "",
  duration_minutes: 60,
  price: 0,
});
const scheduleDrafts = reactive({});
const weekdays = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Jakarta",
});
const filterStatus = ref("");
const page = ref(1);
const pagination = reactive({ page: 1, total: 0, totalPages: 0 });
const blockForm = reactive({
  professional_id: null,
  date: "",
  start_time: "09:00",
  end_time: "17:00",
  reason: "",
});
const money = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
function notify(value, type = "success") {
  message.value = value;
  messageType.value = type;
}
function logout() {
  sessionStorage.removeItem("booking_admin_token");
  sessionStorage.removeItem("booking_tenant_name");
  sessionStorage.removeItem("booking_admin_account");
  sessionStorage.removeItem("booking_tenant_slug");
  token.value = "";
  account.value = {};
}
async function login() {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await api.post("/admin/login", credentials);
    sessionStorage.setItem("booking_admin_token", data.token);
    sessionStorage.setItem("booking_tenant_name", data.tenant.name);
    sessionStorage.setItem(
      "booking_admin_account",
      JSON.stringify(data.account),
    );
    sessionStorage.setItem("booking_tenant_slug", data.tenant.slug);
    token.value = data.token;
    tenantName.value = data.tenant.name;
    account.value = data.account;
    tenantSlug.value = data.tenant.slug;
    await loadAll();
  } catch (cause) {
    error.value = apiError(cause);
  } finally {
    busy.value = false;
  }
}
async function fetchBookings() {
  try {
    const { data } = await api.get("/admin/bookings", {
      params: {
        page: page.value,
        ...(filterStatus.value && { status: filterStatus.value }),
      },
    });
    bookings.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (cause) {
    if (cause.response?.status === 401) logout();
    notify(apiError(cause), "error");
  }
}
async function loadAll() {
  try {
    const [overviewResponse, blocksResponse, prosResponse] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/blocks"),
      api.get("/admin/professionals"),
    ]);
    Object.assign(overview, overviewResponse.data);
    blocks.value = blocksResponse.data.data;
    professionals.value = prosResponse.data.data;
    if (isCompany.value) {
      const [servicesResponse, siteResponse, accountsResponse] =
        await Promise.all([
          api.get("/admin/services"),
          api.get("/admin/site"),
          api.get("/admin/accounts"),
        ]);
      services.value = servicesResponse.data.data;
      Object.assign(siteForm, siteResponse.data);
      accounts.value = accountsResponse.data.data;
    }
    selectedOfferingPro.value =
      selectedOfferingPro.value ||
      (isCompany.value
        ? professionals.value[0]?.id
        : account.value.professional_id) ||
      null;
    if (selectedOfferingPro.value) await fetchOfferings();
    for (const person of professionals.value)
      scheduleDrafts[person.id] = Object.fromEntries(
        person.schedule.map((item) => [item.weekday, { ...item }]),
      );
    await fetchBookings();
  } catch (cause) {
    if (cause.response?.status === 401) logout();
    notify(apiError(cause), "error");
  }
}
async function fetchOfferings() {
  if (!selectedOfferingPro.value) {
    offerings.value = [];
    return;
  }
  try {
    const { data } = await api.get("/admin/offerings", {
      params: { professional_id: selectedOfferingPro.value },
    });
    offerings.value = data.data;
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function saveOfferings() {
  try {
    await api.put(`/admin/offerings/${selectedOfferingPro.value}`, {
      offerings: offerings.value.map(({ service_id, price, active }) => ({
        service_id,
        price,
        active,
      })),
    });
    notify("Paket dan harga disimpan.");
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function createAccount() {
  try {
    await api.post("/admin/accounts", newAccount);
    Object.assign(newAccount, {
      email: "",
      password: "",
      professional_id: null,
    });
    accounts.value = (await api.get("/admin/accounts")).data.data;
    notify("Akun fotografer dibuat.");
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function changePassword() {
  try {
    await api.patch("/admin/password", passwordForm);
    Object.assign(passwordForm, { current_password: "", new_password: "" });
    notify("Kata sandi berhasil diperbarui.");
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function updateStatus(item, status) {
  try {
    await api.patch(`/admin/bookings/${item.id}/status`, { status });
    notify("Status reservasi diperbarui.");
    await loadAll();
  } catch (cause) {
    notify(apiError(cause), "error");
    await fetchBookings();
  }
}
async function addBlock() {
  try {
    await api.post("/admin/blocks", blockForm);
    notify("Jadwal berhasil diblokir.");
    blockForm.reason = "";
    const { data } = await api.get("/admin/blocks");
    blocks.value = data.data;
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function removeBlock(id) {
  try {
    await api.delete(`/admin/blocks/${id}`);
    blocks.value = blocks.value.filter((block) => block.id !== id);
    notify("Blokir jadwal dihapus.");
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
function toggleDay(personId, weekday, enabled) {
  if (enabled)
    scheduleDrafts[personId][weekday] = {
      weekday,
      start_time: "09:00",
      end_time: "17:00",
    };
  else delete scheduleDrafts[personId][weekday];
}
async function saveSchedule(personId) {
  try {
    await api.put(`/admin/professionals/${personId}/schedule`, {
      schedule: Object.values(scheduleDrafts[personId]),
    });
    notify("Jam kerja disimpan.");
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function addProfessional() {
  try {
    await api.post("/admin/professionals", newProfessional);
    Object.keys(newProfessional).forEach((key) => (newProfessional[key] = ""));
    notify("Fotografer ditambahkan. Atur jam kerjanya di bagian atas.");
    await loadAll();
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function saveProfessional(person) {
  try {
    await api.patch(`/admin/professionals/${person.id}`, person);
    notify("Profil fotografer disimpan.");
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function addService() {
  try {
    await api.post("/admin/services", newService);
    Object.assign(newService, {
      name: "",
      description: "",
      duration_minutes: 60,
      price: 0,
    });
    notify("Layanan ditambahkan.");
    await loadAll();
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function saveService(service) {
  try {
    await api.patch(`/admin/services/${service.id}`, service);
    notify("Layanan disimpan.");
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
async function saveSite() {
  try {
    const { data } = await api.patch("/admin/site", siteForm);
    Object.assign(siteForm, data.data);
    tenantName.value = data.data.name;
    sessionStorage.setItem("booking_tenant_name", data.data.name);
    notify("Profil studio disimpan.");
  } catch (cause) {
    notify(apiError(cause), "error");
  }
}
watch(page, fetchBookings);
watch(selectedOfferingPro, fetchOfferings);
watch(filterStatus, () => {
  if (page.value !== 1) page.value = 1;
  else fetchBookings();
});
onMounted(() => {
  if (token.value)
    api
      .get("/admin/me")
      .then(({ data }) => {
        account.value = data.account;
        tenantSlug.value = data.tenant.slug;
        tenantName.value = data.tenant.name;
        sessionStorage.setItem(
          "booking_admin_account",
          JSON.stringify(data.account),
        );
        loadAll();
      })
      .catch(() => logout());
});
</script>

<style scoped>
.schedule-person {
  padding: 20px 0;
  border-top: 1px solid #e3e6df;
}
.schedule-person:first-of-type {
  margin-top: 18px;
}
.schedule-person h3 {
  margin-bottom: 15px;
  font-size: 1rem;
}
.schedule-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-bottom: 15px;
}
.schedule-list label {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 39px;
  font-size: 0.79rem;
}
.schedule-list input[type="time"] {
  min-width: 0;
  width: 105px;
  padding: 6px;
  border: 1px solid #cbd2c8;
  background: #fff;
}
@media (max-width: 720px) {
  .schedule-list {
    grid-template-columns: 1fr;
  }
}
.editable-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 13px 0;
  border-top: 1px solid #e3e6df;
}
.person-row {
  grid-template-columns: repeat(5, minmax(0, 1fr)) auto auto;
}
.editable-row input:not([type="checkbox"]),
.site-form input,
.site-form textarea {
  width: 100%;
  min-width: 0;
  padding: 9px;
  border: 1px solid #cbd2c8;
  background: #fff;
}
.editable-row label {
  white-space: nowrap;
  font-size: 0.8rem;
}
.site-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}
.site-form label {
  display: grid;
  gap: 5px;
  font-size: 0.8rem;
}
.site-form label.wide {
  grid-column: 1/-1;
}
.site-form button {
  justify-self: start;
}
@media (max-width: 900px) {
  .editable-row,
  .person-row {
    grid-template-columns: 1fr 1fr;
  }
  .editable-row label {
    grid-column: 1;
  }
  .editable-row button {
    grid-column: 2;
  }
}
@media (max-width: 600px) {
  .editable-row,
  .person-row,
  .site-form {
    grid-template-columns: 1fr;
  }
  .editable-row label,
  .editable-row button {
    grid-column: auto;
  }
  .site-form label.wide {
    grid-column: auto;
  }
}
</style>
