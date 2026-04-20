-- ============================================================
-- CFW LEAD INTEL — COMPLETE MIGRATION (no secrets)
-- Version: 2026-04-20 final
-- Paste into Supabase → SQL Editor → Run. Idempotent.
-- API keys are inserted separately (see README for INSERT statements).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- app_secrets
-- ============================================================
CREATE TABLE IF NOT EXISTS app_secrets (
  name        text PRIMARY KEY,
  value       text NOT NULL,
  description text,
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_secrets_deny_all" ON app_secrets;
CREATE POLICY "app_secrets_deny_all" ON app_secrets FOR ALL TO anon, authenticated USING (false);

-- ============================================================
-- metro_regions
-- ============================================================
CREATE TABLE IF NOT EXISTS metro_regions (
  slug            text PRIMARY KEY,
  name            text NOT NULL,
  display_name    text,
  state_primary   text NOT NULL,
  states_included text[] NOT NULL DEFAULT '{}',
  center_lat      numeric,
  center_lon      numeric,
  radius_miles    int DEFAULT 40,
  zip_prefixes    jsonb DEFAULT '{}'::jsonb,
  core_cities     text[] DEFAULT '{}',
  activated       boolean DEFAULT false,
  licensee_id     uuid,
  license_status  text DEFAULT 'available',
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS licensees (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  full_name     text, company text, phone text,
  metro_slug    text REFERENCES metro_regions(slug),
  plan_tier     text DEFAULT 'starter',
  billing_status text DEFAULT 'trial',
  seat_count    int DEFAULT 1,
  started_at    timestamptz DEFAULT now(),
  expires_at    timestamptz,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS decision_makers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              uuid REFERENCES jobs(id) ON DELETE CASCADE,
  company_name        text,
  metro_slug          text,
  full_name           text,
  first_name          text, last_name text,
  title               text, seniority text,
  email               text, email_verified boolean, email_risk text,
  phone               text, phone_line_type text, phone_verified boolean,
  dnc_status          text,
  linkedin_url        text, photo_url text,
  apollo_person_id    text, apollo_raw jsonb,
  enrichment_bundle   jsonb DEFAULT '{}'::jsonb,
  profile             jsonb,
  profile_built_at    timestamptz,
  profile_confidence  numeric,
  intel_package       jsonb,
  intel_built_at      timestamptz,
  approach_mode       text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dm_job ON decision_makers(job_id);
CREATE INDEX IF NOT EXISTS idx_dm_metro ON decision_makers(metro_slug);
CREATE INDEX IF NOT EXISTS idx_dm_mode ON decision_makers(approach_mode);

CREATE TABLE IF NOT EXISTS actions_queue (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_maker_id   uuid REFERENCES decision_makers(id) ON DELETE CASCADE,
  job_id              uuid REFERENCES jobs(id) ON DELETE CASCADE,
  metro_slug          text,
  step_number         int,
  action_type         text,
  channel             text,
  scheduled_for       timestamptz,
  due_date            date,
  title               text, body text,
  script_snippets     jsonb,
  status              text DEFAULT 'pending',
  completed_at        timestamptz,
  outcome             text, outcome_notes text,
  next_action_trigger text,
  estimated_duration_min int,
  created_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_actions_dm ON actions_queue(decision_maker_id);
CREATE INDEX IF NOT EXISTS idx_actions_due ON actions_queue(due_date, status);
CREATE INDEX IF NOT EXISTS idx_actions_metro ON actions_queue(metro_slug, status);

CREATE TABLE IF NOT EXISTS suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text, phone text, domain text,
  reason text, source text, metro_slug text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_supp_email ON suppressions(email);
CREATE INDEX IF NOT EXISTS idx_supp_phone ON suppressions(phone);

CREATE TABLE IF NOT EXISTS call_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_maker_id uuid REFERENCES decision_makers(id) ON DELETE CASCADE,
  direction text, duration_sec int, recording_url text,
  transcript text, sentiment numeric,
  objections_raised text[], next_step text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- EXTEND jobs with all new columns
-- ============================================================
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS metro_slug text DEFAULT 'chicago';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS primary_decision_maker_id uuid REFERENCES decision_makers(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS domain text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS zip text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dot_number text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS license_number text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS enrichment_status text DEFAULT 'pending';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS enrichment_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS street_view_analysis jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS competitor_wrap_vendor text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apollo_enriched boolean DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apollo_email text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apollo_linkedin text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS fleet_size int;

CREATE INDEX IF NOT EXISTS idx_jobs_metro ON jobs(metro_slug);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_score ON jobs(score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_dot ON jobs(dot_number);

UPDATE jobs SET metro_slug = 'chicago' WHERE metro_slug IS NULL;

-- ============================================================
-- SEED: 20 metros
-- ============================================================
INSERT INTO metro_regions (slug, name, display_name, state_primary, states_included, center_lat, center_lon, radius_miles, activated, license_status) VALUES
('chicago','Chicago','Chicagoland','IL',ARRAY['IL','IN','WI'],41.8781,-87.6298,40,true,'reserved'),
('nyc','New York','NYC Metro','NY',ARRAY['NY','NJ','CT'],40.7128,-74.0060,40,false,'available'),
('la','Los Angeles','LA Metro','CA',ARRAY['CA'],34.0522,-118.2437,40,false,'available'),
('houston','Houston','Houston Metro','TX',ARRAY['TX'],29.7604,-95.3698,40,false,'available'),
('dallas','Dallas','Dallas-Fort Worth','TX',ARRAY['TX'],32.7767,-96.7970,40,false,'available'),
('phoenix','Phoenix','Phoenix Metro','AZ',ARRAY['AZ'],33.4484,-112.0740,40,false,'available'),
('atlanta','Atlanta','Atlanta Metro','GA',ARRAY['GA'],33.7490,-84.3880,40,false,'available'),
('miami','Miami','South Florida','FL',ARRAY['FL'],25.7617,-80.1918,40,false,'available'),
('philadelphia','Philadelphia','Philly Metro','PA',ARRAY['PA','NJ','DE'],39.9526,-75.1652,40,false,'available'),
('boston','Boston','Greater Boston','MA',ARRAY['MA','NH'],42.3601,-71.0589,40,false,'available'),
('dc','Washington DC','DMV Metro','DC',ARRAY['DC','MD','VA'],38.9072,-77.0369,40,false,'available'),
('seattle','Seattle','Puget Sound','WA',ARRAY['WA'],47.6062,-122.3321,40,false,'available'),
('denver','Denver','Denver Metro','CO',ARRAY['CO'],39.7392,-104.9903,40,false,'available'),
('minneapolis','Minneapolis','Twin Cities','MN',ARRAY['MN','WI'],44.9778,-93.2650,40,false,'available'),
('detroit','Detroit','Detroit Metro','MI',ARRAY['MI'],42.3314,-83.0458,40,false,'available'),
('tampa','Tampa','Tampa Bay','FL',ARRAY['FL'],27.9506,-82.4572,40,false,'available'),
('charlotte','Charlotte','Charlotte Metro','NC',ARRAY['NC','SC'],35.2271,-80.8431,40,false,'available'),
('nashville','Nashville','Nashville Metro','TN',ARRAY['TN'],36.1627,-86.7816,40,false,'available'),
('san_diego','San Diego','San Diego County','CA',ARRAY['CA'],32.7157,-117.1611,40,false,'available'),
('portland','Portland','Portland Metro','OR',ARRAY['OR','WA'],45.5152,-122.6784,40,false,'available')
ON CONFLICT (slug) DO UPDATE SET activated = EXCLUDED.activated;

-- Chicago zip prefixes + core cities
UPDATE metro_regions SET
  zip_prefixes = '{"IL":["600","601","602","603","604","605","606","607","608"],"IN":["463","464"],"WI":["531"]}'::jsonb,
  core_cities = ARRAY['CHICAGO','CICERO','OAK PARK','BERWYN','EVANSTON','SKOKIE','LINCOLNWOOD','PARK RIDGE','NILES','MORTON GROVE','HARWOOD HEIGHTS','NORRIDGE','FOREST PARK','ELMWOOD PARK','RIVER FOREST','OAK LAWN','BURBANK','EVERGREEN PARK','CHICAGO RIDGE','BRIDGEVIEW','BLUE ISLAND','ALSIP','OAK FOREST','ORLAND PARK','TINLEY PARK','COUNTRY CLUB HILLS','MATTESON','MARKHAM','HARVEY','DOLTON','SOUTH HOLLAND','CALUMET CITY','LANSING','SAUK VILLAGE','CHICAGO HEIGHTS','ROBBINS','POSEN','PALOS HEIGHTS','PALOS PARK','HICKORY HILLS','JUSTICE','WILLOW SPRINGS','LA GRANGE','WESTERN SPRINGS','BROOKFIELD','RIVERSIDE','LYONS','MELROSE PARK','FRANKLIN PARK','BELLWOOD','MAYWOOD','BROADVIEW','WESTCHESTER','HILLSIDE','LA GRANGE PARK','WILMETTE','KENILWORTH','WINNETKA','GLENCOE','HIGHLAND PARK','NORTHBROOK','GLENVIEW','DES PLAINES','ROSEMONT','MOUNT PROSPECT','ARLINGTON HEIGHTS','PROSPECT HEIGHTS','ROLLING MEADOWS','PALATINE','HOFFMAN ESTATES','SCHAUMBURG','ELK GROVE VILLAGE','ITASCA','ROSELLE','WOOD DALE','BENSENVILLE','HANOVER PARK','STREAMWOOD','BARTLETT','NAPERVILLE','WHEATON','LOMBARD','DOWNERS GROVE','WESTMONT','CLARENDON HILLS','HINSDALE','OAK BROOK','ELMHURST','ADDISON','VILLA PARK','GLEN ELLYN','CAROL STREAM','BLOOMINGDALE','WARRENVILLE','LISLE','WOODRIDGE','BOLINGBROOK','WEST CHICAGO','WAUKEGAN','GURNEE','LIBERTYVILLE','LAKE FOREST','LAKE BLUFF','DEERFIELD','MUNDELEIN','VERNON HILLS','LAKE ZURICH','BUFFALO GROVE','WHEELING','LINCOLNSHIRE','BARRINGTON','JOLIET','PLAINFIELD','ROMEOVILLE','LOCKPORT','CREST HILL','NEW LENOX','FRANKFORT','MOKENA','HOMER GLEN','LEMONT','SHOREWOOD','PARK FOREST','RICHTON PARK','UNIVERSITY PARK','ELGIN','AURORA','GENEVA','ST CHARLES','BATAVIA','NORTH AURORA','SOUTH ELGIN','CARPENTERSVILLE','HUNTLEY','CRYSTAL LAKE','MCHENRY','WOODSTOCK','ALGONQUIN','LAKE IN THE HILLS','CARY','OSWEGO','YORKVILLE','MONTGOMERY','HAMMOND','EAST CHICAGO','GARY','MERRILLVILLE','CROWN POINT','SCHERERVILLE','HIGHLAND','MUNSTER','GRIFFITH','DYER','ST JOHN','HOBART','LAKE STATION','WHITING','VALPARAISO','PORTAGE','CHESTERTON','KENOSHA','PLEASANT PRAIRIE']
WHERE slug='chicago';

-- Roy as Chicago licensee
INSERT INTO licensees (email, full_name, company, metro_slug, plan_tier, billing_status)
VALUES ('roy@chicagofleetwraps.com', 'Roy Alkalay', 'Chicago Fleet Wraps', 'chicago', 'enterprise', 'active')
ON CONFLICT (email) DO NOTHING;

UPDATE metro_regions SET licensee_id = (SELECT id FROM licensees WHERE email = 'roy@chicagofleetwraps.com')
WHERE slug = 'chicago';

-- ============================================================
-- DONE — verify
-- ============================================================
SELECT 'app_secrets' AS t, COUNT(*) AS n FROM app_secrets
UNION ALL SELECT 'metro_regions', COUNT(*) FROM metro_regions
UNION ALL SELECT 'licensees', COUNT(*) FROM licensees
UNION ALL SELECT 'decision_makers', COUNT(*) FROM decision_makers
UNION ALL SELECT 'actions_queue', COUNT(*) FROM actions_queue
UNION ALL SELECT 'jobs (chicago)', COUNT(*) FROM jobs WHERE metro_slug='chicago';
