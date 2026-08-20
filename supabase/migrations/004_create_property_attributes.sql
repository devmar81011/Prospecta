-- Create property_attributes table (for dynamic fields)
CREATE TABLE IF NOT EXISTS property_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on property_id for faster queries
CREATE INDEX idx_property_attributes_property_id ON property_attributes(property_id);

-- Enable Row Level Security
ALTER TABLE property_attributes ENABLE ROW LEVEL SECURITY;

-- Create policies
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
