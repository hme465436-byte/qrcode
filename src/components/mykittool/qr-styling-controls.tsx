"use client"

import React from 'react';
import { QRState } from '@/lib/qr-types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';

interface QrStylingControlsProps {
  state: QRState;
  updateState: (updates: Partial<QRState>) => void;
}

export function QrStylingControls({ state, updateState }: QrStylingControlsProps) {
  return (
    <Card className="glass-card shadow-2xl border-border relative overflow-hidden">
      <CardHeader className="border-b border-border bg-secondary/30 py-8">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
          <Palette className="w-5 h-5 text-primary" /> Technical Styling
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-10 space-y-10">
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-4">
             <Label className="text-[9px] uppercase font-black text-foreground/40 tracking-[0.2em]">Dot Engine</Label>
             <Select value={state.dotStyle} onValueChange={val => updateState({ dotStyle: val as any })}>
                <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="extra-rounded">Lux Rounded</SelectItem>
                  <SelectItem value="rounded">Soft Flow</SelectItem>
                  <SelectItem value="classy">Classy Dots</SelectItem>
                  <SelectItem value="square">Standard</SelectItem>
                  <SelectItem value="dots">Pixel Flow</SelectItem>
                </SelectContent>
             </Select>
           </div>
           <div className="space-y-4">
             <Label className="text-[9px] uppercase font-black text-foreground/40 tracking-[0.2em]">Corner Geometry</Label>
             <Select value={state.cornerStyle} onValueChange={val => updateState({ cornerStyle: val as any })}>
                <SelectTrigger className="h-12 bg-secondary border-border rounded-xl text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="rounded">Circular Eye</SelectItem>
                  <SelectItem value="dot">Soft Corner</SelectItem>
                  <SelectItem value="square">Sharp</SelectItem>
                </SelectContent>
             </Select>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-4">
             <Label className="text-[9px] uppercase font-black text-foreground/40 tracking-[0.2em]">Matrix Color</Label>
             <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-border">
                <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: state.fgColor }}>
                  <input type="color" value={state.fgColor} onChange={(e) => updateState({ fgColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                </div>
                <span className="text-[10px] font-mono text-foreground/50">{state.fgColor}</span>
             </div>
           </div>
           <div className="space-y-4">
             <Label className="text-[9px] uppercase font-black text-foreground/40 tracking-[0.2em]">Canvas Background</Label>
             <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-border">
                <div className="w-8 h-8 rounded-lg relative overflow-hidden ring-1 ring-border" style={{ backgroundColor: state.bgColor }}>
                  <input type="color" value={state.bgColor} onChange={(e) => updateState({ bgColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                </div>
                <span className="text-[10px] font-mono text-foreground/50">{state.bgColor}</span>
             </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}