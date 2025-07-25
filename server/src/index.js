const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path');

const port = 3000;
const nodemailerRoutes = require("./routes/nodemailerRoutes");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());

app.use("/api/nodemailer", nodemailerRoutes);

app.listen(port, () => {
  console.log(`Tienda Distrolac escuchando a: http://localhost:${port}`);
});
