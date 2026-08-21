export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <a href="/" className="text-xl font-bold text-gray-900">
            Prospecta
          </a>
          <a
            href="/auth/login"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  )
}
