"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Info,
  Search,
  Plus,
  Trash2,
  Share2,
  QrCode,
  Download,
  History,
  List,
  Smile,
  ChevronRight,
  Loader2,
  Monitor,
  LayoutGrid,
  Settings2,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Production Data Matrix ---

const COUNTRIES = [
  { code: '92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '91', name: 'India', flag: '🇮🇳' },
  { code: '966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '971', name: 'UAE', flag: '🇦🇪' },
  { code: '44', name: 'UK', flag: '🇬🇧' },
  { code: '1', name: 'USA / Canada', flag: '🇺🇸' },
  { code: '880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '90', name: 'Turkey', flag: '🇹🇷' },
  { code: '60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '61', name: 'Australia', flag: '🇦🇺' },
  { code: '49', name: 'Germany', flag: '🇩🇪' },
  { code: '33', name: 'France', flag: '🇫🇷' },
  { code: '39', name: 'Italy', flag: '🇮🇹' },
  { code: '34', name: 'Spain', flag: '🇪🇸' },
  { code: '7', name: 'Russia', flag: '🇷🇺' },
  { code: '81', name: 'Japan', flag: '🇯🇵' },
  { code: '82', name: 'South Korea', flag: '🇰🇷' },
  { code: '86', name: 'China', flag: '🇨🇳' },
  { code: '234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '27', name: 'South Africa', flag: '🇿🇦' },
  { code: '55', name: 'Brazil', flag: '🇧🇷' },
  { code: '52', name: 'Mexico', flag: '🇲🇽' },
];

const TEMPLATES = [
  { label: 'Hello', text: 'Hello! I would like to get in touch.' },
  { label: 'Price?', text: 'Hi, can you provide pricing details for your services?' },
  { label: 'Details', text: 'Hello, I need more information about this.' },
  { label: 'Available?', text: 'Hi, are you currently available for a project?' },
  { label: 'Support', text: 'Hello, I need technical assistance with my account.' },
];

const HISTORY_KEY = 'mykit_wa_history_v2';

interface HistoryItem {
  id: string;
  phone: string;
  country: string;
  message: string;
  url: string;
  timestamp: number;
}

export default function WhatsAppLinkGeneratorPage() {
  const { toast } = useToast();
  
  // Primary State
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('92');
  const [message, setMessage] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<any>(null);

  // --- Persistence & Initialization ---
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveToHistory = (item: HistoryItem) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.url !== item.url);
      const next = [item, ...filtered].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  // --- Synthesis Logic ---
  const cleanNumber = (num: string) => num.replace(/[^0-9]/g, '');

  const waLink = useMemo(() => {
    const cleaned = cleanNumber(phone);
    if (!cleaned) return '';
    let url = `https://wa.me/${countryCode}${cleaned}`;
    if (message.trim()) url += `?text=${encodeURIComponent(message.trim())}`;
    return url;
  }, [phone, countryCode, message]);

  // QR Logic
  useEffect(() => {
    if (waLink && qrRef.current) {
      const render = async () => {
        if (!(window as any).QRCodeStyling) return;
        qrRef.current!.innerHTML = '';
        qrInstance.current = new (window as any).QRCodeStyling({
          width: 300,
          height: 300,
          data: waLink,
          dotsOptions: { color: "#2563eb", type: "extra-rounded" },
          backgroundOptions: { color: "transparent" },
          cornersSquareOptions: { type: "extra-rounded", color: "#2563eb" },
          imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 10 }
        });
        qrInstance.current.append(qrRef.current);
      };
      render();
    }
  }, [waLink, activeMode]);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Signal Isolated", description: `${label} saved to clipboard.` });
    setTimeout(() => setIsCopied(null), 2000);
    
    if (label === 'link' && phone) {
      saveToHistory({
        id: Math.random().toString(36).substr(2, 9),
        phone: phone,
        country: countryCode,
        message: message,
        url: text,
        timestamp: Date.now()
      });
    }
  };

  const handleShare = async () => {
    if (!waLink) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'WhatsApp Contact Link', url: waLink });
      } catch (e) {
        handleCopy(waLink, 'link');
      }
    } else {
      handleCopy(waLink, 'link');
    }
  };

  const downloadQr = () => {
    if (qrInstance.current) {
      qrInstance.current.download({ name: "whatsapp-qr", extension: "png" });
      toast({ title: "Master Exported", description: "QR saved as high-res PNG." });
    }
  };

  const executeBulk = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return;
    
    const results = lines.map(line => {
      const cleaned = cleanNumber(line);
      let url = `https://wa.me/${countryCode}${cleaned}`;
      if (message.trim()) url += `?text=${encodeURIComponent(message.trim())}`;
      return url;
    });

    navigator.clipboard.writeText(results.join('\n'));
    toast({ title: "Batch Complete", description: `Synthesized ${results.length} links to clipboard.` });
  };

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.includes(searchQuery)
    );
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <MessageSquare className="w-3.5 h-3.5" /> Identity Suite Pro
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            WhatsApp <span className="text-primary italic">Link Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional linguistic link synthesis. Create instant wa.me chat protocols with custom messages, bulk re-matricing, and hardware-native QR generation.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="whatsapp-link-generator" />
           <Button variant="outline" size="sm" onClick={() => { setPhone(''); setMessage(''); setBulkInput(''); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls - Left */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Tabs value={activeMode} onValueChange={(v: any) => setActiveMode(v)} className="w-full">
              <TabsList className="grid grid-cols-2 bg-secondary p-1 rounded-2xl h-14 mb-8 border border-white/5 shadow-2xl">
                 <TabsTrigger value="single" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Single Identity</TabsTrigger>
                 <TabsTrigger value="bulk" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background">Bulk Production</TabsTrigger>
              </TabsList>

              <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="py-8 border-b border-border bg-secondary/30">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Country Selector */}
                    <div className="md:col-span-5 space-y-4">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Port (Country)</Label>
                       <div className="space-y-4">
                          <div className="relative group/search">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                             <Input 
                               placeholder="Search Code..." 
                               value={searchQuery}
                               onChange={e => setSearchQuery(e.target.value)}
                               className="h-10 pl-9 bg-background/50 border-border text-[9px] font-black uppercase rounded-xl"
                             />
                          </div>
                          <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-auto custom-scrollbar pr-1">
                             {filteredCountries.map(c => (
                               <button
                                 key={c.code}
                                 onClick={() => setCountryCode(c.code)}
                                 className={cn(
                                   "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                   countryCode === c.code ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40 hover:border-primary/20"
                                 )}
                               >
                                  <span className="text-[10px] font-bold uppercase truncate">{c.flag} {c.name}</span>
                                  <span className="text-[9px] font-mono font-bold opacity-60">+{c.code}</span>
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Number & Message */}
                    <div className="md:col-span-7 space-y-8">
                       <TabsContent value="single" className="m-0 space-y-8 animate-in fade-in">
                          <div className="space-y-4">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Phone Identity</Label>
                             <div className="relative group/input">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-bold text-lg pointer-events-none">+{countryCode}</div>
                                <Input 
                                  value={phone}
                                  onChange={e => setPhone(e.target.value)}
                                  placeholder="300 1234567"
                                  className="h-16 bg-secondary border-border rounded-2xl text-xl font-bold pl-20 focus:ring-primary/40"
                                />
                             </div>
                             <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest ml-1">Cleaned: +{countryCode}{cleanNumber(phone)}</p>
                          </div>
                       </TabsContent>

                       <TabsContent value="bulk" className="m-0 space-y-4 animate-in fade-in">
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Batch Roster (Numbers)</Label>
                          <Textarea 
                            value={bulkInput}
                            onChange={e => setBulkInput(e.target.value)}
                            placeholder="Enter one number per line..."
                            className="h-32 bg-secondary/30 border-border rounded-2xl text-xs font-mono p-4 resize-none"
                          />
                       </TabsContent>

                       <div className="space-y-6 pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center px-1">
                             <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Context Payload (Message)</Label>
                             <span className="text-[9px] font-mono text-primary/40">{message.length}/500</span>
                          </div>
                          <Textarea 
                            value={message}
                            onChange={e => setMessage(e.target.value.substring(0, 500))}
                            placeholder="Enter pre-filled chat message..."
                            className="h-32 bg-secondary/50 border-border rounded-2xl text-sm font-medium p-6 resize-none focus:ring-primary/40"
                          />
                          
                          <div className="flex flex-wrap gap-2">
                             {TEMPLATES.map(t => (
                               <button 
                                key={t.label} 
                                onClick={() => setMessage(t.text)}
                                className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-[8px] font-black uppercase text-foreground/40 hover:text-primary transition-all"
                               >
                                 {t.label}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    {activeMode === 'single' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <Button onClick={handleShare} disabled={!phone} className="h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                            <Share2 className="w-4 h-4 mr-2" /> Share Matrix
                         </Button>
                         <Button onClick={() => handleCopy(waLink, 'link')} disabled={!phone} variant="outline" className="h-16 border-border bg-white/5 text-foreground font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            {isCopied === 'link' ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />} 
                            Copy Direct Link
                         </Button>
                      </div>
                    ) : (
                      <Button onClick={executeBulk} disabled={!bulkInput.trim()} className="h-16 w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95">
                         <Layers className="w-5 h-5 mr-3" /> Execute Batch Synthesis
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
           </Tabs>

           {/* Performance Tips */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                 <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                 </div>
                 <div className="space-y-2">
                   <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                     Linguistic identifiers are processed strictly in local memory. No phone numbers or message payloads are logged.
                   </p>
                 </div>
              </div>
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                 <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Globe className="w-7 h-7" />
                 </div>
                 <div className="space-y-2">
                   <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Global Compatibility</h4>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                     Short links are compatible with all modern browser nodes and mobile operating systems via standard URI protocols.
                   </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Output & QR - Right */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {/* QR Card */}
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Identity QR
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center gap-10 bg-black/10">
               <div className="relative group/qr p-4 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 ring-1 ring-border overflow-hidden">
                  {!phone && <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex items-center justify-center p-12 text-center text-[10px] font-black uppercase text-foreground/20 tracking-widest">Awaiting Signal</div>}
                  <div ref={qrRef} className="w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]" />
               </div>

               <div className="grid grid-cols-1 w-full gap-4">
                  <Button 
                    onClick={downloadQr} 
                    disabled={!phone}
                    className="h-14 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-white/90 active:scale-95"
                  >
                     <Download className="w-4 h-4 mr-2" /> Export PNG Master
                  </Button>
                  <Button 
                    onClick={() => handleCopy(waLink, 'qr')} 
                    disabled={!phone}
                    variant="outline"
                    className="h-12 border-white/10 bg-white/5 text-white/40 font-black uppercase text-[9px] tracking-widest rounded-xl"
                  >
                     Copy Pattern URL
                  </Button>
               </div>
            </CardContent>
          </Card>

          {/* History / Archive */}
          <Card className="glass-card border-border shadow-xl flex flex-col min-h-[300px]">
             <CardHeader className="py-6 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <History className="w-4 h-4 text-primary" />
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive Registry</CardTitle>
                </div>
                {history.length > 0 && (
                   <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} className="text-[9px] font-black text-foreground/20 hover:text-red-500 uppercase transition-colors">Purge</button>
                )}
             </CardHeader>
             <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
                {history.length === 0 ? (
                  <div className="py-20 text-center opacity-10 space-y-4">
                     <Activity className="w-10 h-10 mx-auto" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Zero Matrix History</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                     {history.map(item => (
                       <div key={item.id} className="p-5 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => { setPhone(item.phone); setCountryCode(item.country); setMessage(item.message); }}>
                          <div className="flex items-center gap-4 overflow-hidden">
                             <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors shrink-0 shadow-inner font-mono text-[9px] font-bold">
                                {item.country}
                             </div>
                             <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground truncate uppercase">+{item.country} {item.phone}</p>
                                <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all" />
                       </div>
                     ))}
                  </div>
                )}
             </CardContent>
          </Card>
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
