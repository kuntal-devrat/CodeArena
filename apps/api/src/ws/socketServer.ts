import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { WSMessage, WSEventType } from "@codearena/shared";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";

interface AuthSocket extends Socket {
  userId?: string;
  username?: string;
}

export function initSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.WEB_URL ?? "http://localhost:3000",
      credentials: true,
    },
  });

  // ─── Auth middleware ───────────────────────────────────────────────────────
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Missing auth token"));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string; username?: string };
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // ─── Connection handler ────────────────────────────────────────────────────
  io.on("connection", (socket: AuthSocket) => {
    console.log(`[ws] connected userId=${socket.userId}`);

    // Join a room
    socket.on("room:join", (roomId: string) => {
      socket.join(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit("ROOM_MEMBER_UPDATE", {
        type: "ROOM_MEMBER_UPDATE",
        payload: { userId: socket.userId, status: "idle" },
        timestamp: new Date().toISOString(),
      });
    });

    // Leave a room
    socket.on("room:leave", (roomId: string) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit("ROOM_MEMBER_UPDATE", {
        type: "ROOM_MEMBER_UPDATE",
        payload: { userId: socket.userId, status: "offline" },
        timestamp: new Date().toISOString(),
      });
    });

    // Chat message
    socket.on("room:chat", (payload: { roomId: string; message: string }) => {
      const msg: WSMessage = {
        type: "ROOM_CHAT_MESSAGE",
        payload: {
          senderId: socket.userId,
          roomId: payload.roomId,
          message: payload.message,
        },
        timestamp: new Date().toISOString(),
      };
      io.to(`room:${payload.roomId}`).emit("ROOM_CHAT_MESSAGE", msg);
    });

    // Emoji reaction
    socket.on("room:react", (payload: { roomId: string; emoji: string }) => {
      const msg: WSMessage = {
        type: "ROOM_EMOJI_REACTION",
        payload: { senderId: socket.userId, roomId: payload.roomId, emoji: payload.emoji },
        timestamp: new Date().toISOString(),
      };
      io.to(`room:${payload.roomId}`).emit("ROOM_EMOJI_REACTION", msg);
    });

    // ─── Peek ────────────────────────────────────────────────────────────────
    socket.on("peek:request", (payload: { roomId: string; targetId: string }) => {
      io.to(`user:${payload.targetId}`).emit("PEEK_REQUEST", {
        type: "PEEK_REQUEST",
        payload: { requesterId: socket.userId, roomId: payload.roomId },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("peek:response", (payload: { peekId: string; approved: boolean; requesterId: string }) => {
      io.to(`user:${payload.requesterId}`).emit("PEEK_RESPONSE", {
        type: "PEEK_RESPONSE",
        payload: { peekId: payload.peekId, approved: payload.approved },
        timestamp: new Date().toISOString(),
      });
    });

    // Live code update during peek (target → requester)
    socket.on("peek:code", (payload: { peekId: string; code: string; language: string; targetId: string }) => {
      io.to(`user:${payload.targetId}`).emit("PEEK_CODE_UPDATE", {
        type: "PEEK_CODE_UPDATE",
        payload: { peekId: payload.peekId, code: payload.code, language: payload.language },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("peek:revoke", (payload: { peekId: string; requesterId: string }) => {
      io.to(`user:${payload.requesterId}`).emit("PEEK_REVOKED", {
        type: "PEEK_REVOKED",
        payload: { peekId: payload.peekId },
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Spectator ───────────────────────────────────────────────────────────
    socket.on("spectate:join", (payload: { roomId: string; targetUserId: string }) => {
      socket.join(`spectate:${payload.targetUserId}`);
      io.to(`user:${payload.targetUserId}`).emit("SPECTATOR_JOIN", {
        type: "SPECTATOR_JOIN",
        payload: { userId: socket.userId, roomId: payload.roomId },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("spectate:leave", (payload: { targetUserId: string }) => {
      socket.leave(`spectate:${payload.targetUserId}`);
      io.to(`user:${payload.targetUserId}`).emit("SPECTATOR_LEAVE", {
        type: "SPECTATOR_LEAVE",
        payload: { userId: socket.userId },
        timestamp: new Date().toISOString(),
      });
    });

    // ─── User room (personal channel) ────────────────────────────────────────
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on("disconnect", () => {
      console.log(`[ws] disconnected userId=${socket.userId}`);
    });
  });

  return io;
}
