# Dockerfile for Picoresult (Vite/React frontend + Express/Postgres API)
FROM node:20-alpine

# psql is needed to apply schema.sql on container start
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the Vite frontend (outputs to /app/dist)
RUN npm run build

EXPOSE 3001

# Apply schema (safe to run every deploy — uses IF NOT EXISTS), then start the API
# which also serves the built frontend (see server/index.ts changes).
CMD sh -c "psql \$DATABASE_URL -f schema.sql && npx tsx server/index.ts"
