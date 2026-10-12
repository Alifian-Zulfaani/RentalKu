<template>
  <section class="admin-panel">
    <p class="section-index">AKUN SAYA</p>
    <h2>Ubah kata sandi</h2>
    <p class="panel-description">
      Gunakan kata sandi baru minimal 8 karakter yang berbeda dari kata sandi
      sebelumnya.
    </p>
    <form class="password-form" @submit.prevent="changePassword">
      <PasswordField
        v-model="passwordForm.current_password"
        label="Kata sandi saat ini"
        autocomplete="current-password"
        :error="passwordFieldErrors.current_password"
        @update:model-value="delete passwordFieldErrors.current_password"
      />
      <PasswordField
        v-model="passwordForm.new_password"
        label="Kata sandi baru"
        autocomplete="new-password"
        :minlength="8"
        :error="passwordFieldErrors.new_password"
        @update:model-value="delete passwordFieldErrors.new_password"
      />
      <PasswordField
        v-model="passwordForm.new_password_confirmation"
        label="Konfirmasi kata sandi baru"
        autocomplete="new-password"
        :minlength="8"
        :error="passwordFieldErrors.new_password_confirmation"
        @update:model-value="
          delete passwordFieldErrors.new_password_confirmation
        "
      />
      <button class="button primary" type="submit" :disabled="passwordBusy">
        {{ passwordBusy ? "Menyimpan…" : "Simpan kata sandi" }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { useAdminContext } from "../../stores/context";
import PasswordField from "../../components/admin/PasswordField.vue";
const { passwordForm, passwordFieldErrors, passwordBusy, changePassword } =
  useAdminContext();
</script>
