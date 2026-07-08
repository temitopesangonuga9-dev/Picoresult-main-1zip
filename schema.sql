-- schema.sql
-- Migration for Picoresult (PostgreSQL backend)
-- Mirrors the old Firestore document-store shape: generic collections + a single settings row.

CREATE TABLE IF NOT EXISTS collections (
  collection TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection, doc_id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_collection ON collections (collection);
CREATE INDEX IF NOT EXISTS idx_collections_updated_at ON collections (updated_at);
