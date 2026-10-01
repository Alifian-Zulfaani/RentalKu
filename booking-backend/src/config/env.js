const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5175,http://*.localhost:5175"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.some((allowed) => {
    if (origin === allowed) return true;
    if (!allowed.includes("*.")) return false;
    try {
      const actual = new URL(origin);
      const pattern = new URL(allowed.replace("*.", ""));
      return (
        actual.protocol === pattern.protocol &&
        actual.port === pattern.port &&
        actual.hostname.endsWith(`.${pattern.hostname}`)
      );
    } catch {
      return false;
    }
  });
}

module.exports = { isAllowedOrigin, port: Number(process.env.PORT) || 3002 };
