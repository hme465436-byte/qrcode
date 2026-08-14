import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MY KIT TOOL Professional Studio',
    short_name: 'MY KIT TOOL',
    description: 'Premium AI-Powered Digital Utility Studio. Professional assets and technical tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060907',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity', 'utilities', 'business'],
    screenshots: [
      {
        src: 'https://picsum.photos/seed/mykit-ss/400/800',
        sizes: '400x800',
        type: 'image/png',
        label: 'MY KIT TOOL Studio Dashboard'
      }
    ]
  };
}
