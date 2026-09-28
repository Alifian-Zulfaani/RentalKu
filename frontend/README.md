# RentalKu Frontend

Frontend perusahaan RentalKu untuk landing page, pendaftaran early access, dan dashboard admin. Dibangun dengan Vue 3, Vite, Pinia, Vue Router, Axios, serta CSS native.

## Menjalankan lokal

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Buka `http://localhost:5173`. Gunakan `npm run build` untuk memverifikasi build produksi.

## Konfigurasi

- `VITE_API_BASE_URL`: alamat API, default `http://localhost:3000/api`.
- `VITE_SITE_URL`: URL publik untuk canonical SEO.

Permintaan API dipusatkan di `src/services/api.js`; token admin disimpan lokal dan dikirim sebagai `Authorization: Bearer <token>`. Kontrak backend yang dikonsumsi frontend tersedia di [../backend/docs/api-contract.md](../backend/docs/api-contract.md).
