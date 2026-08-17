"use client"

import React from 'react';
import { QrGeneratorContainer } from '@/components/qr-canvas/qr-generator-container';
import { Layers, Zap } from 'lucide-react';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function BulkQRPage() {
  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <Layers className="w-3.5 h-3.5" /> Batch Mode
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
            Bulk <span className="text-primary">Production</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
            High-speed engine for large-scale QR asset generation. Paste your list and export high-res assets in a single ZIP bundle.
          </p>
        </div>
        <div className="shrink-0 pb-2">
           <GetHelp toolId="bulk" />
        </div>
      </div>
      
      <QrGeneratorContainer forcedMode="bulk" />
    </div>
  );
}
