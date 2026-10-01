const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const money = (amount) => rupiah.format(Number(amount) || 0);

export const longDate = (date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

export const bookingStatusLabel = (status) =>
  ({
    pending: "Menunggu",
    confirmed: "Terkonfirmasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  })[status] || status;
