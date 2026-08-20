export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Real Estate Lead App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/auth/login" className="text-sm text-gray-700 hover:text-gray-900">
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-gray-50">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Post your property. Find your buyers. Never lose a lead.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Simple, mobile-first app for real estate agents who get buyers through Facebook
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold text-lg mb-2">Mobile-First</h3>
              <p className="text-sm text-gray-600">
                Manage your properties and leads from your phone
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-3">❤️</div>
              <h3 className="font-semibold text-lg mb-2">Automatic Leads</h3>
              <p className="text-sm text-gray-600">
                Buyers click "I'm Interested" - leads are created automatically
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-lg mb-2">Track Everything</h3>
              <p className="text-sm text-gray-600">
                Manage leads, schedule viewings, update status
              </p>
            </div>
          </div>

          <a
            href="/auth/signup"
            className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            Start Free
          </a>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required
          </p>
        </div>
      </div>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            &copy; 2026 Real Estate Lead App. Built for Facebook-first real estate agents.
          </p>
        </div>
      </footer>
    </main>
  );
}
