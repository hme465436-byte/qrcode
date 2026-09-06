'use client';

import { ShieldCheck, Zap, AppWindow, Globe } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="w-10 h-10 text-blue-400" />,
    title: "100% Privacy Protected",
    description: "All tools run locally in your browser using WebAssembly. Your files never leave your device—zero uploads, zero server storage, complete privacy.",
    className: "lg:col-span-4",
    glowClass: "hover:border-blue-500/50"
  },
  {
    icon: <Zap className="w-10 h-10 text-cyan-400" />,
    title: "Lightning Fast",
    description: "No uploads, no waiting. Instant processing with browser-native technology.",
    className: "lg:col-span-2",
    glowClass: "hover:border-cyan-500/50"
  },
  {
    icon: <AppWindow className="w-10 h-10 text-purple-400" />,
    title: "120+ Professional Tools",
    description: "One platform for everything—AI, PDF, Image, Video, Utilities & more.",
    className: "lg:col-span-3",
    glowClass: "hover:border-purple-500/50"
  },
   {
    icon: <Globe className="w-10 h-10 text-orange-400" />,
    title: "Works Everywhere",
    description: "Desktop, tablet, or mobile. Fully responsive for all your devices.",
    className: "lg:col-span-3",
     glowClass: "hover:border-orange-500/50"
  },
];

export function Features() {
  return (
    <section id="features" className="w-full py-16 sm:py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Unmatched Power, Unbeatable Simplicity</h2>
            <p className="mt-2 text-base text-gray-400 max-w-2xl mx-auto">MyKitTool is engineered from the ground up to deliver professional-grade performance without the complexity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg transition-all duration-300 hover:-translate-y-1 ${feature.className} ${feature.glowClass}`}
            >
              <div className="mb-5 p-3 bg-white/10 rounded-full w-min border border-white/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
