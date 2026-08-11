import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ToolboxHQ',
  description: 'ToolboxHQ is a free, privacy-focused collection of browser-based tools for developers and general users. Files are processed locally on your device.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">About ToolboxHQ</h1>
          
          <div className="mt-8 prose prose-gray dark:prose-invert max-w-none">
            <p>
              ToolboxHQ is a free, privacy-focused collection of browser-based tools for developers, students, and general users. Our mission is to provide powerful, easy-to-use utilities that respect your privacy and work entirely in your browser.
            </p>

            <h2>Our Mission</h2>
            <p>
              We believe that essential developer and file tools should be accessible to everyone, free of charge, and without compromising privacy. By processing files locally in your browser, we ensure that your data never leaves your device unless absolutely necessary.
            </p>

            <h2>Privacy First</h2>
            <p>
              Privacy is at the core of everything we do. Most of our tools process data entirely on your device using modern browser APIs. This means:
            </p>
            <ul>
              <li>Your files never leave your device</li>
              <li>No server-side processing for most operations</li>
              <li>No account required to use our tools</li>
              <li>No data collection or tracking</li>
            </ul>

            <h2>Technology</h2>
            <p>
              ToolboxHQ is built with modern web technologies to ensure fast performance and a great user experience:
            </p>
            <ul>
              <li><strong>Next.js</strong> - React framework for optimal performance</li>
              <li><strong>TypeScript</strong> - Type-safe code for reliability</li>
              <li><strong>Tailwind CSS</strong> - Modern utility-first styling</li>
              <li><strong>Client-side libraries</strong> - PDF-lib, Canvas API, and more for local processing</li>
            </ul>

            <h2>Open Source</h2>
            <p>
              ToolboxHQ is open source. You can view our code, contribute, or even run your own instance. We believe in transparency and community-driven development.
            </p>

            <h2>Contact Us</h2>
            <p>
              Have questions, suggestions, or want to contribute? We&apos;d love to hear from you. Visit our <a href="/contact">contact page</a> to get in touch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
