'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode, DEMO_PROPERTIES } from '@/lib/demo-auth'

interface Property {
  id: string
  title: string
  property_type: string
  price: number
  location: string
  status: string
  slug: string
  bedrooms?: number
  bathrooms?: number
  area?: number
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function getPropertyTypeLabel(type: string): string {
  const types: Record<string, string> = {
    house: '🏠 House & Lot',
    condo: '🏢 Condominium',
    lot: '🌳 Lot Only',
    commercial: '🏬 Commercial',
    HOUSE_LOT: '🏠 House & Lot',
    CONDOMINIUM: '🏢 Condominium',
    LOT_ONLY: '🌳 Lot Only',
    COMMERCIAL: '🏬 Commercial',
  }
  return types[type] || type
}

function getStatusBadge(status: string) {
  const badges: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
    available: { bg: 'bg-green-100', text: 'text-green-800' },
    reserved: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    sold: { bg: 'bg-blue-100', text: 'text-blue-800' },
    inactive: { bg: 'bg-red-100', text: 'text-red-800' },
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800' },
    ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
    RESERVED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    SOLD: { bg: 'bg-blue-100', text: 'text-blue-800' },
    INACTIVE: { bg: 'bg-red-100', text: 'text-red-800' },
  }
  const badge = badges[status] || badges.draft
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
      {status.toUpperCase()}
    </span>
  )
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperties() {
      if (isDemoMode()) {
        // Load demo properties
        setProperties(DEMO_PROPERTIES as any)
        setLoading(false)
      } else {
        // Load real properties from Supabase
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const { data } = await supabase
          .from('properties')
          .select('*')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false })

        setProperties(data || [])
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white">🏠</span>
              </div>
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Prospecta
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-sm text-gray-600 mt-1">Create listings and share them on Facebook to capture leads</p>
          </div>
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
          >
            + New Property
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first property listing to start getting leads
            </p>
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
            >
              Create Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-6xl">
                  {property.property_type === 'house' || property.property_type === 'HOUSE_LOT' ? '🏠' : '🏢'}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getPropertyTypeLabel(property.property_type)}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">{getStatusBadge(property.status)}</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <span className="font-bold text-blue-600 text-xl">
                        {formatPrice(property.price)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-1">📍</span>
                      <span className="truncate">{property.location}</span>
                    </div>
                    {(property.bedrooms || property.bathrooms || property.area) && (
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {property.bedrooms && <span>🛏️ {property.bedrooms} bed</span>}
                        {property.bathrooms && <span>🚿 {property.bathrooms} bath</span>}
                        {property.area && <span>📏 {property.area}m²</span>}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/dashboard/properties/${property.id}/edit`}
                      className="block w-full text-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      ✏️ Edit Property
                    </Link>
                    {property.status === 'available' || property.status === 'ACTIVE' ? (
                      <>
                        <Link
                          href={`/p/${property.slug}`}
                          target="_blank"
                          className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          👁️ Preview Page
                        </Link>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/p/${property.slug}`
                              const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
                              window.open(fbUrl, '_blank', 'width=600,height=400')
                            }}
                            className="flex-1 px-3 py-2 bg-[#1877F2] text-white rounded-lg text-sm font-medium hover:bg-[#166fe5] transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Share
                          </button>
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/p/${property.slug}`
                              navigator.clipboard.writeText(url)
                              alert('✅ Link copied! Now paste it on Facebook.')
                            }}
                            className="px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            title="Copy link"
                          >
                            📋
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-xs text-gray-500 py-2">
                        Set status to "Active" to share
                      </div>
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
