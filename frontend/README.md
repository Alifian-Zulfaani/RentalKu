# RentalKu Frontend

Frontend platform RentalKu untuk memperkenalkan dua produk, menerima pendaftaran early access, dan mengelola customer Rental serta Booking dari panel admin. Dibangun dengan Vue 3, Vite, Pinia, Vue Router, Axios, serta CSS native.

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

Halaman publik menjelaskan RentalKu Rental (barang dan stok) serta RentalKu Booking (jasa dan slot jadwal). Di `/order`, pendaftar memilih `product_type`. Admin memakai `/admin/rental` dan `/admin/booking` untuk dua daftar yang mengambil data dari satu tabel subscriber. Permintaan API dipusatkan di `src/services/api.js`; token admin dikirim sebagai `Authorization: Bearer <token>`. [Kontrak API platform](../backend/docs/api-contract.md).
