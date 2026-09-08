FROM node:20-alpine AS base
WORKDIR /app
RUN npm i -g turbo

FROM base AS builder
COPY . .
RUN turbo prune --scope=@codearena/web --docker

FROM base AS installer
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

FROM installer AS runner
COPY --from=builder /app/out/full/ .
RUN npm run build --workspace=apps/web

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=apps/web"]
