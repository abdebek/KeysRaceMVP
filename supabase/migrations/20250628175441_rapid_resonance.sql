/*
  # AI Cache Analytics Table

  1. New Tables
    - `ai_cache_analytics` - Track AI cache performance and usage
    - `ai_usage_quotas` - Manage AI API usage limits per user

  2. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- AI Cache Analytics table
CREATE TABLE IF NOT EXISTS ai_cache_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  cache_key text NOT NULL,
  analysis_type text NOT NULL,
  cache_hit boolean DEFAULT false,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- AI Usage Quotas table
CREATE TABLE IF NOT EXISTS ai_usage_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quota_type text NOT NULL CHECK (quota_type IN ('daily', 'monthly')),
  requests_used integer DEFAULT 0,
  requests_limit integer NOT NULL,
  reset_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quota_type)
);

-- Enable RLS
ALTER TABLE ai_cache_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_quotas ENABLE ROW LEVEL SECURITY;

-- Policies for ai_cache_analytics
CREATE POLICY "Users can read own cache analytics"
  ON ai_cache_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for ai_usage_quotas
CREATE POLICY "Users can read own usage quotas"
  ON ai_usage_quotas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_cache_analytics_user_id ON ai_cache_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_analytics_created_at ON ai_cache_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_analytics_cache_key ON ai_cache_analytics(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_usage_quotas_user_id ON ai_usage_quotas(user_id);

-- Function to check and update AI usage quota
CREATE OR REPLACE FUNCTION check_ai_quota(user_id_param uuid, quota_type_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_quota RECORD;
  quota_limit integer;
BEGIN
  -- Get current quota
  SELECT * INTO current_quota
  FROM ai_usage_quotas
  WHERE user_id = user_id_param AND quota_type = quota_type_param;

  -- Set default limits
  quota_limit := CASE 
    WHEN quota_type_param = 'daily' THEN 50
    WHEN quota_type_param = 'monthly' THEN 1000
    ELSE 10
  END;

  -- Create quota record if it doesn't exist
  IF current_quota IS NULL THEN
    INSERT INTO ai_usage_quotas (user_id, quota_type, requests_used, requests_limit, reset_date)
    VALUES (
      user_id_param, 
      quota_type_param, 
      1, 
      quota_limit,
      CASE 
        WHEN quota_type_param = 'daily' THEN CURRENT_DATE + INTERVAL '1 day'
        WHEN quota_type_param = 'monthly' THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      END
    );
    RETURN true;
  END IF;

  -- Check if quota needs reset
  IF current_quota.reset_date <= NOW() THEN
    UPDATE ai_usage_quotas
    SET 
      requests_used = 1,
      reset_date = CASE 
        WHEN quota_type_param = 'daily' THEN CURRENT_DATE + INTERVAL '1 day'
        WHEN quota_type_param = 'monthly' THEN DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      END
    WHERE user_id = user_id_param AND quota_type = quota_type_param;
    RETURN true;
  END IF;

  -- Check if under quota
  IF current_quota.requests_used < current_quota.requests_limit THEN
    UPDATE ai_usage_quotas
    SET requests_used = requests_used + 1
    WHERE user_id = user_id_param AND quota_type = quota_type_param;
    RETURN true;
  END IF;

  -- Over quota
  RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_ai_quota(uuid, text) TO authenticated;