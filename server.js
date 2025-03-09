require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const server = express();

// Database connection
connectToDatabase();

// Middleware
server.use(express.json());
server.use(cookieParser());
server.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://jewelsamarth-frontend.vercel.app",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// API Endpoints
server.use("/api/auth", require("./src/routes/authRoute"));
server.use("/api/user", require("./src/routes/userRoute"));
server.use("/api/product", require("./src/routes/productRoute"));
server.use("/api/cart", require("./src/routes/cartRoute"));

// Home Routes
server.get("/", (req, res) => {
  res.send("Home Page Found");
});

module.exports = server;
