import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Prospecta',
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: August 21, 2026</p>

      <div className="mt-8 space-y-6 text-gray-700 leading-relaxed">
        <p>
          Prospecta is a real-estate lead app for agents. This policy explains
          what we collect when you sign in and use the service.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Information we collect</h2>
          <p className="mt-2">
            If you continue with Facebook, we receive your Facebook name, profile
            photo, and email address so we can create your Prospecta account.
          </p>
          <p className="mt-2">
            You may also add property listings, lead details, viewing schedules,
            and profile information such as your name, phone number, and public
            listing links.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">How we use it</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Create and authenticate your account</li>
            <li>Show your properties, leads, and viewings in the dashboard</li>
            <li>Share public property pages you publish</li>
            <li>Improve and support the product</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal information. We do not post to Facebook
            on your behalf unless you choose a share action in the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Sharing</h2>
          <p className="mt-2">
            We use infrastructure providers to host the app and store data,
            including Vercel and Supabase. They process data only to provide
            those services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Your choices</h2>
          <p className="mt-2">
            You can update your profile in the dashboard. To delete your
            account and related data, follow the instructions on our{' '}
            <a className="text-blue-600 underline" href="/data-deletion">
              Data deletion
            </a>{' '}
            page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p className="mt-2">
            Questions about this policy: josephleomarsenanin@yahoo.com
          </p>
        </section>
      </div>
    </article>
  )
}
