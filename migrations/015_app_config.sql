-- LinguaMold: app_config
CREATE TABLE IF NOT EXISTS public.app_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
