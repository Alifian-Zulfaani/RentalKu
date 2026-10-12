# RentalKu Booking Frontend

Situs publik dan panel admin untuk bisnis jasa berbasis jadwal, dengan **Studio Senja** sebagai contoh fotografi. Dibangun dengan Vue 3, Vite, Vue Router, Axios, dan Lucide Icons.

## Fitur

- Navbar publik berisi Beranda, Bio, dan Portofolio. Beranda menampilkan reservasi dan tiga karya pilihan; `/bio` berisi profil serta filosofi studio yang dapat diedit di admin; `/portofolio` menampilkan seluruh karya. Route lama `/tentang` mengarah ke `/bio`.
- Kartu karya di Beranda dan Portofolio dapat dibuka sebagai pratinjau dengan navigasi foto, tombol tutup, dan dukungan keyboard.
- Kalender memuat ulang slot saat layanan atau bulan berubah; konflik reservasi menampilkan pesan dan memperbarui jadwal.
- Sebelum dikirim, reservasi ditampilkan dalam modal konfirmasi. Setelah berhasil, pengguna diarahkan ke halaman ringkasan tersendiri.
- Panel admin MVP menampilkan Ringkasan, Reservasi, Jadwal & ketersediaan studio, Portofolio, dan Pengaturan. Daftar utama memakai tabel, pagination, serta aksi berlabel yang seragam.
- Halaman dan logika fotografer tetap ada untuk fase berikutnya, tetapi dinonaktifkan melalui `src/config/features.js`; menu dan route manajemennya disembunyikan saat ini.
- Pengelolaan fotografer memiliki halaman daftar, tambah, detail, dan edit terpisah untuk profil, jadwal mingguan, paket, serta harga.
- Perubahan status reservasi, pembatalan, penghapusan blokir jadwal, dan keluar panel dilindungi modal konfirmasi. Aksi Keluar berada di menu profil kanan atas agar tetap mudah ditemukan saat sidebar tertutup.
- Pengaturan Keamanan menyediakan tampil/sembunyikan untuk ketiga input kata sandi dan validasi konfirmasi sandi baru.
- Enam foto contoh berada di `public/images`; URL gambar dapat diganti melalui panel admin. Ganti foto contoh dengan karya studio asli sebelum situs dipublikasikan.

## Menjalankan lokal

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Situs berjalan di `http://localhost:5175`. Jalankan `booking-backend/` di port `3002` dan seed data contoh agar halaman Studio Senja memiliki konten.

## Konfigurasi

| Variabel              | Kegunaan                                           | Default                     |
| --------------------- | -------------------------------------------------- | --------------------------- |
| `VITE_API_BASE_URL`   | Base URL API booking                               | `http://localhost:3002/api` |
| `VITE_BOOKING_DOMAIN` | Domain induk untuk URL subdomain studio/fotografer | `booking.rentalku.id`       |

Vite memuat `.env` saat dijalankan. Sesuaikan `CORS_ORIGIN` pada backend jika origin frontend berubah.

## Verifikasi

```powershell
npm run build
```

## Struktur kode

Strukturnya mengikuti frontend RentalKu dan Summit Gear:

- `src/components/admin`: layout dan komponen reusable panel admin.
- `src/components/public`: section dan interaksi reusable situs publik.
- `src/components/shared`: identitas merek dan notifikasi yang dipakai lintas area.
- `src/views/admin`: satu file untuk setiap halaman/menu admin.
- `src/views/public`: beranda reservasi, bio studio, portofolio, dan halaman hasil reservasi.
- `src/router`, `src/services`, `src/stores`, dan `src/utils`: routing, akses API, state, serta formatter.
- `.agents/skills/studio-frontend/SKILL.md`: konvensi kerja khusus frontend Studio Senja.

## Dokumentasi

Tampilan studio dapat dibuka di `http://studio.localhost:5175/` atau `http://localhost:5175/?tenant=studio`. Login panel admin berada di `/admin/login`. Route dan komponen fotografer dipertahankan untuk nanti, tetapi tidak dipakai pada MVP.

Di produksi, `VITE_BOOKING_DOMAIN=booking.rentalku.id` memetakan `studio.booking.rentalku.id` ke studio dan `naya.studio.booking.rentalku.id` ke fotografer. Hosting perlu menyediakan DNS untuk host yang dipakai, sertifikat TLS yang mencakup kedua tingkat subdomain, dan rewrite SPA. Aplikasi tidak membuat DNS otomatis. Lihat [kontrak API booking](../booking-backend/docs/api-contract.md) untuk request dan respons yang dipakai frontend.
