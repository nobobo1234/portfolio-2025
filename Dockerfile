# Stage 1: Build the application using Node.js (more stable for SvelteKit builds)
FROM node:20-slim AS builder
WORKDIR /app

# Install Bun to handle dependencies
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g bun

# Copy dependency files
COPY package.json bun.lockb* package-lock.json* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

ENV CI=true

# Receive DATABASE_URL from docker-compose build args (sourced from .env).
# Only needed to satisfy prisma.config.ts at load time; no DB connection is made.
ARG DATABASE_URL
# svelte-kit sync generates .svelte-kit/tsconfig.json, which tsconfig.json extends.
# prisma.config.ts is compiled via TypeScript and requires it to be present first.
RUN npx svelte-kit sync && npx prisma generate

# Build the application using Node.js
RUN npm run build

# Prune dev dependencies (create a clean node_modules for production)
RUN rm -rf node_modules && bun install --production --no-frozen-lockfile

# Stage 2: One-off seeder – runs migrations and seeds the DB, then exits.
# Contains source code intentionally; it never serves traffic.
FROM node:20-slim AS seeder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g tsx

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/src ./src

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]

# Stage 3: Production runtime – lean, no source code.
# Use node:20-slim (Debian/glibc) to match the builder – required for sharp's
# prebuilt native libvips binaries (they are glibc-linked and won't run on musl/Alpine).
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Match the port in svelte.config.js
ENV PORT=4800
# Allow external connections (essential for Docker)
ENV HOST=0.0.0.0

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN addgroup --system --gid 1001 sveltekit
RUN adduser --system --uid 1001 sveltekit

# Copy only the built application and production dependencies
COPY --from=builder --chown=sveltekit:sveltekit /app/build ./build
COPY --from=builder --chown=sveltekit:sveltekit /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:sveltekit /app/package.json ./package.json

# Create persistent directories and make them writable by the app user.
# Both are bind-mounted from Docker named volumes in production.
RUN mkdir -p /app/uploads /app/db && chown sveltekit:sveltekit /app/uploads /app/db

# Switch to non-root user
USER sveltekit

# Expose the application port
EXPOSE 4800

CMD ["node", "build/index.js"]
