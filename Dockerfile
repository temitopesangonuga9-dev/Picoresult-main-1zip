FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Run install, then unconditionally dump the npm debug log and directory
# listing directly into the build output so we can see exactly what happened
# without needing to expand any collapsed log lines.
RUN npm install --loglevel verbose; \
    echo "---- NPM DEBUG LOG ----"; \
    cat /root/.npm/_logs/*-debug-0.log 2>/dev/null || echo "no debug log found"; \
    echo "---- /app CONTENTS ----"; \
    ls -la /app; \
    echo "---- node_modules CONTENTS (if any) ----"; \
    ls -la /app/node_modules 2>/dev/null || echo "NO node_modules DIRECTORY WAS CREATED"

RUN test -f node_modules/.bin/vite && echo "vite binary OK" || (echo "VITE BINARY MISSING" && exit 1)

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "psql \"$DATABASE_URL\" -f schema.sql && npx tsx server/index.ts"]
