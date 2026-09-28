const bcrypt = require("bcryptjs");
const db = require("./config/database");

console.log("🌱 Seeding Customer Tenant database (Summit Gear)...");

// Seed admin
const adminPwd = bcrypt.hashSync("admin123", 10);
const existingAdmin = db
  .prepare("SELECT * FROM admins WHERE email = ?")
  .get("admin@summitgear.com");
if (!existingAdmin) {
  db.prepare("INSERT INTO admins (name, email, password) VALUES (?, ?, ?)").run(
    "Budi Santoso",
    "admin@summitgear.com",
    adminPwd,
  );
  console.log("✅ Admin: admin@summitgear.com / admin123");
}

// Seed site config
const existingConfig = db
  .prepare("SELECT * FROM site_config WHERE id = 1")
  .get();
if (!existingConfig) {
  db.prepare(
    `INSERT INTO site_config (id, business_name, tagline, description, primary_color, secondary_color, whatsapp, email, address, hero_title, hero_subtitle, about_text)
    VALUES (1, 'Summit Gear', 'Sewa Gear untuk Mendaki & Berkemah', 'Perlengkapan hiking dan camping yang terawat untuk perjalanan yang lebih ringan.', '#2f5948', '#c66e46', '081234567890', 'hello@summitgear.com', 'Jl. Gunung Merapi No. 42, Yogyakarta', 'Lebih ringan berangkat. Lebih jauh menjelajah.', 'Sewa perlengkapan hiking dan camping yang terawat. Pilih alat, tentukan tanggal, lalu tim kami menyiapkannya untuk perjalananmu.', 'Summit Gear membantu pendaki, camper, dan penjelajah akhir pekan mendapatkan perlengkapan yang tepat tanpa harus membeli semuanya. Setiap gear dibersihkan, dicek, dan disiapkan kembali sebelum disewakan agar perjalananmu lebih aman dan nyaman.')`,
  ).run();
  console.log("✅ Site config seeded");
}

// Seed categories
const existingCats = db
  .prepare("SELECT COUNT(*) as count FROM categories")
  .get().count;
if (existingCats === 0) {
  const cats = [
    "Tenda & Shelter",
    "Carrier & Tas",
    "Sleeping Gear",
    "Peralatan Masak",
    "Perlengkapan Safety",
    "Aksesoris",
  ];
  for (const c of cats)
    db.prepare("INSERT INTO categories (name) VALUES (?)").run(c);
  console.log(`✅ ${cats.length} categories seeded`);
}

// Seed inventory
const existingInv = db
  .prepare("SELECT COUNT(*) as count FROM inventory")
  .get().count;
if (existingInv === 0) {
  const items = [
    {
      name: "Tenda Ultralight 2P",
      cat: 1,
      stock: 8,
      daily: 75000,
      weekly: 400000,
      monthly: 1200000,
      desc: "Tenda ultralight untuk 2 orang, waterproof 3000mm, berat hanya 1.8kg. Cocok untuk hiking dan camping.",
    },
    {
      name: "Tenda Basecamp 4P",
      cat: 1,
      stock: 5,
      daily: 120000,
      weekly: 650000,
      monthly: 2000000,
      desc: "Tenda basecamp kapasitas 4 orang dengan vestibule. Tahan angin kencang dan hujan deras.",
    },
    {
      name: "Flysheet 3x4m",
      cat: 1,
      stock: 15,
      daily: 25000,
      weekly: 130000,
      monthly: 400000,
      desc: "Flysheet waterproof ukuran 3x4 meter. Multi-fungsi sebagai shelter tambahan.",
    },
    {
      name: "Carrier Osprey 60L",
      cat: 2,
      stock: 10,
      daily: 60000,
      weekly: 320000,
      monthly: 1000000,
      desc: "Carrier premium 60L dengan rain cover. Suspension system nyaman untuk perjalanan panjang.",
    },
    {
      name: "Carrier Deuter 45L",
      cat: 2,
      stock: 12,
      daily: 50000,
      weekly: 270000,
      monthly: 850000,
      desc: "Carrier 45L ideal untuk weekend hiking. Ringan dan ergonomis.",
    },
    {
      name: "Daypack 25L",
      cat: 2,
      stock: 20,
      daily: 25000,
      weekly: 130000,
      monthly: 400000,
      desc: "Daypack ringkas untuk day hike atau perjalanan singkat.",
    },
    {
      name: "Sleeping Bag -5°C",
      cat: 3,
      stock: 15,
      daily: 40000,
      weekly: 210000,
      monthly: 650000,
      desc: "Sleeping bag comfort temperature -5°C. Material bulu angsa sintetis, ringan dan hangat.",
    },
    {
      name: "Sleeping Bag 10°C",
      cat: 3,
      stock: 20,
      daily: 30000,
      weekly: 160000,
      monthly: 500000,
      desc: "Sleeping bag untuk suhu moderate. Cocok untuk camping di dataran tinggi.",
    },
    {
      name: "Matras Foam",
      cat: 3,
      stock: 25,
      daily: 15000,
      weekly: 80000,
      monthly: 250000,
      desc: "Matras foam anti-slip, tebal 2cm. Nyaman dan tahan lama.",
    },
    {
      name: "Kompor Portable + Gas",
      cat: 4,
      stock: 12,
      daily: 30000,
      weekly: 160000,
      monthly: 500000,
      desc: "Kompor portable windproof + 1 tabung gas 230g. Auto ignition, efisien bahan bakar.",
    },
    {
      name: "Nesting Set (3 pcs)",
      cat: 4,
      stock: 15,
      daily: 20000,
      weekly: 100000,
      monthly: 300000,
      desc: "Set alat masak camping: panci, wajan, dan tutup. Material aluminium anti-lengket.",
    },
    {
      name: "Headlamp 300 Lumen",
      cat: 5,
      stock: 30,
      daily: 15000,
      weekly: 80000,
      monthly: 250000,
      desc: "Headlamp LED 300 lumen, rechargeable USB-C. 3 mode pencahayaan, tahan air IPX4.",
    },
    {
      name: "Trekking Pole (sepasang)",
      cat: 5,
      stock: 10,
      daily: 25000,
      weekly: 130000,
      monthly: 400000,
      desc: "Trekking pole aluminium adjustable 65-135cm. Grip cork, wrist strap, snow basket.",
    },
    {
      name: "Hammock Double",
      cat: 6,
      stock: 8,
      daily: 30000,
      weekly: 160000,
      monthly: 500000,
      desc: "Hammock double layer kapasitas 200kg. Termasuk tali gantung dan karabiner.",
    },
    {
      name: "Rain Poncho Heavy Duty",
      cat: 6,
      stock: 20,
      daily: 15000,
      weekly: 80000,
      monthly: 250000,
      desc: "Poncho hujan heavy duty, material ripstop. Bisa dipakai sebagai ground sheet darurat.",
    },
  ];
  for (const i of items) {
    db.prepare(
      "INSERT INTO inventory (name, category_id, stock, available_stock, rate_daily, rate_weekly, rate_monthly, status, description) VALUES (?,?,?,?,?,?,?,?,?)",
    ).run(
      i.name,
      i.cat,
      i.stock,
      i.stock,
      i.daily,
      i.weekly,
      i.monthly,
      "active",
      i.desc,
    );
  }
  console.log(`✅ ${items.length} inventory items seeded`);
}

