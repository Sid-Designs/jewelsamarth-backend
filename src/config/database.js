require("dotenv").config();
const mongoose = require("mongoose");

const URI = process.env.MONGODB_DATABASE_URI;

if (!URI) {
  console.error("MONGODB_DATABASE_URI environment variable is not set.");
  process.exit(1);
}

const connectToDatabase = async () => {
  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
};

module.exports = connectToDatabase;
