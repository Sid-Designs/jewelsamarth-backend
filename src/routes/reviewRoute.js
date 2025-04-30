const express = require('express');
const router = express.Router();
const userAuth = require('../middlewares/userAuth');
const { addReviewController, getAllReviewsController, getReviewByIdController, updateReviewController, deleteReviewController } = require('../controllers/reviewController');

router.post('/add', addReviewController);
router.put('/update', updateReviewController);
router.delete('/delete', deleteReviewController);

module.exports = router;