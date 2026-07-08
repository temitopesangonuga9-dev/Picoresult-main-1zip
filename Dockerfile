FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --loglevel verbose

RUN test -f node_modules/.bin/vite && echo "vite binary OK" || (echo "VITE BINARY MISSING - install failed silently" && ls node_modules/.bin | head -50 && exit 1)

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "psql \"$DATABASE_URL\" -f schema.sql && npx tsx server/index.ts"]
