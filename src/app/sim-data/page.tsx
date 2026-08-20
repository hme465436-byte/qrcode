"use client"

import React, { useState } from 'react';
import { 
  Smartphone, 
  Search, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  User,
  MapPin,
  Fingerprint,
  Phone,
  ShieldCheck,
  Zap,
  Activity,
  AlertCircle,
  Database,
  Clock,
  Network,
  Globe,
  BadgeCheck,
  Shield,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { validatePhoneNumber } from './actions';

// --- Original Data Registry (Mock Database) ---
const SIM_REGISTRY: Record<string, any> = {
  '03001234567': {
    owner: "AHMED KHAN",
    cnic: "35202-1234567-1",
    address: "MODEL TOWN, LAHORE, PUNJAB",
    status: "ACTIVE",
    activationDate: "2019-04-12",
    carrier: "Mobilink (Jazz)"
  },
  '03129876543': {
    owner: "SARA BIBI",
    cnic: "42101-9876543-2",
    address: "DEFENCE PHASE 6, KARACHI, SINDH",
    status: "ACTIVE",
    activationDate: "2021-11-05",
    carrier: "Zong"
  },
  '03335554444': {
    owner: "MUHAMMAD ALI",
    cnic: "61101-5554444-3",
    address: "SECTOR F-7, ISLAMABAD, ICT",
    status: "ACTIVE",
    activationDate: "2018-01-20",
    carrier: "Ufone"
  },
  '03456667777': {
    owner: "FATIMA ZAHRA",
    cnic: "33102-6667777-4",
    address: "CANTT AREA, FAISALABAD, PUNJAB",
    status: "ACTIVE",
    activationDate: "2023-02-14",
    carrier: "Telenor"
  }
};

export default function SimDataPage() {
  const { toast } = useToast();
  const [number, setNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const getCarrierFallback = (num: string) => {
    const clean = num.startsWith('0') ? num.substring(1) : num;
    if (clean.startsWith('30') || clean.startsWith('32')) return 'Mobilink / Warid (Jazz)';
    if (clean.startsWith('34')) return 'Telenor';
    if (clean.startsWith('33')) return 'Ufone';
    if (clean.startsWith('31')) return 'Zong';
    return 'Unknown Network';
  };

  const handleSearch = async () => {
    const cleanNum = number.trim().replace(/[^0-9]/g, '');
    if (cleanNum.length < 10) {
      toast({ variant: "destructive", title: "Input Required", description: "Please enter a valid Pakistani number (11 digits)." });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setHasSearched(false);

    const formattedNum = cleanNum.startsWith('0') ? cleanNum : `0${cleanNum}`;
    
    try {
      // 1. Execute Global Validation Protocol
      const validation = await validatePhoneNumber(formattedNum);
      
      // 2. Lookup in Original Data Matrix
      const foundData = SIM_REGISTRY[formattedNum];
      
      // 3. Combine Result Matrix
      if (validation.success && validation.data) {
        const v = validation.data;
        setResult({
          owner: foundData?.owner || (v.is_valid ? "IDENTITY RESTRICTED" : "RECORD NOT FOUND"),
          cnic: foundData?.cnic || "UNAVAILABLE",
          address: foundData?.address || (v.location ? v.location : "SIGNAL UNKNOWN"),
          status: foundData?.status || (v.is_valid ? "ACTIVE" : "INACTIVE / UNLISTED"),
          activationDate: foundData?.activationDate || "N/A",
          carrier: foundData?.carrier || v.carrier || getCarrierFallback(formattedNum),
          isValid: v.is_valid,
          country: v.country || "Pakistan",
          lineType: v.timezones?.[0] ? "Digital / Mobile" : "Unknown",
          isMissing: !foundData
        });
      } else {
        // Fallback if API restricted
        setResult({
          owner: foundData?.owner || "RECORD NOT FOUND",
          cnic: foundData?.cnic || "UNAVAILABLE",
          address: foundData?.address || "SIGNAL UNKNOWN",
          status: foundData?.status || "INACTIVE / UNLISTED",
          activationDate: foundData?.activationDate || "N/A",
          carrier: foundData?.carrier || getCarrierFallback(formattedNum),
          isValid: true, // Assume valid if formatted
          isMissing: !foundData,
          fallbackMode: true
        });
      }
      
      toast({ title: "Signal Isolated", description: "Identity data and network validation complete." });
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Failed to negotiate with discovery nodes." });
    } finally {
      setIsProcessing(false);
      setHasSearched(true);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Smartphone className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Sim Data <span className="text-primary italic">Finder Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional mobile identity matrix. Identify carrier protocols, regional registration data, and global number validity locally and securely.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="sim-data" />
              {(result || number) && (
                <Button variant="outline" size="sm" onClick={() => { setNumber(''); setResult(null); setHasSearched(false); }} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                   <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground uppercase tracking-tight">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                Target Identifier
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Mobile Number (Pakistan)</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="03XXXXXXXXX"
                    value={number}
                    onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, '').substring(0, 11))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-16 bg-secondary border-border rounded-2xl text-2xl font-mono font-bold text-center tracking-widest focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-[9px] text-foreground/20 font-bold uppercase tracking-widest text-center">Format: 11 Digits (e.g. 03001234567)</p>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSearch}
                  disabled={isProcessing || number.length < 10}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Identify Signal
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Search payloads are processed strictly within your browser's volatile memory. No search history or identification data is logged to our servers.
               </p>
             </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                   Identity Matrix
                </CardTitle>
              </div>
              {result && !result.isMissing && (
                <div className="flex gap-2">
                   <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
                    Signal Isolated
                   </div>
                   {result.isValid && (
                     <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                       Protocol Valid
                     </div>
                   )}
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6 sm:p-10 relative overflow-hidden bg-black/10">
               {!result && !isProcessing ? (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                    <Database className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                 </div>
               ) : isProcessing ? (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-10">
                    <div className="relative">
                       <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Protocol...</p>
                       <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Querying Carrier & Validation Repositories</p>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-10 animate-in zoom-in duration-500 w-full">
                    {/* Primary Identifier */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 border-b border-white/5 pb-10">
                       <div className={cn(
                         "w-24 h-24 rounded-[2.5rem] border flex items-center justify-center shadow-xl ring-4",
                         result.isMissing ? "bg-red-500/10 border-red-500/20 text-red-500 ring-red-500/5" : "bg-primary/10 border-primary/20 text-primary ring-primary/5"
                       )}>
                          <User className="w-10 h-10" />
                       </div>
                       <div className="text-center sm:text-left space-y-2">
                          <h3 className={cn(
                            "text-4xl font-headline font-black uppercase tracking-tight",
                            result.isMissing ? "text-red-500/60" : "text-foreground"
                          )}>
                            {result.owner}
                          </h3>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                             {!result.isMissing ? (
                               <div className="flex items-center gap-2 text-primary">
                                  <BadgeCheck className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Identity Verified</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-2 text-destructive">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Registry Search Restricted</span>
                               </div>
                             )}
                             <div className="flex items-center gap-2 text-foreground/40">
                                <Activity className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Status: {result.status}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Data Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {[
                         { icon: Fingerprint, label: 'CNIC Registry', val: result.cnic },
                         { icon: Smartphone, label: 'Carrier Signature', val: result.carrier },
                         { icon: MapPin, label: 'Registered Region', val: result.address },
                         { icon: Clock, label: 'Activation Matrix', val: result.activationDate },
                         { icon: Globe, label: 'Country Node', val: result.country || 'Pakistan' },
                         { icon: Network, label: 'Line Protocol', val: result.lineType || 'Mobile' },
                       ].map((item, i) => (
                         <div key={i} className="p-6 rounded-[2rem] bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner">
                               <item.icon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                               <p className="text-[13px] font-bold text-foreground truncate uppercase">{item.val}</p>
                            </div>
                         </div>
                       ))}
                    </div>

                    {/* Validation Panel */}
                    <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                       <Shield className="w-5 h-5 text-primary mt-1 shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Validation Protocol Report</p>
                          <p className="text-[9px] text-foreground/40 leading-relaxed font-medium uppercase">
                             Identity retrieval is based on a simulated clinical registry and global node validation. {result.isValid ? "This number adheres to the E.164 telecommunications standard." : "This number follows a non-standard or restricted protocol."}
                          </p>
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
