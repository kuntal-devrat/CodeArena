# Product Requirements Document
## CodeArena — Social Competitive Coding Practice Platform

**Status:** Draft v1.0
**Author:** [Product/PM Name]
**Last updated:** September 7, 2026

---

## 1. Summary

CodeArena is a coding practice and interview-prep platform that matches
the core problem-solving experience of established platforms like
LeetCode — a large problem bank, an in-browser editor with multi-
language execution, submissions, and progress tracking — while adding a
social/competitive layer that today's tools mostly lack: **Rooms** where
friends can practice together in real time, **Peek** (a controlled
ability to glance at a friend's screen/code when you're stuck), live
**spectator presence** (people watching know they're being watched, and
the person coding knows who's watching), and lightweight **emoji
reactions and chat**. The goal is to turn solitary grinding into a
shared, motivating activity, similar to how Duolingo or Discord turned
solo/async activities into social ones.

## 2. Problem Statement

Practicing coding problems is currently a solitary, often demotivating
grind:
- People drop off practice streaks because there's no social
accountability or fun.
- Getting stuck on a problem is isolating — the only options are to
struggle alone or leave the platform entirely (Discord, forums) to ask
for help, breaking flow.
- Existing "compete with friends" features on incumbent platforms are
shallow (e.g., a weekly leaderboard) and don't support real-time, in-
session interaction.
- There's no good way to practice interviews socially — with the
immediacy of watching a friend think through a problem — without doing
a full formal mock interview.

## 3. Goals

### 3.1 Product goals
- Provide full feature parity with a standard coding-practice platform
(problem bank, editor, judge, progress tracking) as table stakes.
- Make practicing with friends the primary differentiator and growth loop
— social presence should be a default, ambient part of the product, not
a buried feature.
- Reduce the "stuck and alone" drop-off moment by giving users a low-
friction way to get unstuck via friends, without fully spoiling the
problem.

### 3.2 Business goals
- Drive organic growth via a social/viral loop (Rooms are inherently
invite-driven).
- Increase session length and D7/D30 retention relative to solo-grind
platforms.

- Build a wedge for a paid tier (private rooms at scale, premium problem
sets, teams/orgs for interview prep).

### 3.3 Non-goals (v1)
- Not building a full LMS/course platform (video courses, structured
curricula) — practice-first, not learn-first.
- Not building formal, structured mock-interview scheduling/matching
(that's a possible v2/v3).
- Not aiming to fully replace collaborative-IDE tools (e.g., real-time
pair editing of the *same* code) — Peek is view-only by default, not
co-editing.

## 4. Target Users

| Persona | Description | Primary need |
|---|---|---|
| Interview grinder | Preparing for SWE interviews, does daily problems |
Structured practice, progress tracking, motivation to stay consistent |
| Study group / friend group | 3–10 people (bootcamp cohort, CS
classmates, coworkers) | Shared sessions, friendly competition, low-
stakes help |
| Competitive programmer | Enjoys contests and speed-solving | Live
competition, rankings, low-latency judge |
| Casual community member | Wants a fun, social way to stay sharp |
Ambient presence, chat, low commitment |

## 5. Core Feature Set (LeetCode-parity — table stakes)

These are required for the product to be viable as a coding-practice tool
at all.

### 5.1 Problem bank
- Large library of problems tagged by topic (arrays, DP, graphs, etc.),
difficulty (Easy/Medium/Hard), and company/frequency tags.
- Problem detail page: statement, constraints, examples, starter code per
language.
- Search and filter (by tag, difficulty, status:
solved/attempted/unsolved).

### 5.2 Editor & execution
- In-browser code editor (Monaco or CodeMirror) with syntax highlighting,
multi-language support (Python, Java, C++, JavaScript, Go, etc. at
minimum).
- "Run" against sample/custom test cases; "Submit" against the full
hidden test suite.
- Sandboxed, isolated code execution with time/memory limits per
submission.
- Submission result states: Accepted, Wrong Answer, TLE, MLE, Runtime
Error, Compile Error — each with diagnostic output.

### 5.3 Judge & scoring
- Deterministic, isolated judge service; consistent grading across
languages.
- Submission history per user per problem, with runtime/memory percentile
comparison.

### 5.4 Progress & profile
- Per-user solved count, streaks, calendar heatmap, difficulty breakdown.

- Public profile page (solved problems, badges, contest history — user-
configurable privacy).

### 5.5 Contests / leaderboards
- Scheduled global contests with time-boxed problem sets and a public
leaderboard.
- Global and friends-only leaderboards.

### 5.6 Discussion (async)
- Per-problem discussion/solutions board, editorial write-ups, hints.

## 6. Differentiated Features (the "unique" layer)

This is the core of what makes CodeArena different. These should feel
**ambient and default**, not a separate mode you have to opt into — the
product should feel like a community/hangout space that happens to have a
great problem bank, not a solo tool with a bolted-on social feature.

### 6.1 Rooms
A Room is a persistent or ephemeral shared space where a group of friends
practices together.

- **Creation:** Any user can create a Room, invite friends via
link/username, and set it to solo-visible-to-invitees, friends-only, or
public/discoverable.
- **Modes:**
  - *Free practice* — everyone works on whatever problem they choose;
presence and chat are shared.
  - *Same-problem sync* — the host picks one problem and everyone
solves it simultaneously, with a shared timer and live standings.
  - *Head-to-head* — 1v1 or small-group timed duel on a problem,
fastest-correct-submission wins.
- **Persistence:** Rooms can be "always-on" (like a Discord
server/channel for a friend group) or one-off sessions that expire.
- **Room roster:** shows who's currently active, what they're doing
(idle/coding/submitted), and their live status.

### 6.2 Peek (controlled screen/code visibility)
The core "stuck and want help" mechanic.

- When a user is stuck, they can request or grant a **Peek**: a time-
boxed, read-only view into a friend's current editor state (code as
typed, live) within the same Room and same problem.
- **Two flows:**
  1. *Ask to peek:* User A requests to peek at User B's screen; B gets a
prompt and can approve, deny, or auto-approve (per their settings).
  2. *Offer to help:* User B, seeing A is stuck (e.g., idle too long, or
explicitly flags "I'm stuck"), can proactively offer a peek, which A
accepts or declines.
- **Consent and awareness are mandatory:** peeking is never silent. The
person being peeked at always sees an indicator (name/avatar + "peeking"
badge) for the duration.
- **Scope controls:** the peeked user can choose to share only their
code, or code + cursor/selection, and can revoke access instantly.
- **Time-boxed:** peeks default to a short window (e.g., 60–120
seconds) and can be extended by mutual consent, to keep it a nudge rather
than a way to fully copy a solution.

- **Not full pair programming:** Peek is view-only by default; no editing
of the other person's code unless both parties explicitly enable a
"collaborate" mode.

### 6.3 Live spectator presence
- Any Room member (or, for public rooms, any viewer) can spectate a
coder's session in real time.
- **Bidirectional visibility:** the coder always sees who is currently
spectating them (avatars + count), consistent with the "no silent
watching" principle above.
- Spectators can leave at any time; leaving updates the coder's visible
list immediately.
- Coders can toggle a "do not disturb / no spectating" mode for a given
session if they want privacy, honored platform-wide.

### 6.4 Emoji reactions & chat
- Lightweight, low-friction social layer available by default in every
Room and on spectated sessions.
- **Emoji reactions:** quick-fire reactions (👀, 🔥, 😅, 💡,
ðŸ ›, 🎉) that float over the session, visible to the coder and other
spectators — meant for cheering, commiseration, or gentle ribbing
without breaking flow with a full message.
- **Chat:** a persistent side-panel text chat per Room, plus optional
ephemeral "whisper" chat between a spectator and coder.
- Chat and reactions are logged per Room for context but are
ephemeral/mutable by the sender (can delete their own messages).

### 6.5 Ambient community layer
- A default "Community" surface (distinct from private Rooms) where
public rooms, ongoing contests, and currently-active friends are visible
— meant to make the platform feel alive, similar to a game lobby or
Discord home screen, rather than a quiet solo tool.
- Friend activity feed: "X just solved Y," "X started a Room," "X is on a
10-day streak" — opt-in, privacy-respecting.
- Presence indicators (online/coding/in a room) on friends' profiles,
matching standard social-app conventions.

## 7. User Stories (representative)

- As a user stuck on a Medium DP problem, I want to ask a friend in my
Room to peek at my code so they can point me toward my bug without giving
me the full solution.
- As a user being peeked at, I want to always know who is looking at my
screen and be able to revoke access instantly.
- As a study-group organizer, I want to create a persistent Room for my
6-person bootcamp cohort so we have a shared space to practice together
every week.
- As a competitive user, I want to challenge a friend to a head-to-head
duel on a random Medium problem with a live timer and standings.
- As a spectator, I want to react with an emoji to cheer a friend on
without interrupting them with a message.
- As a privacy-conscious user, I want to disable spectating and peek
requests entirely for a private session.

## 8. Key Flows to Design

1. Create Room â†’ invite friends â†’ choose mode (free practice / same-
problem / duel) â†’ session lifecycle â†’ post-session summary.

2. Stuck-user flow: idle detection or explicit "I'm stuck" flag â†’
offer/request Peek â†’ consent prompt â†’ time-boxed view â†’ auto-expire
or extend.
3. Spectate flow: browsing a public Room or a friend's active session â†’
join as spectator â†’ visible presence indicator appears on coder's
screen â†’ react/chat â†’ leave.
4. Onboarding flow: solo signup â†’ prompted to add friends / join a
public Room / explore Community — social surface introduced early, not
buried in settings.

## 9. Non-Functional Requirements

- **Real-time infrastructure:** Rooms, Peek, presence, and chat require
low-latency real-time sync (WebSocket-based; consider CRDT or OT for
future co-editing). Target <300ms end-to-end latency for code-state
updates during a Peek.
- **Privacy & consent by design:** no passive/silent observation of a
user's code is permitted anywhere in the product; every form of
visibility must be indicated to the person being viewed, and revocable.
- **Judge isolation & security:** sandboxed execution environment (e.g.,
gVisor/Firecracker-style isolation) to prevent malicious code from
escaping the sandbox; per-submission resource limits.
- **Scalability:** problem judge and real-time services should scale
independently; contests can spike concurrent submissions significantly
(design for burst load at contest start times).
- **Abuse/moderation:** rate-limiting and reporting for chat/emoji spam,
and a way to block/mute specific users from Rooms, spectating, or peek
requests.
- **Data retention:** chat/room history retention policy should be
explicit and disclosed (e.g., 30/90-day retention, user-deletable).

## 10. Success Metrics

- **Engagement:** average session length, sessions per week per active
user, % of sessions that occur inside a Room vs. solo.
- **Social loop health:** % of users who join or create a Room within
first 7 days; average Room size; Peek usage rate among stuck users (idle
>X minutes).
- **Retention:** D7/D30 retention, especially comparing Room users vs.
solo-only users (hypothesis: Room usage significantly lifts retention).
- **Growth:** invite-to-join conversion rate from Room invite links
(viral coefficient).
- **Core practice metrics:** problems solved per user per week,
submission acceptance rate over time (learning curve proxy).

## 11. Phasing / Roadmap

### Phase 1 — MVP (core parity + basic social)
- Problem bank, editor, judge, submissions, profile/progress (Section 5,
minus contests).
- Rooms: free-practice mode only, with presence list and chat.
- Basic emoji reactions.
- No Peek yet — spectating is opt-in per session, always visible to the
coder.

### Phase 2 — Differentiation
- Peek (ask/offer flows, consent, time-boxing, revocation).
- Same-problem sync mode and head-to-head duels in Rooms.

- Contests with live leaderboards.
- Community surface (public rooms, activity feed, presence on profiles).

### Phase 3 — Depth & monetization
- Persistent/organizational Rooms (teams, bootcamps, companies) — paid
tier.
- Optional full co-editing/collaborate mode (beyond read-only Peek).
- Advanced analytics (skill-gap tracking, personalized problem
recommendations).
- Structured mock-interview matching built on top of the Room/Peek
primitives.

## 12. Risks & Open Questions

- **Cheating/integrity risk:** Peek could be used to copy solutions
wholesale in a contest context. Mitigation: disable Peek during ranked
contests, or restrict it to non-scored practice sessions only.
- **Content licensing/legal risk:** the problem bank itself must be
original or properly licensed content — cannot copy existing platforms'
proprietary problem statements/test cases verbatim. Needs a dedicated
content strategy (in-house authored problems, partnerships, or a
curation/licensing plan).
- **Privacy sensitivity:** even with consent-based design, some users may
find any screen-sharing feature uncomfortable in an interview-prep
context; default settings should lean toward privacy-off until explicitly
enabled.
- **Moderation cost:** chat and public Rooms introduce a real-time
moderation burden — needs a plan before Community/public rooms ship
(Phase 2).
- **Open question:** Should Peek be available during timed contests at
all, or strictly limited to free-practice Rooms? (Recommend: practice-
only for v1.)
- **Open question:** How much of the problem bank (if any) should be free
vs. paywalled, and how does that interact with Room practice (can free
users join a paid friend's Room)?

## 13. Out of Scope for This PRD

- Detailed UI/visual design (to be covered in design specs/mockups).
- Specific problem-bank content and editorial pipeline.
- Detailed system architecture and infra sizing (to be covered in a
separate technical design doc).
- Pricing and packaging details for paid tiers.

---

*Next steps: review with eng/design leads, validate Peek's consent UX
with a small user test, and scope Phase 1 into sprint-sized tickets.*
