<template>
  <button
    class="scroll-to-top"
    :class="{ visible: isVisible }"
    @click="scrollToTop"
    aria-label="Kembali ke bagian atas halaman"
    title="Kembali ke atas"
  >
    <ArrowUp :size="24" />
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ArrowUp } from "lucide-vue-next";

const isVisible = ref(false);

const handleScroll = () => {
  isVisible.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => window.addEventListener("scroll", handleScroll));
onUnmounted(() => window.removeEventListener("scroll", handleScroll));
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: calc(var(--floating-action-bottom) + var(--floating-action-size) + var(--floating-action-gap));
  right: var(--floating-action-right);
  width: var(--floating-action-size);
  height: var(--floating-action-size);
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
}

.scroll-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.scroll-to-top:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  background: var(--accent-gradient-hover);
}

</style>
