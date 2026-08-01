# CodeLab - Online Judge System

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14"/>
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/MongoDB-8-green?logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Docker-Containerized-blue?logo=docker" alt="Docker"/>
</p>

A production-ready competitive programming platform with real-time code execution, sandboxed Docker containers, and live leaderboards.

## ✨ Features

- 📝 **Problem Set**: Browse, search, and filter coding problems by difficulty
- 💻 **Monaco Editor**: Full-featured code editor with syntax highlighting
- 🚀 **Multi-Language**: Support for C++, Python, Java, and JavaScript
- 🔒 **Secure Sandbox**: Docker-based code execution with resource limits
- ⚡ **Real-time Updates**: WebSocket-powered submission status
- 🏆 **Leaderboards**: Global and problem-specific rankings
- 📅 **Daily Challenge**: Featured problem every day

## 🏗️ Architecture

```
CodeLab/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   ├── api/          # Express.js backend
│   └── worker/       # Code execution worker
├── packages/
│   └── shared/       # Shared types & utilities
├── docker/
│   └── images/       # Execution environment Dockerfiles
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker (for code execution)
- MongoDB (local or cloud)
- Redis (for job queue)

### Installation

```bash
# Clone the repository
git clone https://github.com/AbinashIIITB/codelab-judge-system.git
cd codelab-judge-system

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

### Build the execution images

Do this **before** submitting anything — the worker spawns one of these per test
case, and submissions fail with "image not found" until they exist.

```bash
./docker/images/build.sh

# Creates codelab-cpp, codelab-python, codelab-java and
# codelab-javascript, all tagged :latest
```

### Run with Docker Compose (Recommended)

```bash
# Start everything (Mongo and Redis included)
docker compose up -d

# Seed the database once Mongo is up
npm run db:seed

# View logs
docker compose logs -f
```

Frontend on http://localhost:3000, API on http://localhost:4000.

### Run Individually (Development)

Mongo and Redis still need to be running — `docker compose up -d mongodb redis`
is the easiest way.

```bash
# Terminal 1: Frontend
npm run dev:web    # http://localhost:3000

# Terminal 2: API Server
npm run dev:api    # http://localhost:4000

# Terminal 3: Worker Service
npm run dev:worker
```

## 📦 Deployment

### Deploy Frontend to Vercel

```bash
cd apps/web
npx vercel --prod
```

Or connect your GitHub repo to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import `AbinashIIITB/codelab-judge-system`
3. Set root directory to `apps/web`
4. Add environment variables
5. Deploy!

### Deploy API to Railway/Render

1. Connect your GitHub repo
2. Set root directory to `apps/api`
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables

### Required Environment Variables

See [.env.example](.env.example) for the annotated list. The ones that matter
in production:

```env
# API + worker
MONGODB_URI=mongodb://...
REDIS_URL=redis://...

# Required in production — the API refuses to start without them
CORS_ORIGIN=https://your-frontend.vercel.app   # comma-separated, or "*"
WORKER_API_KEY=<a real secret>                 # must match on API and worker

# Worker only — where it reaches the API's WebSocket server
API_WS_URL=https://your-api.railway.app

# Frontend
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_WS_URL=wss://your-api.railway.app
```

> **`NEXT_PUBLIC_*` is inlined at build time.** Setting it only in the runtime
> environment has no effect on the browser bundle. On Vercel, set it before
> building; with Docker, pass it as a build arg (`docker-compose.yml` already does).

Auth is not implemented yet — `next-auth` is a dependency but no provider or
route exists, so submissions are attributed to an `anonymous` user.

## 🧪 Seeded Problems

The database comes with 5 classic algorithmic problems:

1. **Two Sum** (Easy) - Array, Hash Table
2. **Reverse Linked List** (Easy) - Linked List, Recursion
3. **Valid Parentheses** (Easy) - String, Stack
4. **Merge Two Sorted Lists** (Easy) - Linked List
5. **Best Time to Buy and Sell Stock** (Medium) - Array, DP

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS, Monaco Editor |
| Backend | Express.js, Socket.IO, BullMQ |
| Database | MongoDB, Redis |
| Execution | Docker, Dockerode |
| Auth | NextAuth.js |

## 📁 Project Structure

```
apps/web/          # Next.js frontend
├── app/           # App Router pages
├── components/    # React components
└── lib/           # Utils, API client, socket

apps/api/          # Express backend
├── routes/        # API endpoints
├── models/        # MongoDB schemas
└── socket/        # WebSocket handlers

apps/worker/       # Execution worker
├── processors/    # Job processors
├── executor/      # Docker executor
└── utils/         # Output comparison
```

## 🛡️ Security

Each submission runs in a throwaway container with:

- Networking disabled (`NetworkMode: none`)
- Memory limit (256 MB default, no swap — an OOM is reported as Memory Limit Exceeded)
- CPU limit (50% of one core)
- Process limit (64 PIDs)
- `no-new-privileges` set, and the process runs as a non-root user
- A hard wall-clock kill, after which the container is force-removed

The root filesystem is writable, because the submission's source is compiled
inside the container. Isolation comes from the container being discarded after
every single test case.

`WORKER_API_KEY` is a shared secret between the API and the worker. It guards
the hidden-test-case endpoint and authenticates the worker's status relay, so
set it to a real secret in any deployment — both services refuse to start
without it when `NODE_ENV=production`.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

---

Built with ❤️ by [AbinashIIITB](https://github.com/AbinashIIITB)
