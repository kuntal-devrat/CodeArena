// ─── WebSocket message types shared by client and server ───────────────────

export type WSEventType =
  // Room events
  | "ROOM_JOIN"
  | "ROOM_LEAVE"
  | "ROOM_MEMBER_UPDATE"
  | "ROOM_CHAT_MESSAGE"
  | "ROOM_EMOJI_REACTION"
  // Peek events
  | "PEEK_REQUEST"
  | "PEEK_RESPONSE"
  | "PEEK_CODE_UPDATE"
  | "PEEK_EXPIRED"
  | "PEEK_REVOKED"
  // Spectator events
  | "SPECTATOR_JOIN"
  | "SPECTATOR_LEAVE"
  // Presence events
  | "PRESENCE_UPDATE"
  // Submission events
  | "SUBMISSION_STATUS_UPDATE"
  // Error
  | "ERROR";

export interface WSMessage<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}

// Payload shapes for key events
export interface RoomChatPayload {
  roomId: string;
  senderId: string;
  senderUsername: string;
  message: string;
}

export interface EmojiReactionPayload {
  roomId: string;
  senderId: string;
  emoji: string;
}

export interface PeekCodeUpdatePayload {
  peekId: string;
  code: string;
  language: string;
  cursorLine?: number;
}

export interface SpectatorJoinPayload {
  roomId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}
