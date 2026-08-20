'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LeadCaptureFormProps {
  propertyId: string
  agentId: string
}

export default function LeadCaptureForm({ propertyId, agentId }: LeadCaptureFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            agent_id: agentId,
            property_id: propertyId,
            name: formData.name,
            phone_number: formData.phone_number,
            message: formData.message || null,
            source: 'DIRECT',
            status: 'NEW',
          },
        ])

      if (error) throw error

      setSuccess(true)
      setFormData({ name: '', phone_number: '', message: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Inquiry Sent!</h3>
          <p className="text-gray-700 mb-6">
            The agent has been notified of your interest and will contact you soon.
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setIsOpen(false)
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center px-6 py-4 text-lg font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          <span className="mr-2">❤️</span>
          I'M INTERESTED
        </button>
        <p className="text-center text-sm text-gray-600 mt-3">
          Let the agent know you're interested in this property
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm Interested!</h2>
      <p className="text-gray-600 mb-6">
        Fill out this form and the agent will contact you shortly.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            required
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Juan Dela Cruz"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number *
          </label>
          <input
            type="tel"
            id="phone_number"
            required
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="+63 912 345 6789"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            id="message"
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Any questions or additional information..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Inquiry'}
          </button>
        </div>
      </form>
    </div>
  )
}
