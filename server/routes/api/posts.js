const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const router = express.Router();

// Set up MongoDB connection URI and options
const uri =
  "mongodb+srv://lucasapedemonte:81othJ5ryldcRZfL@cluster0.g7o1od1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Get Posts
router.get("/", async (req, res) => {
  try {
    const posts = await loadPostsCollection();
    res.send(await posts.find({}).toArray());
  } catch (error) {
    console.error("Error fetching posts", error);
    res.status(500).send("Failed to load posts");
  }
});

// Add Post
router.post("/", async (req, res) => {
  const posts = await loadPostsCollection();
  await posts.insertOne({
    text: req.body.text,
    createdAt: new Date(),
  });
  res.status(201).send();
});

const { ObjectId } = require("mongodb");

router.delete("123", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid ID format");
  }

  const posts = await loadPostsCollection();
  const result = await posts.deleteOne({});
  if (result.deletedCount === 0) {
    return res.status(404).send("No post found with that ID.");
  }
  res.send("Post deleted successfully.");
});

async function loadPostsCollection() {
  try {
    await client.connect();
    return client.db("vue_express").collection("posts");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error; // Re-throw the error to be caught by the route handler
  }
}

// Function to close MongoDB connection
async function closeConnection() {
  await client.close();
}

module.exports = router;
module.exports.closeConnection = closeConnection; // Export this function if needed elsewhere

// Run function to ping MongoDB upon starting the server
async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
