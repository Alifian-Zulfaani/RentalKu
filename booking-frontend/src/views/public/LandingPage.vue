<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="wrap header-inner">
        <a :href="studioHref" class="wordmark">
          <BrandMark :name="site?.tenant.name || 'Studio Senja'" />
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#tentang">{{ site?.profile ? "Profil" : "Tentang" }}</a
          ><a :href="site?.profile ? '#jadwal' : '#fotografer'">{{
            site?.profile ? "Jadwal" : "Fotografer"
          }}</a
          ><a href="#layanan">{{
            site?.profile ? "Paket & harga" : "Layanan"
          }}</a>
          <ThemeToggle />
          <a href="#reservasi" class="nav-book"
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
      <PhotographerLanding v-if="site.profile" />
      <StudioLanding v-else />

      <ReservationSection />
    </main>
    <footer class="footer">
      <div class="wrap">
        <strong>{{ site?.tenant.name || "Studio Senja" }}</strong
        ><span>{{ site?.tenant.location }} · {{ site?.tenant.email }}</span
        ><a href="/admin">Panel pengelola</a>
      </div>
    </footer>
    <BookingConfirmModal
      v-if="confirmationOpen && chosenService && chosenProfessional"
      :customer="form"
      :service="chosenService"
      :professional="chosenProfessional"
      :date="selectedDate"
      :time="selectedTime"
      :submitting="submitting"
      @close="confirmationOpen = false"
      @confirm="confirmBooking"
    />
    <FloatingActions
      :phone="site?.tenant.whatsapp"
      :business-name="site?.tenant.name || 'Studio Senja'"
    />
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-vue-next";
import { api, apiError, siteContext } from "../../services/api";
import { longDate, money } from "../../utils/formatters";
import { publicContextKey } from "../../stores/context";
import BookingConfirmModal from "../../components/public/BookingConfirmModal.vue";
import PhotographerLanding from "../../components/public/PhotographerLanding.vue";
import StudioLanding from "../../components/public/StudioLanding.vue";
import ReservationSection from "../../components/public/ReservationSection.vue";
import BrandMark from "../../components/shared/BrandMark.vue";
import FloatingActions from "../../components/shared/FloatingActions.vue";
import ThemeToggle from "../../components/shared/ThemeToggle.vue";

const router = useRouter();
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
const confirmationOpen = ref(false);
const bookingErrorElement = ref(null);
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
  const request = ++availabilityRequest;
  if (!site.value || !selectedPro.value || !selectedService.value) {
    availability.value = [];
    availabilityLoading.value = false;
    selectedDate.value = "";
    selectedTime.value = "";
    return;
  }
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
function reviewBooking() {
  bookingError.value = "";
  Object.keys(fieldErrors).forEach((field) => delete fieldErrors[field]);
  if (
    !selectedDate.value ||
    !selectedTime.value ||
    !chosenService.value ||
    !chosenProfessional.value
  ) {
    bookingError.value = "Pilih tanggal dan jam terlebih dahulu.";
    return;
  }
  confirmationOpen.value = true;
}
async function confirmBooking() {
  if (submitting.value) return;
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
    confirmationOpen.value = false;
    await router.push({
      name: "booking-success",
      query: {
        tenant: context.tenant,
        ...(context.pro && { pro: context.pro }),
      },
      state: {
        confirmation: {
          ...data.data,
          tenant_name: site.value.tenant.name,
          tenant_whatsapp: site.value.tenant.whatsapp,
        },
      },
    });
  } catch (error) {
    confirmationOpen.value = false;
    bookingError.value = apiError(error);
    for (const item of error.response?.data?.errors || [])
      fieldErrors[item.field] = item.message;
    if (error.response?.status === 409) await fetchAvailability();
    await nextTick();
    bookingErrorElement.value?.focus({ preventScroll: true });
    bookingErrorElement.value?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  } finally {
    submitting.value = false;
  }
}
provide(publicContextKey, {
  site,
  studioHref,
  profileHref,
  scheduleFor,
  availableServices,
  minPrice,
  maxPrice,
  studioServices,
  chooseService,
  money,
  longDate,
  selectedPro,
  selectedService,
  month,
  currentMonth,
  availability,
  availabilityLoading,
  selectedDate,
  selectedTime,
  bookingError,
  bookingErrorElement,
  submitting,
  fieldErrors,
  form,
  weekdays,
  monthLabel,
  calendarOffset,
  chosenService,
  chosenProfessional,
  selectedDay,
  changeMonth,
  selectDay,
  reviewBooking,
});
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
