-- Create properties table
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

-- Create index on agent_id for faster queries
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_slug ON properties(slug);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Add updated_at trigger
CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
