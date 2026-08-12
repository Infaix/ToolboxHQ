import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ToolboxHQ - Free Online Tools & Utilities",
    template: "%s | ToolboxHQ",
  },
  description:
    "Free online tools for everyday tasks. Edit PDFs, convert images, format code and more — all processed locally in your browser with no sign-up.",
  applicationName: "ToolboxHQ",
  keywords: [
    "online tools",
    "free tools",
    "pdf editor",
    "pdf merge",
    "pdf split",
    "image converter",
    "image compressor",
    "json formatter",
    "json validator",
    "base64 encoder",
    "uuid generator",
    "regex tester",
    "adobe acrobat alternative",
    "utilities",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ToolboxHQ",
    title: "ToolboxHQ - Free Online Tools & Utilities",
    description:
      "Free online tools for everyday tasks. Edit PDFs, convert images, format code and more — processed locally in your browser.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "ToolboxHQ - Free Online Tools & Utilities",
    description:
      "Free online tools for everyday tasks. Edit PDFs, convert images, format code and more — processed locally in your browser.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <Navigation />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
