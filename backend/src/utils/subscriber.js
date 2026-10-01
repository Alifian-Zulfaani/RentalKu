const { toIsoUtc } = require("./dates");

function serializeSubscriber(subscriber) {
  if (!subscriber) return null;
  return {
    ...subscriber,
    created_at: toIsoUtc(subscriber.created_at),
    ...(Object.hasOwn(subscriber, "confirmed_at")
      ? { confirmed_at: toIsoUtc(subscriber.confirmed_at) }
      : {}),
  };
}

module.exports = { serializeSubscriber };
