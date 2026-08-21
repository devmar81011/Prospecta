'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode, DEMO_LEADS } from '@/lib/demo-auth'
import BrandLogo from '@/components/BrandLogo'

interface Lead {
  id: string
  property_id: string
  property_title: string
  name: string
  email: string
  phone: string
  message?: string
  status: string
  temperature?: string
  notes?: string
  created_at: string
}

function getTemperatureBadge(temp: string) {
  const badges: Record<string, { bg: string; text: string; icon: string }> = {
    HOT: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔥' },
    WARM: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
    COLD: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '❄️' },
  }
  const badge = badges[temp] || badges.WARM
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text} uppercase`}>
      <span>{badge.icon}</span>
      {temp}
    </span>
  )
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [temperature, setTemperature] = useState('WARM')
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const router = useRouter()
  const [leadId, setLeadId] = useState<string>('')

  useEffect(() => {
    params.then(p => setLeadId(p.id))
  }, [params])

  useEffect(() => {
    if (!leadId) return

    async function loadLead() {
      if (isDemoMode()) {
        const demoLead = DEMO_LEADS.find(l => l.id === leadId)
        if (demoLead) {
          setLead(demoLead as any)
          setTemperature((demoLead as any).temperature || 'WARM')
          setNotes((demoLead as any).notes || '')
        }
        setLoading(false)
      } else {
        const supabase = createClient()
        const { data } = await supabase
          .from('leads')
          .select(`
            *,
            property:properties(title, location, slug)
          `)
          .eq('id', leadId)
          .single()

        if (data) {
          setLead({
            ...data,
            property_title: data.property?.title || 'Unknown Property',
            phone: data.phone || data.phone_number,
            email: data.email || '',
          })
          setTemperature(data.temperature || 'WARM')
          setNotes(data.notes || '')
        }
        setLoading(false)
      }
    }

    loadLead()
  }, [leadId])

  const handleTemperatureUpdate = async () => {
    if (!lead || !temperature) return

    if (isDemoMode()) {
      alert('Demo Mode: Lead temperature updated to: ' + temperature)
      setLead({ ...lead, temperature })
    } else {
      const supabase = createClient()
      await supabase
        .from('leads')
        .update({ temperature })
        .eq('id', lead.id)
      
      setLead({ ...lead, temperature })
      alert('Temperature updated successfully!')
    }
  }

  const handleNotesUpdate = async () => {
    if (!lead) return

    if (isDemoMode()) {
      alert('Demo Mode: Notes saved!')
      setLead({ ...lead, notes })
      setEditingNotes(false)
    } else {
      const supabase = createClient()
      await supabase
        .from('leads')
        .update({ notes })
        .eq('id', lead.id)
      
      setLead({ ...lead, notes })
      setEditingNotes(false)
      alert('Notes saved successfully!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lead Not Found</h1>
          <Link href="/dashboard/leads" className="text-blue-600 hover:text-blue-800">
            ← Back to Leads
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <BrandLogo href="/dashboard/leads" size="sm" />
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Leads
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isDemoMode() && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              🎭 <strong>Demo Mode</strong> - Changes won't be saved to a database
            </p>
          </div>
        )}

        {/* Lead Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{lead.name}</h1>
              <div className="flex items-center gap-2">
                {getTemperatureBadge(lead.temperature || temperature)}
                <span className="text-sm text-gray-500">
                  • Received {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800 font-medium">
                {lead.email}
              </a>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
              <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800 font-medium">
                {lead.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Property Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Interested Property</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{lead.property_title}</p>
              <p className="text-sm text-gray-500 mt-1">Property ID: {lead.property_id}</p>
            </div>
            <Link
              href={`/dashboard/properties`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View Property →
            </Link>
          </div>
        </div>

        {/* Message */}
        {lead.message && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Message</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{lead.message}</p>
          </div>
        )}

        {/* Temperature Update */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Temperature</h2>
          <p className="text-sm text-gray-600 mb-4">Qualify how interested this lead is:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="HOT">🔥 HOT - Ready to view or buy</option>
              <option value="WARM">🟡 WARM - Interested but undecided</option>
              <option value="COLD">❄️ COLD - Just asking/browsing</option>
            </select>
            <button
              onClick={handleTemperatureUpdate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Update
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Personal Notes</h2>
            {!editingNotes && (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {lead.notes ? 'Edit Notes' : 'Add Notes'}
              </button>
            )}
          </div>
          
          {editingNotes ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your private notes about this lead..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleNotesUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => {
                    setEditingNotes(false)
                    setNotes(lead.notes || '')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {lead.notes ? (
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              ) : (
                <p className="text-gray-400 italic">No notes yet. Click "Add Notes" to add your private notes.</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
            <a
              href={`sms:${lead.phone}`}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              SMS
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
