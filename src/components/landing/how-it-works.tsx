'use client';

import { MousePointer2, DownloadCloud, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: MousePointer2,
    title: "1. Choose a tool",
    description: "Identify the tool you need from our collection."
  },
  {
    icon: ShieldCheck,
    title: "2. Use it in your browser",
    description: "Process everything locally on your device for absolute privacy."
  },
  {
    icon: DownloadCloud,
    title: "3. Download or copy",
    description: "Save your result instantly to your computer or phone."
  }
];

export function HowItWorks() {
  return (
    <section className="w-full py-24 sm:py-32 bg-[#02040a] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24 space-y-4 animate-reveal">
          <h2 className="text-3xl md:text-5xl font-headline font-black text-white uppercase tracking-tight leading-none">How it <span className="text-primary italic">works</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-8 group animate-reveal" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-700 relative z-10 shadow-2xl">
                  <step.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">{step.title}</h3>
                <p className="text-[10px] text-white/20 font-medium leading-relaxed uppercase tracking-tighter max-w-[240px] mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
