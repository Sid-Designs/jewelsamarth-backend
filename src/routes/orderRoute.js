const express = require("express");
const router = express.Router();
const checkAdmin = require("../middlewares/checkAdmin");
const {
  createOrderController,
  verifyPaymentController,
  couponController,
  getOrderDetailsController,
  getAllOrdersController,
  getAllOrderDetailsController,
} = require("../controllers/orderController");

router.post("/checkout", createOrderController);
router.post("/verify", verifyPaymentController);
router.post("/coupon/apply", couponController);
router.post("/details/:orderId", getOrderDetailsController);
router.get("/all", checkAdmin, getAllOrdersController);
router.post("/details", getAllOrderDetailsController);

module.exports = router;
