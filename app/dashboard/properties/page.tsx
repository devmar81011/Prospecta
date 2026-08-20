import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Property } from '@/lib/types/database'

async function getProperties(userId: string): Promise<Property[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('agent_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  return data || []
}

function formatPrice(price: number, currency: string = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function getPropertyTypeLabel(type: string): string {
  const types: Record<string, string> = {
    HOUSE_LOT: '🏠 House & Lot',
    CONDOMINIUM: '🏢 Condominium',
    LOT_ONLY: '🌳 Lot Only',
    COMMERCIAL: '🏬 Commercial',
    OTHER: '➕ Other',
  }
  return types[type] || type
}

function getStatusBadge(status: string) {
  const badges: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
    ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
    RESERVED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    SOLD: { bg: 'bg-blue-100', text: 'text-blue-800' },
    INACTIVE: { bg: 'bg-red-100', text: 'text-red-800' },
  }
  const badge = badges[status] || badges.DRAFT
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
      {status}
    </span>
  )
}

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const properties = await getProperties(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Real Estate Lead App
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + New Property
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first property listing to start getting leads
            </p>
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getPropertyTypeLabel(property.property_type)}
                      </p>
                    </div>
                    <div>{getStatusBadge(property.status)}</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="font-semibold text-blue-600 text-lg">
                        {formatPrice(property.price, property.currency)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-1">📍</span>
                      {property.location}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/properties/${property.id}/edit`}
                      className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    {property.status === 'ACTIVE' && (
                      <Link
                        href={`/p/${property.slug}`}
                        target="_blank"
                        className="flex-1 text-center px-3 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
                      >
                        View Public
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
