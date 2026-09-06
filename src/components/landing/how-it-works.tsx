'use client';

import { MousePointer2, DownloadCloud, ShieldCheck, Zap } from 'lucide-react';

const steps = [
  {
    icon: MousePointer2,
    title: "1. Select Protocol",
    description: "Identify the required production unit from the studio registry."
  },
  {
    icon: ShieldCheck,
    title: "2. Local Synthesis",
    description: "Process data directly in your browser memory. Absolute privacy."
  },
  {
    icon: DownloadCloud,
    title: "3. Master Export",
    description: "Download high-fidelity assets instantly to local storage."
  }
];

export function HowItWorks() {
  return (
    <section className="w-full py-32 sm:py-56 bg-[#02040a] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-32 space-y-4 animate-reveal">
          <h2 className="text-4xl md:text-6xl font-headline font-black text-white uppercase tracking-tight leading-none">Zero Friction <span className="text-primary italic">Workflow</span></h2>
          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">Clinical execution sequence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 lg:gap-32">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-10 group animate-reveal" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-700 relative z-10 shadow-2xl">
                  <step.icon className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">{step.title}</h3>
                <p className="text-[11px] text-white/20 font-medium leading-relaxed uppercase tracking-tighter max-w-[280px] mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
