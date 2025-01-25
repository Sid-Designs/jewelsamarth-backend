require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./src/config/database");
const cookieParser = require("cookie-parser");
const User = require("./src/models/userModel");

const server = express();

// Database connection
connectToDatabase();

// Middleware
server.use(express.json());
server.use(cookieParser());

// API Endpoints
server.use("/api/auth", require("./src/routes/authRoute"));
server.use("/api/user", require("./src/routes/userRoute"));

// Home Routes
server.get("/", (req, res) => {
  res.send("Home Page Found");
});

module.exports = server;
