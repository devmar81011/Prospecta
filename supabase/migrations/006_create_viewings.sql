-- Create viewings table
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

-- Create indexes for faster queries
CREATE INDEX idx_viewings_lead_id ON viewings(lead_id);
CREATE INDEX idx_viewings_property_id ON viewings(property_id);
CREATE INDEX idx_viewings_scheduled_at ON viewings(scheduled_at);
CREATE INDEX idx_viewings_status ON viewings(status);

-- Enable Row Level Security
ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Add updated_at trigger
CREATE TRIGGER set_viewings_updated_at
  BEFORE UPDATE ON viewings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
