import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PDF Editor - Free Adobe Acrobat Alternative',
  description:
    'The free, open-source PDF editor that works like Adobe Acrobat — annotate, add text, fill forms, add signatures, redact, organize pages, and export. 100% in your browser. No account, no install, no cost.',
  alternates: {
    canonical: '/pdf-editor',
  },
  openGraph: {
    type: 'website',
    url: '/pdf-editor',
    siteName: 'ToolboxHQ',
    title: 'PDF Editor - Free Adobe Acrobat Alternative',
    description:
      'Annotate, add text, fill forms, add signatures, redact, and organize pages — all in your browser. Free, open source, and your files never leave your device.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Editor - Free Adobe Acrobat Alternative',
    description:
      'Annotate, add text, fill forms, add signatures, redact, and organize pages — all in your browser. Free, open source, and your files never leave your device.',
  },
};

const FEATURES = [
  {
    title: 'Annotate like Acrobat',
    description: 'Highlight, underline, and strikethrough text, drop sticky notes, and mark up anything with the exact tools you know from Acrobat.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    title: 'Add & edit text',
    description: 'Place fully formatted text anywhere — choose font, size, color, alignment, bold, italic, and even background color.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
      </svg>
    ),
  },
  {
    title: 'Draw, shape & sign',
    description: 'Freehand drawing with smooth strokes, arrows, lines, rectangles, and ellipses — plus typed signatures on any page.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: 'Fill & create forms',
    description: 'Type into existing form fields and drop your own — text fields, checkboxes, radio buttons, dropdowns, and date fields.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Redact sensitive content',
    description: 'Black out confidential information before sharing, just like Acrobat’s redaction tool.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: 'Organize pages',
    description: 'Reorder by dragging thumbnails, rotate, duplicate, delete, add blank pages, insert other PDFs, extract, and replace pages.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
  },
  {
    title: 'Watermarks, numbers & headers',
    description: 'Stamp watermarks, page numbers, headers, and footers across some or all pages in a few clicks.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    title: 'Search & export',
    description: 'Search for any text across every page and export a clean, finalized PDF — your annotations are baked right in.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
];

const PARITY = [
  { feature: 'Highlight / underline / strikethrough', us: true, acrobat: true },
  { feature: 'Add & format text', us: true, acrobat: true },
  { feature: 'Images & typed signatures', us: true, acrobat: true },
  { feature: 'Freehand drawing & shapes', us: true, acrobat: true },
  { feature: 'Sticky notes', us: true, acrobat: true },
  { feature: 'Redact content', us: true, acrobat: true },
  { feature: 'Fill & create form fields', us: true, acrobat: true },
  { feature: 'Search text in the document', us: true, acrobat: true },
  { feature: 'Reorder, rotate, delete, duplicate pages', us: true, acrobat: true },
  { feature: 'Insert, merge, extract, replace pages', us: true, acrobat: true },
  { feature: 'Watermarks & page numbers', us: true, acrobat: true },
  { feature: 'Export to PDF', us: true, acrobat: true },
  { feature: 'Price', us: 'Free forever', acrobat: 'From $12.99/mo' },
  { feature: 'Account required', us: 'No', acrobat: 'Yes' },
  { feature: 'Installation', us: 'None — works in your browser', acrobat: 'Desktop install' },
  { feature: 'Files stay on your device', us: 'Yes — 100%', acrobat: 'Uploaded to cloud' },
  { feature: 'Open source', us: 'Yes', acrobat: 'No' },
];

const FAQ = [
  {
    q: 'Is this PDF editor really free?',
    a: 'Yes. No sign-up, no trial, no watermark, and no paywall. Every feature on this page is free to use, forever.',
  },
  {
    q: 'Do my PDFs leave my device?',
    a: 'No. The editor processes everything locally in your browser. Your files are never uploaded to a server, which is why there are no size-based uploads and nothing for us to store.',
  },
  {
    q: 'Is it open source?',
    a: 'Yes. The entire project is open source and available on GitHub, so you can audit the code, suggest features, or contribute.',
  },
  {
    q: 'Does it need Adobe Acrobat or an Adobe account?',
    a: 'No. The editor is completely independent and runs in any modern browser — no plugins, no accounts, no Adobe anything.',
  },
  {
    q: 'Are there any limits?',
    a: 'The editor supports PDFs up to 200 MB and up to 1,000 pages per document.',
  },
  {
    q: 'Can I use it on my phone or tablet?',
    a: 'Yes. The editor is responsive and works in modern browsers on desktop, tablet, and mobile.',
  },
];

