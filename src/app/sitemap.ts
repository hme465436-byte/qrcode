import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    '/single', '/bulk', '/hash-generator', '/uuid-generator', '/json-formatter', 
    '/regex-tester', '/photo-enhance-fix', '/passport-photo-maker', '/ocr', 
    '/pdf-merger', '/pdf-compressor', '/video-to-audio', '/whatsapp-dp-maker', 
    '/csv-to-json', '/json-to-csv', '/logo-maker', '/pdf-rotator', 
    '/word-to-pdf', '/pdf-to-image', '/pdf-splitter', '/file-compressor', 
    '/password-generator', '/color-picker', '/rgb-picker', '/markdown-preview', 
    '/image-converter', '/image-resizer', '/image-compressor', '/image-to-pdf', 
    '/photo-editor', '/vocal-separator', '/video-to-gif', '/audio-joiner', 
    '/audio-booster', '/letter-art', '/dot-art', '/repeater', '/hex-converter', 
    '/code-converter', '/dictionary', '/image-url-downloader', '/speaker-tester', 
    '/mic-tester', '/live-wallpaper', '/youtube-thumbnail-downloader', 
    '/youtube-thumbnail-maker', '/youtube-banner-maker', '/age-calculator', 
    '/rename-file', '/lorem-ipsum-generator', '/nickname-generator', '/donate',
    '/image-border-frame', '/custom-watermark', '/direct-file-share', '/wifi-qr-decoder',
    '/hide-message-photo', '/temp-room', '/sim-data', '/html-to-url', '/tax-calculator', '/lucky-draw',
    '/bmi-calculator', '/bio-maker', '/image-size-increaser', '/wps-sheets', '/speed-test', '/ip-finder',
    '/currency-converter', '/weather'
  ];

  const routes = tools.map(tool => ({
    url: `https://mykittool.app${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://mykittool.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...routes
  ];
}
