# RentalKu

RentalKu menyediakan dua aplikasi untuk bisnis dengan cara pemesanan berbeda: **Rental** untuk barang dan stok, serta **Booking** untuk jasa dan jadwal. Repositori ini memuat platform pendaftaran RentalKu dan dua aplikasi contoh yang berjalan terpisah.

| Aplikasi | Fungsi | Port lokal |
| --- | --- | ---: |
| [`frontend/`](frontend/) | Situs RentalKu, pemilihan produk, dan admin platform | `5173` |
| [`backend/`](backend/) | API pendaftaran dan subscriber dua produk dalam satu tabel | `3000` |
| [`rental-frontend/`](rental-frontend/) | Situs dan panel pengelola rental alat outdoor Summit Gear | `5174` |
| [`rental-backend/`](rental-backend/) | API katalog, inventaris, order sewa, dan pengaturan rental | `3001` |
| [`booking-frontend/`](booking-frontend/) | Situs studio/fotografer dan panel reservasi Studio Senja | `5175` |
| [`booking-backend/`](booking-backend/) | API layanan, kalender ketersediaan, reservasi, dan jam kerja | `3002` |

Semua frontend memakai Vue 3 dan Vite. Semua backend memakai Express dan SQLite. Setiap pasangan aplikasi memiliki konfigurasi dan basis data sendiri.

## Alur singkat

Di situs platform, calon pengguna memilih Rental atau Booking sebelum mengirim pendaftaran. Backend platform menyimpan keduanya pada tabel `subscribers` dengan `product_type`. Data lama otomatis diberi tipe `rental`. Admin platform memiliki menu Customer Rental dan Customer Booking yang memfilter tabel yang sama.

Contoh Rental, **Summit Gear**, menampilkan profil dan katalog alat outdoor, detail barang dalam modal, serta form sewa dua langkah. Panel admin mengelola inventaris, pelanggan, order, dan pengaturan situs.

Contoh Booking, **Studio Senja**, menampilkan landing page studio dan landing page personal tiap fotografer dari satu frontend. Jadwal dan harga paket bisa berbeda per fotografer. Kalender menghitung slot dari jam kerja, durasi layanan, reservasi, serta blokir admin; reservasi yang bertabrakan ditolak backend. Panel admin memiliki role studio dan fotografer dengan cakupan data serta menu yang berbeda.

## Menjalankan lokal

Pada tiap folder, jalankan `npm install`, salin `.env.example` menjadi `.env`, lalu jalankan `npm run dev`. Mulai kedua backend contoh dengan `npm run seed` sekali untuk membuat data demo. Gunakan terminal terpisah untuk keenam aplikasi.

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Ulangi pada `rental-backend` dan `booking-backend`, kemudian jalankan `frontend`, `rental-frontend`, dan `booking-frontend` dengan `npm install` serta `npm run dev`. Sesuaikan port dan URL API melalui `.env.example` masing-masing aplikasi.

Situs platform tersedia di `http://localhost:5173`, rental di `http://localhost:5174`, dan booking di `http://localhost:5175`. Contoh halaman booking:

- Studio: `http://localhost:5175/?tenant=studio`
- Fotografer: `http://localhost:5175/?tenant=studio&pro=naya`
- Admin booking: `http://localhost:5175/admin`

Di produksi, frontend booking membaca subdomain: `studio.booking.rentalku.id` untuk studio dan `naya.studio.booking.rentalku.id` untuk fotografer. Konfigurasi DNS wildcard, TLS untuk kedua tingkat host, dan rewrite SPA perlu disediakan oleh hosting. Rincian ada di [README Booking Frontend](booking-frontend/README.md).

## Dokumentasi dan verifikasi

| Aplikasi | README | Kontrak API |
| --- | --- | --- |
| Platform | [Frontend](frontend/README.md) · [Backend](backend/README.md) | [Platform API](backend/docs/api-contract.md) |
| Rental | [Frontend](rental-frontend/README.md) · [Backend](rental-backend/README.md) | [Rental API](rental-backend/docs/api-contract.md) |
| Booking | [Frontend](booking-frontend/README.md) · [Backend](booking-backend/README.md) | [Booking API](booking-backend/docs/api-contract.md) |

Jalankan `npm run build` di setiap frontend dan `npm test` di ketiga backend. Sebelum deploy, ganti kredensial contoh, atur `JWT_SECRET`, `CORS_ORIGIN`, alamat API, lokasi SQLite, dan zona waktu bisnis.
