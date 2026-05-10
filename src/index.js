require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const authRoutes = require("./APIs/routes/auth");
const healthRoutes = require("./APIs/routes/health");
const userRoutes = require("./APIs/routes/user");
const productRoutes = require("./APIs/routes/product");
const sellerRoutes = require("./APIs/routes/seller");
const cartRoutes = require("./APIs/routes/cart");

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/cart", cartRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "api not found",
  });
});
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV !== "development"
    ? "internal server error"
    : err.message;
  res.status(statusCode).json({
    success: false,
    message,
  });
});
const PORT = process.env.PORT || 3000;
let server;
async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("Database connected");
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  if (server) server.close(() => { console.log("Server closed"); });
  await db.end();
  process.exit(0);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
