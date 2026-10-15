/*
# Create snippets table for Developer Snippet Vault

1. New Tables
- `snippets`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users with cascade delete)
  - `title` (text, not null)
  - `description` (text, nullable - AI-generated summary)
  - `code` (text, not null - the code content)
  - `language` (text, not null - programming language for syntax highlighting)
  - `tags` (text array, default empty - AI-generated tags)
  - `is_favorite` (boolean, default false)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
2. Security
- Enable RLS on `snippets`.
- Owner-scoped CRUD: each authenticated user can only SELECT, INSERT, UPDATE, DELETE their own rows.
- Uses `auth.uid()` for ownership checks.
- `user_id` defaults to `auth.uid()` so client inserts omitting user_id still satisfy WITH CHECK.
3. Indexes
- Index on `user_id` for fast per-user queries.
- Index on `created_at` for sorted dashboard listings.
*/

CREATE TABLE IF NOT EXISTS snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  code text NOT NULL,
  language text NOT NULL,
  tags text[] DEFAULT '{}',
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_snippets" ON snippets;
CREATE POLICY "select_own_snippets" ON snippets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_snippets" ON snippets;
CREATE POLICY "insert_own_snippets" ON snippets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_snippets" ON snippets;
CREATE POLICY "update_own_snippets" ON snippets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_snippets" ON snippets;
CREATE POLICY "delete_own_snippets" ON snippets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at DESC);
