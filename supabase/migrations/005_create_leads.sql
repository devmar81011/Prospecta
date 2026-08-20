-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT,
  source TEXT DEFAULT 'DIRECT' CHECK (source IN ('FACEBOOK', 'DIRECT', 'OTHER')),
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'INTERESTED', 'VIEWING', 'NEGOTIATING', 'RESERVED', 'SOLD', 'NOT_INTERESTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_leads_agent_id ON leads(agent_id);
CREATE INDEX idx_leads_property_id ON leads(property_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Add updated_at trigger
CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
