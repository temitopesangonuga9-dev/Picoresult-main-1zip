import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const ARRAY_COLLECTIONS = [
  'admins', 'students', 'classes', 'subjects', 'teachers',
  'scores', 'affectiveTraits', 'psychomotorSkills',
  'subjectAssignments', 'classTeacherAssignments', 'scoreComponents',
];

function getDocId(colName: string, item: any): string {
  if (colName === 'scores') {
    return `${item.studentId}_${item.subjectId}_${item.session}_${item.term}`.replace(/\//g, '-');
  }
  if (colName === 'affectiveTraits' || colName === 'psychomotorSkills') {
    return `${item.studentId}_${item.session}_${item.term}`.replace(/\//g, '-');
  }
  return item.id || '';
}

app.get('/api/sync', async (_req, res) => {
  try {
    const [colRes, setRes] = await Promise.all([
      pool.query('SELECT collection, data FROM collections ORDER BY collection'),
      pool.query("SELECT data FROM settings WHERE key = 'main'"),
    ]);

    const db: any = {
      admins: [], students: [], classes: [], subjects: [],
      teachers: [], scores: [], affectiveTraits: [], psychomotorSkills: [],
      subjectAssignments: [], classTeacherAssignments: [], scoreComponents: [],
      sessions: [], terms: [], schoolSettings: {}, reportCardLayout: {},
    };

    for (const row of colRes.rows) {
      if (Array.isArray(db[row.collection])) {
        db[row.collection].push(row.data);
      }
    }

    if (setRes.rows.length > 0) {
      const s = setRes.rows[0].data;
      db.sessions = s.sessions || [];
      db.terms = s.terms || [];
      db.schoolSettings = s.schoolSettings || {};
      db.reportCardLayout = s.reportCardLayout || {};
    }

    res.json({ success: true, db });
  } catch (err: any) {
    console.error('Sync error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/updated-at', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT GREATEST(
        (SELECT MAX(updated_at) FROM collections),
        (SELECT MAX(updated_at) FROM settings)
      ) AS last_updated
    `);
    res.json({ lastUpdated: result.rows[0].last_updated?.toISOString() ?? null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save', async (req, res) => {
  const { newDb, oldDb } = req.body;
  if (!newDb) return res.status(400).json({ success: false, error: 'newDb required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const settingsChanged = !oldDb ||
      JSON.stringify(oldDb.sessions) !== JSON.stringify(newDb.sessions) ||
      JSON.stringify(oldDb.terms) !== JSON.stringify(newDb.terms) ||
      JSON.stringify(oldDb.schoolSettings) !== JSON.stringify(newDb.schoolSettings) ||
      JSON.stringify(oldDb.reportCardLayout) !== JSON.stringify(newDb.reportCardLayout);

    if (settingsChanged) {
      await client.query(
        `INSERT INTO settings (key, data, updated_at) VALUES ('main', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = NOW()`,
        [JSON.stringify({
          sessions: newDb.sessions,
          terms: newDb.terms,
          schoolSettings: newDb.schoolSettings,
          reportCardLayout: newDb.reportCardLayout,
        })]
      );
    }

    for (const colName of ARRAY_COLLECTIONS) {
      const newItems: any[] = newDb[colName] || [];
      const oldItems: any[] | undefined = oldDb?.[colName];

      if (oldItems && JSON.stringify(newItems) === JSON.stringify(oldItems)) continue;

      const newIds = new Set(newItems.map((item: any) => getDocId(colName, item)));

      if (oldItems) {
        const deletedIds = oldItems
          .map((item: any) => getDocId(colName, item))
          .filter((id: string) => id && !newIds.has(id));
        for (const id of deletedIds) {
          await client.query(
            'DELETE FROM collections WHERE collection = $1 AND doc_id = $2',
            [colName, id]
          );
        }
      }

      for (const item of newItems) {
        const docId = getDocId(colName, item);
        if (docId) {
          await client.query(
            `INSERT INTO collections (collection, doc_id, data, updated_at) VALUES ($1, $2, $3, NOW())
             ON CONFLICT (collection, doc_id) DO UPDATE SET data = $3, updated_at = NOW()`,
            [colName, docId, JSON.stringify(item)]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Save error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

const PORT = parseInt(process.env.API_PORT || '3001', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
