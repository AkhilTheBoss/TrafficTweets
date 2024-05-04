// index.js
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./models/dbpg"); // Import dbpg.js
const Producer = require("./producer");
const producer = new Producer();
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.send("<h1>Hi everybody! This is forms service.<h1>");
});

app.post("/forms", async function (req, res) {
  // Extract waitingTime and reason from the request body
  const { waitingTime, reason } = req.body;

  // Call the function to insert data into the database
  try {
    await db.insertData(waitingTime, reason);
    res.send("Post req received and data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/notify", async (req, res) => {
  await producer.publishMessage(req.body.message);
  res.send();
});

app.listen(3002, () => {
  console.log("Forms Server running");
});
