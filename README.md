# CodeArena ⚡

> **Social Competitive Coding Platform** — Google Material 3 UI, 2,900+ LeetCode problems, 50–180 real test cases per problem, and a zero-server-cost **Desktop Hardware Executor**.

[![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-0284c7?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Material 3](https://img.shields.io/badge/Design-Google%20Material%203-4285f4?style=flat-square&logo=google)](https://m3.material.io/)
[![Problems](https://img.shields.io/badge/LeetCode%20Problems-2%2C913-FFA116?style=flat-square&logo=leetcode)](http://localhost:3000/problems)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## ✨ Features

### 🎨 1. Google Material 3 UI/UX Overhaul
- **M3 Design Tokens**: Surface hierarchy (`surface`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`), primary tonal palettes, and outline variants.
- **Typography & Font System**: Built with Google Fonts **Roboto** and **Roboto Mono**, featuring tuned line heights, character spacing, and readable font weights.
- **Micro-animations**: Smooth hover transitions, tactile elevation lifts, active scaling, and subtle status pulses.

### 📚 2. Complete LeetCode Problem Bank (2,913 Questions)
- **High-Fidelity Problem Catalog**: Over 2,900 questions scraped and organized with difficulties (`Easy`, `Medium`, `Hard`), topic tags, and acceptance rates.
- **Interactive Browsing & Search**: Real-time keyword filtering, difficulty toggle chips, topic tag filters, and customizable pagination (20 / 50 / 100 items per page).
- **Clean Problem Statement View**: Problem statements are parsed cleanly without duplicate inline examples. Structured Material 3 cards format **Example 1**, **Example 2**, etc., with one-click **"Copy Input"** buttons, syntax highlighting, and dedicated **Follow-up** callouts.

### ⚡ 3. Desktop Hardware Executor (`apps/desktop-runner`)
Execute code directly on your local hardware instead of incurring cloud server costs:
- **$0 Cloud Cost**: All execution happens directly on your CPU.
- **Sub-50ms Latency**: 0ms network queuing delay.
- **Hardware & Runtime Auto-Discovery**: Automatically inspects host CPU model, thread count, and available RAM, auto-detecting 7 local compilers & interpreters:
  - Python (`python`, `python3`)
  - JavaScript (`node`)
  - TypeScript (`tsx`, `ts-node`)
  - C++ (`g++`, `clang++`, `cl.exe`)
  - Java (`javac`, `java`)
  - Go (`go`)
  - Rust (`rustc`)
- **Real-Time Desktop Dashboard**: Served at `http://127.0.0.1:5001` with hardware telemetry, live activity logs, and a savings meter.
- **1-Click Launcher**: Double-click [`start-runner.bat`](./start-runner.bat) or run `npm run runner`.
- **Web App Auto-Pairing**: The web app automatically detects the local runner and displays a live **`⚡ Hardware Runner ($0 Server Cost)`** indicator, allowing instantaneous switching between Local Hardware and Cloud Sandbox.

### 🧪 4. Real Authentic LeetCode Test Cases (No Mocks)
- **Extensive Test Coverage**: Over **2,490 problems** are populated with **50 to 180+ authentic test cases** per problem (e.g. `two-sum` has 80 real test cases, `string-to-integer-atoi` has 188 real test cases).
- **Two-Tier Execution Depth**:
  - **"Run" Button**: Evaluates against the sample test cases (the first 3 examples) for rapid interactive debugging.
  - **"Submit" Button**: Evaluates against **all 50–100+ real test cases** in the database, displaying `X / Y test cases passed` in the verdict console.

---

## 🏛️ Monorepo Architecture

```
CodeArena/
├── apps/
│   ├── web/              # Next.js 14 frontend (Material 3 + Monaco Editor + Tailwind)
│   ├── api/              # Express + Socket.IO backend (Prisma SQLite/Postgres)
│   ├── judge/            # Sandboxed cloud execution service (Express)
│   └── desktop-runner/   # Local Hardware Executor daemon + Material 3 Dashboard (Port 5001)
├── packages/
│   ├── shared/           # Shared TypeScript interfaces (Problem, Submission, Runtimes)
│   └── db/               # Re-exported Prisma database client
├── tools/
│   └── scraper/          # Python leetscrape problem scraper & ingestion utilities
├── scratch/              # Database migration, verification & testing scripts
├── start-runner.bat      # 1-Click Windows launcher for Desktop Hardware Executor
└── turbo.json            # Turborepo build orchestration
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **Python**: 3.10+ (for Python execution and scraping)
- Optional: `g++`, `java`, `go`, `rustc` for local multi-language execution

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/kuntal-devrat/CodeArena.git
cd CodeArena

# Install monorepo dependencies
npm install
```

### 3. Start Development Services
Run all workspace services simultaneously using Turborepo:
```bash
npm run dev
```

The services will be available at:
| Service | URL | Description |
|---|---|---|
| **Web Frontend** | `http://localhost:3000` | CodeArena Next.js 14 Web Application |
| **API Backend** | `http://localhost:4000` | Express REST & WebSocket API |
| **Cloud Judge** | `http://localhost:5000` | Server-side execution judge |
| **Desktop Runner** | `http://127.0.0.1:5001` | Direct Hardware Executor & Telemetry Dashboard |

---

## ⚡ Using the Desktop Hardware Executor

To run solutions directly on your local CPU for maximum speed and zero cloud cost:

1. **Option A (1-Click on Windows)**:
   Double-click [`start-runner.bat`](./start-runner.bat) in the repository root.

2. **Option B (Terminal)**:
   ```bash
   npm run runner
   ```

3. Open `http://localhost:3000/problems/two-sum`. The green **`⚡ Hardware Runner`** badge will automatically illuminate in the top bar.
4. Click **Run** or **Submit** — your code will be compiled and executed directly on your processor in milliseconds!

---

## 🛠️ Verification & Testing

Verify that all monorepo packages compile and pass typechecks:
```bash
# Typecheck all 6 packages
npm run typecheck

# Run end-to-end service verification
node scratch/verify_all.js
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
