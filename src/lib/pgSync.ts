import { Database } from '../data';

const API = '/api';

export const syncDatabase = (
  onUpdate: (db: Database) => void,
  onError: (err: any) => void
) => {
  let lastUpdated: string | null = null;
  let stopped = false;

  const loadFull = async () => {
    const res = await fetch(`${API}/sync`);
    if (!res.ok) throw new Error(`Sync failed: HTTP ${res.status}`);
    const { db } = await res.json();
    onUpdate(db as Database);
  };

  const poll = async () => {
    if (stopped) return;
    try {
      const res = await fetch(`${API}/updated-at`);
      if (!res.ok) return;
      const { lastUpdated: serverTime } = await res.json();
      if (serverTime && serverTime !== lastUpdated) {
        lastUpdated = serverTime;
        await loadFull();
      }
    } catch {
      // silent — retries on next interval
    }
  };

  // Initial full load
  loadFull()
    .then(() =>
      fetch(`${API}/updated-at`)
        .then(r => r.json())
        .then(({ lastUpdated: t }) => { lastUpdated = t; })
        .catch(() => {})
    )
    .catch(onError);

  const interval = setInterval(poll, 3000);
  return () => { stopped = true; clearInterval(interval); };
};

export const saveDatabaseToFirestore = async (newDb: Database, oldDb?: Database) => {
  const res = await fetch(`${API}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newDb, oldDb }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Save failed: HTTP ${res.status}`);
  }
};
