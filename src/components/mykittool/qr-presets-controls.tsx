"use client"

import React from 'react';
import { QRState } from '@/lib/qr-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  RotateCcw, 
  ImageIcon, 
  MessageSquare, 
  Youtube, 
  Search,
  Sparkles 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TEMPLATES = [
  { id: 'image-qr', label: 'Modern Brand', type: 'URL', data: 'https://brand.studio', color: '#3b82f6', dotStyle: 'extra-rounded' },
  { id: 'whatsapp', label: 'Connect Hub', type: 'WhatsApp', whatsapp: { phone: '+1234567890', message: 'Hi! Let\'s collaborate.' }, color: '#3b82f6' },
  { id: 'youtube', label: 'Media Stream', type: 'URL', data: 'https://youtube.com/@brand', color: '#3b82f6' },
  { id: 'google-review', label: 'Trust Pulse', type: 'URL', data: 'https://g.page/review/brand', color: '#3b82f6' },
];

interface QrPresetsControlsProps {
  state: QRState;
  updateState: (updates: Partial<QRState>) => void;
}

export function QrPresetsControls({ state, updateState }: QrPresetsControlsProps) {
  const { toast } = useToast();

  const applyTemplate = (template: any) => {
    updateState({
      type: template.type,
      data: template.data || '',
      fgColor: template.color || state.fgColor,
      dotStyle: template.dotStyle || state.dotStyle,
      ...(template.whatsapp && { whatsapp: template.whatsapp }),
    });
    toast({ title: "Template Applied", description: `Loading ${template.label} studio preset.` });
  };

  const handleReset = () => {
    updateState({
      data: 'https://google.com',
      logo: null,
      logoSize: 0.3,
      backgroundImage: null,
      backgroundOpacity: 0.25,
      backgroundMode: 'auto',
      fgColor: '#3b82f6',
      bgColor: '#ffffff',
      type: 'URL',
      dotStyle: 'extra-rounded',
      cornerStyle: 'rounded',
      wifi: { ssid: '', password: '', encryption: 'WPA' },
      email: { address: '', subject: '', body: '' },
      whatsapp: { phone: '', message: '' },
      vCard: { firstName: '', lastName: '', mobile: '', email: '', organization: '', jobTitle: '', website: '' }
    });
    toast({ title: "Studio Reset", description: "Parameters restored to default." });
  };

  return (
    <Card className="glass-card overflow-hidden shadow-2xl relative">
      <CardHeader className="py-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
              Artistic Presets
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="h-8 text-[9px] uppercase font-black tracking-[0.2em] text-foreground/40 hover:text-primary transition-all border border-white/10 rounded-xl"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className="flex flex-col items-center gap-4 p-5 rounded-[2rem] bg-white/30 dark:bg-black/30 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all group shadow-sm"
            >
              <div 
                className="w-12 h-12 rounded-2xl bg-white dark:bg-black/50 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 border border-white/10 shadow-lg text-primary"
              >
                 {t.id === 'image-qr' ? <ImageIcon className="w-5 h-5" /> : 
                 t.id === 'whatsapp' ? <MessageSquare className="w-5 h-5" /> : 
                 t.id === 'youtube' ? <Youtube className="w-5 h-5" /> :
                 <Search className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-black text-center leading-tight text-foreground/50 group-hover:text-primary uppercase tracking-widest">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}