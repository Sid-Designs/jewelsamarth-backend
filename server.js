require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./config/database");

const server = express();

connectToDatabase();

server.get("/", (req, res) => {
  res.send("Home Page");
});

module.exports = server;
