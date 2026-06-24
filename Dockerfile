FROM node:24-alpine AS build

RUN npm install -g pnpm@10.28.2

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY tsconfig.base.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN pnpm install --frozen-lockfile

COPY frontend/ frontend/
COPY backend/ backend/
RUN pnpm -C frontend build && pnpm -C backend build

RUN pnpm --filter backend deploy --legacy /app/standalone

FROM node:24-alpine AS production

WORKDIR /app

COPY --from=build /app/standalone ./
COPY --from=build /app/frontend/dist ./frontend/dist/

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/health').then(function(r){if(!r.ok)process.exit(1)}).catch(function(){process.exit(1)})"

CMD ["node", "dist/src/index.js"]
