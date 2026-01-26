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

# Seed the database with sample problems
npm run db:seed
```

### Run with Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Run Individually (Development)

```bash
# Terminal 1: Frontend
npm run dev:web    # http://localhost:3000

# Terminal 2: API Server
npm run dev:api    # http://localhost:4000

# Terminal 3: Worker Service
npm run dev:worker
```

### Build Docker Execution Images

```bash
cd docker/images
chmod +x build.sh
./build.sh

# This creates:
# - codelab-cpp:latest
# - codelab-python:latest
# - codelab-java:latest
# - codelab-javascript:latest
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

```env
# Database
MONGODB_URI=mongodb://...
REDIS_URL=redis://...

# Auth (NextAuth.js)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# OAuth (Optional)
GITHUB_ID=...
GITHUB_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# API URLs (for frontend)
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_WS_URL=wss://your-api.railway.app
```

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

- Docker containers run with:
  - Network disabled
  - Memory limits (256MB default)
  - CPU limits (50%)
  - Process limits (64 PIDs)
  - Read-only root filesystem
  - Non-root user

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

---

Built with ❤️ by [AbinashIIITB](https://github.com/AbinashIIITB)
