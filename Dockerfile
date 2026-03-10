# Multi-stage Docker build for LeoRAG System
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 leorag

# Copy built application
COPY --from=builder --chown=leorag:nodejs /app/dist ./dist
COPY --from=deps --chown=leorag:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=leorag:nodejs /app/package.json ./package.json

USER leorag

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/index.js"]