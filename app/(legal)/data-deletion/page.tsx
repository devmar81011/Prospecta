import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Data Deletion - Prospecta',
}

export default function DataDeletionPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900">User data deletion</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: August 21, 2026</p>

      <div className="mt-8 space-y-6 text-gray-700 leading-relaxed">
        <p>
          You can ask us to delete the Prospecta account and personal data
          created when you signed in with Facebook or added listings and leads.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">How to request deletion</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Email <strong>josephleomarsenanin@yahoo.com</strong> from the
              address on your Prospecta account.
            </li>
            <li>
              Use the subject line <strong>Delete my Prospecta account</strong>.
            </li>
            <li>
              Include your name and the Facebook email you used to sign in.
            </li>
          </ol>
          <p className="mt-3">
            We will delete your profile, properties, images, leads, and viewing
            records associated with that account, usually within 7 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Facebook data</h2>
          <p className="mt-2">
            Deleting your Prospecta account does not delete your Facebook
            account. To remove Prospecta&apos;s access in Facebook, open
            Facebook Settings → Apps and websites → Prospecta → Remove.
          </p>
        </section>
      </div>
    </article>
  )
}
