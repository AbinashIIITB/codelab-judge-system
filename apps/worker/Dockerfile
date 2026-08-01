FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy every workspace manifest — `npm ci` validates the whole workspace tree
# against the lockfile and fails if any of them are missing.
COPY package.json package-lock.json* tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/worker/package.json ./apps/worker/
COPY packages/shared/package.json ./packages/shared/

# @codelab/shared has a `prepare` script that runs tsc on install, so its
# sources must be present before npm ci or the install fails with no inputs.
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared package first
RUN npm run build --workspace=@codelab/shared
# Build worker
RUN npm run build --workspace=@codelab/worker

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
# Copy shared package so the node_modules/@codelab/shared symlink resolves correctly
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/src ./packages/shared/src
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

EXPOSE 4001

CMD ["node", "dist/worker.js"]
