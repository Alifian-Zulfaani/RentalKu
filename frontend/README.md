# RentalKu Frontend

Situs publik dan panel admin platform RentalKu. Frontend ini memperkenalkan aplikasi Rental dan Booking serta menerima pendaftaran early access. Dibangun dengan Vue 3, Vite, Pinia, Vue Router, Axios, dan CSS native.

## Fitur

- Halaman publik untuk membandingkan Rental (barang dan stok) dengan Booking (jasa dan jadwal).
- Formulir pendaftaran bisnis untuk salah satu produk; biaya early access ditetapkan backend sebesar Rp0.
- Panel admin dengan daftar pendaftar Rental dan Booking yang terpisah, ringkasan status, pencarian, filter, dan pagination.
- Persetujuan di platform belum otomatis membuat akun pada aplikasi bisnis.

## Menjalankan lokal

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Situs berjalan di `http://localhost:5173`. Jalankan `backend/` di port `3000` agar formulir dan panel admin dapat mengakses API.

## Konfigurasi

| Variabel | Kegunaan | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL API platform | `http://localhost:3000/api` |
| `VITE_SITE_URL` | URL publik untuk canonical SEO | Tidak ada fallback; `.env.example` berisi URL contoh |

Vite memuat `.env` saat dijalankan. Sesuaikan `CORS_ORIGIN` pada backend jika origin frontend berubah.

## Verifikasi

```powershell
npm run build
```

## Dokumentasi

Halaman publik berada di `/` dan formulir di `/order`. Panel admin berada di `/admin/login`, `/admin/dashboard`, `/admin/rental`, dan `/admin/booking`. Lihat [kontrak API platform](../backend/docs/api-contract.md) untuk request dan respons yang dipakai frontend.
