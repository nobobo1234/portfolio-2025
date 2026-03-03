# Stage 1: Build the application using Node.js (more stable for SvelteKit builds)
FROM node:20-slim AS builder
WORKDIR /app

# Install Bun to handle dependencies
RUN npm install -g bun

# Copy dependency files
COPY package.json bun.lockb* package-lock.json* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

ENV CI=true

# Build the application using Node.js
RUN npm run build

# Prune dev dependencies (create a clean node_modules for production)
RUN rm -rf node_modules && bun install --production --no-frozen-lockfile

# Stage 2: Production runtime
# Use node:20-slim (Debian/glibc) to match the builder – required for sharp's
# prebuilt native libvips binaries (they are glibc-linked and won't run on musl/Alpine).
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Match the port in svelte.config.js
ENV PORT=4800
# Allow external connections (essential for Docker)
ENV HOST=0.0.0.0

# Create a non-root user for security
RUN addgroup --system --gid 1001 sveltekit
RUN adduser --system --uid 1001 sveltekit

# Copy the built application and dependencies from the builder stage
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

# Start the SvelteKit server directly with Node
CMD ["node", "build/index.js"]
