# Dockerfile for Picoresult (Vite/React frontend + Express/Postgres API)
# Using node:20-slim (Debian) instead of alpine — avoids musl/glibc native binary
# mismatches that break esbuild/vite/tailwindcss on Alpine.
FROM node:20-slim

# psql is needed to apply schema.sql on container start
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the Vite frontend (outputs to /app/dist)
RUN npm run build

EXPOSE 3001

# Apply schema (safe to run every deploy — uses IF NOT EXISTS), then start the API
# which also serves the built frontend.
CMD ["sh", "-c", "psql \"$DATABASE_URL\" -f schema.sql && npx tsx server/index.ts"]
