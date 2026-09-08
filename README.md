# CodeArena

> Social competitive coding practice — real-time rooms, Peek, spectating, and a full problem bank.

## Monorepo structure

```
codearena/
├── apps/
│   ├── web/        # Next.js 14 frontend (TypeScript + Tailwind + Monaco)
│   ├── api/        # Express + Socket.IO backend (TypeScript + Prisma)
│   └── judge/      # Sandboxed code-execution service (TypeScript)
├── packages/
│   ├── shared/     # Shared types (Problem, Room, Submission, WS events)
│   └── db/         # Re-exported Prisma client
├── infra/          # Docker + future IaC
├── docker-compose.yml
└── turbo.json
```

## Prerequisites

- Node 20+
- Docker & Docker Compose (for Postgres + Redis)

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/kuntal-devrat/CodeArena
cd CodeArena
npm install

# 2. Copy env and fill in values
cp .env.example .env

# 3. Start Postgres + Redis
docker compose up postgres redis -d

# 4. Run DB migrations + seed
npm run db:migrate --workspace=apps/api
npm run db:seed    --workspace=apps/api

# 5. Start all services in dev mode
npm run dev
```

Services:
| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| Judge | http://localhost:5000 |

## Key features (per PRD)

| Feature | Status |
|---------|--------|
| Problem bank + editor | Starter scaffolded |
| Judge service (Python, JS, TS, Java, C++, Go, Rust) | Starter scaffolded |
| Auth (JWT) | Implemented |
| Rooms (free practice mode) | Implemented |
| Real-time WebSocket (chat, presence, emoji) | Implemented |
| Peek (consent-based, time-boxed) | WS events implemented |
| Spectating | WS events implemented |
| Community surface | Phase 2 |
| Contests + leaderboards | Phase 2 |

## Tech stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Monaco Editor, Socket.IO client, Zustand
- **Backend:** Express, Socket.IO, Prisma (PostgreSQL), Redis (pub/sub + presence), Zod, JWT
- **Judge:** Node.js (child_process sandbox) — wrap with gVisor/Firecracker in production
- **Monorepo:** Turborepo + npm workspaces
