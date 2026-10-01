<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="wrap header-inner">
        <a :href="studioHref" class="wordmark"
          ><span class="mark">S.</span
          ><span
            >{{ site?.tenant.name || "Studio Senja"
            }}<small>PHOTOGRAPHY HOUSE</small></span
          ></a
        >
        <nav aria-label="Navigasi utama">
          <a href="#tentang">{{ site?.profile ? "Profil" : "Tentang" }}</a
          ><a :href="site?.profile ? '#jadwal' : '#fotografer'">{{
            site?.profile ? "Jadwal" : "Fotografer"
          }}</a
          ><a href="#layanan">{{
            site?.profile ? "Paket & harga" : "Layanan"
          }}</a
          ><a href="#reservasi" class="nav-book"
            >Reservasi <ArrowUpRight :size="16"
          /></a>
        </nav>
      </div>
    </header>

    <main v-if="loading" class="wrap state-message">
      Menyiapkan halaman studio…
    </main>
    <main v-else-if="loadError" class="wrap state-message">
      <h1>Halaman belum tersedia</h1>
      <p>{{ loadError }}</p>
    </main>
    <main v-else>
      <template v-if="site.profile">
        <section class="personal-hero wrap">
          <div class="personal-photo">
            <img
              :src="site.profile.photo_url || '/images/studio-senja-hero.png'"
              :alt="`Potret ${site.profile.name}`"
              fetchpriority="high"
            /><span>{{ site.profile.title }}</span>
          </div>
          <div class="personal-intro">
            <p class="section-index">
              FOTOGRAFER / {{ site.tenant.name.toUpperCase() }}
            </p>
            <p class="personal-overline">Halo, saya</p>
            <h1>{{ site.profile.name }}.</h1>
            <p class="personal-lead">{{ site.profile.bio }}</p>
            <div class="personal-facts">
              <span><MapPin :size="16" /> {{ site.tenant.location }}</span
              ><span><Camera :size="16" /> {{ site.profile.title }}</span>
            </div>
            <div class="hero-actions">
              <a href="#reservasi" class="button primary"
                >Cek jadwal saya <ArrowRight :size="17" /></a
              ><a :href="studioHref" class="under-link">Kenali studio kami</a>
            </div>
          </div>
        </section>
        <section id="tentang" class="personal-about">
          <div class="wrap personal-about-grid">
            <span class="section-index">01 / PENDEKATAN SAYA</span>
            <h2>{{ site.profile.headline || site.profile.title }}</h2>
            <p>{{ site.profile.approach || site.profile.bio }}</p>
          </div>
        </section>
        <section id="jadwal" class="wrap section personal-schedule">
          <div class="section-top">
            <div>
              <p class="section-index">02 / KETERSEDIAAN</p>
              <h2>Waktu untuk cerita Anda.</h2>
              <p>
                Berikut jam kerja rutin saya. Tanggal dan slot yang benar-benar
                kosong tampil pada kalender reservasi.
              </p>
            </div>
            <a href="#reservasi" class="under-link"
              >Lihat kalender <ArrowRight :size="16"
            /></a>
          </div>
          <div class="schedule-preview">
            <div
              v-for="(label, index) in fullWeekdays"
              :key="label"
              :class="{ off: !scheduleFor(index) }"
            >
              <span>{{ label }}</span
              ><strong>{{
                scheduleFor(index)
                  ? `${scheduleFor(index).start_time}–${scheduleFor(index).end_time}`
                  : "Libur"
              }}</strong>
            </div>
          </div>
        </section>
        <section id="layanan" class="personal-rates">
          <div class="wrap section">
            <div class="section-top">
              <div>
                <p class="section-index">03 / PAKET & HARGA</p>
                <h2>Pilih sesi yang paling cocok.</h2>
                <p>
                  Harga dan durasi di bawah adalah milik
                  {{ site.profile.name }}, bukan tarif rata-rata studio.
                </p>
              </div>
              <span v-if="availableServices.length"
                >{{ money(minPrice) }} – {{ money(maxPrice) }}</span
              >
            </div>
            <div class="rate-grid">
              <article
                v-for="service in availableServices"
                :key="service.id"
                class="rate-card"
              >
                <div>
                  <span class="section-index"
                    >{{ service.duration_minutes }} MENIT</span
                  >
                  <h3>{{ service.name }}</h3>
                  <p>{{ service.description }}</p>
                </div>
                <div class="rate-bottom">
                  <strong>{{ money(service.price) }}</strong
                  ><button
                    type="button"
                    class="button primary"
                    @click="chooseService(service.id)"
                  >
                    Pilih sesi <ArrowUpRight :size="16" />
                  </button>
                </div>
              </article>
            </div>
            <p v-if="!availableServices.length" class="empty-time">
              Belum ada paket yang tersedia untuk fotografer ini.
            </p>
          </div>
        </section>
      </template>
      <template v-else>
        <section class="hero wrap">
          <div class="hero-copy">
            <div class="eyebrow">
              <span></span>STUDIO FOTOGRAFI /
              {{ site.tenant.location.toUpperCase() }}
            </div>
            <h1>{{ site.tenant.tagline }}</h1>
            <p class="hero-intro">
              {{ site.tenant.about }}
            </p>
            <div class="hero-actions">
              <a href="#reservasi" class="button primary"
                >Lihat jadwal tersedia <ArrowRight :size="17" /></a
              ><a href="#fotografer" class="under-link"
                >Kenali fotografer kami</a
              >
            </div>
            <div class="hero-meta">
              <span><MapPin :size="16" /> {{ site.tenant.location }}</span
              ><span><CalendarDays :size="16" /> Reservasi sesuai jadwal</span>
            </div>
          </div>
          <div class="hero-art">
            <div class="photo-frame">
              <img
                :src="
                  site.tenant.hero_image_url || '/images/studio-senja-hero.png'
                "
                alt="Sesi potret di studio fotografi dengan cahaya sore"
                fetchpriority="high"
              /><span>GOOD LIGHT / GOOD STORIES</span>
            </div>
            <div class="art-caption">
              <span>01 / 03</span><span>Ruang untuk cerita Anda</span>
            </div>
          </div>
        </section>

        <section id="tentang" class="about-band">
          <div class="wrap about-grid">
            <p class="section-index">01 — TENTANG KAMI</p>
            <div>
              <h2>Setiap cerita pantas mendapat ruang dan waktu.</h2>
              <p>{{ site.tenant.about }}</p>
            </div>
            <div class="about-side">
              <Camera :size="28" /><span
                >Potret yang terasa dekat, dibuat dengan perhatian pada setiap
                detail.</span
              >
            </div>
          </div>
        </section>

        <section id="fotografer" class="wrap section photographers">
          <div class="section-top">
            <div>
              <p class="section-index">02 — ORANG DI BALIK KAMERA</p>
              <h2>Pilih sudut pandang yang paling dekat dengan Anda.</h2>
            </div>
            <span>{{ site.professionals.length }} fotografer</span>
          </div>
          <div class="people-grid">
            <a
              v-for="(person, index) in site.professionals"
              :key="person.id"
              :href="profileHref(person.slug)"
              class="person-card"
              ><div class="person-art" :class="`portrait-${index % 2}`">
                <img
                  v-if="person.photo_url"
                  :src="person.photo_url"
                  :alt="`Potret ${person.name}`"
                  loading="lazy"
                />
                <span v-else>{{
                  person.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                }}</span>
              </div>
              <div class="person-details">
                <div>
                  <h3>{{ person.name }}</h3>
                  <p>{{ person.title }}</p>
                  <small v-if="person.price_from != null"
                    >Mulai {{ money(person.price_from) }}</small
                  >
                </div>
                <ArrowUpRight :size="21" /></div
            ></a>
          </div>
        </section>

        <section id="layanan" class="services-section">
          <div class="wrap section">
            <div class="section-top">
              <div>
                <p class="section-index">03 — LAYANAN</p>
                <h2>Mulai dari momen yang ingin Anda simpan.</h2>
              </div>
            </div>
            <div class="service-list">
              <article
                v-for="(service, index) in studioServices"
                :key="service.id"
                class="service-row"
              >
                <span class="row-number">{{
                  String(index + 1).padStart(2, "0")
                }}</span>
                <div>
                  <h3>{{ service.name }}</h3>
                  <p>{{ service.description }}</p>
                </div>
                <div class="service-meta">
                  <span>{{ service.duration_minutes }} menit</span
                  ><strong>Mulai {{ money(service.price_from) }}</strong>
                </div>
                <button
                  type="button"
                  class="circle-link"
                  :aria-label="`Pilih ${service.name}`"
                  @click="chooseService(service.id)"
                >
                  <ArrowUpRight :size="19" />
                </button>
              </article>
            </div>
          </div>
        </section>
      </template>

      <section id="reservasi" class="wrap section reservation">
        <div class="section-top">
          <div>
            <p class="section-index">
              {{ site.profile ? "04 / JADWALKAN SESI" : "04 — RESERVASI" }}
            </p>
            <h2>
              {{
                site.profile
                  ? `Temukan waktu bersama ${site.profile.name}.`
                  : "Pilih waktu yang cocok untuk Anda."
              }}
            </h2>
            <p>
              Kalender menampilkan slot yang masih tersedia. Jadwal yang terisi
              otomatis tidak dapat dipilih.
            </p>
          </div>
        </div>
        <div class="booking-layout">
          <div class="booking-card">
            <div class="selection-grid">
              <label
                >Fotografer<select
                  v-model="selectedPro"
                  :disabled="Boolean(site.profile)"
                >
                  <option
                    v-for="person in site.professionals"
                    :key="person.slug"
                    :value="person.slug"
                  >
                    {{ person.name }}
                  </option>
                </select></label
              ><label
                >Layanan<select v-model.number="selectedService">
                  <option
                    v-for="service in availableServices"
                    :key="service.id"
                    :value="service.id"
                  >
                    {{ service.name }} · {{ money(service.price) }}
                  </option>
                </select></label
              >
            </div>
            <div class="calendar-head">
              <strong>{{ monthLabel }}</strong>
              <div>
                <button
                  type="button"
                  aria-label="Bulan sebelumnya"
                  :disabled="month <= currentMonth"
                  @click="changeMonth(-1)"
                >
                  <ChevronLeft :size="18" /></button
                ><button
                  type="button"
                  aria-label="Bulan berikutnya"
                  @click="changeMonth(1)"
                >
                  <ChevronRight :size="18" />
                </button>
              </div>
            </div>
            <div class="calendar-grid">
              <span v-for="day in weekdays" :key="day" class="weekday">{{
                day
              }}</span
              ><span v-for="n in calendarOffset" :key="`blank-${n}`"></span
              ><button
                v-for="day in availability"
                :key="day.date"
                type="button"
                class="calendar-day"
                :class="{ chosen: selectedDate === day.date }"
                :disabled="!day.available || availabilityLoading"
                :aria-label="`${day.date}, ${day.available ? day.slots.length + ' slot tersedia' : 'tidak tersedia'}`"
                @click="selectDay(day)"
              >
                {{ Number(day.date.slice(-2)) }}<i v-if="day.available"></i>
              </button>
            </div>
            <p class="calendar-note">
              <span></span> Tanggal dengan titik memiliki slot tersedia.
            </p>
            <div class="time-section">
              <strong>{{
                selectedDate
                  ? `Jam tersedia · ${longDate(selectedDate)}`
                  : "Pilih tanggal untuk melihat jam"
              }}</strong>
              <div v-if="selectedDay?.slots.length" class="time-grid">
                <button
                  v-for="time in selectedDay.slots"
                  :key="time"
                  type="button"
                  :class="{ chosen: selectedTime === time }"
                  @click="selectedTime = time"
                >
                  {{ time }}
                </button>
              </div>
              <p v-else class="empty-time">
                {{
                  availabilityLoading
                    ? "Memuat jadwal…"
                    : "Pilih tanggal yang ditandai pada kalender."
                }}
              </p>
            </div>
          </div>
          <aside class="booking-summary">
            <span class="section-index">DETAIL RESERVASI</span>
            <h3>{{ chosenService?.name || "Pilih layanan" }}</h3>
            <p>{{ chosenService?.description }}</p>
            <dl>
              <div>
                <dt>Fotografer</dt>
                <dd>{{ chosenProfessional?.name || "—" }}</dd>
              </div>
              <div>
                <dt>Tanggal</dt>
                <dd>
                  {{ selectedDate ? longDate(selectedDate) : "Belum dipilih" }}
                </dd>
              </div>
              <div>
                <dt>Waktu</dt>
                <dd>{{ selectedTime || "Belum dipilih" }}</dd>
              </div>
              <div>
                <dt>Estimasi</dt>
                <dd>{{ chosenService ? money(chosenService.price) : "—" }}</dd>
              </div>
            </dl>
            <form @submit.prevent="submitBooking">
              <h4>Data pemesan</h4>
              <label
                >Nama lengkap<input
                  v-model.trim="form.customer_name"
                  required
                  minlength="2"
                  maxlength="100"
                  autocomplete="name"
                  placeholder="Nama Anda"
                /><small v-if="fieldErrors.customer_name">{{
                  fieldErrors.customer_name
                }}</small></label
              ><label
                >Email<input
                  v-model.trim="form.customer_email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="nama@email.com"
                /><small v-if="fieldErrors.customer_email">{{
                  fieldErrors.customer_email
                }}</small></label
              ><label
                >WhatsApp<input
                  v-model.trim="form.customer_whatsapp"
                  type="tel"
                  required
                  pattern="(?:\+62|62|0)8[0-9]{7,12}"
                  placeholder="08xxxxxxxxxx"
                /><small v-if="fieldErrors.customer_whatsapp">{{
                  fieldErrors.customer_whatsapp
                }}</small></label
              ><label
                >Catatan (opsional)<textarea
                  v-model.trim="form.notes"
                  maxlength="1000"
                  rows="2"
                  placeholder="Ceritakan kebutuhan Anda"
                ></textarea>
              </label>
              <p v-if="bookingError" class="feedback error" role="alert">
                {{ bookingError }}
              </p>
              <p v-if="success" class="feedback success" role="status">
                Reservasi #{{ success.id }} berhasil dikirim. Tim studio akan
                menghubungi Anda untuk konfirmasi.
              </p>
              <button
                type="submit"
                class="button primary full"
                :disabled="!selectedDate || !selectedTime || submitting"
              >
                {{ submitting ? "Mengirim…" : "Kirim reservasi" }}
                <ArrowRight :size="17" />
              </button>
            </form>
          </aside>
        </div>
      </section>
    </main>
    <footer class="footer">
      <div class="wrap">
        <strong>{{ site?.tenant.name || "Studio Senja" }}</strong
        ><span>{{ site?.tenant.location }} · {{ site?.tenant.email }}</span
        ><a href="/admin">Panel pengelola</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-vue-next";
