'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  images?: any[]
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
    house: 'House & Lot',
    condo: 'Condominium',
    apartment: 'Apartment',
    lot: 'Lot Only',
    commercial: 'Commercial',
    HOUSE_LOT: 'House & Lot',
    CONDOMINIUM: 'Condominium',
    APARTMENT: 'Apartment',
    LOT_ONLY: 'Lot Only',
    COMMERCIAL: 'Commercial',
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showGallery, setShowGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function loadProperties() {
      if (isDemoMode()) {
        setProperties(DEMO_PROPERTIES as any)
        setLoading(false)
      } else {
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

  const openGallery = (property: Property) => {
    setSelectedProperty(property)
    setCurrentImageIndex(0)
    setShowGallery(true)
  }

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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center">
                <Image 
                  src="/prospecta-logo.svg" 
                  alt="Prospecta" 
                  width={140} 
                  height={32}
                  className="h-8"
                />
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
      </header>

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
            + Add Property
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
              <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Property Images Grid */}
                <div className="relative">
                  {property.images && property.images.length > 0 ? (
                    <>
                      {/* 1 Photo: Full width */}
                      {property.images.length === 1 && (
                        <div className="h-48 bg-gray-200">
                          <img
                            src={property.images[0].url || property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* 2 Photos: Side by side equal */}
                      {property.images.length === 2 && (
                        <div className="grid grid-cols-2 gap-1">
                          {property.images.map((img: any, idx: number) => (
                            <div key={idx} className="h-48 bg-gray-200">
                              <img
                                src={img.url || img}
                                alt={`${property.title} - Photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 3 Photos: 1 large left, 2 stacked right */}
                      {property.images.length === 3 && (
                        <div className="grid grid-cols-2 gap-1 h-48">
                          <div className="bg-gray-200 h-full">
                            <img
                              src={property.images[0].url || property.images[0]}
                              alt={`${property.title} - Photo 1`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1 h-full">
                            <div className="bg-gray-200 flex-1">
                              <img
                                src={property.images[1].url || property.images[1]}
                                alt={`${property.title} - Photo 2`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="bg-gray-200 flex-1">
                              <img
                                src={property.images[2].url || property.images[2]}
                                alt={`${property.title} - Photo 3`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4 Photos: 2x2 grid */}
                      {property.images.length >= 4 && (
                        <div className="grid grid-cols-2 gap-1 h-48">
                          {property.images.slice(0, 4).map((img: any, idx: number) => (
                            <div key={idx} className="relative bg-gray-200 h-24">
                              <img
                                src={img.url || img}
                                alt={`${property.title} - Photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {idx === 3 && property.images && property.images.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                                  +{property.images.length - 4} more
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-6xl">
                      {property.property_type === 'house' || property.property_type === 'HOUSE_LOT' ? '🏠' : '🏢'}
                    </div>
                  )}
                  
                  {/* View Photos Button */}
                  {property.images && property.images.length > 1 && (
                    <button
                      onClick={() => openGallery(property)}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg shadow-lg flex items-center gap-1.5 text-sm font-medium transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      View Photos ({property.images.length})
                    </button>
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
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-1">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <svg className="w-3.5 h-3.5 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-medium">{property.bedrooms}</span>
                            <span className="text-gray-500">Bedrooms</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <svg className="w-3.5 h-3.5 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            <span className="font-medium">{property.bathrooms}</span>
                            <span className="text-gray-500">Bathrooms</span>
                          </div>
                        )}
                        {property.area && (
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <svg className="w-3.5 h-3.5 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            <span className="font-medium">{property.area}</span>
                            <span className="text-gray-500">sqm</span>
                          </div>
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
                            className="flex-1 text-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors inline-flex items-center justify-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <Link
                            href={`/p/${property.slug}`}
                            target="_blank"
                            className="flex-1 text-center px-3 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-md text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
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
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Share on Facebook
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Mark this property as SOLD?')) {
                                alert('Property marked as SOLD! (Demo mode)')
                              }
                            }}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold transition-colors"
                            title="Mark as Sold"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/dashboard/properties/${property.id}/edit`}
                          className="block w-full text-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors inline-flex items-center justify-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
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

      {/* Photo Gallery Modal */}
      {showGallery && selectedProperty && selectedProperty.images && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full">
            {/* Close button */}
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/70 text-white rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {selectedProperty.images.length}
            </div>

            {/* Main image */}
            <div className="bg-black rounded-lg overflow-hidden">
              <img
                src={selectedProperty.images[currentImageIndex]?.url || selectedProperty.images[currentImageIndex]}
                alt={`${selectedProperty.title} - Photo ${currentImageIndex + 1}`}
                className="w-full h-[70vh] object-cover"
              />
            </div>

            {/* Property title - FIXED POSITION */}
            <div className="mt-3 px-4 py-3 bg-white rounded-lg">
              <h3 className="font-semibold text-gray-900 text-lg">{selectedProperty.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedProperty.location}</p>
            </div>

            {/* Navigation buttons */}
            {selectedProperty.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : selectedProperty.images!.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev < selectedProperty.images!.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Thumbnail strip */}
            <div className="mt-4 flex gap-2 justify-center overflow-x-auto max-w-full px-4">
              {selectedProperty.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === idx ? 'border-white' : 'border-transparent opacity-60'
                  }`}
                >
                  <img 
                    src={img.url || img} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
