-- Prospecta Real Estate App - Complete Database Setup
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  agency_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL, -- 'CONDOMINIUM', 'HOUSE_LOT', 'APARTMENT'
  listing_type TEXT NOT NULL DEFAULT 'FOR_SALE', -- 'FOR_SALE', 'FOR_RENT'
  price DECIMAL(15,2) NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'SOLD', 'INACTIVE'
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Anyone can view active properties" ON properties
  FOR SELECT USING (status = 'ACTIVE' OR auth.uid() = agent_id);

CREATE POLICY "Agents can create properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = agent_id);

-- ============================================
-- 3. PROPERTY IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);

-- Enable RLS
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Property images policies
CREATE POLICY "Anyone can view property images" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id 
      AND (properties.status = 'ACTIVE' OR properties.agent_id = auth.uid())
    )
  );

CREATE POLICY "Agents can manage own property images" ON property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id 
      AND properties.agent_id = auth.uid()
    )
  );

-- ============================================
-- 4. PROPERTY ATTRIBUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS property_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_property_attributes_property_id ON property_attributes(property_id);

-- Enable RLS
ALTER TABLE property_attributes ENABLE ROW LEVEL SECURITY;

-- Property attributes policies
CREATE POLICY "Anyone can view property attributes" ON property_attributes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_attributes.property_id 
      AND (properties.status = 'ACTIVE' OR properties.agent_id = auth.uid())
    )
  );

CREATE POLICY "Agents can manage own property attributes" ON property_attributes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_attributes.property_id 
      AND properties.agent_id = auth.uid()
    )
  );

-- ============================================
-- 5. LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'disqualified'
  temperature TEXT DEFAULT 'WARM', -- 'HOT', 'WARM', 'COLD'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents can view own leads" ON leads
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update own leads" ON leads
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete own leads" ON leads
  FOR DELETE USING (auth.uid() = agent_id);

-- ============================================
-- 6. VIEWINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_viewings_property_id ON viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_viewings_agent_id ON viewings(agent_id);
CREATE INDEX IF NOT EXISTS idx_viewings_scheduled_date ON viewings(scheduled_date);

-- Enable RLS
ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;

-- Viewings policies
CREATE POLICY "Agents can view own viewings" ON viewings
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can create viewings" ON viewings
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update own viewings" ON viewings
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete own viewings" ON viewings
  FOR DELETE USING (auth.uid() = agent_id);

-- ============================================
-- 7. STORAGE BUCKET FOR PROPERTY IMAGES
-- ============================================
-- Note: Run this in the Supabase Storage section, not SQL editor
-- Or use the Supabase dashboard to create a bucket named 'property-images'
-- with public access enabled

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own property images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own property images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 8. FUNCTIONS AND TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_viewings_updated_at
  BEFORE UPDATE ON viewings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 9. SEED DATA (Optional - for testing)
-- ============================================

-- You can add sample data here if needed for testing
-- This will be populated by your demo data when users create properties

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Enable Facebook OAuth in Supabase Authentication settings
-- 2. Add your Supabase URL and anon key to Vercel environment variables
-- 3. Deploy and test!
