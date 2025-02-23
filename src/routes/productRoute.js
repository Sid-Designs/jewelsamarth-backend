const express = require("express");
const router = express.Router();
const { addProductController, getAllProductsController } = require("../controllers/productController");
const checkAdmin = require("../middlewares/checkAdmin");

router.post("/add", checkAdmin, addProductController);
router.get("/all", getAllProductsController);

module.exports = router;
