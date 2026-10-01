# RentalKu Booking Frontend

Situs publik dan panel admin untuk bisnis jasa fotografi, dengan contoh **Studio Senja**. Dibangun dengan Vue 3, Vite, Vue Router, Axios, dan Lucide.

## Jalankan lokal

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend default: `http://localhost:5175`. Jalankan `booking-backend` pada port `3002` dan `npm run seed` di backend agar data contoh tersedia.

## Dua tampilan publik, satu kode

- Halaman studio: `http://studio.localhost:5175/`
- Halaman fotografer: `http://naya.studio.localhost:5175/`
- Fallback tanpa DNS lokal: `http://localhost:5175/?tenant=studio` dan `http://localhost:5175/?tenant=studio&pro=naya`
- Panel admin: `http://localhost:5175/admin`

Di produksi, `VITE_BOOKING_DOMAIN=booking.rentalku.id` memetakan `studio.booking.rentalku.id` ke studio dan `naya.studio.booking.rentalku.id` ke fotografer. DNS wildcard, sertifikat TLS wildcard yang mencakup kedalaman host yang dipakai, dan rewrite SPA harus diatur di reverse proxy/hosting. Tidak ada pembuatan DNS otomatis di aplikasi.

Landing page studio menampilkan identitas bisnis, tim fotografer, katalog dengan harga mulai, dan pemesanan dengan pilihan fotografer. Landing page fotografer berbeda: profil pribadi, jadwal mingguan, serta paket dan harga miliknya. Semua data inti berasal dari API. Kalender menghitung ulang slot ketika fotografer, layanan, atau bulan berubah; konflik saat pengiriman memunculkan pesan dan memuat ulang jadwal.

Panel admin memakai menu berbeda menurut role. Admin studio mengelola seluruh reservasi, fotografer, layanan dasar, harga per fotografer, profil studio, dan akun tim. Akun fotografer hanya melihat serta mengelola data sendiri. Foto contoh berada di `public/images`; URL gambar dapat diganti di panel admin. Jalankan `npm run build` untuk verifikasi.
