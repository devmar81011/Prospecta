import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return profile
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Real Estate Lead App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Good day, {profile?.display_name || 'Agent'} 👋
          </h2>
          <p className="text-gray-600">Welcome to your dashboard</p>
        </div>

        {!profile?.display_name && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Please complete your profile to get started.{' '}
              <Link href="/dashboard/profile" className="font-medium underline">
                Setup Profile
              </Link>
            </p>
          </div>
        )}

        <div className="mb-8">
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + CREATE PROPERTY POST
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🔥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New Leads
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/leads" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all leads
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Today's Viewings
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/viewings" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View schedule
              </Link>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🏠</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Properties
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/dashboard/properties" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View properties
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/properties"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mr-3">🏠</span>
              <div>
                <h4 className="font-medium text-gray-900">My Properties</h4>
                <p className="text-sm text-gray-500">Manage your property listings</p>
              </div>
            </Link>
            <Link
              href="/dashboard/leads"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mr-3">❤️</span>
              <div>
                <h4 className="font-medium text-gray-900">My Leads</h4>
                <p className="text-sm text-gray-500">Track interested buyers</p>
              </div>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mr-3">👤</span>
              <div>
                <h4 className="font-medium text-gray-900">My Profile</h4>
                <p className="text-sm text-gray-500">Update your contact information</p>
              </div>
            </Link>
            <Link
              href="/dashboard/viewings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mr-3">📅</span>
              <div>
                <h4 className="font-medium text-gray-900">Site Viewings</h4>
                <p className="text-sm text-gray-500">Schedule and manage viewings</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
