const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const userData = require("../controllers/userController");

router.get("/data", userAuth, userData);

module.exports = router;
