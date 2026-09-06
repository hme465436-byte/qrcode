"use client"

import React from 'react';
import { 
  HelpCircle, 
  X, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HELP_REGISTRY, HelpContent } from '@/lib/help-data';
import { cn } from '@/lib/utils';

interface GetHelpProps {
  toolId: string;
}

const DEFAULT_HELP: HelpContent = {
  title: 'Studio Unit',
  description: 'This professional utility is designed for local-only data processing.',
  steps: [
    'Import or enter your data payload in the designated fields.',
    'Configure the technical parameters to match your requirements.',
    'Review the live preview for immediate visual verification.',
    'Execute the final synthesis or conversion protocol.',
    'Save the resulting asset directly to your local storage.'
  ],
  tips: [
    'Ensure all input fields are valid before executing high-volume tasks.',
    'Clear the studio between projects to purge temporary memory buffers.'
  ],
  privacy: 'This tool operates 100% locally in your browser memory. No data is logged or transmitted.'
};

export function GetHelp({ toolId }: GetHelpProps) {
  const content = HELP_REGISTRY[toolId] || DEFAULT_HELP;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm active:scale-95"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Get Help
        </button>
      </DialogTrigger>
      <DialogContent className="glass-card max-w-2xl w-[calc(100%-32px)] md:w-full border-white/10 p-0 overflow-hidden outline-none flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 sm:p-8 border-b border-white/5 bg-primary/5 relative shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 border border-white/10 shrink-0">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-headline font-black uppercase tracking-tight text-foreground truncate">
                {content.title}
              </DialogTitle>
              <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] truncate">Clinical Protocol Documentation</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-10 bg-transparent">
          <div className="space-y-3">
             <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/40">Capability Matrix</h4>
             <p className="text-[14px] sm:text-[15px] font-medium text-foreground/70 leading-relaxed">{content.description}</p>
          </div>

          <div className="space-y-6">
             <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/40">Execution Protocol</h4>
             <div className="space-y-4">
                {content.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 sm:gap-5 group">
                    <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center text-[10px] font-black text-primary shrink-0 transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-foreground/60 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                   <Zap className="w-3.5 h-3.5" /> Studio Tips
                </h4>
                <ul className="space-y-3">
                   {content.tips.map((tip, i) => (
                     <li key={i} className="flex items-start gap-3">
                        <ArrowRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-foreground/40 leading-relaxed uppercase">{tip}</span>
                     </li>
                   ))}
                </ul>
             </div>
             <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border space-y-4">
                <div className="flex items-center gap-3 text-primary">
                   <ShieldCheck className="w-4 h-4" />
                   <h4 className="text-[10px] font-black uppercase tracking-widest">Privacy Mandate</h4>
                </div>
                <p className="text-[11px] text-foreground/50 font-medium leading-relaxed uppercase">{content.privacy}</p>
             </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-secondary/30 border-t border-white/5 flex items-center justify-between shrink-0">
           <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20">MY KIT TOOL • TECHNICAL DOCS</span>
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> <span className="hidden xs:inline">Verified Protocol</span>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
