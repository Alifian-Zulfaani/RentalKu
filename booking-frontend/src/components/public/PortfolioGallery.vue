<template>
  <div class="portfolio-grid">
    <article
      v-for="(item, index) in items"
      :key="item.id"
      class="portfolio-card"
    >
      <button
        :ref="(element) => (cardButtons[index] = element)"
        type="button"
        class="portfolio-card-trigger"
        :aria-label="`Pratinjau ${item.title}`"
        @click="open(index)"
      >
        <span class="portfolio-image-wrap">
          <img :src="item.image_url" :alt="item.title" loading="lazy" />
          <span class="portfolio-view-label"
            >Lihat foto <ArrowUpRight :size="16"
          /></span>
        </span>
        <span class="portfolio-card-copy">
          <strong>{{ item.title }}</strong>
          <span>{{ item.caption }}</span>
        </span>
      </button>
    </article>
  </div>
  <Teleport to="body">
    <div
      v-if="selectedItem"
      class="portfolio-preview-overlay"
      @click.self="close"
    >
      <section
        ref="dialog"
        class="portfolio-preview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-preview-title"
        tabindex="-1"
      >
        <div class="portfolio-preview-top">
          <span
            >{{ String(selectedIndex + 1).padStart(2, "0") }} /
            {{ String(items.length).padStart(2, "0") }}</span
          >
          <button
            type="button"
            class="portfolio-preview-close"
            aria-label="Tutup pratinjau"
            @click="close"
          >
            <X :size="22" />
          </button>
        </div>
        <img :src="selectedItem.image_url" :alt="selectedItem.title" />
        <div class="portfolio-preview-bottom">
          <div>
            <h2 id="portfolio-preview-title">{{ selectedItem.title }}</h2>
            <p>{{ selectedItem.caption }}</p>
          </div>
          <div class="portfolio-preview-controls">
            <button
              type="button"
              aria-label="Foto sebelumnya"
              :disabled="selectedIndex === 0"
              @click="selectedIndex--"
            >
              <ChevronLeft :size="20" />
            </button>
            <button
              type="button"
              aria-label="Foto berikutnya"
              :disabled="selectedIndex === items.length - 1"
              @click="selectedIndex++"
            >
              <ChevronRight :size="20" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-vue-next";

const props = defineProps({ items: { type: Array, default: () => [] } });
const selectedIndex = ref(-1);
const selectedItem = computed(() => props.items[selectedIndex.value] || null);
const cardButtons = [];
const dialog = ref(null);
let previousOverflow = "";
function open(index) {
  selectedIndex.value = index;
}
function close() {
  const index = selectedIndex.value;
  selectedIndex.value = -1;
  nextTick(() => cardButtons[index]?.focus());
}
function onKeydown(event) {
  if (!selectedItem.value) return;
  if (event.key === "Escape") close();
  if (event.key === "ArrowLeft" && selectedIndex.value > 0)
    selectedIndex.value--;
  if (
    event.key === "ArrowRight" &&
    selectedIndex.value < props.items.length - 1
  )
    selectedIndex.value++;
  if (event.key !== "Tab") return;
  const controls = [
    ...(dialog.value?.querySelectorAll("button:not(:disabled)") || []),
  ];
  if (!controls.length) return;
  const first = controls[0],
    last = controls.at(-1);
  if (
    event.shiftKey &&
    (document.activeElement === first ||
      document.activeElement === dialog.value)
  ) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
watch(selectedItem, async (item, previous) => {
  if (item && !previous) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    await nextTick();
    dialog.value?.querySelector(".portfolio-preview-close")?.focus();
  } else if (!item && previous) document.body.style.overflow = previousOverflow;
});
onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (selectedItem.value) document.body.style.overflow = previousOverflow;
});
</script>
