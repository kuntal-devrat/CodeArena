FROM node:20-alpine AS builder
WORKDIR /app
COPY apps/judge/package*.json ./
COPY packages/shared/package*.json ../shared/
RUN npm ci
COPY apps/judge/src ./src
COPY apps/judge/tsconfig.json .
RUN npm run build

FROM node:20-alpine
# Install language runtimes for the judge
RUN apk add --no-cache python3 py3-pip g++ openjdk17 go rust

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# No network access — containers should be run with --network none
EXPOSE 5000
CMD ["node", "dist/index.js"]
