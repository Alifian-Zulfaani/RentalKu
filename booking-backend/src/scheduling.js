const db = require("./db");

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMinutes = (time) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const toTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
function validDate(date) {
  return (
    datePattern.test(date) &&
    !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date
  );
}
function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.BOOKING_TIME_ZONE || "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
function currentTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: process.env.BOOKING_TIME_ZONE || "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}
function isAvailable(professionalId, date, startTime, endTime) {
  const collision = db
    .prepare(
      `SELECT 1 FROM bookings WHERE professional_id = ? AND date = ? AND status != 'cancelled' AND start_time < ? AND end_time > ? LIMIT 1`,
    )
    .get(professionalId, date, endTime, startTime);
  const block = db
    .prepare(
      `SELECT 1 FROM blocks WHERE professional_id = ? AND date = ? AND start_time < ? AND end_time > ? LIMIT 1`,
    )
    .get(professionalId, date, endTime, startTime);
  return !collision && !block;
}
function slotsForDay(professionalId, date, duration) {
  if (!validDate(date) || date < today()) return [];
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const hours = db
    .prepare(
      "SELECT start_time, end_time FROM working_hours WHERE professional_id = ? AND weekday = ?",
    )
    .get(professionalId, weekday);
  if (!hours) return [];
  const slots = [];
  for (
    let start = toMinutes(hours.start_time);
    start + duration <= toMinutes(hours.end_time);
    start += 30
  ) {
    const startTime = toTime(start);
    if (date === today() && startTime <= currentTime()) continue;
    const endTime = toTime(start + duration);
    if (isAvailable(professionalId, date, startTime, endTime))
      slots.push(startTime);
  }
  return slots;
}
module.exports = {
  validDate,
  timePattern,
  toMinutes,
  toTime,
  today,
  slotsForDay,
  isAvailable,
};
