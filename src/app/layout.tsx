import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Navbar } from '@/components/mykittool/navbar';
import { ToolNav } from '@/components/mykittool/tool-nav';
import { RelatedTools } from '@/components/mykittool/related-tools';
import { Footer } from '@/components/mykittool/footer';
import { Toaster } from '@/components/ui/toaster';
import { FeedbackRow } from '@/components/mykittool/feedback-row';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Suspense } from 'react';
import { KitRouter } from '@/components/mykittool/kit-router';
import { FloatingActionHub } from '@/components/mykittool/floating-action-hub';
import { UsageTracker } from '@/components/mykittool/usage-tracker';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: 'My Kit Tool | Free Online Tools',
  description: 'My Kit Tool free AI, PDF and image tools. Access over 120+ professional online utilities including AI Chatbot, Resume Builder, and PDF management for free.',
  keywords: 'free online tools, ai tools, pdf editor, image converter, qr code generator, developer tools, my kit tool, privacy-focused tools, browser-based utilities',
  authors: [{ name: 'MY KIT TOOL Team' }],
  metadataBase: new URL('https://mykittool.vercel.app'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'vMj1XN9ziXyU5kBso8wdA_OhZuzhD0o_BGSrSu9uiGU',
  },
  openGraph: {
    title: 'My Kit Tool | Free Online Tools',
    description: '120+ free online tools for AI, PDF, Images, and more at My Kit Tool. Fast, private, and secure.',
    type: 'website',
    url: 'https://mykittool.vercel.app',
    siteName: 'MY KIT TOOL',
    images: [{ url: 'https://mykittool.vercel.app/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Kit Tool | Free Online Tools',
    description: 'Supercharge your productivity with My Kit Tool. Access a wide range of free, secure, and browser-based tools for AI, PDF, images, and more.',
    images: ['https://mykittool.vercel.app/twitter-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="font-body bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground overflow-x-hidden w-full max-w-full"
        suppressHydrationWarning
      >
        <FirebaseClientProvider>
          <UsageTracker />
          <Navbar />
          <main className="min-h-screen pt-16 flex flex-col w-full max-w-full">
            <Suspense fallback={null}>
              <ToolNav />
            </Suspense>
            <div className="flex-1 w-full max-w-full">
              <Suspense fallback={null}>
                <KitRouter>
                  {children}
                </KitRouter>
              </Suspense>
              <Suspense fallback={null}>
                <RelatedTools />
              </Suspense>
            </div>
            <FeedbackRow />
          </main>
          <Footer />
          <FloatingActionHub />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
