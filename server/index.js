const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const db = require("./models/dbpg");
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

app.get("/", function (req, res) {
  res.send("<h1>Hi everybody!<h1>");
});

app.post("/insertTrafficData", (req, res) => {
  // console.log("a:", req.body);
  const { roomID, author, message } = req.body;
  db.insert(roomID, author, message);
  res.send("data inserted succesfully");
});

app.get("/getData", (req, res) => {
  console.log("HI");
  // const room = req.query.room;
  // console.log("Room:", room);
  res.send("Display success!");
});

server.listen(3001, () => {
  console.log("Server running");
});
