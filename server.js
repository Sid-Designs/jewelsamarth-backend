require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./src/config/database");
const User = require("./src/models/userModel");

const server = express();

// Database connection
connectToDatabase();

// Middleware
server.use(express.json());

// Routes
server.use("/register", require("./src/routes/userRoute"));

server.get("/", (req, res) => {
  res.send("Home Pages");
});

server.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ message: "User Page", users: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = server;
