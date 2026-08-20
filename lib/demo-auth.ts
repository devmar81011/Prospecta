// Demo authentication system for testing without Supabase
export const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@prospecta.com',
  full_name: 'Demo Agent',
  phone: '+1234567890',
  agency: 'Demo Real Estate Agency',
  bio: 'Experienced real estate agent specializing in residential properties.',
}

export const DEMO_CREDENTIALS = {
  email: 'demo@prospecta.com',
  password: 'demo123',
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('demo_mode') === 'true'
}

export function setDemoMode(enabled: boolean) {
  if (typeof window === 'undefined') return
  if (enabled) {
    localStorage.setItem('demo_mode', 'true')
    localStorage.setItem('demo_user', JSON.stringify(DEMO_USER))
  } else {
    localStorage.removeItem('demo_mode')
    localStorage.removeItem('demo_user')
  }
}

export function getDemoUser() {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('demo_user')
  return userStr ? JSON.parse(userStr) : null
}

export function validateDemoCredentials(email: string, password: string): boolean {
  return email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password
}

// Mock properties for demo
export const DEMO_PROPERTIES = [
  {
    id: 'prop-1',
    title: 'Modern 3BR Condo in Makati',
    description: 'Spacious 3-bedroom condo with city views, fully furnished, near BGC.',
    property_type: 'condo',
    price: 8500000,
    location: 'Makati City, Metro Manila',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    status: 'available',
    slug: 'modern-3br-condo-makati',
    created_at: new Date().toISOString(),
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', is_cover: true },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', is_cover: false },
    ],
  },
  {
    id: 'prop-2',
    title: 'Luxury House & Lot in Alabang',
    description: '4-bedroom house with pool, modern design, gated subdivision.',
    property_type: 'house',
    price: 15000000,
    location: 'Alabang, Muntinlupa',
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    status: 'available',
    slug: 'luxury-house-alabang',
    created_at: new Date().toISOString(),
    images: [
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', is_cover: true },
    ],
  },
]

// Mock leads for demo
export const DEMO_LEADS = [
  {
    id: 'lead-1',
    property_id: 'prop-1',
    property_title: 'Modern 3BR Condo in Makati',
    name: 'Juan Dela Cruz',
    email: 'juan@email.com',
    phone: '+639171234567',
    message: 'Interested in viewing this property. Available this weekend?',
    status: 'new',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'lead-2',
    property_id: 'prop-2',
    property_title: 'Luxury House & Lot in Alabang',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '+639181234567',
    message: 'Looking for a family home. Is this still available?',
    status: 'contacted',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'lead-3',
    property_id: 'prop-1',
    property_title: 'Modern 3BR Condo in Makati',
    name: 'Pedro Reyes',
    email: 'pedro@email.com',
    phone: '+639191234567',
    message: 'Can we schedule a viewing?',
    status: 'qualified',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
]

// Mock viewings for demo
export const DEMO_VIEWINGS = [
  {
    id: 'view-1',
    lead_id: 'lead-3',
    property_id: 'prop-1',
    property_title: 'Modern 3BR Condo in Makati',
    client_name: 'Pedro Reyes',
    scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: 'scheduled',
    notes: 'Client prefers morning viewing',
    created_at: new Date().toISOString(),
  },
]
