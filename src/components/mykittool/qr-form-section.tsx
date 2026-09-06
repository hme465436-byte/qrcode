"use client"

import React, { useState } from 'react';
import { QRState } from '@/lib/qr-types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Link2, 
  Type, 
  Phone, 
  Mail, 
  Wifi, 
  Contact, 
  LayoutGrid,
  MessageSquare,
  Sparkles,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { QrStylingControls } from './qr-styling-controls';
import { QrBrandingControls } from './qr-branding-controls';
import { QrPresetsControls } from './qr-presets-controls';
import { qrContentRefiner } from '@/ai/flows/qr-content-refiner-flow';
import { suggestQrContentType } from '@/ai/flows/qr-content-type-suggester-flow';

interface QrFormSectionProps {
  state: QRState;
  updateState: (updates: Partial<QRState>) => void;
}

export function QrFormSection({ state, updateState }: QrFormSectionProps) {
  const { toast } = useToast();
  const [isRefining, setIsRefining] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const dataLength = state.data?.length || 0;

  const handleAiRefine = async () => {
    if (!state.data.trim()) return;
    setIsRefining(true);
    try {
      const refined = await qrContentRefiner({ text: state.data });
      updateState({ data: refined });
      toast({ title: "AI Refinement Complete", description: "Text optimized for QR efficiency." });
    } catch (e) {
      toast({ variant: "destructive", title: "Refinement Failed", description: "AI engine temporarily unavailable." });
    } finally {
      setIsRefining(false);
    }
  };

  const handleAiSuggestType = async () => {
    if (!state.data.trim()) return;
    setIsSuggesting(true);
    try {
      const result = await suggestQrContentType({ content: state.data });
      updateState({ type: result.type as any });
      toast({ title: "Type Optimized", description: `Switched to ${result.type} profile.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Suggestion Failed", description: "Could not analyze content type." });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-10">
      <QrPresetsControls state={state} updateState={updateState} />

      <Card className="glass-card border-border shadow-2xl overflow-hidden">
        <CardHeader className="pb-8 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40">
                <LayoutGrid className="w-6 h-6" />
              </div>
              Data Payload
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAiSuggestType}
                disabled={isSuggesting || !state.data.trim()}
                className="h-9 px-4 rounded-xl border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10"
              >
                {isSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5 mr-2" />}
                Auto Detect
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10">
          <Tabs value={state.type} onValueChange={(val) => updateState({ type: val as any })} className="w-full">
            <TabsList className="grid grid-cols-4 sm:grid-cols-7 gap-2 bg-transparent p-0 mb-10 h-auto">
              {[
                { id: 'URL', icon: Link2, label: 'URL' },
                { id: 'Text', icon: Type, label: 'Text' },
                { id: 'WhatsApp', icon: MessageSquare, label: 'WA' },
                { id: 'Phone', icon: Phone, label: 'Call' },
                { id: 'Email', icon: Mail, label: 'Mail' },
                { id: 'WiFi', icon: Wifi, label: 'WiFi' },
                { id: 'vCard', icon: Contact, label: 'vCard' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="flex flex-col gap-2 py-3 bg-secondary border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-xl"
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="min-h-[160px]">
              {state.type === 'WhatsApp' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in">
                  <div className="space-y-3.5">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">WhatsApp Number</Label>
                    <Input className="h-14 bg-secondary border-border rounded-2xl text-foreground" placeholder="+1234567890" value={state.whatsapp.phone} onChange={e => updateState({ whatsapp: { ...state.whatsapp, phone: e.target.value } })} />
                  </div>
                  <div className="space-y-3.5">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Initial Message</Label>
                    <Input className="h-14 bg-secondary border-border rounded-2xl text-foreground" placeholder="Hi! I'm interested..." value={state.whatsapp.message} onChange={e => updateState({ whatsapp: { ...state.whatsapp, message: e.target.value } })} />
                  </div>
                </div>
              ) : state.type === 'WiFi' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in">
                  <div className="space-y-3.5">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Network SSID</Label>
                    <Input className="h-14 bg-secondary border-border rounded-2xl text-foreground" placeholder="Home Network" value={state.wifi.ssid} onChange={e => updateState({ wifi: { ...state.wifi, ssid: e.target.value } })} />
                  </div>
                  <div className="space-y-3.5">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">WiFi Password</Label>
                    <Input className="h-14 bg-secondary border-border rounded-2xl text-foreground" type="password" placeholder="••••••••" value={state.wifi.password} onChange={e => updateState({ wifi: { ...state.wifi, password: e.target.value } })} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in relative">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">
                      {state.type === 'URL' ? 'Destination Website' : 'Content Payload'}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAiRefine}
                        disabled={isRefining || !state.data.trim()}
                        className="h-8 px-3 rounded-lg bg-secondary text-primary text-[9px] font-black uppercase tracking-widest hover:bg-secondary/80 border border-border"
                      >
                        {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2 fill-primary/20" />}
                        AI Refine
                      </Button>
                      <span className="text-[10px] font-mono text-foreground/30">{dataLength} chars</span>
                    </div>
                  </div>
                  <Textarea 
                    placeholder="Enter URL or text content here..."
                    value={state.data}
                    onChange={(e) => updateState({ data: e.target.value })}
                    className="min-h-[140px] bg-secondary border-border text-lg rounded-3xl focus:ring-primary/40 p-6 text-foreground leading-relaxed resize-none transition-all focus:bg-secondary/80"
                  />
                  <div className="absolute bottom-4 right-4 pointer-events-none opacity-20">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <QrStylingControls state={state} updateState={updateState} />
        <QrBrandingControls state={state} updateState={updateState} />
      </div>
    </div>
  );
}