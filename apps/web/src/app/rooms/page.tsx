import { RoomList } from "@/components/room/RoomList";

export const metadata = { title: "Rooms — CodeArena" };

export default function RoomsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rooms</h1>
          <p className="text-arena-muted mt-1">
            Join a friend group's room or create your own practice space.
          </p>
        </div>
        <button className="btn-primary">+ Create Room</button>
      </div>
      <RoomList />
    </div>
  );
}
