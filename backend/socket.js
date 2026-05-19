import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || ["http://127.0.0.1:5173", "http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    }
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("join", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
