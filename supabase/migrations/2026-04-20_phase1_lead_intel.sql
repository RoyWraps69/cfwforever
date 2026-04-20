-- ============================================================
-- CFW LEAD INTEL — PHASE 1 MIGRATION
-- Paste this entire file into Supabase → SQL Editor → Run.
-- Idempotent: safe to run multiple times.
-- Version: 2026-04-20
-- ============================================================

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLE: app_secrets (API keys, held server-side only)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_secrets (
  name        text PRIMARY KEY,
  value       text NOT NULL,
  description text,
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;
-- Deny-all policy by default. Only service_role or Edge Functions can read.
DROP POLICY IF EXISTS "app_secrets_deny_all" ON app_secrets;
CREATE POLICY "app_secrets_deny_all" ON app_secrets FOR ALL TO anon, authenticated USING (false);

-- ============================================================
-- TABLE: metro_regions (20-city territory lock)
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
  license_status  text DEFAULT 'available',  -- available | sold | reserved | paused
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: licensees (SaaS buyers — one per metro)
-- ============================================================
CREATE TABLE IF NOT EXISTS licensees (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  full_name     text,
  company       text,
  phone         text,
  metro_slug    text REFERENCES metro_regions(slug),
  plan_tier     text DEFAULT 'starter', -- starter | working | enterprise
  billing_status text DEFAULT 'trial',  -- trial | active | past_due | cancelled
  seat_count    int DEFAULT 1,
  started_at    timestamptz DEFAULT now(),
  expires_at    timestamptz,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE: decision_makers (the human at the company)
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_makers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              uuid REFERENCES jobs(id) ON DELETE CASCADE,
  company_name        text,
  metro_slug          text,

  -- Identity
  full_name           text,
  first_name          text,
  last_name           text,
  title               text,
  seniority           text,  -- owner | c_suite | vp | director | manager | ic
  email               text,
  email_verified      boolean,
  email_risk          text,  -- valid | invalid | catch_all | risky | unknown
  phone               text,
  phone_line_type     text,  -- mobile | landline | voip | unknown
  phone_verified      boolean,
  dnc_status          text,  -- clear | listed | unknown
  linkedin_url        text,
  photo_url           text,

  -- Apollo-sourced raw
  apollo_person_id    text,
  apollo_raw          jsonb,

  -- Enrichment bundle (the data fed into the profile builder)
  enrichment_bundle   jsonb DEFAULT '{}'::jsonb,

  -- The 50-field psych profile (built by Claude)
  profile             jsonb,
  profile_built_at    timestamptz,
  profile_confidence  numeric,

  -- The 11-section intelligence package (built by Claude)
  intel_package       jsonb,
  intel_built_at      timestamptz,
  approach_mode       text,  -- teddy_bear | hat_in_hand | hat_in_hand_swagger | swagger | local_pride | mentor | urgency

  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dm_job ON decision_makers(job_id);
CREATE INDEX IF NOT EXISTS idx_dm_metro ON decision_makers(metro_slug);
CREATE INDEX IF NOT EXISTS idx_dm_mode ON decision_makers(approach_mode);

-- ============================================================
-- TABLE: actions_queue (TODAY'S SINGLE ACTION per lead)
-- ============================================================
CREATE TABLE IF NOT EXISTS actions_queue (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_maker_id   uuid REFERENCES decision_makers(id) ON DELETE CASCADE,
  job_id              uuid REFERENCES jobs(id) ON DELETE CASCADE,
  metro_slug          text,

  step_number         int,            -- position in 30-day sequence
  action_type         text,           -- call | email | linkedin_msg | sms | drive_by | gift | letter | research
  channel             text,
  scheduled_for       timestamptz,
  due_date            date,

  title               text,           -- "Call Mike at 7:15am"
  body                text,           -- the actual script/email
  script_snippets     jsonb,          -- array of copy-paste pieces

  status              text DEFAULT 'pending', -- pending | done | skipped | snoozed | failed
  completed_at        timestamptz,
  outcome             text,           -- answered | voicemail | sent | opened | replied | bounced
  outcome_notes       text,
  next_action_trigger text,           -- trigger_next | retry_in_X | stall

  created_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_actions_dm ON actions_queue(decision_maker_id);
CREATE INDEX IF NOT EXISTS idx_actions_due ON actions_queue(due_date, status);
CREATE INDEX IF NOT EXISTS idx_actions_metro ON actions_queue(metro_slug, status);

-- ============================================================
-- TABLE: suppressions (do-not-contact list)
-- ============================================================
CREATE TABLE IF NOT EXISTS suppressions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text,
  phone       text,
  domain      text,
  reason      text,      -- unsubscribed | bounced | dnc | complaint | manual
  source      text,
  metro_slug  text,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_supp_email ON suppressions(email);
CREATE INDEX IF NOT EXISTS idx_supp_phone ON suppressions(phone);

-- ============================================================
-- TABLE: call_log (for recorded calls → transcribed → profile update)
-- ============================================================
CREATE TABLE IF NOT EXISTS call_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_maker_id uuid REFERENCES decision_makers(id) ON DELETE CASCADE,
  direction         text,   -- outbound | inbound
  duration_sec      int,
  recording_url     text,
  transcript        text,
  sentiment         numeric,
  objections_raised text[],
  next_step         text,
  created_at        timestamptz DEFAULT now()
);

-- ============================================================
-- EXTEND: jobs — add metro_slug + decision_maker linkage
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

CREATE INDEX IF NOT EXISTS idx_jobs_metro ON jobs(metro_slug);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_score ON jobs(score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_dot ON jobs(dot_number);

-- ============================================================
-- SEED: 20 metro regions (Chicago activated, 19 dormant)
-- ============================================================
INSERT INTO metro_regions (slug, name, display_name, state_primary, states_included, center_lat, center_lon, radius_miles, zip_prefixes, core_cities, activated, license_status) VALUES
('chicago', 'Chicago', 'Chicagoland', 'IL', ARRAY['IL','IN','WI'], 41.8781, -87.6298, 40,
 '{"IL":["600","601","602","603","604","605","606","607","608"],"IN":["463","464"],"WI":["531"]}'::jsonb,
 ARRAY['CHICAGO','CICERO','OAK PARK','BERWYN','EVANSTON','SKOKIE','LINCOLNWOOD','PARK RIDGE','NILES','MORTON GROVE','HARWOOD HEIGHTS','NORRIDGE','FOREST PARK','ELMWOOD PARK','RIVER FOREST','OAK LAWN','BURBANK','EVERGREEN PARK','CHICAGO RIDGE','BRIDGEVIEW','BLUE ISLAND','ALSIP','OAK FOREST','ORLAND PARK','TINLEY PARK','COUNTRY CLUB HILLS','MATTESON','MARKHAM','HARVEY','DOLTON','SOUTH HOLLAND','CALUMET CITY','LANSING','SAUK VILLAGE','CHICAGO HEIGHTS','ROBBINS','POSEN','PALOS HEIGHTS','PALOS PARK','HICKORY HILLS','JUSTICE','WILLOW SPRINGS','LA GRANGE','WESTERN SPRINGS','BROOKFIELD','RIVERSIDE','LYONS','MELROSE PARK','FRANKLIN PARK','BELLWOOD','MAYWOOD','BROADVIEW','WESTCHESTER','HILLSIDE','LA GRANGE PARK','WILMETTE','KENILWORTH','WINNETKA','GLENCOE','HIGHLAND PARK','NORTHBROOK','GLENVIEW','DES PLAINES','ROSEMONT','MOUNT PROSPECT','ARLINGTON HEIGHTS','PROSPECT HEIGHTS','ROLLING MEADOWS','PALATINE','HOFFMAN ESTATES','SCHAUMBURG','ELK GROVE VILLAGE','ITASCA','ROSELLE','WOOD DALE','BENSENVILLE','HANOVER PARK','STREAMWOOD','BARTLETT','NAPERVILLE','WHEATON','LOMBARD','DOWNERS GROVE','WESTMONT','CLARENDON HILLS','HINSDALE','OAK BROOK','ELMHURST','ADDISON','VILLA PARK','GLEN ELLYN','CAROL STREAM','BLOOMINGDALE','WARRENVILLE','LISLE','WOODRIDGE','BOLINGBROOK','WEST CHICAGO','WINFIELD','WAYNE','WAUKEGAN','GURNEE','LIBERTYVILLE','LAKE FOREST','LAKE BLUFF','DEERFIELD','MUNDELEIN','VERNON HILLS','LAKE ZURICH','BUFFALO GROVE','WHEELING','LINCOLNSHIRE','RIVERWOODS','LAKE VILLA','ROUND LAKE','GRAYSLAKE','FOX LAKE','ANTIOCH','ZION','BEACH PARK','NORTH CHICAGO','WINTHROP HARBOR','HIGHWOOD','HAWTHORN WOODS','KILDEER','LONG GROVE','BARRINGTON','JOLIET','PLAINFIELD','ROMEOVILLE','LOCKPORT','CREST HILL','NEW LENOX','FRANKFORT','MOKENA','HOMER GLEN','LEMONT','SHOREWOOD','MINOOKA','MANHATTAN','MONEE','PEOTONE','PARK FOREST','RICHTON PARK','UNIVERSITY PARK','BEECHER','ELWOOD','BRAIDWOOD','WILMINGTON','ELGIN','AURORA','GENEVA','ST CHARLES','BATAVIA','NORTH AURORA','SOUTH ELGIN','CARPENTERSVILLE','EAST DUNDEE','WEST DUNDEE','SLEEPY HOLLOW','HUNTLEY','PINGREE GROVE','GILBERTS','LILY LAKE','MAPLE PARK','CRYSTAL LAKE','MCHENRY','WOODSTOCK','ALGONQUIN','LAKE IN THE HILLS','CARY','ISLAND LAKE','MARENGO','HARVARD','RICHMOND','SPRING GROVE','WONDER LAKE','JOHNSBURG','OSWEGO','YORKVILLE','MONTGOMERY','PLANO','NEWARK','HAMMOND','EAST CHICAGO','GARY','MERRILLVILLE','CROWN POINT','SCHERERVILLE','HIGHLAND','MUNSTER','GRIFFITH','DYER','ST JOHN','CEDAR LAKE','LOWELL','HOBART','LAKE STATION','WHITING','VALPARAISO','PORTAGE','CHESTERTON','KENOSHA','PLEASANT PRAIRIE','SOMERS','PARIS'],
 true, 'reserved'),
('nyc', 'New York', 'NYC Metro', 'NY', ARRAY['NY','NJ','CT'], 40.7128, -74.0060, 40, '{"NY":["100","101","102","103","104","105","110","111","112","113","114","115","116","117","118","119"],"NJ":["070","071","072","073","074","076","077"],"CT":["068","069"]}'::jsonb, '{}', false, 'available'),
('la', 'Los Angeles', 'LA Metro', 'CA', ARRAY['CA'], 34.0522, -118.2437, 40, '{"CA":["900","901","902","903","904","905","906","907","908","910","911","912","913","914","915","917","918"]}'::jsonb, '{}', false, 'available'),
('houston', 'Houston', 'Houston Metro', 'TX', ARRAY['TX'], 29.7604, -95.3698, 40, '{"TX":["770","771","772","773","774","775","776","777","778","779"]}'::jsonb, '{}', false, 'available'),
('dallas', 'Dallas', 'Dallas-Fort Worth', 'TX', ARRAY['TX'], 32.7767, -96.7970, 40, '{"TX":["750","751","752","753","754","760","761","762"]}'::jsonb, '{}', false, 'available'),
('phoenix', 'Phoenix', 'Phoenix Metro', 'AZ', ARRAY['AZ'], 33.4484, -112.0740, 40, '{"AZ":["850","851","852","853"]}'::jsonb, '{}', false, 'available'),
('atlanta', 'Atlanta', 'Atlanta Metro', 'GA', ARRAY['GA'], 33.7490, -84.3880, 40, '{"GA":["300","301","302","303","304","305","306"]}'::jsonb, '{}', false, 'available'),
('miami', 'Miami', 'South Florida', 'FL', ARRAY['FL'], 25.7617, -80.1918, 40, '{"FL":["330","331","332","333","334"]}'::jsonb, '{}', false, 'available'),
('philadelphia', 'Philadelphia', 'Philly Metro', 'PA', ARRAY['PA','NJ','DE'], 39.9526, -75.1652, 40, '{"PA":["190","191"],"NJ":["080","081","082","083","084","085"],"DE":["197","198","199"]}'::jsonb, '{}', false, 'available'),
('boston', 'Boston', 'Greater Boston', 'MA', ARRAY['MA','NH'], 42.3601, -71.0589, 40, '{"MA":["019","020","021","022","023","024","025","026","027"]}'::jsonb, '{}', false, 'available'),
('dc', 'Washington DC', 'DMV Metro', 'DC', ARRAY['DC','MD','VA'], 38.9072, -77.0369, 40, '{"DC":["200"],"MD":["207","208","209","218"],"VA":["201","220","221","222"]}'::jsonb, '{}', false, 'available'),
('seattle', 'Seattle', 'Puget Sound', 'WA', ARRAY['WA'], 47.6062, -122.3321, 40, '{"WA":["980","981","982","983","984"]}'::jsonb, '{}', false, 'available'),
('denver', 'Denver', 'Denver Metro', 'CO', ARRAY['CO'], 39.7392, -104.9903, 40, '{"CO":["800","801","802","803","804","805"]}'::jsonb, '{}', false, 'available'),
('minneapolis', 'Minneapolis', 'Twin Cities', 'MN', ARRAY['MN','WI'], 44.9778, -93.2650, 40, '{"MN":["550","551","552","553","554","555"]}'::jsonb, '{}', false, 'available'),
('detroit', 'Detroit', 'Detroit Metro', 'MI', ARRAY['MI'], 42.3314, -83.0458, 40, '{"MI":["480","481","482","483","484","485"]}'::jsonb, '{}', false, 'available'),
('tampa', 'Tampa', 'Tampa Bay', 'FL', ARRAY['FL'], 27.9506, -82.4572, 40, '{"FL":["335","336","337","346"]}'::jsonb, '{}', false, 'available'),
('charlotte', 'Charlotte', 'Charlotte Metro', 'NC', ARRAY['NC','SC'], 35.2271, -80.8431, 40, '{"NC":["280","281","282"]}'::jsonb, '{}', false, 'available'),
('nashville', 'Nashville', 'Nashville Metro', 'TN', ARRAY['TN'], 36.1627, -86.7816, 40, '{"TN":["370","371","372"]}'::jsonb, '{}', false, 'available'),
('san_diego', 'San Diego', 'San Diego County', 'CA', ARRAY['CA'], 32.7157, -117.1611, 40, '{"CA":["919","920","921","922"]}'::jsonb, '{}', false, 'available'),
('portland', 'Portland', 'Portland Metro', 'OR', ARRAY['OR','WA'], 45.5152, -122.6784, 40, '{"OR":["970","971","972"]}'::jsonb, '{}', false, 'available')
ON CONFLICT (slug) DO NOTHING;

-- Roy as master licensee on Chicago
INSERT INTO licensees (email, full_name, company, metro_slug, plan_tier, billing_status)
VALUES ('roy@chicagofleetwraps.com', 'Roy Alkalay', 'Chicago Fleet Wraps', 'chicago', 'enterprise', 'active')
ON CONFLICT (email) DO NOTHING;

-- Link Chicago to Roy
UPDATE metro_regions SET licensee_id = (SELECT id FROM licensees WHERE email = 'roy@chicagofleetwraps.com' LIMIT 1), license_status = 'reserved' WHERE slug = 'chicago';

-- ============================================================
-- DONE — verify counts
-- ============================================================
SELECT 'metro_regions' AS table_name, COUNT(*) AS n FROM metro_regions
UNION ALL SELECT 'licensees', COUNT(*) FROM licensees
UNION ALL SELECT 'decision_makers', COUNT(*) FROM decision_makers
UNION ALL SELECT 'actions_queue', COUNT(*) FROM actions_queue
UNION ALL SELECT 'suppressions', COUNT(*) FROM suppressions
UNION ALL SELECT 'call_log', COUNT(*) FROM call_log
UNION ALL SELECT 'app_secrets', COUNT(*) FROM app_secrets;
