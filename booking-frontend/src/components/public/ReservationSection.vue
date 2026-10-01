<template>
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
    <p
      v-if="bookingError"
      ref="bookingErrorElement"
      class="booking-feedback"
      role="alert"
      tabindex="-1"
    >
      {{ bookingError }}
    </p>
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
        <form @submit.prevent="reviewBooking">
          <h4>Data pemesan</h4>
          <label
            >Nama lengkap<input
              v-model.trim="form.customer_name"
              required
              minlength="2"
              maxlength="100"
              autocomplete="name"
              placeholder="Nama Anda"
              :aria-invalid="Boolean(fieldErrors.customer_name)"
              @input="delete fieldErrors.customer_name"
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
              :aria-invalid="Boolean(fieldErrors.customer_email)"
              @input="delete fieldErrors.customer_email"
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
              :aria-invalid="Boolean(fieldErrors.customer_whatsapp)"
              @input="delete fieldErrors.customer_whatsapp"
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
          <button
            type="submit"
            class="button primary full"
            :disabled="!selectedDate || !selectedTime || submitting"
          >
            Periksa reservasi <ArrowRight :size="17" />
          </button>
        </form>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { usePublicContext } from "../../stores/context";
const {
  site,
  availableServices,
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
} = usePublicContext();
</script>
