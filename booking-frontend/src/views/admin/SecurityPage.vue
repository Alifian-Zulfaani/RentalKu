<template>
  <section class="admin-panel">
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
      ><button class="button primary" type="submit">Simpan kata sandi</button>
    </form>
  </section>
</template>

<script setup>
import { useAdminContext } from "../../stores/context";
const { passwordForm, changePassword } = useAdminContext();
</script>
