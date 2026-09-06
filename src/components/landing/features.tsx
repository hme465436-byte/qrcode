'use client';

import { Lock, Zap, Package, Globe } from 'lucide-react';

const features = [
  {
    icon: <Lock className="w-8 h-8 text-blue-500" />,
    title: "100% Privacy Protected",
    description: "All tools run locally in your browser. Your files never leave your device.",
  },
  {
    icon: <Zap className="w-8 h-8 text-purple-500" />,
    title: "Lightning Fast",
    description: "No uploads, no waiting. Instant processing with browser-native technology.",
  },
  {
    icon: <Package className="w-8 h-8 text-cyan-500" />,
    title: "120+ Free Tools",
    description: "One platform for everything - AI, PDF, Image, Video, Utilities & more.",
  },
  {
    icon: <Globe className="w-8 h-8 text-green-500" />,
    title: "Works Everywhere",
    description: "Desktop, tablet, or mobile - perfectly optimized for all devices.",
  },
];

export function Features() {
  return (
    <section className="w-full py-16 sm:py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/10 to-transparent" />
                <div className="relative z-10">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
