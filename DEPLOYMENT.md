# Deploying CodeLab

## The one constraint that shapes everything

CodeLab runs untrusted code. That needs either a Docker daemon it can spawn
sandbox containers on, or an external execution service. **Managed free tiers
(Vercel, Render free, Netlify) do not give you a Docker socket**, so the worker
cannot run there.

The public Piston API at `emkc.org` used to be the way around this. It became
**whitelist-only on 2026-02-15** and now returns `401` to everyone, so
`EXECUTOR_TYPE=piston` against the public endpoint no longer works.

That leaves three honest options:

| Option | Cost | Card needed | Notes |
|---|---|---|---|
| **A.** One small VM running everything via `docker compose` | Free with student credits | Depends on provider | Simplest, and the worker actually works |
| **B.** Managed frontend + API, self-hosted worker + Piston | Free | Only for the VM | More moving parts, better cold-start behaviour |
| **C.** Managed everything, hosted judge API (Judge0) | Free tier limits | No | Needs a RapidAPI key; ~50 runs/day free |

Option A is recommended. Everything below assumes you pick one.

---

## Getting a free machine

You are almost certainly eligible for the [GitHub Student Developer
Pack](https://education.github.com/pack) — it is free and needs no card:

- **DigitalOcean** — $200 credit for 12 months. A $6/mo droplet runs this whole
  stack for the entire year and change.
- **Microsoft Azure** — $100 credit, no card.
- **MongoDB Atlas** — $50 credit on top of the always-free M0 tier.
- **Namecheap** — a free `.me` domain for a year.

Without student status, **Oracle Cloud Always Free** gives a genuinely
free-forever ARM VM (4 cores / 24 GB) that is more than enough. It asks for a
card for identity verification but does not charge it.

---

## Option A — single VM, everything self-hosted

On any Ubuntu box with Docker installed:

```bash
git clone https://github.com/AbinashIIITB/codelab-judge-system.git
cd codelab-judge-system

cp .env.example .env
# Set at minimum:
#   WORKER_API_KEY=<a real secret>
#   CORS_ORIGIN=http://<your-server-ip>:3000
#   NEXT_PUBLIC_API_URL=http://<your-server-ip>:4000
#   NEXT_PUBLIC_WS_URL=ws://<your-server-ip>:4000

# Sandbox images the worker spawns, one container per test case
./docker/images/build.sh

docker compose up -d --build
npm ci && npm run db:seed
```

Frontend on `:3000`, API on `:4000`. To judge through a private Piston instance
instead of spawning containers directly:

```bash
EXECUTOR_TYPE=piston docker compose --profile piston up -d
```

Put a reverse proxy (Caddy gets you HTTPS in two lines) in front before exposing
it publicly, and rebuild the web image afterwards so `NEXT_PUBLIC_*` picks up the
real domain — those values are baked into the browser bundle at build time and a
restart will not change them.

---

## Option B — managed frontend and API

### 1. Database — MongoDB Atlas M0 (free, no card)

Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com), add a
database user, and allow access from anywhere (`0.0.0.0/0`) since Render's egress
IPs are not fixed on the free plan. Keep the connection string.

### 2. API, frontend and Redis — Render

The repo ships a [`render.yaml`](render.yaml) blueprint. From the Render
dashboard choose **New → Blueprint** and point it at this repository; it creates
the API, the frontend and a free Key-Value (Redis) instance in one step and
prompts for the values it cannot infer (`MONGODB_URI`, `CORS_ORIGIN`,
`NEXT_PUBLIC_*`).

Free web services sleep after ~15 minutes idle, so the first request after a
quiet period takes a few seconds.

### 3. Worker and Piston — your VM

Render has no free background workers, and the worker needs Docker anyway. On
the VM from the section above:

```bash
docker run -d --privileged --restart unless-stopped \
  -p 2000:2000 ghcr.io/engineer-man/piston:latest

docker run -d --restart unless-stopped \
  -e MONGODB_URI='<atlas uri>' \
  -e REDIS_URL='<render redis url>' \
  -e API_WS_URL='https://<your-api>.onrender.com' \
  -e WORKER_API_KEY='<same secret as the API>' \
  -e EXECUTOR_TYPE=piston \
  -e PISTON_URL='http://localhost:2000/api/v2/execute' \
  ghcr.io/abinashiiitb/codelab-worker:latest
```

Images are published automatically — see below.

---

## Prebuilt images

Every push to `master` builds and publishes three images to GitHub Container
Registry. GHCR is free for public repositories and authenticates with the
built-in `GITHUB_TOKEN`, so there is nothing to set up:

```
ghcr.io/abinashiiitb/codelab-api:latest
ghcr.io/abinashiiitb/codelab-worker:latest
ghcr.io/abinashiiitb/codelab-web:latest
```

Both `:latest` and a `:<commit-sha>` tag are pushed, so you can pin a deploy.

Pushes build `linux/amd64`, which is what every mainstream cloud host runs.
`linux/arm64` is emulated on GitHub's runners and takes over an hour, so it is
built only for tagged releases (`v*`) or by running the workflow manually with
the **arm64** option ticked. Do that before deploying to an ARM box such as an
Oracle Cloud Always Free instance or Apple Silicon.

For the web image, set the repository variables `NEXT_PUBLIC_API_URL` and
`NEXT_PUBLIC_WS_URL` (Settings → Secrets and variables → Actions → Variables)
before the build — they are compiled into the browser bundle and cannot be
changed at runtime.

---

## Environment variables that matter

| Variable | Where | Notes |
|---|---|---|
| `MONGODB_URI` | api, worker | |
| `REDIS_URL` | api, worker | BullMQ needs `noeviction` |
| `WORKER_API_KEY` | api, worker | **Must match.** Guards hidden test cases; the API refuses to start without it in production |
| `CORS_ORIGIN` | api | Comma-separated origins, or `*` |
| `API_WS_URL` | worker | Where the worker reaches the API's WebSocket |
| `EXECUTOR_TYPE` | worker | `docker` (default) or `piston` |
| `PISTON_URL` | worker | Your own instance — the public one is whitelist-only |
| `NEXT_PUBLIC_API_URL` | web | **Build time.** Setting it at runtime does nothing |
| `NEXT_PUBLIC_WS_URL` | web | **Build time.** |

---

## Verifying a deployment

```bash
curl https://<api>/health                          # {"status":"ok",...}
curl https://<api>/api/problems | head -c 200      # seeded problems
curl -o /dev/null -w '%{http_code}\n' \
  https://<api>/api/problems/two-sum/testcases     # must be 403
```

That last one matters: it must **not** return test cases without the
`x-api-key` header. Then submit a solution through the UI and confirm the
verdict streams in live rather than hanging on "Submitting…".

## Known gaps

- **No authentication.** Submissions are attributed to `anonymous`, and the
  `x-user-id` header is trusted if sent. Do not treat the leaderboard as
  trustworthy on a public deployment.
- Reported runtime is wall-clock and includes compilation and VM startup, so
  Java looks slower than it is.
- Memory is only reported accurately when a run is OOM-killed.
