export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  solvedCount: number;
  streak: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  iconUrl: string;
  earnedAt: string;
}

export type PresenceStatus = "online" | "coding" | "in_room" | "offline";

export interface UserPresence {
  userId: string;
  username: string;
  avatarUrl?: string;
  status: PresenceStatus;
  roomId?: string;
}
