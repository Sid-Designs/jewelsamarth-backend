const express = require("express");
const router = express.Router();
const {
  addProductController,
  getAllProductsController,
  getProductByIdController,
  getProductByCategoryController
} = require("../controllers/productController");
const checkAdmin = require("../middlewares/checkAdmin");

router.post("/add", checkAdmin, addProductController);
router.get("/all", getAllProductsController);
router.get("/:id", getProductByIdController);
router.get("/category/:category", getProductByCategoryController);

module.exports = router;
