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

const timestampFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Jakarta",
});

export function dateTime(value, time) {
  if (!value) return "—";

  // Booking slots are local studio times, while SQLite timestamps are UTC.
  if (time !== undefined) {
    const clock = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(time);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !clock) return "—";
    return `${longDate(value)} ${clock[1]}:${clock[2]}:${clock[3] || "00"}`;
  }

  const source =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? `${value.replace(" ", "T")}Z`
      : value;
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return "—";
  const parts = Object.fromEntries(
    timestampFormatter
      .formatToParts(parsed)
      .map(({ type, value: part }) => [type, part]),
  );
  return `${parts.day} ${parts.month} ${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export const bookingStatusLabel = (status) =>
  ({
    pending: "Menunggu",
    confirmed: "Terkonfirmasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  })[status] || status;
