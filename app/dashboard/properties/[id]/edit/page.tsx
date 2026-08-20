'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import type { Property, PropertyType, PropertyStatus, PropertyAttribute, PropertyImage } from '@/lib/types/database'
import ImageUpload from './ImageUpload'

const PROPERTY_TYPES: { value: PropertyType; label: string; emoji: string }[] = [
  { value: 'HOUSE_LOT', label: 'House & Lot', emoji: '🏠' },
  { value: 'CONDOMINIUM', label: 'Condominium', emoji: '🏢' },
  { value: 'LOT_ONLY', label: 'Lot Only', emoji: '🌳' },
  { value: 'COMMERCIAL', label: 'Commercial', emoji: '🏬' },
  { value: 'OTHER', label: 'Other', emoji: '➕' },
]

const SUGGESTED_ATTRIBUTES: Record<PropertyType, { label: string; unit?: string }[]> = {
  HOUSE_LOT: [
    { label: 'Bedrooms' },
    { label: 'Bathrooms' },
    { label: 'Lot Area', unit: 'sqm' },
    { label: 'Floor Area', unit: 'sqm' },
    { label: 'Parking Slots' },
  ],
  CONDOMINIUM: [
    { label: 'Unit Type' },
    { label: 'Bedrooms' },
    { label: 'Bathrooms' },
    { label: 'Floor Area', unit: 'sqm' },
    { label: 'Floor Number' },
    { label: 'Furnishing' },
  ],
  LOT_ONLY: [
    { label: 'Lot Area', unit: 'sqm' },
    { label: 'Frontage', unit: 'm' },
    { label: 'Land Classification' },
    { label: 'Title Status' },
  ],
  COMMERCIAL: [
    { label: 'Floor Area', unit: 'sqm' },
    { label: 'Building Type' },
    { label: 'Parking Slots' },
    { label: 'Year Built' },
  ],
  OTHER: [],
}

export default function EditPropertyPage() {
  const params = useParams()
  const propertyId = params.id as string
  const [property, setProperty] = useState<Partial<Property> | null>(null)
  const [attributes, setAttributes] = useState<Partial<PropertyAttribute>[]>([])
  const [images, setImages] = useState<PropertyImage[]>([])
  const [newAttribute, setNewAttribute] = useState({ label: '', value: '', unit: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  const loadProperty = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('agent_id', user.id)
        .single()

      if (propertyError) throw propertyError
      setProperty(propertyData)

      const { data: attributesData, error: attributesError } = await supabase
        .from('property_attributes')
        .select('*')
        .eq('property_id', propertyId)

      if (attributesError) throw attributesError
      setAttributes(attributesData || [])

      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('sort_order', { ascending: true })

      if (imagesError) throw imagesError
      setImages(imagesData || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      if (!property) throw new Error('Property not loaded')

      const { error: propertyError } = await supabase
        .from('properties')
        .update({
          title: property.title,
          property_type: property.property_type,
          price: property.price,
          location: property.location,
          description: property.description,
          status: property.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)

      if (propertyError) throw propertyError

      const { error: deleteError } = await supabase
        .from('property_attributes')
        .delete()
        .eq('property_id', propertyId)

      if (deleteError) throw deleteError

      if (attributes.length > 0) {
        const attributesToInsert = attributes.map(attr => ({
          property_id: propertyId,
          label: attr.label!,
          value: attr.value!,
          unit: attr.unit || null,
        }))

        const { error: insertError } = await supabase
          .from('property_attributes')
          .insert(attributesToInsert)

        if (insertError) throw insertError
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update property')
    } finally {
      setSaving(false)
    }
  }

  const addSuggestedAttribute = (label: string, unit?: string) => {
    if (!attributes.find(attr => attr.label === label)) {
      setAttributes([...attributes, { label, value: '', unit: unit || '' }])
    }
  }

  const addCustomAttribute = () => {
    if (newAttribute.label && newAttribute.value) {
      setAttributes([...attributes, { ...newAttribute }])
      setNewAttribute({ label: '', value: '', unit: '' })
    }
  }

  const updateAttribute = (index: number, field: keyof PropertyAttribute, value: string) => {
    const updated = [...attributes]
    updated[index] = { ...updated[index], [field]: value }
    setAttributes(updated)
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      if (error) throw error

      router.push('/dashboard/properties')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete property')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading property...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Property not found</p>
      </div>
    )
  }

  const suggestedAttributes = SUGGESTED_ATTRIBUTES[property.property_type as PropertyType] || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/properties')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Properties
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Property</h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">Property updated successfully!</p>
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
                  value={property.title || ''}
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
                  value={property.price || ''}
                  onChange={(e) => setProperty({ ...property, price: parseFloat(e.target.value) })}
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
                  value={property.location || ''}
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
                  value={property.description || ''}
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
                  value={property.status || 'DRAFT'}
                  onChange={(e) => setProperty({ ...property, status: e.target.value as PropertyStatus })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active (Public)</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
                
                {suggestedAttributes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedAttributes.map((attr) => (
                        <button
                          key={attr.label}
                          type="button"
                          onClick={() => addSuggestedAttribute(attr.label, attr.unit)}
                          disabled={attributes.some(a => a.label === attr.label)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + {attr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Label"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={attr.label || ''}
                        onChange={(e) => updateAttribute(index, 'label', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={attr.value || ''}
                        onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={attr.unit || ''}
                        onChange={(e) => updateAttribute(index, 'unit', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add Custom Detail</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Label (e.g., Swimming Pool)"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={newAttribute.label}
                      onChange={(e) => setNewAttribute({ ...newAttribute, label: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g., Yes)"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={newAttribute.value}
                      onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={newAttribute.unit}
                      onChange={(e) => setNewAttribute({ ...newAttribute, unit: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={addCustomAttribute}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <ImageUpload
                propertyId={propertyId}
                existingImages={images}
                onImagesUpdated={loadProperty}
              />

              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Delete Property
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/properties')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
