# Kontrak API RentalKu Booking

Base URL lokal: `http://localhost:3002/api`. Semua body memakai JSON. Error validasi: `422` dengan `message` dan opsional `errors: [{ field, message }]`. Slot tidak tersedia: `409`.

## Publik

| Endpoint | Kegunaan |
| --- | --- |
| `GET /health` | Status API |
| `GET /public/site?tenant=studio[&pro=naya]` | Identitas studio, fotografer beserta rentang harga, layanan/harga per fotografer, dan profil serta jam kerja jika `pro` dipilih |
| `GET /public/availability?tenant=studio&pro=naya&service=1&month=2026-10` | Daftar tanggal dalam bulan dengan `slots: ["09:00", ...]` dan `available` |
| `POST /public/bookings` | Membuat reservasi baru; respons `201` berisi ID dan detail jadwal |

Body `POST /public/bookings`:

```json
{
  "tenant": "studio",
  "pro": "naya",
  "service_id": 1,
  "date": "2026-10-17",
  "start_time": "10:00",
  "customer_name": "Ayu Lestari",
  "customer_email": "ayu@example.com",
  "customer_whatsapp": "081234567890",
  "notes": "Sesi di luar ruangan"
}
```

`tenant`, `pro`, dan `service_id` harus berada dalam tenant yang sama. Layanan harus aktif untuk fotografer tersebut. Server menghitung `end_time` dan harga dari tarif fotografer (`professional_services`); klien tidak boleh menentukan keduanya. `date` dan `start_time` wajib merupakan slot tersedia yang belum lewat.

## Admin

`POST /admin/login` menerima `{ "email": "...", "password": "..." }` dan mengembalikan `token` JWT, `account` (role `company` atau `photographer`), serta tenant. Semua endpoint berikut membutuhkan `Authorization: Bearer <token>`. Role diverifikasi ulang dari database pada setiap request, bukan dipercaya dari payload klien.

| Endpoint | Kegunaan |
| --- | --- |
| `GET /admin/me` | Identitas akun, role, tenant, dan profil fotografer jika berlaku |
| `GET /admin/overview` | Statistik dan lima reservasi terbaru |
| `GET /admin/bookings?page=1[&status=pending]` | Reservasi terpaginasikan, 10 item per halaman |
| `PATCH /admin/bookings/:id/status` | Ubah status ke `pending`, `confirmed`, `completed`, atau `cancelled` |
| `GET /admin/professionals` | Fotografer dan jam kerja mingguan |
| `PUT /admin/professionals/:id/schedule` | Ganti jam kerja; body `schedule: [{ weekday: 1, start_time: "09:00", end_time: "17:00" }]` |
| `GET /admin/services` | Daftar layanan tenant |
| `POST /admin/services` | Tambah layanan: `name`, `description`, `duration_minutes` kelipatan 30, `price` rupiah |
| `PATCH /admin/services/:id` | Ubah layanan atau `active` |
| `GET /admin/offerings?professional_id=1` | Katalog dengan harga dan status aktif milik fotografer; role fotografer selalu melihat dirinya sendiri |
| `PUT /admin/offerings/:professionalId` | Simpan `offerings: [{ service_id, price, active }]` untuk fotografer yang diizinkan |
| `POST /admin/professionals` | Tambah fotografer: `slug`, `name`, `title`, `bio`; `photo_url`, `headline`, `approach` opsional |
| `PATCH /admin/professionals/:id` | Ubah profil/foto/copy landing page; admin studio juga dapat mengubah `slug` dan `active` |
| `GET /admin/site` | Profil tenant untuk diedit |
| `PATCH /admin/site` | Ubah `name`, `tagline`, `about`, `location`, `whatsapp`, `email`, `hero_image_url` |
| `GET /admin/blocks` | Waktu terblokir yang belum lewat |
| `POST /admin/blocks` | Blokir slot; body `professional_id`, `date`, `start_time`, `end_time`, `reason` opsional |
| `DELETE /admin/blocks/:id` | Hapus blokir |
| `GET /admin/accounts` | Daftar akun tim (khusus admin studio) |
| `POST /admin/accounts` | Buat akun fotografer: `email`, `password` minimal 8 karakter, `professional_id` (khusus admin studio) |
| `PATCH /admin/password` | Ubah kata sandi sendiri: `current_password`, `new_password` minimal 8 karakter |

`weekday` memakai 0=Minggu hingga 6=Sabtu. Reservasi `cancelled` tidak mengunci slot; saat diaktifkan kembali API memeriksa bentrok. Admin studio melihat seluruh data tenant dan mengelola katalog, profil studio, tim, dan akun. Fotografer hanya melihat reservasi, blokir, jam kerja, profil, serta paket/harga miliknya; endpoint studio mengembalikan `403`. Semua ID diperiksa lagi terhadap tenant dan fotografer akun.
