'use client';

import { MousePointer2, UploadCloud, DownloadCloud } from 'lucide-react';

const steps = [
  {
    icon: <MousePointer2 className="w-12 h-12 text-cyan-400" />,
    title: "Choose Your Tool",
    description: "Browse our collection of 120+ professional tools or use the search bar to find exactly what you need."
  },
  {
    icon: <UploadCloud className="w-12 h-12 text-blue-400" />,
    title: "Process Your Files",
    description: "Simply drag and drop your files or paste your content. All processing happens securely in your browser."
  },
  {
    icon: <DownloadCloud className="w-12 h-12 text-purple-400" />,
    title: "Download Instantly",
    description: "Your results are ready in seconds. Download your converted files with a single click, no waiting required."
  }
];

export function HowItWorks() {
  return (
    <section className="w-full py-16 sm:py-20 bg-gradient-to-b from-[#0F172A] to-[#030712]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Get Started in Seconds</h2>
          <p className="mt-2 text-base text-gray-400 max-w-xl mx-auto">A seamless workflow from start to finish.</p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-full max-w-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/5 border-2 border-white/10 backdrop-blur-sm">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
