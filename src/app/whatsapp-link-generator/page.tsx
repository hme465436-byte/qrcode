"use client"

import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Phone, 
  Globe, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Type, 
  RotateCcw,
  Smartphone,
  Check,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

const COUNTRIES = [
  { code: '92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '1', name: 'USA / Canada', flag: '🇺🇸' },
  { code: '44', name: 'UK', flag: '🇬🇧' },
  { code: '966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '971', name: 'UAE', flag: '🇦🇪' },
  { code: '91', name: 'India', flag: '🇮🇳' },
  { code: '86', name: 'China', flag: '🇨🇳' },
  { code: '61', name: 'Australia', flag: '🇦🇺' },
  { code: '49', name: 'Germany', flag: '🇩🇪' },
  { code: '33', name: 'France', flag: '🇫🇷' },
  { code: '90', name: 'Turkey', flag: '🇹🇷' },
  { code: '60', name: 'Malaysia', flag: '🇲🇾' },
];

export default function WhatsAppLinkGeneratorPage() {
  const { toast } = useToast();
  
  // State Matrix
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('92');
  const [message, setMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Synthesis Logic
  const waLink = useMemo(() => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return '';
    
    // Construct base matrix
    let url = `https://wa.me/${countryCode}${cleanPhone}`;
    
    // Inject message payload if present
    if (message.trim()) {
      url += `?text=${encodeURIComponent(message.trim())}`;
    }
    
    return url;
  }, [phone, countryCode, message]);

  const handleCopy = () => {
    if (!waLink) return;
    navigator.clipboard.writeText(waLink);
    setIsCopied(true);
    toast({ title: "Link Isolated", description: "Identity saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpen = () => {
    if (!waLink) return;
    window.open(waLink, '_blank');
  };

  const handleReset = () => {
    setPhone('');
    setMessage('');
    setCountryCode('92');
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <MessageSquare className="w-3.5 h-3.5" /> Social Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                WhatsApp <span className="text-primary italic">Link Generator</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional linguistic link synthesis. Create instant wa.me chat protocols with custom messages and automated hardware sanitization.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="whatsapp-link-generator" />
              {(phone || message) && (
                <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls - Left */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Zap className="w-5 h-5 text-primary" /> Matrix Parameters
               </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr,2fr] gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Country Node</Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="h-14 bg-secondary border-border rounded-xl font-bold uppercase text-[10px] tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        {COUNTRIES.map(c => (
                          <SelectItem key={c.code} value={c.code} className="text-[10px] font-black uppercase">
                            {c.flag} +{c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Phone Identity</Label>
                    <div className="relative group/phone">
                      <Input 
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="300 1234567"
                        className="h-14 bg-secondary border-border rounded-xl font-bold text-lg px-6"
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/phone:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Context Payload (Optional)</Label>
                    <span className="text-[9px] font-mono text-primary/40">{message.length}/500</span>
                  </div>
                  <Textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value.substring(0, 500))}
                    placeholder="Enter pre-filled chat message..."
                    className="h-32 bg-secondary/50 border-border rounded-2xl text-sm font-medium p-6 resize-none focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Button 
                  onClick={handleCopy}
                  disabled={!phone.trim()}
                  className="h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                 >
                    {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                    Copy Matrix Link
                 </Button>
                 <Button 
                  onClick={handleOpen}
                  disabled={!phone.trim()}
                  variant="outline"
                  className="h-16 border-border bg-secondary hover:bg-white/5 text-foreground font-black uppercase tracking-widest text-[11px] rounded-2xl"
                 >
                    <ExternalLink className="w-5 h-5 mr-2 text-primary" />
                    Launch Protocol
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Identity strings are processed strictly in local memory. No phone numbers or message payloads are logged or transmitted to our servers.
               </p>
             </div>
          </div>
        </div>

        {/* Result - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {!phone.trim() ? (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Smartphone className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Identity Signal</p>
                   </div>
                 ) : (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-6">
                         <p className="text-[10px] font-black uppercase text-primary tracking-[0.6em]">Validated Identifier</p>
                         <div className="p-8 rounded-[3rem] bg-background/50 border-2 border-primary/20 shadow-2xl relative overflow-hidden group/link">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-foreground break-all leading-tight relative z-10">{waLink}</h2>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {[
                           { icon: Smartphone, label: 'Linguistic Destination', val: `+${countryCode} ${phone}` },
                           { icon: Globe, label: 'Web Protocol', val: 'WA.ME (v2.0)' },
                           { icon: ShieldCheck, label: 'Integrity', val: 'SECURE' },
                           { icon: Type, label: 'Payload Type', val: message.trim() ? 'DYNAMIC' : 'DIRECT' },
                         ].map((item, i) => (
                           <div key={i} className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                                 <item.icon className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                                 <h4 className="text-[12px] font-bold text-foreground truncate uppercase">{item.val}</h4>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-4">
                         <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleCopy} className="h-16 flex-1 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90 active:scale-95 transition-all">
                               {isCopied === 'identity' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                               Copy Short Link
                            </Button>
                            <Button onClick={handleOpen} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                               <ExternalLink className="w-5 h-5 mr-2" /> Launch
                            </Button>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                 <Info className="w-5 h-5 text-primary mt-1 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[11px] font-black text-primary uppercase tracking-widest">Protocol Tip</p>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase leading-relaxed">
                       Short links generated here are compatible with all modern browser nodes and mobile operating systems.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
