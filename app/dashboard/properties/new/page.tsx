'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { PropertyType, PropertyStatus } from '@/lib/types/database'

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'HOUSE_LOT', label: 'House & Lot' },
  { value: 'CONDOMINIUM', label: 'Condominium' },
  { value: 'LOT_ONLY', label: 'Lot Only' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'OTHER', label: 'Other' },
]

// Dynamic fields based on property type
const PROPERTY_FIELDS = {
  HOUSE_LOT: ['bedrooms', 'bathrooms', 'garage', 'lotArea', 'floorArea'],
  CONDOMINIUM: ['bedrooms', 'bathrooms', 'floorNumber', 'unitNumber', 'parkingSlots'],
  LOT_ONLY: ['lotArea', 'titleType'],
  COMMERCIAL: ['floorArea', 'parking', 'floors'],
  OTHER: [],
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 9)
}

export default function NewPropertyPage() {
  const [property, setProperty] = useState({
    title: '',
    property_type: 'HOUSE_LOT' as PropertyType,
    price: '',
    location: '',
    description: '',
    status: 'DRAFT' as PropertyStatus,
    // Dynamic fields
    bedrooms: '',
    bathrooms: '',
    garage: '',
    lotArea: '',
    floorArea: '',
    floorNumber: '',
    unitNumber: '',
    parkingSlots: '',
    titleType: '',
    parking: '',
    floors: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const slug = generateSlug(property.title)

      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            agent_id: user.id,
            title: property.title,
            slug,
            property_type: property.property_type,
            price: parseFloat(property.price),
            currency: 'PHP',
            location: property.location,
            description: property.description || null,
            status: property.status,
          },
        ])
        .select()
        .single()

      if (error) throw error

      router.push(`/dashboard/properties/${data.id}/edit`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create property')
      setLoading(false)
    }
  }

  const dynamicFields = PROPERTY_FIELDS[property.property_type] || []

  const renderDynamicField = (fieldName: string) => {
    const labels: Record<string, string> = {
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      garage: 'Garage Spaces',
      lotArea: 'Lot Area (sqm)',
      floorArea: 'Floor Area (sqm)',
      floorNumber: 'Floor Number',
      unitNumber: 'Unit Number',
      parkingSlots: 'Parking Slots',
      titleType: 'Title Type',
      parking: 'Parking Spaces',
      floors: 'Number of Floors',
    }

    return (
      <div key={fieldName}>
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
          {labels[fieldName]}
        </label>
        <input
          type={fieldName === 'unitNumber' || fieldName === 'titleType' ? 'text' : 'number'}
          id={fieldName}
          min="0"
          step={fieldName.includes('Area') ? '0.01' : '1'}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={(property as any)[fieldName]}
          onChange={(e) => setProperty({ ...property, [fieldName]: e.target.value })}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Property</h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Property Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Beautiful 3BR House in Quezon City"
                  value={property.title}
                  onChange={(e) => setProperty({ ...property, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setProperty({ ...property, property_type: type.value })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        property.property_type === type.value
                          ? 'border-[#1877F2] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Fields based on property type */}
              {dynamicFields.length > 0 && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="col-span-2 text-sm font-medium text-blue-900 mb-2">
                    Property Details
                  </div>
                  {dynamicFields.map((field) => renderDynamicField(field))}
                </div>
              )}

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (PHP) *
                </label>
                <input
                  type="number"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="5000000"
                  value={property.price}
                  onChange={(e) => setProperty({ ...property, price: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Quezon City, Metro Manila"
                  value={property.location}
                  onChange={(e) => setProperty({ ...property, location: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Describe your property..."
                  value={property.description}
                  onChange={(e) => setProperty({ ...property, description: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={property.status}
                  onChange={(e) => setProperty({ ...property, status: e.target.value as PropertyStatus })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active (Public)</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Only "Active" properties will be visible to the public
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1877F2] hover:bg-[#166fe5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
