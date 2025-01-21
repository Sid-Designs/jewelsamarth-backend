require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./src/config/database");
const User = require("./src/models/userModel");
import { injectSpeedInsights } from '@vercel/speed-insights';


const server = express();

// Database connection
connectToDatabase();

// Middleware
server.use(express.json());

// Routes
server.use("/register", require("./src/routes/userRoute"));

server.get("/", (req, res) => {
  res.send("Home Page Found");
});

server.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send({ message: "User Page", users: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Speed Insights
injectSpeedInsights();

module.exports = server;
