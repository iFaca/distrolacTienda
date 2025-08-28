const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 4100;
const NODE_ENV = process.env.NODE_ENV || "production";

if (NODE_ENV !== "production") {
  app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }));
}

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// ✅ prefijo alineado con el front: /form-api/nodemailer/...
const nodemailerRoutes = require("./routes/nodemailerRoutes");
app.use("/nodemailer", nodemailerRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Form backend escuchando en :${PORT} (NODE_ENV=${NODE_ENV})`);
});
