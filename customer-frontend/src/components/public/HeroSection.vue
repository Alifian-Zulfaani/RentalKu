<template>
  <header class="hero">
    <div
      class="hero-bg"
      :style="{
        background: `linear-gradient(135deg, ${config.primary_color}22, ${config.secondary_color}22)`,
      }"
    ></div>
    <div class="container hero-container">
      <div class="hero-content">
        <div class="tagline" :style="{ color: config.primary_color }">
          {{ config.tagline }}
        </div>
        <h1 class="title">{{ config.hero_title }}</h1>
        <p class="subtitle">{{ config.hero_subtitle }}</p>
        <div class="hero-actions">
          <a
            href="#katalog"
            class="btn btn-primary btn-lg"
            :style="{ background: config.primary_color }"
            >Lihat Katalog</a
          >
          <a href="#tentang" class="btn btn-secondary btn-lg"
            >Pelajari Lebih Lanjut</a
          >
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({ config: Object });
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  filter: blur(60px);
  opacity: 0.8;
}
.hero-container {
  position: relative;
  z-index: 2;
  text-align: center;
}
.hero-content {
  max-width: 800px;
  margin: 0 auto;
}
.tagline {
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 24px;
}
.title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: var(--text-primary);
}
.subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  .subtitle {
    font-size: 1.1rem;
  }
}
</style>
