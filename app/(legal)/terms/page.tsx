import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Prospecta',
}

export default function TermsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: August 21, 2026</p>

      <div className="mt-8 space-y-6 text-gray-700 leading-relaxed">
        <p>
          By using Prospecta, you agree to these terms. Prospecta helps real
          estate agents manage property listings, leads, and viewings.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Your account</h2>
          <p className="mt-2">
            You are responsible for the information you add, including property
            details and lead data. Use the service only for lawful real-estate
            work, and only with data you have the right to store.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Facebook login</h2>
          <p className="mt-2">
            If you sign in with Facebook, you also follow Facebook&apos;s terms.
            Prospecta only uses Facebook to authenticate you and read the name,
            photo, and email you approve.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Availability</h2>
          <p className="mt-2">
            We provide the service as-is and may change or discontinue features.
            We are not a party to your transactions with buyers or sellers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p className="mt-2">
            Questions: josephleomarsenanin@yahoo.com
          </p>
        </section>
      </div>
    </article>
  )
}
