// index.js
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
// const db = require("./models/dbpg"); // Import dbpg.js
const Producer = require("./producer");
const producer = new Producer();
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());

// // MongoDB connection URI obtained from MongoDB Atlas
const uri = `mongodb+srv://ashriram:cbMfe2B168mY1hLU@cluster0.tnfbkwl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Define the schema
const roomSchema = new mongoose.Schema({
  location: String,
  roomID: String,
});

// Create a model from the schema
const Room = mongoose.model("roomAvailabilty", roomSchema);

app.get("/", function (req, res) {
  res.send("<h1>Hi everybody! This is User Profile service.<h1>");
});

app.post("/", function (req, res) {
  console.log(req.body.roomID);
});

app.post("/locationCheck", async function (req, res) {
  const location = req.body.location;
  const uuid = req.body.uuid;
  console.log("location:", location);
  try {
    const existingLoc = await Room.findOne({ location: location });
    console.log("eL:", existingLoc);
    if (existingLoc) {
      res.send(
        `Location already exists in the database, check the notifications page to find out the room Number`
      );
      await producer.publishMessage(location, uuid, existingLoc.roomID);
    } else {
      res.send(`Location not found in the database`);
    }
  } catch (error) {
    console.error("Error checking location:", error);
    res.send("Internal server error");
  }
});

// Endpoint to check if a roomID exists in the database
app.post("/roomIDCheck", async (req, res) => {
  try {
    const roomID = req.body.roomID;
    const location = req.body.location;

    const existingRoom = await Room.findOne({ roomID: roomID });
    if (existingRoom) {
      res.send(`RoomID ${roomID} exists in the database`);
    } else {
      res.send(
        `RoomID ${roomID} does not exist in the database, room created just now. Make sure you type in the same number: ${roomID}, curated for this signal`
      );

      // Insert data
      const roomData = {
        location: location,
        roomID: roomID,
      };

      Room.create(roomData)
        .then((room) => {
          console.log("Room created successfully:", room);
        })
        .catch((error) => {
          console.error("Error creating room:", error);
        });
    }
  } catch (error) {
    console.error("Error checking roomID:", error);
    res.send("Internal server error");
  }
});

app.get("/Page", function (req, res) {
  res.send("<h1>This the page route of User Profile service.<h1>");
});

app.post("/loadPage", function (req, res) {
  console.log("HI How are you?");
});

app.listen(3003, () => {
  console.log("User Profile Server running");
});
