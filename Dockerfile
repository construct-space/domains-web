# Stage 1 — build the Vue SPA
FROM oven/bun:1.3-alpine AS build

WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 2 — nginx serving dist/ with SPA fallback + /api proxy to
# domains-api.lisaos.dev so the public search works same-origin.
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
