# Kontrak API Customer App

Base URL default: `http://localhost:3001/api`

Semua request body memakai JSON. Endpoint bertanda **Admin** membutuhkan header:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## Format umum

Daftar berpaginasi mengembalikan:

```json
{
  "data": [],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

Kesalahan validasi menggunakan status `422`:

```json
{
  "message": "Data yang dikirim belum valid",
  "errors": [
    { "field": "email", "message": "Email tidak valid" }
  ]
}
```

Error lain berbentuk `{ "message": "..." }`. Status yang umum: `401` token/login tidak valid, `403` akses ditolak, `404` data tidak ditemukan, `409` konflik stok/status, dan `500` kesalahan server.

## Publik

### `GET /health`

Health check API.

### `GET /public/config`

Mengembalikan identitas bisnis, logo, warna, konten hero, informasi tentang bisnis, dan kontak publik.

### `GET /public/categories`

Mengembalikan daftar kategori.

### `GET /public/products`

Mengembalikan inventaris berstatus `active` untuk katalog.

Query opsional:

- `category_id`: ID kategori.

Field produk utama: `id`, `name`, `description`, `category_id`, `category_name`, `rate_daily`, `rate_weekly`, `rate_monthly`, `available_stock`, dan `image_url`.

### `POST /public/booking`

Membuat pelanggan bila nomor WhatsApp belum terdaftar, kemudian membuat order dan mereservasi stok dalam satu transaksi.

```json
{
  "name": "Budi Santoso",
  "whatsapp": "081234567890",
  "email": "budi@example.com",
  "start_date": "2026-10-01",
  "end_date": "2026-10-03",
  "notes": "Pengambilan pagi",
  "items": [
    { "inventory_id": 1, "quantity": 2 }
  ]
}
```

Ketentuan:

- `name`, `whatsapp`, `start_date`, `end_date`, dan minimal satu item wajib diisi.
- `email` dan `notes` opsional.
- Tanggal memakai format `YYYY-MM-DD`; tanggal mulai tidak boleh lampau.
- Tarif publik selalu harian dan durasi dihitung inklusif.
- Item duplikat digabung. Kekurangan stok membatalkan seluruh transaksi.

Respons `201`:

```json
{
  "message": "Booking berhasil dikirim",
  "data": {
    "order_number": "ORD-20260928-A1B2C3",
    "total_amount": 450000,
    "status": "booking"
  }
}
```

## Autentikasi

### `POST /auth/login`

```json
{
  "email": "admin@summitgear.com",
  "password": "admin123"
}
```

Respons sukses berisi `token` JWT yang berlaku tujuh hari dan objek `admin` (`id`, `name`, `email`).

## Inventaris — Admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/inventory` | Daftar inventaris berpaginasi |
| `GET` | `/inventory/categories` | Daftar kategori |
| `GET` | `/inventory/:id` | Detail barang |
| `POST` | `/inventory` | Tambah barang |
| `PUT` | `/inventory/:id` | Perbarui barang |
| `DELETE` | `/inventory/:id` | Hapus barang |

Query daftar: `search`, `status` (`active`, `maintenance`, `inactive`), `category_id`, `page`, dan `limit` (maksimal 100).

Body barang:

```json
{
  "name": "Tenda Ultralight 2P",
  "category_id": 1,
  "stock": 10,
  "rate_daily": 75000,
  "rate_weekly": 400000,
  "rate_monthly": 1200000,
  "status": "active",
  "image_url": "https://example.com/tenda.jpg",
  "description": "Tenda dua orang."
}
```

`name` dan `stock` wajib saat membuat barang. Field lain opsional. Stok tidak dapat diturunkan di bawah jumlah unit yang sedang disewa. Barang yang masih terhubung ke order berjalan tidak dapat dihapus.

## Pelanggan — Admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/customers` | Daftar pelanggan berpaginasi |
| `GET` | `/customers/:id` | Detail pelanggan beserta order |
| `POST` | `/customers` | Tambah pelanggan |
| `PUT` | `/customers/:id` | Perbarui pelanggan |
| `DELETE` | `/customers/:id` | Hapus pelanggan |
| `PATCH` | `/customers/:id/blacklist` | Toggle blokir pelanggan |

Query daftar: `search`, `is_blacklisted` (`0` atau `1`), `page`, dan `limit` (maksimal 100).

Body pelanggan: `name`, `email`, `whatsapp`, `address`, dan `notes`. `name` wajib saat membuat pelanggan.

## Order — Admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/orders` | Daftar order berpaginasi |
| `GET` | `/orders/stats` | Statistik dashboard dan lima order terbaru |
| `GET` | `/orders/:id` | Detail order, pelanggan, dan item |
| `POST` | `/orders` | Membuat order dari panel admin |
| `PATCH` | `/orders/:id/status` | Mengubah status order |

Query daftar: `search`, `status`, `page`, dan `limit` (maksimal 100). Pencarian mencakup nomor order dan nama pelanggan.

Status internal:

- `booking`: menunggu.
- `active`: sedang disewa.
- `late`: terlambat.
- `completed`: selesai.
- `cancelled`: dibatalkan.

Transisi yang diizinkan:

```text
booking -> active | cancelled
active  -> late | completed | cancelled
late    -> completed | cancelled
```

Status `completed` dan `cancelled` bersifat terminal. Perubahan ke status terminal mengembalikan stok.

Body pembuatan order:

```json
{
  "customer_id": 1,
  "start_date": "2026-10-01",
  "end_date": "2026-10-07",
  "notes": "Opsional",
  "items": [
    {
      "inventory_id": 1,
      "quantity": 1,
      "rate_type": "weekly"
    }
  ]
}
```

`rate_type` opsional dan menerima `daily`, `weekly`, atau `monthly`. Detail order menyertakan data pelanggan serta `items[]` dengan `item_name`, `quantity`, `rate_type`, `rate_amount`, dan `subtotal`.

Body perubahan status:

```json
{ "status": "active" }
```

## Konfigurasi website — Admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/site-config` | Mengambil konfigurasi lengkap |
| `PUT` | `/site-config` | Memperbarui konfigurasi |

Semua field update opsional: `business_name`, `tagline`, `description`, `logo_url`, `primary_color`, `secondary_color`, `whatsapp`, `email`, `address`, `hero_title`, `hero_subtitle`, dan `about_text`.

Warna harus berupa hex enam digit, misalnya `#2F5948`. `logo_url` harus berupa URL HTTP/HTTPS atau dikosongkan.

