const app = require("./server");
const { port } = require("./config/env");
app.listen(port, () =>
  console.log(`RentalKu Booking API berjalan di http://localhost:${port}`),
);
