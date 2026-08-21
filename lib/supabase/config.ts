const PLACEHOLDER_URL_MARKERS = [
  'mock-project',
  'your_supabase',
  'YOUR-PROJECT-REF',
  'your-project',
]

const REAL_SUPABASE_URL = 'https://cksjlnxjgaxczibuuhgv.supabase.co'
const REAL_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrc2psbnhqZ2F4Y3ppYnV1aGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDM2NDQsImV4cCI6MjEwMjg3OTY0NH0.B37lOaMMVc0Jb7fkcrYR__PD0-SmxDoRd36DFktVFA0'

function isPlaceholderUrl(url: string | undefined) {
  if (!url) return true
  return PLACEHOLDER_URL_MARKERS.some((marker) => url.includes(marker))
}

function isPlaceholderKey(key: string | undefined) {
  if (!key) return true
  return key.includes('your-anon-key') || key.includes('your_supabase_anon_key')
}

export const supabaseUrl = isPlaceholderUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? REAL_SUPABASE_URL
  : process.env.NEXT_PUBLIC_SUPABASE_URL!

export const supabaseAnonKey = isPlaceholderKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ? REAL_SUPABASE_ANON_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
