import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Property, PropertyAttribute, PropertyImage, Profile } from '@/lib/types/database'
import LeadCaptureForm from './LeadCaptureForm'
import DemoPropertyView from './DemoPropertyView'

async function getPropertyBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      agent:profiles(*)
    `)
    .eq('slug', slug)
    .in('status', ['ACTIVE', 'available'])
    .single()

  if (error || !property) return null

  const { data: attributes } = await supabase
    .from('property_attributes')
    .select('*')
    .eq('property_id', property.id)

  const { data: images } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', property.id)
    .order('sort_order', { ascending: true })

  return {
    ...property,
    attributes: attributes || [],
    images: images || [],
  }
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
    HOUSE_LOT: 'House & Lot',
    CONDOMINIUM: 'Condominium',
    LOT_ONLY: 'Lot Only',
    COMMERCIAL: 'Commercial',
    OTHER: 'Other',
  }
  return types[type] || type
}

export default async function PublicPropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Return both demo and real views - client will decide which to show
  return (
    <>
      <DemoPropertyView slug={slug} />
      <RealPropertyView slug={slug} />
    </>
  )
}

async function RealPropertyView({ slug }: { slug: string }) {
  const property = await getPropertyBySlug(slug)

  if (!property) {
    notFound()
  }

  const agent = (property as any).agent as Profile

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Property Images */}
        <div className="bg-gray-200 rounded-lg mb-6 aspect-video flex items-center justify-center">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images.find((img: PropertyImage) => img.is_cover)?.image_url || property.images[0]?.image_url}
              alt={property.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-500">
              <span className="text-6xl mb-2 block">🏠</span>
              <p>No image available</p>
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <p className="text-sm text-gray-600 mb-4">{getPropertyTypeLabel(property.property_type)}</p>
          
          <div className="mb-4">
            <span className="text-3xl font-bold text-blue-600">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>

          <div className="flex items-center text-gray-700 mb-6">
            <span className="mr-2">📍</span>
            <span>{property.location}</span>
          </div>

          {property.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {property.attributes && property.attributes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.attributes.map((attr: PropertyAttribute) => (
                  <div key={attr.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">{attr.label}</p>
                    <p className="font-semibold text-gray-900">
                      {attr.value} {attr.unit && <span className="text-sm text-gray-600">{attr.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lead Capture Form */}
        <LeadCaptureForm propertyId={property.id} agentId={property.agent_id} />

        {/* Agent Contact Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Agent</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Agent</p>
              <p className="font-semibold text-gray-900">{agent.display_name || 'Real Estate Agent'}</p>
              {agent.agency_name && (
                <p className="text-sm text-gray-600">{agent.agency_name}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {agent.phone_number && (
                <a
                  href={`tel:${agent.phone_number}`}
                  className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span className="mr-2">📞</span>
                  Call
                </a>
              )}
              {agent.messenger_url && (
                <a
                  href={agent.messenger_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center px-4 py-3 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                >
                  <span className="mr-2">💬</span>
                  Messenger
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
