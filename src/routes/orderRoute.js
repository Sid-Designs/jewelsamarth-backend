const express = require('express');
const router = express.Router();
const checkAdmin = require("../middlewares/checkAdmin");
const {createOrderController, verifyPaymentController, couponController, getAllOrdersController} = require('../controllers/orderController');

router.post('/checkout', createOrderController);
router.post('/verify', verifyPaymentController);
router.get("/all", checkAdmin, getAllOrdersController);

module.exports = router;