function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

export default function PdfEditorLanding() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              Free • Open Source • Private
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              The free, open-source alternative to{' '}
              <span className="text-blue-600 dark:text-blue-400">Adobe Acrobat</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Everything you normally reach for Acrobat for — annotate, add text, fill forms, add
              signatures, redact, and organize pages — with none of the cost, account, or cloud
              uploads. Runs entirely in your browser.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/pdf-editor/editor"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Open the free editor
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="https://github.com/Infaix/ToolboxHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                View source on GitHub
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ['200 MB', 'PDF size limit'],
                ['1,000', 'pages per document'],
                ['0', 'accounts or installs'],
                ['0¢', 'forever'],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Every Acrobat essential, right in your browser
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            The tools you’re used to — without the subscription.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="border-y border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              ToolboxHQ PDF Editor vs Adobe Acrobat
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Feature-for-feature coverage of the things people actually do — free.
            </p>
          </div>
          <div className="mt-12 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60">
                  <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Feature</th>
                  <th className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">ToolboxHQ PDF Editor</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Adobe Acrobat (paid)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {PARITY.map((row) => (
                  <tr key={row.feature} className="bg-white dark:bg-gray-900">
                    <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300">
                      {row.us === true ? <CheckIcon /> : <span className="font-medium text-green-600 dark:text-green-400">{row.us}</span>}
                    </td>
                    <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300">
                      {row.acrobat === true ? <CheckIcon /> : row.acrobat === false ? <DashIcon /> : <span className="text-gray-500 dark:text-gray-400">{row.acrobat}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
            Advanced Acrobat-only features such as OCR of scanned documents, converting PDFs to Word
            or Excel, and requesting remote e-signatures are on the roadmap — everything above is
            available today, for free.
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Your files never leave your device
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Everything — opening, annotating, organizing, and exporting — happens locally in your
              browser using WebAssembly and the Canvas API. There is no upload, no server copy, and
              no account to track you.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                '100% client-side processing — nothing is uploaded',
                'No account, no email, no sign-up',
                'No watermarks or branding added to your exports',
                'Works for sensitive or confidential documents',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Open source by design</h3>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              The whole project is open source on GitHub. Inspect the code, report issues, request
              features, or contribute — because your PDF tools shouldn’t be a black box.
            </p>
            <a
              href="https://github.com/Infaix/ToolboxHQ"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Contribute on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Priced like every tool should be
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              One plan. It’s the free one.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-blue-600 bg-white p-8 shadow-sm dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ToolboxHQ PDF Editor</h3>
              <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
                $0
                <span className="text-base font-normal text-gray-500 dark:text-gray-400"> / forever</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {['Every feature included', 'No account or sign-up', 'Unlimited documents', 'No watermarks', 'No data ever uploaded'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pdf-editor/editor"
                className="mt-8 block rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Start editing — it’s free
              </Link>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Adobe Acrobat Pro</h3>
              <p className="mt-2 text-4xl font-bold text-gray-400">
                $12.99
                <span className="text-base font-normal text-gray-400"> / month</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-500 dark:text-gray-400">
                {['Paid subscription', 'Account required', 'Files uploaded to the cloud', 'Trial gates and paywalls', 'Proprietary code'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <DashIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Frequently asked questions
        </h2>
        <div className="mt-10 space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-gray-900 dark:text-white">
                {item.q}
                <svg
                  className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-200 bg-blue-600 dark:border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ditch the Acrobat subscription
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Free. Open source. Private. Your PDFs, your browser, your call.
          </p>
          <Link
            href="/pdf-editor/editor"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
          >
            Open the editor now
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
