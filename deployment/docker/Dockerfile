## Multi-stage Dockerfile for Next.js (standalone)
##  - Builds the app in a builder stage
##  - Produces a small runtime image containing only the standalone output
## Auto trigger test: Updated on Oct 13, 2025

# Use a full Node image for build stage (alpine is fine, but include libc)
FROM node:18-alpine AS base

# Install build dependencies for the builder stage
RUN apk add --no-cache libc6-compat python3 make g++ dumb-init

WORKDIR /app

# Install deps only when package.json or lockfile change
FROM base AS deps
COPY package.json package-lock.json* ./
# Use npm ci to provide reproducible installs. Install prod+optional only in builder
RUN npm ci --only=production && npm cache clean --force

# Builder: copy source and build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments from system environment
ARG MONGODB_URL=mongodb://localhost:27017/vucar-build
ARG NEXTAUTH_URL=http://localhost:3000
ARG NEXTAUTH_SECRET=build-dummy-secret-32-chars-long-abc123def456
ARG JWT_SECRET=build-dummy-jwt-secret
ARG ENCRYPTION_KEY=build-dummy-encryption-key
ARG NODE_ENV=production

# Set environment variables for build process
ENV MONGODB_URL=$MONGODB_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV JWT_SECRET=$JWT_SECRET
ENV ENCRYPTION_KEY=$ENCRYPTION_KEY
ENV NODE_ENV=$NODE_ENV

# Ensure Next is configured to output standalone server (next.config.js: output: 'standalone')
RUN npm run build

# Runner: use a minimal image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only the standalone output (server.js + node_modules packaged by Next) and public/static files
# The standalone output places a package.json and node_modules inside the standalone dir
COPY --from=builder /app/.next/standalone/ .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Ensure ownership and sensible defaults
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
