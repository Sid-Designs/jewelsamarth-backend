const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Subscribe = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
}, { timestamps: true });

module.exports = mongoose.model('Subscribe', Subscribe);