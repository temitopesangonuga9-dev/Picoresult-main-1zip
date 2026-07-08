FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Only copy package.json, NOT package-lock.json. The committed lockfile was
# generated inside Replit's environment and pins some packages (pg and its
# dependencies, cors, etc.) to Replit's internal proxy host
# (package-firewall.replit.local), which is unreachable outside Replit and
# breaks the install. Installing without the lockfile forces npm to resolve
# everything fresh against the public registry.
COPY package.json ./
RUN npm install

RUN test -f node_modules/.bin/vite && echo "vite binary OK" || (echo "VITE BINARY MISSING" && exit 1)

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "psql \"$DATABASE_URL\" -f schema.sql && npx tsx server/index.ts"]
