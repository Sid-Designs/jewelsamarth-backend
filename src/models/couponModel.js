const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Coupon = new mongoose.Schema({
    code: String,
    discount: Number,
    expiryDate: Date,
});

module.exports =  mongoose.model('Coupon', Coupon);;