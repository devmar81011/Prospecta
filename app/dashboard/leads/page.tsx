'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode, DEMO_LEADS } from '@/lib/demo-auth'

interface Lead {
  id: string
  property_id: string
  property_title: string
  name: string
  email: string
  phone: string
  message?: string
  status: string
  created_at: string
}

function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    new: '🔥',
    contacted: '💬',
    qualified: '❤️',
    viewing: '📅',
    negotiating: '🤝',
    reserved: '📝',
    sold: '🎉',
    lost: '❌',
    NEW: '🔥',
    CONTACTED: '💬',
    INTERESTED: '❤️',
    VIEWING: '📅',
    NEGOTIATING: '🤝',
    RESERVED: '📝',
    SOLD: '🎉',
    NOT_INTERESTED: '❌',
  }
  return emojis[status] || '📋'
}

function getStatusBadge(status: string) {
  const badges: Record<string, { bg: string; text: string }> = {
    new: { bg: 'bg-red-100', text: 'text-red-800' },
    contacted: { bg: 'bg-blue-100', text: 'text-blue-800' },
    qualified: { bg: 'bg-pink-100', text: 'text-pink-800' },
    viewing: { bg: 'bg-purple-100', text: 'text-purple-800' },
    negotiating: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    reserved: { bg: 'bg-orange-100', text: 'text-orange-800' },
    sold: { bg: 'bg-green-100', text: 'text-green-800' },
    lost: { bg: 'bg-gray-100', text: 'text-gray-800' },
    NEW: { bg: 'bg-red-100', text: 'text-red-800' },
    CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    INTERESTED: { bg: 'bg-pink-100', text: 'text-pink-800' },
    VIEWING: { bg: 'bg-purple-100', text: 'text-purple-800' },
    NEGOTIATING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    RESERVED: { bg: 'bg-orange-100', text: 'text-orange-800' },
    SOLD: { bg: 'bg-green-100', text: 'text-green-800' },
    NOT_INTERESTED: { bg: 'bg-gray-100', text: 'text-gray-800' },
  }
  const badge = badges[status] || badges.new
  const emoji = getStatusEmoji(status)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
      <span className="mr-1">{emoji}</span>
      {status.toUpperCase().replace('_', ' ')}
    </span>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeads() {
      if (isDemoMode()) {
        // Load demo leads
        setLeads(DEMO_LEADS as any)
        setLoading(false)
      } else {
        // Load real leads from Supabase
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const { data } = await supabase
          .from('leads')
          .select(`
            *,
            property:properties(title, location)
          `)
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false })

        const formattedLeads = (data || []).map((lead: any) => ({
          ...lead,
          property_title: lead.property?.title || 'Unknown Property'
        }))

        setLeads(formattedLeads)
        setLoading(false)
      }
    }

    loadLeads()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white">🏠</span>
              </div>
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Prospecta
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your property inquiries and leads</p>
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-600 mb-6">
              Share your property links on Facebook to start capturing leads
            </p>
            <Link
              href="/dashboard/properties"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
            >
              View Properties
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.property_title}</div>
                        {lead.message && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{lead.message}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="text-blue-600 hover:text-blue-900 font-semibold"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
