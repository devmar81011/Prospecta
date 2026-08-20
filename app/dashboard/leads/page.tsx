import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Lead } from '@/lib/types/database'

interface LeadWithProperty extends Lead {
  property: {
    title: string
    location: string
  }
}

async function getLeads(userId: string): Promise<LeadWithProperty[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      property:properties(title, location)
    `)
    .eq('agent_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return data as LeadWithProperty[]
}

function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
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
    NEW: { bg: 'bg-red-100', text: 'text-red-800' },
    CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    INTERESTED: { bg: 'bg-pink-100', text: 'text-pink-800' },
    VIEWING: { bg: 'bg-purple-100', text: 'text-purple-800' },
    NEGOTIATING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    RESERVED: { bg: 'bg-orange-100', text: 'text-orange-800' },
    SOLD: { bg: 'bg-green-100', text: 'text-green-800' },
    NOT_INTERESTED: { bg: 'bg-gray-100', text: 'text-gray-800' },
  }
  const badge = badges[status] || badges.NEW
  const emoji = getStatusEmoji(status)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
      <span className="mr-1">{emoji}</span>
      {status.replace('_', ' ')}
    </span>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const leads = await getLeads(user.id)

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
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600">Track and manage your interested buyers</p>
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-600 mb-6">
              When buyers express interest in your properties, they'll appear here
            </p>
            <Link
              href="/dashboard/properties"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View My Properties
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.phone_number}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.property.title}</div>
                        <div className="text-sm text-gray-500">📍 {lead.property.location}</div>
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
                          className="text-blue-600 hover:text-blue-900"
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
