const express = require("express");
const router = express.Router();
const { addProductController } = require("../controllers/productController");
const checkAdmin = require("../middlewares/checkAdmin");

router.post("/add", checkAdmin, addProductController);

module.exports = router;
