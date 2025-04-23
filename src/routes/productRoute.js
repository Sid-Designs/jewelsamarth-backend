const express = require("express");
const router = express.Router();
const {
  addProductController,
  getAllProductsController,
  getProductByIdController,
  getProductByCategoryController,
  getProductBySearchController,
} = require("../controllers/productController");
const checkAdmin = require("../middlewares/checkAdmin");

router.get("/search", getProductBySearchController)
router.post("/add", checkAdmin, addProductController);
router.get("/all", getAllProductsController);
router.get("/:id", getProductByIdController);
router.get("/category/:category", getProductByCategoryController);

module.exports = router;
