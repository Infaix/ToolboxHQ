import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ToolboxHQ privacy policy. Our tools process data locally in your browser and do not upload, store, or share your files.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          
          <div className="mt-8 prose prose-gray dark:prose-invert max-w-none">
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2>Introduction</h2>
            <p>
              At ToolboxHQ, we take your privacy seriously. This privacy policy explains how we handle your data when you use our tools.
            </p>

            <h2>Client-Side Processing</h2>
            <p>
              Most of our tools process data entirely in your browser using modern web APIs. This means:
            </p>
            <ul>
              <li>Your files and data never leave your device</li>
              <li>No data is sent to our servers</li>
              <li>No data is stored on our servers</li>
              <li>We cannot access your files or data</li>
            </ul>

            <h2>Data Collection</h2>
            <p>
              We do not collect:
            </p>
            <ul>
              <li>Uploaded files</li>
              <li>File contents</li>
              <li>Processed data</li>
              <li>Personal information</li>
              <li>Account credentials (we don&apos;t require accounts)</li>
            </ul>

            <h2>Cookies and Local Storage</h2>
            <p>
              We may use browser local storage to:
            </p>
            <ul>
              <li>Remember your theme preference (light/dark mode)</li>
              <li>Store non-sensitive user preferences</li>
            </ul>
            <p>
              We do not use tracking cookies or third-party analytics services.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              We do not use third-party services that would compromise your privacy. Our tools use only open-source libraries that run entirely in your browser.
            </p>

            <h2>Server-Side Processing</h2>
            <p>
              For tools that require server-side processing (if any), we will:
            </p>
            <ul>
              <li>Clearly indicate this on the tool page</li>
              <li>Delete your data immediately after processing</li>
              <li>Not store your data for any longer than necessary</li>
              <li>Not share your data with third parties</li>
            </ul>

            <h2>Security</h2>
            <p>
              We implement appropriate security measures to protect your data. However, since most processing happens client-side, the security of your data primarily depends on the security of your device and browser.
            </p>

            <h2>Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of significant changes by updating the date at the top of this policy.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us through our <a href="/contact">contact page</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
