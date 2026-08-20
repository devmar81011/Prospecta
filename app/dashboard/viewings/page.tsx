import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Viewing } from '@/lib/types/database'

interface ViewingWithDetails extends Viewing {
  lead: {
    name: string
    phone_number: string
  }
  property: {
    title: string
    location: string
  }
}

async function getViewings(userId: string): Promise<ViewingWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('viewings')
    .select(`
      *,
      lead:leads(name, phone_number),
      property:properties(title, location)
    `)
    .eq('leads.agent_id', userId)
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching viewings:', error)
    return []
  }

  return data as ViewingWithDetails[]
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isFuture(date: Date): boolean {
  return date > new Date()
}

export default async function ViewingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const allViewings = await getViewings(user.id)
  const today = new Date()
  
  const todayViewings = allViewings.filter(v => {
    const viewingDate = new Date(v.scheduled_at)
    return isToday(viewingDate) && v.status === 'SCHEDULED'
  })

  const upcomingViewings = allViewings.filter(v => {
    const viewingDate = new Date(v.scheduled_at)
    return isFuture(viewingDate) && !isToday(viewingDate) && v.status === 'SCHEDULED'
  })

  const pastViewings = allViewings.filter(v => {
    const viewingDate = new Date(v.scheduled_at)
    return viewingDate < today || v.status !== 'SCHEDULED'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Real Estate Lead App
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Site Viewings</h1>
          <p className="text-gray-600">Manage your scheduled property viewings</p>
        </div>

        {allViewings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No viewings scheduled</h3>
            <p className="text-gray-600 mb-6">
              Schedule viewings from your lead details page
            </p>
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View Leads
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {todayViewings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Viewings</h2>
                <div className="bg-white rounded-lg shadow divide-y">
                  {todayViewings.map((viewing) => (
                    <div key={viewing.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl font-bold text-blue-600 mr-3">
                              {new Date(viewing.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">{viewing.lead.name}</p>
                              <p className="text-sm text-gray-600">{viewing.property.title}</p>
                            </div>
                          </div>
                          {viewing.location && (
                            <p className="text-sm text-gray-600 ml-20">📍 {viewing.location}</p>
                          )}
                          {viewing.notes && (
                            <p className="text-sm text-gray-600 ml-20 mt-1">{viewing.notes}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <a
                            href={`tel:${viewing.lead.phone_number}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            📞 {viewing.lead.phone_number}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingViewings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Viewings</h2>
                <div className="bg-white rounded-lg shadow divide-y">
                  {upcomingViewings.map((viewing) => (
                    <div key={viewing.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">
                            {new Date(viewing.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {new Date(viewing.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                          <p className="font-semibold text-gray-900">{viewing.lead.name}</p>
                          <p className="text-sm text-gray-600">{viewing.property.title}</p>
                          {viewing.location && (
                            <p className="text-sm text-gray-600 mt-1">📍 {viewing.location}</p>
                          )}
                        </div>
                        <a
                          href={`tel:${viewing.lead.phone_number}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          📞 Call
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastViewings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Past Viewings</h2>
                <div className="bg-white rounded-lg shadow divide-y">
                  {pastViewings.slice(0, 10).map((viewing) => (
                    <div key={viewing.id} className="p-4 hover:bg-gray-50 opacity-75">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">
                            {new Date(viewing.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="font-medium text-gray-900">{viewing.lead.name}</p>
                          <p className="text-sm text-gray-600">{viewing.property.title}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
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
        )}
      </main>
    </div>
  )
}
