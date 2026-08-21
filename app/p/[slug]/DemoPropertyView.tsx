'use client'

import { useEffect, useState } from 'react'
import { isDemoMode, DEMO_PROPERTIES, DEMO_USER } from '@/lib/demo-auth'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'

export default function DemoPropertyView({ slug }: { slug: string }) {
  const [property, setProperty] = useState<any>(null)
  const [showGallery, setShowGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (isDemoMode()) {
      const demoProperty = DEMO_PROPERTIES.find(p => p.slug === slug)
      if (demoProperty) {
        setProperty({
          ...demoProperty,
          agent: {
            display_name: DEMO_USER.full_name,
            phone_number: DEMO_USER.phone,
            facebook_url: 'https://facebook.com',
            messenger_url: 'https://m.me/',
          }
        })
      }
    }
  }, [slug])

  if (!isDemoMode()) {
    return null // Let server-side rendering handle non-demo mode
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-4">This property doesn't exist in demo mode.</p>
          <button
            onClick={() => router.push('/dashboard/properties')}
            className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5]"
          >
            Back to Properties
          </button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      HOUSE_LOT: 'House & Lot',
      CONDOMINIUM: 'Condominium',
      APARTMENT: 'Apartment',
      LOT_ONLY: 'Lot Only',
      COMMERCIAL: 'Commercial',
      OTHER: 'Other',
    }
    return types[type] || type
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <BrandLogo href="/" size="sm" />
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Demo Mode Badge */}
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-sm text-yellow-800">
            🎭 <strong>Demo Mode</strong> - This is a sample property listing
          </p>
        </div>

        {/* Property Images with View Photos button and Status badge */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 relative">
          {/* Status Badge - Upper Right */}
          <div className="absolute top-4 right-4 z-10">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg ${
              property.status === 'available' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {property.status === 'available' ? '✓ AVAILABLE' : '✕ SOLD'}
            </span>
          </div>

          {property.images && property.images.length > 0 && (
            <div className="relative">
              {/* Main Cover Image */}
              <div className="aspect-video w-full relative">
                <img
                  src={property.images[0].url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* View Photos Button - Lower Left */}
                {property.images.length > 1 && (
                  <button
                    onClick={() => setShowGallery(true)}
                    className="absolute bottom-4 left-4 px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">View Photos ({property.images.length})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Photo Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
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
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/90 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {property.images.length}
              </div>

              {/* Main image */}
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={property.images[currentImageIndex].url}
                  alt={`${property.title} - Photo ${currentImageIndex + 1}`}
                  className="w-full h-[70vh] object-contain"
                />
              </div>

              {/* Navigation buttons */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : property.images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < property.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Thumbnail strip */}
              <div className="mt-4 flex gap-2 justify-center overflow-x-auto">
                {property.images.map((img: any, idx: number) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === idx ? 'border-white' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
              {getPropertyTypeLabel(property.property_type)}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <p className="text-2xl font-bold text-[#1877F2]">
              {formatPrice(property.price)}
              {property.price < 100000 && <span className="text-sm text-gray-500 ml-2">per month</span>}
            </p>
          </div>

          <div className="flex items-center text-gray-600 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{property.location}</span>
          </div>

          {/* Property Features with Icons + Labels */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {property.bedrooms && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500">Bedrooms</div>
                  <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                </div>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500">Bathrooms</div>
                  <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                </div>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500">Floor Area</div>
                  <div className="font-semibold text-gray-900">{property.area} sqm</div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
          </div>
        </div>

        {/* Contact Agent */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Interested in this property?</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white font-bold text-lg">
              {property.agent.display_name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{property.agent.display_name}</p>
              <p className="text-sm text-gray-500">Licensed Real Estate Agent</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            📱 This is a demo property. In live mode, clicking "I'm Interested" would capture your details and notify the agent.
          </p>
          <button
            disabled
            className="w-full px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
          >
            I'm Interested (Demo Mode)
          </button>
        </div>
      </div>
    </div>
  )
}
