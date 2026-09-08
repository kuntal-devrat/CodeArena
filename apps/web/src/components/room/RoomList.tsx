"use client";

import type { Room } from "@codearena/shared";
import { clsx } from "clsx";

// Placeholder — replace with API call
const MOCK_ROOMS: Room[] = [
  {
    id: "r1",
    name: "Aniket's Study Group",
    mode: "FREE_PRACTICE",
    visibility: "FRIENDS",
    hostId: "u1",
    members: [
      { userId: "u1", username: "aniket", status: "coding", isHost: true, joinedAt: new Date().toISOString() },
      { userId: "u2", username: "kuntal", status: "idle", isHost: false, joinedAt: new Date().toISOString() },
    ],
    createdAt: new Date().toISOString(),
  },
];

const MODE_LABEL: Record<Room["mode"], string> = {
  FREE_PRACTICE: "Free Practice",
  SAME_PROBLEM: "Same Problem",
  HEAD_TO_HEAD: "Head-to-Head",
};

export function RoomList() {
  if (MOCK_ROOMS.length === 0) {
    return (
      <div className="card text-center text-arena-muted py-16">
        No rooms yet. Create one and invite your friends!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MOCK_ROOMS.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <div className="card hover:border-brand-500/50 transition-colors cursor-pointer space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white">{room.name}</h3>
          <span className="text-xs text-arena-muted">{MODE_LABEL[room.mode]}</span>
        </div>
        <span
          className={clsx(
            "text-xs px-2 py-0.5 rounded-full border",
            room.visibility === "PUBLIC"
              ? "border-green-500/30 text-green-400"
              : "border-arena-border text-arena-muted"
          )}
        >
          {room.visibility.toLowerCase()}
        </span>
      </div>

      {/* Members */}
      <div className="flex items-center gap-2">
        {room.members.map((m) => (
          <div key={m.userId} className="flex items-center gap-1.5">
            <span
              className={clsx("w-2 h-2 rounded-full", {
                "bg-green-400": m.status === "coding",
                "bg-yellow-400": m.status === "submitted",
                "bg-arena-muted": m.status === "idle",
                "bg-blue-400": m.status === "spectating",
              })}
            />
            <span className="text-xs text-arena-muted">{m.username}</span>
          </div>
        ))}
        <span className="text-xs text-arena-muted ml-auto">
          {room.members.length} member{room.members.length !== 1 ? "s" : ""}
        </span>
      </div>

      <button className="btn-primary w-full text-sm py-2">Join Room</button>
    </div>
  );
}
