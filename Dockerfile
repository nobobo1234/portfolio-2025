# Stage 1: Build the application using Bun (faster)
FROM oven/bun:alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Prune dev dependencies (create a clean node_modules for production)
RUN rm -rf node_modules && bun install --production

# Stage 2: Production runtime
FROM node:20-alpine AS runner
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

# Switch to non-root user
USER sveltekit

# Expose the application port
EXPOSE 4800

# Start the SvelteKit server directly with Node
CMD ["node", "build/index.js"]
