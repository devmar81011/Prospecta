'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import type { Lead, LeadStatus, Viewing } from '@/lib/types/database'

interface LeadWithDetails extends Lead {
  property: {
    title: string
    location: string
    slug: string
  }
}

const LEAD_STATUSES: { value: LeadStatus; label: string; emoji: string }[] = [
  { value: 'NEW', label: 'New', emoji: '🔥' },
  { value: 'CONTACTED', label: 'Contacted', emoji: '💬' },
  { value: 'INTERESTED', label: 'Interested', emoji: '❤️' },
  { value: 'VIEWING', label: 'Viewing', emoji: '📅' },
  { value: 'NEGOTIATING', label: 'Negotiating', emoji: '🤝' },
  { value: 'RESERVED', label: 'Reserved', emoji: '📝' },
  { value: 'SOLD', label: 'Sold', emoji: '🎉' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', emoji: '❌' },
]

export default function LeadDetailsPage() {
  const params = useParams()
  const leadId = params.id as string
  const [lead, setLead] = useState<LeadWithDetails | null>(null)
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [viewingForm, setViewingForm] = useState({
    scheduled_at: '',
    location: '',
    notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadLead()
    loadViewings()
  }, [leadId])

  const loadLead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          property:properties(title, location, slug)
        `)
        .eq('id', leadId)
        .eq('agent_id', user.id)
        .single()

      if (error) throw error
      setLead(data as LeadWithDetails)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadViewings = async () => {
    try {
      const { data, error } = await supabase
        .from('viewings')
        .select('*')
        .eq('lead_id', leadId)
        .order('scheduled_at', { ascending: false })

      if (error) throw error
      setViewings(data || [])
    } catch (err: any) {
      console.error('Error loading viewings:', err)
    }
  }

  const updateStatus = async (newStatus: LeadStatus) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId)

      if (error) throw error

      setLead(lead ? { ...lead, status: newStatus } : null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const scheduleViewing = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!lead) throw new Error('Lead not loaded')

      const { error } = await supabase
        .from('viewings')
        .insert([
          {
            lead_id: leadId,
            property_id: lead.property_id,
            scheduled_at: viewingForm.scheduled_at,
            location: viewingForm.location || null,
            notes: viewingForm.notes || null,
            status: 'SCHEDULED',
          },
        ])

      if (error) throw error

      if (lead.status === 'NEW' || lead.status === 'CONTACTED' || lead.status === 'INTERESTED') {
        await updateStatus('VIEWING')
      }

      await loadViewings()
      setShowScheduleForm(false)
      setViewingForm({ scheduled_at: '', location: '', notes: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to schedule viewing')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading lead...</p>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Lead not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/leads')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Leads
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{lead.name}</h1>
              <p className="text-gray-600">{lead.phone_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Interested {new Date(lead.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Property</h3>
            <p className="font-semibold text-gray-900">{lead.property.title}</p>
            <p className="text-sm text-gray-600">📍 {lead.property.location}</p>
          </div>

          {lead.message && (
            <div className="border-t pt-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
              <p className="text-gray-900">{lead.message}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a
                href={`tel:${lead.phone_number}`}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="mr-2">📞</span>
                Call
              </a>
              <a
                href={`sms:${lead.phone_number}`}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="mr-2">💬</span>
                SMS
              </a>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="flex items-center justify-center px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                <span className="mr-2">📅</span>
                Schedule
              </button>
              <a
                href={`/p/${lead.property.slug}`}
                target="_blank"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="mr-2">🏠</span>
                View Property
              </a>
            </div>
          </div>
        </div>

        {showScheduleForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Site Viewing</h2>
            <form onSubmit={scheduleViewing} className="space-y-4">
              <div>
                <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="scheduled_at"
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={viewingForm.scheduled_at}
                  onChange={(e) => setViewingForm({ ...viewingForm, scheduled_at: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Property address or meeting point"
                  value={viewingForm.location}
                  onChange={(e) => setViewingForm({ ...viewingForm, location: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={viewingForm.notes}
                  onChange={(e) => setViewingForm({ ...viewingForm, notes: e.target.value })}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Scheduling...' : 'Schedule Viewing'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LEAD_STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() => updateStatus(status.value)}
                disabled={saving || lead.status === status.value}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  lead.status === status.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-2xl mb-1">{status.emoji}</div>
                <div className="text-xs font-medium text-gray-900">{status.label}</div>
              </button>
            ))}
          </div>
        </div>

        {viewings.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Viewings</h2>
            <div className="space-y-3">
              {viewings.map((viewing) => (
                <div key={viewing.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(viewing.scheduled_at).toLocaleString()}
                      </p>
                      {viewing.location && (
                        <p className="text-sm text-gray-600 mt-1">📍 {viewing.location}</p>
                      )}
                      {viewing.notes && (
                        <p className="text-sm text-gray-600 mt-1">{viewing.notes}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      viewing.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      viewing.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      viewing.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewing.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
