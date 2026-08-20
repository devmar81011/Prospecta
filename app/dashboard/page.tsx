'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode, getDemoUser, DEMO_LEADS, DEMO_PROPERTIES, DEMO_VIEWINGS } from '@/lib/demo-auth'
import { setDemoMode } from '@/lib/demo-auth'
import { useRouter } from 'next/navigation'

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
              <div className="h-8 w-8 sm:h-9 sm:w-9 bg-[#1877F2] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-lg sm:text-xl">P</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[#1877F2] truncate">
                Prospecta
              </h1>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">📋 Properties</h3>
            <p className="text-xs sm:text-sm text-gray-600">Manage listings</p>
          </Link>

          <Link 
            href="/dashboard/leads" 
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">👥 Leads</h3>
            <p className="text-xs sm:text-sm text-gray-600">Track inquiries</p>
          </Link>

          <Link 
            href="/dashboard/viewings" 
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">📅 Viewings</h3>
            <p className="text-xs sm:text-sm text-gray-600">View schedule</p>
          </Link>

          <Link 
            href="/dashboard/profile" 
            className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">⚙️ Profile</h3>
            <p className="text-xs sm:text-sm text-gray-600">Edit settings</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
