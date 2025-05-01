const express = require("express");
const router = express.Router();
const checkAdmin = require("../middlewares/checkAdmin");
const {
  addtocartController,
  qtyPlusController,
  qtyMinusController,
  removeCartController,
  getcartController,
  allcartController,
  getCartTotalController
} = require("../controllers/cartController");

router.post("/add", addtocartController);
router.post("/qtyplus/:productId", qtyPlusController);
router.post("/qtyminus/:productId", qtyMinusController);
router.delete("/remove/:productId", removeCartController);
router.post("/get", getcartController);
router.get("/getall", checkAdmin, allcartController);
router.get("/total/:userId", getCartTotalController);


module.exports = router;
