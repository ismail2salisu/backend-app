const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app's origin
    methods: ["GET", "POST"]
  }
});

const PORT = 4000;

// Store users
const users = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle new user joining
  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('userJoined', username);
    io.emit('userList', Object.values(users));
  });

  // Handle chat messages
  socket.on('sendMessage', (message) => {
    const username = users[socket.id];
    io.emit('message', { username, text: message });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    if (username) {
      io.emit('userLeft', username);
      io.emit('userList', Object.values(users));
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});