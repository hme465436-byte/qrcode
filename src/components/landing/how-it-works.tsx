'use client';

import { MousePointer2, DownloadCloud, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: MousePointer2,
    title: "1. Choose a tool",
    description: "Identify the tool you need from our collection.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "group-hover:border-cyan-500/20"
  },
  {
    icon: ShieldCheck,
    title: "2. Use it in your browser",
    description: "Process everything locally on your device for absolute privacy.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "group-hover:border-emerald-500/20"
  },
  {
    icon: DownloadCloud,
    title: "3. Download or copy",
    description: "Save your result instantly to your computer or phone.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "group-hover:border-purple-500/20"
  }
];

export function HowItWorks() {
  return (
    <section className="w-full py-24 sm:py-32 bg-[#02040a] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24 space-y-4 animate-reveal">
          <h2 className="text-2xl md:text-4xl font-headline font-black text-white uppercase tracking-tight leading-none">
            Simple <span className="text-primary italic">Process</span>
          </h2>
          <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.3em]">Three step logic</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group animate-reveal" style={{ animationDelay: `${index * 150}ms` }}>
              <div className={cn(
                "flex flex-col items-center justify-center h-full w-full p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 transition-all duration-500 hover:bg-white/[0.02] hover:-translate-y-1 shadow-2xl relative overflow-hidden",
                step.border
              )}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className={cn(
                  "mb-8 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/5 shadow-inner group-hover:scale-110",
                  step.bg,
                  step.color
                )}>
                  <step.icon className="w-6 h-6" />
                </div>

                <div className="space-y-3 relative z-10">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">{step.title}</h3>
                  <p className="text-[10px] text-white/50 font-medium leading-relaxed uppercase tracking-tighter max-w-[200px] mx-auto">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
