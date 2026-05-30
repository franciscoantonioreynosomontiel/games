-- Robust Setup for GameHub
-- This script ensures consistent types to avoid "uuid vs bigint" errors.

DROP TABLE IF EXISTS game_scores CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- 1. Create app_users with UUID
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create game_scores with matching user_id type (UUID)
CREATE TABLE game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    game_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    difficulty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- POLICIES
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public select" ON app_users;
    CREATE POLICY "Allow public select" ON app_users FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow public insert" ON app_users;
    CREATE POLICY "Allow public insert" ON app_users FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public update" ON app_users;
    CREATE POLICY "Allow public update" ON app_users FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Allow score select" ON game_scores;
    CREATE POLICY "Allow score select" ON game_scores FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow score insert" ON game_scores;
    CREATE POLICY "Allow score insert" ON game_scores FOR INSERT WITH CHECK (true);
END
$$;

-- Default Admin
INSERT INTO app_users (username, email, password, role)
SELECT 'Antonio', 'antonio@gamehub.com', 'Asd123', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE username = 'Antonio');
