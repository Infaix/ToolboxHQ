import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'ToolboxHQ is free to use. View our simple pricing plans for individual users, professionals, and enterprises.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Pricing</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Perfect for casual users
            </p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                All developer tools
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                All file tools
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Client-side processing
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No account required
              </li>
            </ul>
            <button className="mt-8 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              Current Plan
            </button>
          </div>

          <div className="rounded-lg border-2 border-blue-500 bg-white p-8 shadow-sm dark:border-blue-400 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ToolboxHQ Pro</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Coming Soon
              </span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              For power users and professionals
            </p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$2.99</span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">or $25 lifetime</span>
            </div>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Everything in Free
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Ad-free experience
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Batch processing
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced tools
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved preferences
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
            </ul>
            <button
              disabled
              className="mt-8 w-full rounded-md border border-blue-500 bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        <div className="mt-16 rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Need custom solutions? Contact us for enterprise pricing and features.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}
