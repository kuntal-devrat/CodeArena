export type RoomMode = "FREE_PRACTICE" | "SAME_PROBLEM" | "HEAD_TO_HEAD";
export type RoomVisibility = "PRIVATE" | "FRIENDS" | "PUBLIC";
export type RoomMemberStatus = "idle" | "coding" | "submitted" | "spectating";

export interface RoomMember {
  userId: string;
  username: string;
  avatarUrl?: string;
  status: RoomMemberStatus;
  isHost: boolean;
  joinedAt: string;
}

export interface Room {
  id: string;
  name: string;
  mode: RoomMode;
  visibility: RoomVisibility;
  hostId: string;
  members: RoomMember[];
  problemId?: string; // set in SAME_PROBLEM / HEAD_TO_HEAD modes
  startedAt?: string;
  endsAt?: string;
  createdAt: string;
}

export interface PeekRequest {
  id: string;
  roomId: string;
  requesterId: string;
  targetId: string;
  status: "pending" | "approved" | "denied" | "expired";
  durationSeconds: number;
  createdAt: string;
  expiresAt?: string;
}