// Seed customers
const existingCust = db
  .prepare("SELECT COUNT(*) as count FROM customers")
  .get().count;
if (existingCust === 0) {
  const custs = [
    {
      name: "Andi Prasetyo",
      wa: "081111222333",
      email: "andi@email.com",
      addr: "Jl. Kaliurang Km 10, Yogyakarta",
    },
    {
      name: "Lisa Kurnia",
      wa: "082222333444",
      email: "lisa@email.com",
      addr: "Jl. Malioboro No. 55, Yogyakarta",
    },
    {
      name: "Reza Firmansyah",
      wa: "083333444555",
      email: "reza@email.com",
      addr: "Jl. Godean Km 5, Yogyakarta",
    },
    {
      name: "Maya Sari",
      wa: "084444555666",
      email: "maya@email.com",
      addr: "Jl. Solo No. 88, Yogyakarta",
    },
    {
      name: "Dimas Arya",
      wa: "085555666777",
      email: "dimas@email.com",
      addr: "Jl. Palagan Km 8, Sleman",
    },
  ];
  for (const c of custs)
    db.prepare(
      "INSERT INTO customers (name, whatsapp, email, address) VALUES (?,?,?,?)",
    ).run(c.name, c.wa, c.email, c.addr);
  console.log(`✅ ${custs.length} customers seeded`);
}

// Seed orders
const existingOrders = db
  .prepare("SELECT COUNT(*) as count FROM orders")
  .get().count;
if (existingOrders === 0) {
  const now = new Date();
  const orders = [
    {
      custId: 1,
      status: "active",
      daysAgo: 2,
      items: [
        { invId: 1, qty: 1 },
        { invId: 4, qty: 2 },
        { invId: 7, qty: 2 },
      ],
    },
    {
      custId: 2,
      status: "completed",
      daysAgo: 10,
      items: [
        { invId: 2, qty: 1 },
        { invId: 10, qty: 1 },
      ],
    },
    {
      custId: 3,
      status: "booking",
      daysAgo: 0,
      items: [
        { invId: 5, qty: 3 },
        { invId: 9, qty: 3 },
        { invId: 12, qty: 3 },
      ],
    },
    {
      custId: 4,
      status: "active",
      daysAgo: 1,
      items: [
        { invId: 14, qty: 1 },
        { invId: 11, qty: 1 },
      ],
    },
    {
      custId: 5,
      status: "late",
      daysAgo: 7,
      items: [
        { invId: 3, qty: 2 },
        { invId: 13, qty: 1 },
      ],
    },
  ];

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - o.daysAgo);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);
    const orderNum = `ORD-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${String(1000 + i).slice(-4)}`;
    let total = 0;

    const result = db
      .prepare(
        "INSERT INTO orders (order_number, customer_id, status, start_date, end_date) VALUES (?,?,?,?,?)",
      )
      .run(
        orderNum,
        o.custId,
        o.status,
        startDate.toISOString().slice(0, 10),
        endDate.toISOString().slice(0, 10),
      );
    const orderId = result.lastInsertRowid;

    for (const item of o.items) {
      const inv = db
        .prepare("SELECT * FROM inventory WHERE id = ?")
        .get(item.invId);
      if (!inv) continue;
      const sub = inv.rate_daily * item.qty;
      total += sub;
      db.prepare(
        "INSERT INTO order_items (order_id, inventory_id, quantity, rate_type, rate_amount, subtotal) VALUES (?,?,?,?,?,?)",
      ).run(orderId, item.invId, item.qty, "daily", inv.rate_daily, sub);
      if (o.status !== "completed" && o.status !== "cancelled") {
        db.prepare(
          "UPDATE inventory SET available_stock = available_stock - ? WHERE id = ?",
        ).run(item.qty, item.invId);
      }
    }

    db.prepare(
      "UPDATE orders SET total_amount = ?, paid_amount = ? WHERE id = ?",
    ).run(total, o.status === "completed" ? total : 0, orderId);
  }
  console.log(`✅ ${orders.length} orders seeded`);
}

console.log("🎉 Customer tenant seeding complete!");
