<template>
  <section class="admin-panel">
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
        >Fotografer<select v-model.number="newAccount.professional_id" required>
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
</template>

<script setup>
import { useAdminContext } from "../../stores/context";
const { professionals, accounts, newAccount, createAccount, tenantName } =
  useAdminContext();
</script>
