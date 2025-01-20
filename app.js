require("dotenv").config();
const express = require("express");
const app = express();

app.listen(process.env.PORT, () => {
  console.log("Server Started At : Port ", process.env.PORT);
});

app.get("/", (req, res) => {
  res.send("Home Page");
});
