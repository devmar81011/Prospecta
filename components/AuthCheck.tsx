'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isDemoMode } from '@/lib/demo-auth'
import { createClient } from '@/lib/supabase/client'

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      // Check demo mode first
      if (isDemoMode()) {
        setAuthorized(true)
        setLoading(false)
        return
      }

      // Check Supabase auth
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setAuthorized(true)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
