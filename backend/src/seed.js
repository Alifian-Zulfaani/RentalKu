const bcrypt = require("bcryptjs");
const db = require("./config/database");

console.log("🌱 Seeding RentalKu Company database...");

// Seed admin
const adminPassword = bcrypt.hashSync("admin123", 10);
const existingAdmin = db
  .prepare("SELECT * FROM admins WHERE email = ?")
  .get("admin@rentalku.com");
if (!existingAdmin) {
  db.prepare("INSERT INTO admins (name, email, password) VALUES (?, ?, ?)").run(
    "Administrator",
    "admin@rentalku.com",
    adminPassword,
  );
  console.log("✅ Admin created: admin@rentalku.com / admin123");
}

// Seed subscribers
const existingSubs = db
  .prepare("SELECT COUNT(*) as count FROM subscribers")
  .get().count;
if (existingSubs === 0) {
  const subs = [
    {
      name: "Budi Santoso",
      email: "budi@rental.com",
      whatsapp: "081234567890",
      business_name: "Summit Gear",
      business_type: "Outdoor Equipment",
      subdomain: "summitgear",
      plan: "lifetime",
      payment_method: "transfer",
      amount: 249000,
      status: "confirmed",
    },
    {
      name: "Siti Rahayu",
      email: "siti@rental.com",
      whatsapp: "082345678901",
      business_name: "CamRent Pro",
      business_type: "Kamera & Videografi",
      subdomain: "camrentpro",
      plan: "lifetime",
      payment_method: "qris",
      amount: 249000,
      status: "confirmed",
    },
    {
      name: "Ahmad Fauzi",
      email: "ahmad@rental.com",
      whatsapp: "083456789012",
      business_name: "SoundMax",
      business_type: "Sound System",
      subdomain: "soundmax",
      plan: "lifetime",
      payment_method: "transfer",
      amount: 249000,
      status: "confirmed",
    },
    {
      name: "Dewi Lestari",
      email: "dewi@rental.com",
      whatsapp: "084567890123",
      business_name: "Tenda Express",
      business_type: "Tenda & Dekorasi",
      subdomain: "tendaexpress",
      plan: "lifetime",
      payment_method: "transfer",
      amount: 249000,
      status: "pending",
    },
    {
      name: "Rizky Pratama",
      email: "rizky@rental.com",
      whatsapp: "085678901234",
      business_name: "AutoDrive",
      business_type: "Kendaraan",
      subdomain: "autodrive",
      plan: "lifetime",
      payment_method: "qris",
      amount: 249000,
      status: "pending",
    },
    {
      name: "Nina Kusuma",
      email: "nina@rental.com",
      whatsapp: "086789012345",
      business_name: "Party Supplies",
      business_type: "Meja & Kursi",
      subdomain: "partysupplies",
      plan: "lifetime",
      payment_method: "transfer",
      amount: 249000,
      status: "rejected",
    },
  ];
  for (const s of subs) {
    db.prepare(
      `INSERT INTO subscribers (name, email, whatsapp, business_name, business_type, subdomain, plan, payment_method, amount, status, confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      s.name,
      s.email,
      s.whatsapp,
      s.business_name,
      s.business_type,
      s.subdomain,
      s.plan,
      s.payment_method,
      s.amount,
      s.status,
      s.status === "confirmed" ? new Date().toISOString() : null,
    );
  }
  console.log(`✅ ${subs.length} subscribers seeded`);
}

const bookingDemo = db.prepare("SELECT 1 FROM subscribers WHERE product_type = 'booking' LIMIT 1").get();
if (!bookingDemo) {
  db.prepare(`INSERT INTO subscribers (name, email, whatsapp, business_name, business_type, product_type, subdomain, plan, payment_method, amount, status) VALUES (?, ?, ?, ?, ?, 'booking', ?, 'lifetime', 'free', 0, 'pending')`).run(
    "Naya Putri", "naya@studiosenja.example", "081234567891", "Studio Senja", "Jasa fotografi", "studio-senja"
  );
  console.log("✅ Booking demo subscriber seeded");
}

console.log("🎉 Company seeding complete!");
