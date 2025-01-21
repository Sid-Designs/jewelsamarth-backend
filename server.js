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
  res.send("Home Page");
});

server.get("/users", async (req, res) => {
  const users = await User.find();
  res.send("User Page");
});

module.exports = server;
