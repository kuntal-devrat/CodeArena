export const metadata = { title: "Community — CodeArena" };

export default function CommunityPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-arena-muted mt-1">
          See what your friends are solving, join public rooms, and stay sharp together.
        </p>
      </div>
      {/* Activity feed, public rooms, presence indicators — Phase 2 */}
      <div className="card text-arena-muted text-sm">
        Community surface coming in Phase 2 — public rooms, activity feed, and presence.
      </div>
    </div>
  );
}
