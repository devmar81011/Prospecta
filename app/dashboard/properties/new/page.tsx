'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { PropertyType, PropertyStatus } from '@/lib/types/database'

const PROPERTY_TYPES: { value: PropertyType; label: string; emoji: string }[] = [
  { value: 'HOUSE_LOT', label: 'House & Lot', emoji: '🏠' },
  { value: 'CONDOMINIUM', label: 'Condominium', emoji: '🏢' },
  { value: 'LOT_ONLY', label: 'Lot Only', emoji: '🌳' },
  { value: 'COMMERCIAL', label: 'Commercial', emoji: '🏬' },
  { value: 'OTHER', label: 'Other', emoji: '➕' },
]

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Property</h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.emoji}</div>
                      <div className="text-xs font-medium text-gray-900">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
