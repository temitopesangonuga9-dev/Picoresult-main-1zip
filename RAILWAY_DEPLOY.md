# Deploying Picoresult to Railway

## Files in this package
- `Dockerfile` — builds the Vite frontend and runs the Express/Postgres API
- `schema.sql` — creates the two Postgres tables (`collections`, `settings`); safe to re-run on every deploy
- `server/index.ts` — drop-in replacement for your existing file. Only change from your original: added `express.static` + a catch-all route so the built frontend is served, plus static file imports (`path`, `url`) at the top.

## Steps

1. **Copy these files into your repo**
   - Replace `server/index.ts` with the one here (or manually add the static-serving lines to yours).
   - Add `schema.sql` and `Dockerfile` to the repo root.
   - Commit and push to GitHub.

2. **Create a Railway project**
   - New Project -> Deploy from GitHub repo -> pick `Picoresult-main-1zip`.
   - Railway will detect the `Dockerfile` automatically.

3. **Add PostgreSQL**
   - In the same Railway project: "+ New" -> Database -> PostgreSQL.
   - Railway auto-injects `DATABASE_URL` into your app service — no manual setup needed.

4. **Set environment variables** (Railway service -> Variables tab)
   - `API_PORT` = `3001` (or leave unset, it defaults to 3001)
   - `GEMINI_API_KEY` = your Gemini key (used by `@google/genai`)
   - Any other keys your app reads from `.env` locally — check `.env.example` in your repo and mirror each one here.

5. **Deploy**
   - Railway builds the Docker image, which runs `npm run build` (Vite) then applies `schema.sql` and starts the server with `tsx server/index.ts`.
   - Your Express server now serves both the API (`/api/...`) and the built frontend on the same Railway URL/port.

6. **Verify**
   - Visit the Railway-provided URL — the app should load.
   - Check `/api/updated-at` returns JSON — confirms the DB connection and tables are working.

## Note
If `vite build` in your repo outputs somewhere other than `dist/`, update `server/index.ts` (`path.join(__dirname, '../dist')` appears twice) and `vite.config.ts`'s `build.outDir` to match.
