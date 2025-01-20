require("dotenv").config();
const express = require("express");
const server = express();

server.get("/", (req, res) => {
  res.send("Home Pages");
});

module.exports = server;