const express = require("express");
const router = express.Router();
const {
  addProductController,
  getAllProductsController,
  getProductByIdController
} = require("../controllers/productController");
const checkAdmin = require("../middlewares/checkAdmin");

router.post("/add", checkAdmin, addProductController);
router.get("/all", getAllProductsController);
router.get("/:id", getProductByIdController);

module.exports = router;
