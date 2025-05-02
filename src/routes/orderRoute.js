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
  changeOrderStatus,
  deleteOrderController
} = require("../controllers/orderController");

router.post("/checkout", createOrderController);
router.post("/verify", verifyPaymentController);
router.post("/coupon/apply", couponController);
router.post("/details/:orderId", getOrderDetailsController);
router.get("/all", checkAdmin, getAllOrdersController);
router.post("/details", getAllOrderDetailsController);
router.post("/change-status",checkAdmin, changeOrderStatus);
router.delete("/delete/:orderId", checkAdmin, deleteOrderController);

module.exports = router;
