# Build stage
FROM oven/bun:1.2.10 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile \
    && bun run build

# Runtime stage
FROM oven/bun:1.2.10 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build /app .
EXPOSE 8080
# Cloud Run sets $PORT; pass it through (default 8080 for local runs)
CMD ["bun", "run", "start"] 