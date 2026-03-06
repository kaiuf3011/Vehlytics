import { io } from "socket.io-client";

export const socket = io("http://localhost:5001", {
  autoConnect: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("disconnect", () => console.log("Socket disconnected"));
socket.on("connect_error", (err) => console.warn("Socket error:", err.message));
