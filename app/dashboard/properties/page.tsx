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
  cover_image?: string
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="h-8 w-8 sm:h-9 sm:w-9 bg-[#1877F2] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-lg sm:text-xl">P</span>
              </div>
              <Link href="/dashboard" className="text-lg sm:text-xl font-bold text-[#1877F2] truncate">
                Prospecta
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 font-medium px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-all overflow-hidden">
                {/* Property Image */}
                <div className="aspect-[4/3] bg-gray-200 overflow-hidden">
                  {property.cover_image ? (
                    <img 
                      src={property.cover_image} 
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-6xl">
                      {property.property_type === 'house' || property.property_type === 'HOUSE_LOT' ? '🏠' : '🏢'}
                    </div>
                  )}
                </div>
                
                {/* Property Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {getPropertyTypeLabel(property.property_type)}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">{getStatusBadge(property.status)}</div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-[#1877F2] text-lg">
                        {formatPrice(property.price)}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{property.location}</span>
                    </div>
                    {(property.bedrooms || property.bathrooms || property.area) && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                        {property.bedrooms && (
                          <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {property.bedrooms}
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            {property.bathrooms}
                          </span>
                        )}
                        {property.area && (
                          <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            {property.area}m²
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    {property.status === 'available' || property.status === 'ACTIVE' ? (
                      <>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/properties/${property.id}/edit`}
                            className="flex-1 text-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                          >
                            ✏️ Edit
                          </Link>
                          <Link
                            href={`/p/${property.slug}`}
                            target="_blank"
                            className="flex-1 text-center px-3 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-md text-sm font-semibold transition-colors"
                          >
                            👁️ Preview
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/p/${property.slug}`
                              const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
                              window.open(fbUrl, '_blank', 'width=600,height=400')
                            }}
                            className="flex-1 px-3 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
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
                              alert('✅ Link copied! Paste it on Facebook.')
                            }}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                            title="Copy link"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/dashboard/properties/${property.id}/edit`}
                          className="block w-full text-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                        >
                          ✏️ Edit
                        </Link>
                        <div className="text-center text-xs text-gray-500 py-2 bg-gray-50 rounded-md">
                          Set to "Active" to share
                        </div>
                      </>
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
