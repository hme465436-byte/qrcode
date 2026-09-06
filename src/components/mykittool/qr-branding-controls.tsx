"use client"

import React, { useState } from 'react';
import { QRState } from '@/lib/qr-types';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Trash2, 
  ImageIcon, 
  Shield, 
  Cpu, 
  MousePointer2, 
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateQrBackground } from '@/ai/flows/qr-background-generator-flow';

interface QrBrandingControlsProps {
  state: QRState;
  updateState: (updates: Partial<QRState>) => void;
}

export function QrBrandingControls({ state, updateState }: QrBrandingControlsProps) {
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'backgroundImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File Too Large", description: "Standard limit is 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState({ [field]: reader.result as string });
        toast({ title: "Asset Uploaded", description: `Brand ${field === 'logo' ? 'icon' : 'imagery'} integrated.` });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiBackgroundGen = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const dataUri = await generateQrBackground(aiPrompt);
      updateState({ backgroundImage: dataUri, backgroundMode: 'auto' });
      toast({ title: "AI Background Ready", description: "Artistic imagery generated and optimized." });
    } catch (e) {
      toast({ variant: "destructive", title: "Generation Failed", description: "Imagen engine temporarily busy." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card shadow-2xl border-border relative overflow-hidden">
      <CardHeader className="border-b border-border bg-secondary/30 py-8">
         <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
           <Shield className="w-5 h-5 text-primary" /> Brand Identity Studio
         </CardTitle>
      </CardHeader>
      <CardContent className="pt-10 space-y-8">
          {/* AI Background Generator */}
          <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
             <div className="flex items-center gap-3">
               <Sparkles className="w-4 h-4 text-primary" />
               <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">AI Background Studio</h4>
             </div>
             <div className="flex gap-2">
                <Input 
                  placeholder="Cyberpunk city, neon forest, abstract gold..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="h-12 bg-background border-border text-xs rounded-xl text-foreground"
                />
                <Button 
                  onClick={handleAiBackgroundGen}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="h-12 w-12 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-xl shadow-primary/20"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </Button>
             </div>
             <p className="text-[9px] text-foreground/40 font-medium">Powered by Imagen. Generates scannability-safe artistic patterns.</p>
          </div>

          {/* Logo Manager */}
          <div className="p-6 rounded-3xl bg-secondary border border-border flex items-center gap-6 group transition-all hover:bg-secondary/80">
            <div className="w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden relative shadow-inner shrink-0">
              {state.logo ? (
                <img src={state.logo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Upload className="w-6 h-6 text-foreground/10 group-hover:text-primary transition-colors" />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black text-foreground uppercase tracking-wider">Brand Icon (Logo)</Label>
                {state.logo && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => updateState({ logo: null })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {state.logo && (
                <div className="space-y-3">
                  <Slider value={[state.logoSize * 100]} min={15} max={45} step={1} onValueChange={(val) => updateState({ logoSize: val[0] / 100 })} />
                  <div className="flex justify-between text-[9px] font-black text-primary uppercase">
                    <span>Icon Scale</span>
                    <span>{(state.logoSize * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Background Layer Intelligence */}
          <div className="p-6 rounded-[2.5rem] bg-secondary border border-border space-y-8 group transition-all hover:bg-secondary/80">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden relative shadow-inner shrink-0">
                {state.backgroundImage ? (
                  <img src={state.backgroundImage} alt="BG" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-foreground/10 group-hover:text-primary transition-colors" />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'backgroundImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-black text-foreground uppercase tracking-wider">Manual Layer</Label>
                  {state.backgroundImage && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => updateState({ backgroundImage: null })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => updateState({ backgroundMode: 'auto' })}
                    className={cn("flex-1 h-10 rounded-xl border flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-wider transition-all px-2", state.backgroundMode === 'auto' ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40 hover:text-foreground")}
                   >
                     <Cpu className="w-3.5 h-3.5" /> Auto
                   </button>
                   <button 
                    onClick={() => updateState({ backgroundMode: 'manual' })}
                    className={cn("flex-1 h-10 rounded-xl border flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-wider transition-all px-2", state.backgroundMode === 'manual' ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground/40 hover:text-foreground")}
                   >
                     <MousePointer2 className="w-3.5 h-3.5" /> Manual
                   </button>
                </div>
              </div>
            </div>

            {state.backgroundImage && (
              <div className="space-y-6 pt-2">
                {state.backgroundMode === 'auto' ? (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4 animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider">Scannability Optimized</p>
                      <p className="text-[9px] text-foreground/40 font-medium">System has set density to 25% for peak reliability across all scanners.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between mb-2">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Intensity Control</Label>
                    </div>
                    <Slider 
                      value={[state.backgroundOpacity * 100]} 
                      min={1} 
                      max={50} 
                      step={1} 
                      onValueChange={(val) => updateState({ backgroundOpacity: val[0] / 100 })} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
      </CardContent>
    </Card>
  );
}