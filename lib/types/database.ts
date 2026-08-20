// Database type definitions

export type Profile = {
  id: string;
  display_name: string | null;
  phone_number: string | null;
  messenger_url: string | null;
  facebook_url: string | null;
  agency_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type PropertyType = 'HOUSE_LOT' | 'CONDOMINIUM' | 'APARTMENT' | 'LOT_ONLY' | 'COMMERCIAL' | 'OTHER';
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'INACTIVE';

export type Property = {
  id: string;
  agent_id: string;
  title: string;
  slug: string;
  property_type: PropertyType;
  price: number;
  currency: string;
  location: string;
  description: string | null;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
}

export type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export type PropertyAttribute = {
  id: string;
  property_id: string;
  label: string;
  value: string;
  unit: string | null;
  created_at: string;
}

export type LeadSource = 'FACEBOOK' | 'DIRECT' | 'OTHER';
export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'INTERESTED' 
  | 'VIEWING' 
  | 'NEGOTIATING' 
  | 'RESERVED' 
  | 'SOLD' 
  | 'NOT_INTERESTED';

export type Lead = {
  id: string;
  agent_id: string;
  property_id: string;
  name: string;
  phone_number: string;
  message: string | null;
  source: LeadSource;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export type ViewingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type Viewing = {
  id: string;
  lead_id: string;
  property_id: string;
  scheduled_at: string;
  location: string | null;
  notes: string | null;
  status: ViewingStatus;
  created_at: string;
  updated_at: string;
}
