const amqp = require("amqplib");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

app.use(express.json());
app.use(express.text());
app.use(cors());

var data = {};

async function consumeMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange("NotifyExchange", "fanout");

  const notifyQueue = await channel.assertQueue("NotifyQueue");

  await channel.bindQueue(notifyQueue.queue, "NotifyExchange", "");

  console.log(`Waiting for messages from NotifyExchange...`);

  channel.consume(notifyQueue.queue, async (msg) => {
    data = JSON.parse(msg.content);
    console.log("Notify QUEUE");
    console.log(`Received notification message: ${data.datetime}`);
    console.log("Msg:", data);
    channel.ack(msg); // Acknowledge that the message has been processed
  });
}

app.get("/data", (req, res) => {
  console.log("Data:", data);
  res.json(data);
});

consumeMessages();
console.log("Next");

app.listen(3004, () => {
  console.log("Notifications Service is running");
});
