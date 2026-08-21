'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode, getDemoUser, DEMO_LEADS, DEMO_PROPERTIES, DEMO_VIEWINGS } from '@/lib/demo-auth'
import { setDemoMode } from '@/lib/demo-auth'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'

interface Profile {
  display_name?: string
  full_name?: string
  phone?: string
  agency?: string
}

interface Stats {
  newLeadsCount: number
  todayViewingsCount: number
  activePropertiesCount: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats>({ newLeadsCount: 0, todayViewingsCount: 0, activePropertiesCount: 0 })
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      if (isDemoMode()) {
        // Load demo data
        const demoUser = getDemoUser()
        setUserEmail(demoUser?.email || '')
        setProfile({ 
          display_name: demoUser?.full_name,
          full_name: demoUser?.full_name,
          phone: demoUser?.phone,
          agency: demoUser?.agency,
        })
        
        // Calculate demo stats
        const newLeadsCount = DEMO_LEADS.filter(l => l.status === 'new').length
        const todayViewingsCount = DEMO_VIEWINGS.length
        const activePropertiesCount = DEMO_PROPERTIES.filter(p => p.status === 'available').length
        
        setStats({ newLeadsCount, todayViewingsCount, activePropertiesCount })
      } else {
        // Load real data from Supabase
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        setUserEmail(user.email || '')

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)

        // Fetch stats
        const { data: newLeads } = await supabase
          .from('leads')
          .select('id')
          .eq('agent_id', user.id)
          .eq('status', 'NEW')

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const { data: todayViewings } = await supabase
          .from('viewings')
          .select('*, leads!inner(agent_id)')
          .eq('leads.agent_id', user.id)
          .eq('status', 'SCHEDULED')
          .gte('scheduled_at', today.toISOString())
          .lt('scheduled_at', tomorrow.toISOString())

        const { data: activeProperties } = await supabase
          .from('properties')
          .select('id')
          .eq('agent_id', user.id)
          .eq('status', 'ACTIVE')

        setStats({
          newLeadsCount: newLeads?.length || 0,
          todayViewingsCount: todayViewings?.length || 0,
          activePropertiesCount: activeProperties?.length || 0,
        })
      }
    }

    loadData()
  }, [])

  const handleSignOut = () => {
    if (isDemoMode()) {
      setDemoMode(false)
      router.push('/auth/login')
    } else {
      window.location.href = '/auth/signout'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <BrandLogo href="/dashboard" size="sm" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isDemoMode() && (
                <span className="hidden xs:inline-flex text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                  DEMO
                </span>
              )}
              <span className="hidden sm:block text-sm text-gray-700 truncate max-w-[150px]">{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Hello, {profile?.display_name || profile?.full_name || 'Agent'}! 👋
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Welcome to your dashboard</p>
        </div>

        {!profile?.display_name && !isDemoMode() && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Please complete your profile to get started.{' '}
              <Link href="/dashboard/profile" className="font-medium underline">
                Setup Profile
              </Link>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.newLeadsCount}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2 sm:p-3">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Viewings</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.todayViewingsCount}</p>
              </div>
              <div className="bg-green-100 rounded-full p-2 sm:p-3">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Properties</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.activePropertiesCount}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-2 sm:p-3">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link 
            href="/dashboard/properties" 
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Properties</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Manage listings</p>
          </Link>

          <Link 
            href="/dashboard/leads" 
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Leads</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Track inquiries</p>
          </Link>

          <Link 
            href="/dashboard/viewings" 
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Viewings</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">View schedule</p>
          </Link>

          <Link 
            href="/dashboard/profile" 
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Profile</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Edit settings</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
