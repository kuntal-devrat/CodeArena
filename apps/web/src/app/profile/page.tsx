export const metadata = { title: "Profile — CodeArena" };

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      {/* Solved count, streak calendar, difficulty breakdown, badges */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Solved", value: "0" },
          { label: "Streak", value: "0 days" },
          { label: "Rooms joined", value: "0" },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-3xl font-bold text-brand-500">{s.value}</div>
            <div className="text-arena-muted text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
