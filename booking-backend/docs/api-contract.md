# Kontrak API RentalKu Booking

## Aturan umum

Base URL lokal: `http://localhost:3002/api`. Request dengan body memakai JSON. Endpoint admin membutuhkan `Authorization: Bearer <token>` setelah login.

Respons sukses Booking belum memakai satu amplop untuk semua endpoint: data publik dapat berupa objek langsung, pembuatan reservasi memakai `{ "message": "...", "data": { ... } }`, login mengembalikan `token`, `account`, dan `tenant` di tingkat teratas, sedangkan daftar admin memakai `data` dan `pagination`. Contoh pagination:

```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

Error mengembalikan JSON `{ "message": "..." }`, dengan `errors: [{ "field": "...", "message": "..." }]` bila kesalahan terkait field. Status yang umum: `401` sesi/login tidak valid, `403` role tidak diizinkan, `404` data tidak ditemukan, `409` slot atau slug/email bentrok, `422` validasi, dan `500` gangguan server. Format ini berbeda dari Problem Details pada API platform RentalKu.

Contoh error validasi `422`:

```json
{
  "message": "Pilih jam yang tersedia",
  "errors": [{ "field": "start_time", "message": "Pilih jam yang tersedia" }]
}
```

Tanggal dan jam booking memakai waktu lokal bisnis (`YYYY-MM-DD`, `HH:MM`), sesuai `BOOKING_TIME_ZONE` pada backend.

## Endpoint publik

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/health` | Status layanan; respons `{ "status": "ok" }` |
| `GET` | `/public/site?tenant=studio[&pro=naya]` | Profil studio, fotografer, layanan/harga, dan profil serta jadwal pribadi jika `pro` dipilih |
| `GET` | `/public/availability?tenant=studio&pro=naya&service=1&month=2026-10` | Hari dalam bulan dengan `slots` dan `available` |
| `POST` | `/public/bookings` | Membuat reservasi; sukses `201` |

`GET /public/site` mengembalikan `{ "tenant": { ... }, "profile": null | { ... }, "professionals": [], "services": [], "schedule": [] }`. `GET /public/availability` mengembalikan `{ "month": "2026-10", "days": [{ "date": "2026-10-17", "slots": ["10:00"], "available": true }] }`.

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

`tenant`, `pro`, dan `service_id` harus saling cocok. Layanan harus aktif untuk fotografer tersebut. Server menghitung `end_time` dan `total` dari durasi serta harga fotografer; klien tidak menentukan keduanya. Tanggal/jam harus merupakan slot tersedia dan belum lewat. Respons `201` memuat `message` serta `data` (`id`, `customer_name`, `service_name`, `professional_name`, `date`, `start_time`, `end_time`, `total`, `status`) untuk ringkasan konfirmasi; slot yang keburu terisi mengembalikan `409`.

## Autentikasi admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/admin/login` | Masuk dengan `email` dan `password`; respons `token`, `account`, `tenant` |
| `GET` | `/admin/me` | Identitas akun, tenant (`id`, `slug`, `name`, `whatsapp`, `email`), dan profil fotografer jika berlaku |

`account.role` bernilai `company` atau `photographer`. Token JWT berlaku 12 jam. Backend membaca ulang role dan tenant akun dari database pada setiap request; klaim klien tidak menentukan izin akses.

## Endpoint admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/admin/overview` | Statistik dan lima reservasi terbaru sesuai role |
| `GET` | `/admin/bookings?page=1[&status=pending][&search=Ayu]` | Reservasi berpaginasi, 10 item per halaman; pencarian mencakup pemesan, kontak, fotografer, dan layanan |
| `PATCH` | `/admin/bookings/:id/status` | Ubah status reservasi |
| `GET` | `/admin/professionals` | Fotografer dan jam kerja mingguan |
| `POST` | `/admin/professionals` | Tambah fotografer (khusus studio) |
| `PATCH` | `/admin/professionals/:id` | Ubah profil fotografer |
| `PUT` | `/admin/professionals/:id/schedule` | Ganti jam kerja fotografer |
| `GET` | `/admin/services` | Daftar layanan tenant (khusus studio) |
| `POST` | `/admin/services` | Tambah layanan (khusus studio) |
| `PATCH` | `/admin/services/:id` | Ubah layanan (khusus studio) |
| `GET` | `/admin/offerings?professional_id=1` | Layanan, harga, dan status aktif per fotografer |
| `PUT` | `/admin/offerings/:professionalId` | Simpan harga dan status layanan fotografer |
| `GET` | `/admin/site` | Profil tenant |
| `PATCH` | `/admin/site` | Ubah profil studio (khusus studio) |
| `GET` | `/admin/blocks` | Blokir jadwal mendatang |
| `POST` | `/admin/blocks` | Tambah blokir jadwal |
| `DELETE` | `/admin/blocks/:id` | Hapus blokir jadwal |
| `GET` | `/admin/accounts` | Daftar akun tim (khusus studio) |
| `POST` | `/admin/accounts` | Buat akun fotografer (khusus studio) |
| `PATCH` | `/admin/password` | Ubah kata sandi akun sendiri |

Body penting:

- Status reservasi: `{ "status": "confirmed" }`; nilai yang diterima `pending`, `confirmed`, `completed`, `cancelled`.
- Jadwal kerja: `{ "schedule": [{ "weekday": 1, "start_time": "09:00", "end_time": "17:00" }] }`; `weekday` adalah 0=Minggu sampai 6=Sabtu.
- Layanan: `name`, `description`, `duration_minutes` (30–480, kelipatan 30), `price` (rupiah, tidak negatif); `PATCH` juga dapat mengubah `active`.
- Profil fotografer baru: `slug`, `name`, `title`, `bio`; `photo_url`, `headline`, `approach` opsional. Admin studio juga dapat mengubah `slug` dan `active` pada `PATCH`.
- Harga fotografer: `{ "offerings": [{ "service_id": 1, "price": 250000, "active": true }] }`.
- Profil studio: `name`, `tagline`, `about`, `location`, `whatsapp`, `email`, `hero_image_url`.
- Blokir jadwal: `professional_id`, `date`, `start_time`, `end_time`, dan `reason` opsional.
- Akun fotografer: `email`, `password` minimal 8 karakter, `professional_id`.
- Kata sandi sendiri: `current_password` dan `new_password` minimal 8 karakter.

## Status dan aturan bisnis

| Status internal | Label UI | Arti |
| --- | --- | --- |
| `pending` | Menunggu | Reservasi menunggu konfirmasi |
| `confirmed` | Terkonfirmasi | Reservasi dikonfirmasi |
| `completed` | Selesai | Sesi telah selesai |
| `cancelled` | Dibatalkan | Reservasi dibatalkan; slot kembali tersedia |

Slot dihitung dari jam kerja, durasi layanan, reservasi selain `cancelled`, dan blokir admin. Harga saat reservasi dibuat disalin dari paket fotografer sehingga perubahan tarif berikutnya tidak mengubah nilai reservasi lama. Saat status `cancelled` diubah kembali, API memeriksa bentrok sebelum menyimpan. Admin studio melihat seluruh data tenant; fotografer hanya dapat mengelola reservasi, blokir, jam kerja, profil, serta paket/harga miliknya. ID selalu diperiksa terhadap tenant dan cakupan role.
