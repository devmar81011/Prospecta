-- Prospecta Real Estate App - Complete Database Setup
-- Run this in a DEDICATED Prospecta Supabase project (not shared with other apps).
-- SQL Editor → New query → paste this entire file → Run.

-- ============================================
-- 1. PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone_number TEXT,
  messenger_url TEXT,
  facebook_url TEXT,
  agency_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 2. PROPERTIES
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  property_type TEXT NOT NULL CHECK (property_type IN ('HOUSE_LOT', 'CONDOMINIUM', 'APARTMENT', 'LOT_ONLY', 'COMMERCIAL', 'OTHER')),
  listing_type TEXT NOT NULL DEFAULT 'FOR_SALE' CHECK (listing_type IN ('FOR_SALE', 'FOR_RENT')),
  price DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  location TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own properties"
  ON properties FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can create their own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their own properties"
  ON properties FOR DELETE
  USING (auth.uid() = agent_id);

CREATE POLICY "Public can view active properties"
  ON properties FOR SELECT
  USING (status = 'ACTIVE');

CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 3. PROPERTY IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_sort_order ON property_images(property_id, sort_order);

ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view images of their own properties"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert images to their own properties"
  ON property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update images of their own properties"
  ON property_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can delete images of their own properties"
  ON property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.agent_id = auth.uid()
    )
  );

CREATE POLICY "Public can view images of active properties"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.status = 'ACTIVE'
    )
  );

-- ============================================
-- 4. PROPERTY ATTRIBUTES
-- ============================================
CREATE TABLE IF NOT EXISTS property_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_attributes_property_id ON property_attributes(property_id);

ALTER TABLE property_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view attributes of their own properties"
  ON property_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_attributes.property_id
      AND properties.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert attributes to their own properties"
  ON property_attributes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_attributes.property_id
      AND properties.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update attributes of their own properties"
  ON property_attributes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_attributes.property_id
      AND properties.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can delete attributes of their own properties"
  ON property_attributes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_attributes.property_id
      AND properties.agent_id = auth.uid()
    )
  );

CREATE POLICY "Public can view attributes of active properties"
  ON property_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_attributes.property_id
      AND properties.status = 'ACTIVE'
    )
  );

-- ============================================
-- 5. LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  message TEXT,
  source TEXT DEFAULT 'DIRECT' CHECK (source IN ('FACEBOOK', 'DIRECT', 'OTHER')),
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'INTERESTED', 'VIEWING', 'NEGOTIATING', 'RESERVED', 'SOLD', 'NOT_INTERESTED')),
  temperature TEXT DEFAULT 'WARM' CHECK (temperature IN ('HOT', 'WARM', 'COLD')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view leads for their own properties"
  ON leads FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update leads for their own properties"
  ON leads FOR UPDATE
  USING (auth.uid() = agent_id);

CREATE POLICY "Anyone can create leads for active properties"
  ON leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = leads.property_id
      AND properties.status = 'ACTIVE'
    )
  );

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 6. VIEWINGS
-- ============================================
CREATE TABLE IF NOT EXISTS viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_viewings_lead_id ON viewings(lead_id);
CREATE INDEX IF NOT EXISTS idx_viewings_property_id ON viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_viewings_scheduled_at ON viewings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_viewings_status ON viewings(status);

ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view viewings for their own leads"
  ON viewings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = viewings.lead_id
      AND leads.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can create viewings for their own leads"
  ON viewings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = viewings.lead_id
      AND leads.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update viewings for their own leads"
  ON viewings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = viewings.lead_id
      AND leads.agent_id = auth.uid()
    )
  );

CREATE POLICY "Agents can delete viewings for their own leads"
  ON viewings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = viewings.lead_id
      AND leads.agent_id = auth.uid()
    )
  );

CREATE TRIGGER set_viewings_updated_at
  BEFORE UPDATE ON viewings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 7. STORAGE BUCKET FOR PROPERTY IMAGES
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
