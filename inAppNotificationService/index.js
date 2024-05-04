const amqp = require("amqplib");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const uri = `mongodb+srv://ashriram:cbMfe2B168mY1hLU@cluster0.tnfbkwl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

app.use(cors());
app.use(express.json());
app.use(express.text());

// Define a flexible schema with a dynamic structure
const logSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true, // Assuming UUID is unique
  },
  logData: [
    {
      // Dynamic field for additional log data
      type: mongoose.Schema.Types.Mixed, // Accepts any type of data
    },
  ],
});

const Form = mongoose.model("Log", logSchema);

var data = {};

async function consumeMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange("NotifyExchange", "fanout");

  const logQueue = await channel.assertQueue("logQueue");

  await channel.bindQueue(logQueue.queue, "NotifyExchange", "");

  console.log(`Waiting for messages from NotifyExchange...`);

  channel.consume(logQueue.queue, async (msg) => {
    data = JSON.parse(msg.content);
    console.log("Notify QUEUE");
    console.log(`Received notification message: ${data.datetime}`);
    console.log("Msg:", data);
    channel.ack(msg); // Acknowledge that the message has been processed
  });
}

async function sendDataToDB(uuid, placeholder, data) {
  try {
    // Check if the UUID already exists in the forms collection
    let existingForm = await Form.findOne({ uuid: uuid });
    if (!existingForm) {
      // If the UUID doesn't exist, create a new entry
      const newForm = new Form({
        uuid: uuid,
        logData: [data], // Use placeholder as a dynamic key
      });
      await newForm.save();
    } else {
      // If the UUID exists, update the existing entry
      existingForm.logData.push(data); // Corrected object destructuring
      await existingForm.save(); // Save the updated document
    }
  } catch (error) {
    console.error(error);
    // Assuming this function doesn't have access to `res`, so handle the error appropriately
    // res.status(500).send("Internal Server Error");
  }
}

app.get("/allDataLogs", async (req, res) => {
  const logs = await Form.find({
    uuid: req.headers.authorization.split(" ")[1],
  });
  console.log("Logs:", logs);
  res.send(logs);
});

app.post("/signUpLog", (req, res) => {});

app.post("/signInLog", (req, res) => {
  const data = req.body;
  const { uuid, ...logData } = data;
  console.log("Signed In Log", logData);
  sendDataToDB(req.body.uuid, "signIn", logData);
  res.send("sign in log sent!");
});

app.post("/logOutLog", (req, res) => {
  const data = req.body;
  const { uuid, ...logData } = data;
  console.log("Logged Out Log", logData);
  sendDataToDB(req.body.uuid, "logOut", logData);
  res.send("Logged out log sent");
});

app.post("/createdRoomLog", (req, res) => {
  const data = req.body;
  const { uuid, ...logData } = data;
  console.log("Room Created Log", logData);
  console.log("da:", logData);
  sendDataToDB(req.body.uuid, "CreateRoom", logData);
  res.send("room created log sent");
});

app.post("/joinedRoomLog", (req, res) => {
  const data = req.body;
  const { uuid, ...logData } = data;
  console.log("Joined Room Log", logData);
  sendDataToDB(req.body.uuid, "JoinRoom", logData);
  res.send("room joined log sent");
});

consumeMessages();
console.log("Next");

app.listen(3005, () => {
  console.log("Logs Service is running");
});
