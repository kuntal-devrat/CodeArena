"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { WSMessage } from "@codearena/shared";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

export function useSocket(roomId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(WS_URL, {
      transports: ["websocket"],
      auth: { roomId },
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  function send<T>(message: Omit<WSMessage<T>, "timestamp">) {
    socketRef.current?.emit("message", {
      ...message,
      timestamp: new Date().toISOString(),
    });
  }

  function on<T>(event: string, handler: (data: T) => void) {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }

  return { socket: socketRef.current, connected, send, on };
}
