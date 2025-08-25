const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ENV
const PORT = process.env.PORT || 4100;
const NODE_ENV = process.env.NODE_ENV || "production";

// CORS:
// En prod no lo necesitás si el front llama /form-api (same-origin via Nginx).
// Lo dejamos condicional para dev (Vite en 5173).
if (NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
}

// Static (si sirve archivos)
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());

// Rutas del formulario
const nodemailerRoutes = require("./routes/nodemailerRoutes");
// Montamos SIN prefijo aquí; el prefijo lo maneja Nginx (/form-api)
app.use("/", nodemailerRoutes);

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Form backend escuchando en :${PORT} (NODE_ENV=${NODE_ENV})`);
});
