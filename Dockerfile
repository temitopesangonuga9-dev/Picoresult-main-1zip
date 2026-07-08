FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

RUN test -f node_modules/.bin/vite && echo "vite binary OK" || (echo "VITE BINARY MISSING" && exit 1)

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "if [ -z \"$DATABASE_URL\" ]; then echo 'FATAL: DATABASE_URL is empty or unset'; else echo 'DATABASE_URL is set, length:' ${#DATABASE_URL}; fi; psql \"$DATABASE_URL\" -f schema.sql && npx tsx server/index.ts"]
