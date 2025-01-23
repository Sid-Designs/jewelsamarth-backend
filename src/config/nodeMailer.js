const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_NO_REPLY_HOST,
    port: process.env.SMTP_NO_REPLY_PORT,
    secure: true,
    auth:{
        user: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
        pass: process.env.SMTP_NO_REPLY_PASS
    }
})

module.exports = transporter;