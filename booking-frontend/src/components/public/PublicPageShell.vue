<template>
  <div class="site-shell">
    <PublicHeader :name="name" />
    <main><slot /></main>
    <footer class="footer">
      <div class="wrap">
        <strong>{{ name }}</strong
        ><span>{{ location }} · {{ email }}</span
        ><a href="/admin">Panel pengelola</a>
      </div>
    </footer>
    <FloatingActions :phone="phone" :business-name="name" />
  </div>
</template>

<script setup>
import PublicHeader from "./PublicHeader.vue";
import FloatingActions from "../shared/FloatingActions.vue";
defineProps({
  name: { type: String, default: "Studio Senja" },
  location: String,
  email: String,
  phone: String,
});
</script>
