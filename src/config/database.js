require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const URI = process.env.MONGODB_DATABASE_URI;

if (!URI) {
  console.error("MONGODB_DATABASE_URI environment variable is not set.");
  process.exit(1);
}

const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

module.exports = connectToDatabase;
