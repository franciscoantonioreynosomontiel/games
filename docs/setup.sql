-- Setup tables for GameHub
-- Note: Replace 'anon' and 'authenticated' with proper roles if needed.

-- USERS TABLE
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SCORES TABLE
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id),
    game_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    difficulty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- POLICIES for app_users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read' AND tablename = 'app_users') THEN
        CREATE POLICY "Allow public read" ON app_users FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert' AND tablename = 'app_users') THEN
        CREATE POLICY "Allow public insert" ON app_users FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update' AND tablename = 'app_users') THEN
        CREATE POLICY "Allow public update" ON app_users FOR UPDATE USING (true);
    END IF;
END
$$;

-- POLICIES for game_scores
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public score select' AND tablename = 'game_scores') THEN
        CREATE POLICY "Allow public score select" ON game_scores FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public score insert' AND tablename = 'game_scores') THEN
        CREATE POLICY "Allow public score insert" ON game_scores FOR INSERT WITH CHECK (true);
    END IF;
END
$$;

-- Insert a default admin if not exists (Password: Asd123)
-- In a real app, use Supabase Auth for encryption.
INSERT INTO app_users (username, email, password)
SELECT 'Antonio', 'antonio@gamehub.com', 'Asd123'
WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE username = 'Antonio');
