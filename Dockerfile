# Use official Bun image as base
FROM oven/bun:latest as builder

# Set working directory
WORKDIR /app

# Copy package files (enables better layer caching)
COPY package.json bun.lock ./
COPY packages/docs/package.json ./packages/docs/package.json

# Install dependencies (production only for final image)
RUN bun install --frozen-lockfile --production

# Copy all files needed for build
COPY packages/docs ./packages/docs
COPY packages/bunxyz ./packages/bunxyz  # Assuming docs depends on bunxyz

# Build the docs application
RUN bun run --filter docs build

# Production stage
FROM oven/bun:slim

WORKDIR /app

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/docs/node_modules ./packages/docs/node_modules

# Copy built application
COPY --from=builder /app/packages/docs/.next ./packages/docs/.next
COPY --from=builder /app/packages/docs/public ./packages/docs/public
COPY --from=builder /app/packages/docs/package.json ./packages/docs/package.json

# Expose Next.js default port
EXPOSE 3000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/ || exit 1

# Run the production server
CMD ["bun", "run", "--filter", "docs", "start"]