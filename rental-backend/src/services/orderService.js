const crypto = require("crypto");
const db = require("../config/database");
const { ApiError } = require("../utils/http");

const TERMINAL_STATUSES = ["completed", "cancelled"];
const RATE_TYPES = ["daily", "weekly", "monthly"];

function parseDateOnly(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getRentalDays(startDate, endDate) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end || end < start) {
    throw new ApiError(422, "Rentang tanggal sewa tidak valid");
  }

  return Math.floor((end - start) / 86_400_000) + 1;
}

function normalizeItems(items, allowRateType = false) {
  const normalized = new Map();

  for (const item of items) {
    const inventoryId = Number(item.inventory_id);
    const quantity = Number(item.quantity);
    const rateType =
      allowRateType && RATE_TYPES.includes(item.rate_type)
        ? item.rate_type
        : "daily";
    const existing = normalized.get(inventoryId);

    if (existing && existing.rateType !== rateType) {
      throw new ApiError(
        422,
        "Satu barang hanya boleh memakai satu jenis tarif",
      );
    }
    if (existing) existing.quantity += quantity;
    else normalized.set(inventoryId, { inventoryId, quantity, rateType });
  }

  return [...normalized.values()];
}

function getBillingUnits(rateType, rentalDays) {
  if (rateType === "weekly") return Math.ceil(rentalDays / 7);
  if (rateType === "monthly") return Math.ceil(rentalDays / 30);
  return rentalDays;
}

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const candidate = `ORD-${date}-${suffix}`;
    const exists = db
      .prepare("SELECT 1 FROM orders WHERE order_number = ?")
      .get(candidate);
    if (!exists) return candidate;
  }

  throw new ApiError(503, "Nomor order belum dapat dibuat. Silakan coba lagi.");
}

function createOrder({
  customerId,
  startDate,
  endDate,
  items,
  notes,
  allowRateType = false,
}) {
  const rentalDays = getRentalDays(startDate, endDate);
  const normalizedItems = normalizeItems(items, allowRateType);

  return db.transaction(() => {
    const customer = db
      .prepare("SELECT id, is_blacklisted FROM customers WHERE id = ?")
      .get(customerId);
    if (!customer) throw new ApiError(404, "Pelanggan tidak ditemukan");
    if (customer.is_blacklisted) {
      throw new ApiError(403, "Pelanggan ini tidak dapat membuat booking");
    }

    const preparedItems = normalizedItems.map((item) => {
      const inventory = db
        .prepare(
          "SELECT id, name, available_stock, rate_daily, rate_weekly, rate_monthly, status FROM inventory WHERE id = ?",
        )
        .get(item.inventoryId);

      if (!inventory || inventory.status !== "active") {
        throw new ApiError(409, "Salah satu barang sudah tidak tersedia");
      }
      if (inventory.available_stock < item.quantity) {
        throw new ApiError(
          409,
          `Stok ${inventory.name} tidak mencukupi (tersisa ${inventory.available_stock})`,
        );
      }

      const rateAmount = Number(inventory[`rate_${item.rateType}`]) || 0;
      const billingUnits = getBillingUnits(item.rateType, rentalDays);

      return {
        ...item,
        rateAmount,
        subtotal: rateAmount * item.quantity * billingUnits,
      };
    });

    const totalAmount = preparedItems.reduce(
      (total, item) => total + item.subtotal,
      0,
    );
    const result = db
      .prepare(
        "INSERT INTO orders (order_number, customer_id, start_date, end_date, total_amount, notes) VALUES (?,?,?,?,?,?)",
      )
      .run(
        createOrderNumber(),
        customerId,
        startDate,
        endDate,
        totalAmount,
        notes || null,
      );
    const orderId = result.lastInsertRowid;

    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, inventory_id, quantity, rate_type, rate_amount, subtotal) VALUES (?,?,?,?,?,?)",
    );
    const reserveStock = db.prepare(
      "UPDATE inventory SET available_stock = available_stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND available_stock >= ?",
    );

    for (const item of preparedItems) {
      const reserved = reserveStock.run(
        item.quantity,
        item.inventoryId,
        item.quantity,
      );
      if (!reserved.changes) {
        throw new ApiError(
          409,
          "Stok berubah. Silakan periksa pesanan kembali.",
        );
      }
      insertItem.run(
        orderId,
        item.inventoryId,
        item.quantity,
        item.rateType,
        item.rateAmount,
        item.subtotal,
      );
    }

    return db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  })();
}

function restoreOrderStock(orderId) {
  const items = db
    .prepare(
      "SELECT inventory_id, quantity FROM order_items WHERE order_id = ?",
    )
    .all(orderId);
  const restore = db.prepare(
    "UPDATE inventory SET available_stock = MIN(stock, available_stock + ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  );

  for (const item of items) {
    if (item.inventory_id) restore.run(item.quantity, item.inventory_id);
  }
}

module.exports = {
  RATE_TYPES,
  TERMINAL_STATUSES,
  createOrder,
  getRentalDays,
  normalizeItems,
  restoreOrderStock,
};
