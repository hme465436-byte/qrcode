'use client';

import { Search, UploadCloud, DownloadCloud } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-10 h-10 text-blue-500" />,
    title: "Choose Your Tool",
    description: "Browse through over 120+ tools or use the search bar to find the perfect one for your needs instantly.",
  },
  {
    icon: <UploadCloud className="w-10 h-10 text-purple-500" />,
    title: "Upload & Process",
    description: "Simply drag and drop your file or paste your content. Our tools process everything in your browser, ensuring privacy.",
  },
  {
    icon: <DownloadCloud className="w-10 h-10 text-green-500" />,
    title: "Download Instantly",
    description: "Get your results in seconds. Download your processed file or copy the output with a single click.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full py-16 sm:py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">How It Works</h2>
          <p className="mt-2 text-base text-gray-400">A seamless three-step process to get your tasks done.</p>
        </div>
        <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/10" aria-hidden="true"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
                <div key={index} className="text-center flex flex-col items-center">
                <div className="mb-4 p-4 bg-white/5 rounded-full border border-white/10">
                    {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 max-w-xs">{step.description}</p>
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
}
