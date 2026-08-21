'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode, DEMO_VIEWINGS } from '@/lib/demo-auth'

interface Viewing {
  id: string
  property_id: string
  property_title: string
  client_name: string
  scheduled_date: string
  status: string
  notes?: string
  created_at: string
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isFuture(date: Date): boolean {
  return date > new Date()
}

function getStatusBadge(status: string) {
  const badges: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-800' },
    completed: { bg: 'bg-green-100', text: 'text-green-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    no_show: { bg: 'bg-gray-100', text: 'text-gray-800' },
    SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
    NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-800' },
  }
  const badge = badges[status] || badges.scheduled
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
      {status.toUpperCase().replace('_', ' ')}
    </span>
  )
}

export default function ViewingsPage() {
  const [viewings, setViewings] = useState<Viewing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadViewings() {
      if (isDemoMode()) {
        // Load demo viewings
        setViewings(DEMO_VIEWINGS as any)
        setLoading(false)
      } else {
        // Load real viewings from Supabase
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const { data } = await supabase
          .from('viewings')
          .select(`
            *,
            lead:leads(name, phone_number),
            property:properties(title, location)
          `)
          .eq('leads.agent_id', user.id)
          .order('scheduled_at', { ascending: true })

        const formattedViewings = (data || []).map((viewing: any) => ({
          ...viewing,
          property_title: viewing.property?.title || 'Unknown Property',
          client_name: viewing.lead?.name || 'Unknown Client',
          scheduled_date: viewing.scheduled_date || viewing.scheduled_at,
        }))

        setViewings(formattedViewings)
        setLoading(false)
      }
    }

    loadViewings()
  }, [])

  const today = new Date()
  
  const todayViewings = viewings.filter(v => {
    const viewingDate = new Date(v.scheduled_date)
    return isToday(viewingDate) && (v.status === 'scheduled' || v.status === 'SCHEDULED')
  })

  const upcomingViewings = viewings.filter(v => {
    const viewingDate = new Date(v.scheduled_date)
    return isFuture(viewingDate) && !isToday(viewingDate) && (v.status === 'scheduled' || v.status === 'SCHEDULED')
  })

  const pastViewings = viewings.filter(v => {
    const viewingDate = new Date(v.scheduled_date)
    return viewingDate < today || (v.status !== 'scheduled' && v.status !== 'SCHEDULED')
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading viewings...</p>
        </div>
      </div>
    )
  }

  const ViewingCard = ({ viewing }: { viewing: Viewing }) => (
    <div className="bg-white rounded-lg border shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{viewing.property_title}</h3>
          <p className="text-sm text-gray-600">👤 {viewing.client_name}</p>
        </div>
        {getStatusBadge(viewing.status)}
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="mr-2">📅</span>
          {formatDateTime(viewing.scheduled_date)}
        </div>
        {viewing.notes && (
          <div className="flex items-start">
            <span className="mr-2">📝</span>
            <span>{viewing.notes}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Link href="/dashboard" className="text-2xl font-bold text-black truncate">
                Prospecta
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
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scheduled Viewings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your property viewing appointments</p>
        </div>

        {viewings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No viewings scheduled</h3>
            <p className="text-gray-600 mb-6">
              Schedule viewings with your leads to show your properties
            </p>
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
            >
              View Leads
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Today's Viewings */}
            {todayViewings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🔥</span> Today's Viewings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todayViewings.map((viewing) => (
                    <ViewingCard key={viewing.id} viewing={viewing} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Viewings */}
            {upcomingViewings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📅</span> Upcoming Viewings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingViewings.map((viewing) => (
                    <ViewingCard key={viewing.id} viewing={viewing} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Viewings */}
            {pastViewings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📋</span> Past Viewings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastViewings.map((viewing) => (
                    <ViewingCard key={viewing.id} viewing={viewing} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
