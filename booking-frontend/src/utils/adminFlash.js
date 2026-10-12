const flashKey = "booking_admin_flash";

export function setAdminFlash(message) {
  sessionStorage.setItem(flashKey, message);
}

export function consumeAdminFlash() {
  const message = sessionStorage.getItem(flashKey);
  sessionStorage.removeItem(flashKey);
  return message;
}
