const app = require("./server");
const port = Number(process.env.PORT) || 3002;
app.listen(port, () =>
  console.log(`RentalKu Booking API berjalan di http://localhost:${port}`),
);
