import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Navbar } from '@/components/qr-canvas/navbar';
import { Footer } from '@/components/qr-canvas/footer';
import { Toaster } from '@/components/ui/toaster';
import { FeedbackRow } from '@/components/qr-canvas/feedback-row';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Suspense } from 'react';
import { KitRouter } from '@/components/qr-canvas/kit-router';
import { FloatingActionHub } from '@/components/qr-canvas/floating-action-hub';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: 'My Kit Tool',
  description: 'Free online tools including AI chatbot, resume builder, image tools and more.',
  keywords: 'digital tools, free utilities, qr code generator, photo editor, ocr text extraction, hex converter, aob converter, professional studio, my kit tool',
  authors: [{ name: 'MY KIT TOOL Team' }],
  metadataBase: new URL('https://mykittool.app'), 
  openGraph: {
    title: 'My Kit Tool',
    description: 'Free online tools including AI chatbot, resume builder, image tools and more.',
    type: 'website',
    url: 'https://mykittool.app',
    siteName: 'MY KIT TOOL',
    images: [{ url: 'https://picsum.photos/seed/mykit-seo/1200/630' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Kit Tool',
    description: 'Free online tools including AI chatbot, resume builder, image tools and more.',
    images: ['https://picsum.photos/seed/mykit-twitter/1200/630'],
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <script 
          src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.9.2/lib/qr-code-styling.min.js" 
          async
        />
      </head>
      <body 
        className="font-body bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground overflow-x-hidden w-full max-w-full"
        suppressHydrationWarning
      >
        <FirebaseClientProvider>
          <Navbar />
          <main className="min-h-screen pt-16 w-full max-w-full">
            <Suspense fallback={null}>
              <KitRouter>
                {children}
              </KitRouter>
            </Suspense>
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