import { api, apiError, siteContext } from "../services/api";

const context = siteContext();
const site = ref(null);
const loading = ref(true);
const loadError = ref("");
const selectedPro = ref(context.pro || "");
const selectedService = ref(null);
const month = ref(
  new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }),
);
const currentMonth = month.value;
const availability = ref([]);
const availabilityLoading = ref(false);
const selectedDate = ref("");
const selectedTime = ref("");
const bookingError = ref("");
const success = ref(null);
const submitting = ref(false);
const fieldErrors = reactive({});
const form = reactive({
  customer_name: "",
  customer_email: "",
  customer_whatsapp: "",
  notes: "",
});
const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const fullWeekdays = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const money = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
const longDate = (date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
const monthLabel = computed(() =>
  new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month.value}-01T00:00:00Z`)),
);
const calendarOffset = computed(() =>
  new Date(`${month.value}-01T00:00:00Z`).getUTCDay(),
);
const availableServices = computed(
  () =>
    site.value?.services.filter(
      (item) => item.professional_id === chosenProfessional.value?.id,
    ) || [],
);
const studioServices = computed(() => {
  const grouped = new Map();
  for (const service of site.value?.services || []) {
    const previous = grouped.get(service.id);
    if (!previous)
      grouped.set(service.id, { ...service, price_from: service.price });
    else previous.price_from = Math.min(previous.price_from, service.price);
  }
  return [...grouped.values()];
});
const chosenService = computed(() =>
  availableServices.value.find((item) => item.id === selectedService.value),
);
const minPrice = computed(() =>
  Math.min(...availableServices.value.map((item) => item.price)),
);
const maxPrice = computed(() =>
  Math.max(...availableServices.value.map((item) => item.price)),
);
const scheduleFor = (weekday) =>
  site.value?.schedule?.find((item) => item.weekday === weekday);
const chosenProfessional = computed(() =>
  site.value?.professionals.find((item) => item.slug === selectedPro.value),
);
const selectedDay = computed(() =>
  availability.value.find((item) => item.date === selectedDate.value),
);
const studioHref = computed(() =>
  window.location.hostname.endsWith(".localhost") ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? `/?tenant=${context.tenant}`
    : `${window.location.protocol}//${context.tenant}.${import.meta.env.VITE_BOOKING_DOMAIN || "booking.rentalku.id"}/`,
);
function profileHref(slug) {
  return window.location.hostname.endsWith(".localhost") ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? `/?tenant=${context.tenant}&pro=${slug}`
    : `${window.location.protocol}//${slug}.${context.tenant}.${import.meta.env.VITE_BOOKING_DOMAIN || "booking.rentalku.id"}/`;
}
function changeMonth(delta) {
  const date = new Date(`${month.value}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  month.value = date.toISOString().slice(0, 7);
}
function selectDay(day) {
  selectedDate.value = day.date;
  selectedTime.value = "";
  bookingError.value = "";
}
function chooseService(id) {
  if (!availableServices.value.some((item) => item.id === id)) {
    const offering = site.value?.services.find((item) => item.id === id);
    selectedPro.value =
      site.value?.professionals.find(
        (item) => item.id === offering?.professional_id,
      )?.slug || selectedPro.value;
  }
  selectedService.value = id;
  document.getElementById("reservasi")?.scrollIntoView({ behavior: "smooth" });
}
let availabilityRequest = 0;
async function fetchAvailability() {
  if (!site.value || !selectedPro.value || !selectedService.value) {
    availability.value = [];
    selectedDate.value = "";
    selectedTime.value = "";
    return;
  }
  const request = ++availabilityRequest;
  availabilityLoading.value = true;
  selectedDate.value = "";
  selectedTime.value = "";
  try {
    const { data } = await api.get("/public/availability", {
      params: {
        tenant: context.tenant,
        pro: selectedPro.value,
        service: selectedService.value,
        month: month.value,
      },
    });
    if (request === availabilityRequest) availability.value = data.days;
  } catch (error) {
    if (request === availabilityRequest) bookingError.value = apiError(error);
  } finally {
    if (request === availabilityRequest) availabilityLoading.value = false;
  }
}
async function submitBooking() {
  bookingError.value = "";
  success.value = null;
  Object.keys(fieldErrors).forEach((field) => delete fieldErrors[field]);
  if (!selectedDate.value || !selectedTime.value) {
    bookingError.value = "Pilih tanggal dan jam terlebih dahulu.";
    return;
  }
  submitting.value = true;
  try {
    const { data } = await api.post("/public/bookings", {
      ...form,
      tenant: context.tenant,
      pro: selectedPro.value,
      service_id: selectedService.value,
      date: selectedDate.value,
      start_time: selectedTime.value,
    });
    success.value = data.data;
    await fetchAvailability();
  } catch (error) {
    bookingError.value = apiError(error);
    for (const item of error.response?.data?.errors || [])
      fieldErrors[item.field] = item.message;
    if (error.response?.status === 409) await fetchAvailability();
  } finally {
    submitting.value = false;
  }
}
watch([selectedPro, selectedService, month], fetchAvailability);
watch(selectedPro, () => {
  if (
    !availableServices.value.some((item) => item.id === selectedService.value)
  )
    selectedService.value = availableServices.value[0]?.id || null;
});
onMounted(async () => {
  try {
    const { data } = await api.get("/public/site", {
      params: {
        tenant: context.tenant,
        ...(context.pro && { pro: context.pro }),
      },
    });
    site.value = data;
    selectedPro.value = data.profile?.slug || data.professionals[0]?.slug || "";
    selectedService.value = availableServices.value[0]?.id || null;
    document.title = `${data.profile ? data.profile.name + " | " : ""}${data.tenant.name} — Reservasi fotografi`;
    await fetchAvailability();
  } catch (error) {
    loadError.value = apiError(error);
  } finally {
    loading.value = false;
  }
});
</script>
