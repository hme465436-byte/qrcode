"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Fingerprint, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Info,
  Settings2,
  Zap,
  Activity,
  Maximize2,
  Download,
  ShieldCheck,
  Hash,
  RefreshCcw,
  Target,
  FileCode,
  Shield,
  Smartphone,
  Check,
  X,
  History,
  ClipboardType,
  FileJson,
  List,
  Braces,
  Search,
  AlertCircle,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Logic Helpers ---

// UUID v1 Style (Simplified for browser use: timestamp + random node)
const generateV1Style = () => {
  const now = Date.now();
  const time_low = (now & 0xffffffff).toString(16).padStart(8, '0');
  const time_mid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0');
  const time_hi_and_version = (((now >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
  const clock_seq_and_res = (Math.floor(Math.random() * 0x3fff) | 0x8000).toString(16).padStart(4, '0');
  const node = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  return `${time_low}-${time_mid}-${time_hi_and_version}-${clock_seq_and_res}-${node}`;
};

type UuidType = 'v4' | 'v1' | 'nil' | 'custom';
type UuidSeparator = 'newline' | 'comma' | 'space';

interface BatchHistory {
  id: string;
  timestamp: number;
  type: UuidType;
  ids: string[];
}

export default function UuidGeneratorPage() {
  const { toast } = useToast();
  
  // Generation State
  const [ids, setIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(10);
  const [uuidType, setUuidType] = useState<UuidType>('v4');
  const [prefix, setPrefix] = useState('');
  
  // Format State
  const [noDashes, setNoDashes] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [useBraces, setUseBraces] = useState(false);
  const [useUrn, setUseUrn] = useState(false);
  const [separator, setSeparator] = useState<UuidSeparator>('newline');
  
  // History & Management
  const [history, setHistory] = useState<BatchHistory[]>([]);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  
  // Validation State
  const [validatingText, setValidatingText] = useState('');

  const generateUUIDs = useCallback(() => {
    const newIds: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let id = '';
      if (uuidType === 'v4') id = crypto.randomUUID();
      else if (uuidType === 'v1') id = generateV1Style();
      else if (uuidType === 'nil') id = '00000000-0000-0000-0000-000000000000';
      else if (uuidType === 'custom') id = prefix + crypto.randomUUID();
      newIds.push(id);
    }
    setIds(newIds);
    
    // Save to History
    const entry: BatchHistory = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: uuidType,
      ids: newIds
    };
    setHistory(prev => [entry, ...prev].slice(0, 20));
  }, [quantity, uuidType, prefix]);

  useEffect(() => {
    generateUUIDs();
  }, []);

  const formatId = (id: string) => {
    let result = id;
    if (noDashes) result = result.replace(/-/g, '');
    if (isUppercase) result = result.toUpperCase();
    else result = result.toLowerCase();
    if (useBraces) result = `{${result}}`;
    if (useUrn) result = `urn:uuid:${result}`;
    return result;
  };

  const formattedIds = useMemo(() => ids.map(formatId), [ids, noDashes, isUppercase, useBraces, useUrn]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied", description: `${label} saved to clipboard.` });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const joinIds = () => {
    if (separator === 'comma') return formattedIds.join(', ');
    if (separator === 'space') return formattedIds.join(' ');
    return formattedIds.join('\n');
  };

  const handleCopyAll = () => {
    const text = joinIds();
    handleCopy(text, 'all');
  };

  const handleDownload = (format: 'txt' | 'csv') => {
    const content = format === 'csv' ? `id\n${formattedIds.join('\n')}` : joinIds();
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mykit_uuid_export.${format}`;
    a.click();
    toast({ title: "Export Complete" });
  };

  const validationResult = useMemo(() => {
    const input = validatingText.trim();
    if (!input) return null;
    
    // UUID pattern: 8-4-4-4-12 hex or 32 hex
    const uuidRegex = /^({)?([0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[1-5][0-9a-fA-F]{3}-?[89abAB][0-9a-fA-F]{3}-?[0-9a-fA-F]{12})(})?$/;
    const match = input.match(uuidRegex);
    
    if (match) {
      // Version digit is at index 14 in hyphenated version (pos 12 in clean version)
      const clean = match[2].replace(/-/g, '');
      const version = clean.charAt(12);
      return { valid: true, version: version };
    }
    return { valid: false };
  }, [validatingText]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <Fingerprint className="w-3.5 h-3.5" /> Identity Suite
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight overflow-wrap-anywhere">
            UUID <span className="text-primary">Generator Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced high-entropy identity matrixing. Generate secure UUID v4, v1-style, and custom identifiers locally with professional formatting and clinical validation.
          </p>
        </div>
        <div className="shrink-0 pb-2">
           <GetHelp toolId="uuid-generator" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Settings2 className="w-5 h-5 text-primary" /> Matrix Config
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              {/* Type Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Algorithm Strategy</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'v4', label: 'UUID v4', desc: 'Secure Random' },
                    { id: 'v1', label: 'v1 Look', desc: 'Time-Based' },
                    { id: 'nil', label: 'NIL Type', desc: 'Zero States' },
                    { id: 'custom', label: 'Custom', desc: 'Prefixed ID' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setUuidType(t.id as UuidType)}
                      className={cn(
                        "flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all text-left",
                        uuidType === t.id ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border text-foreground/40 hover:border-primary/20"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.label}</span>
                      <span className={cn("text-[8px] font-bold uppercase opacity-60", uuidType === t.id ? "text-white" : "text-foreground/30")}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {uuidType === 'custom' && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Matrix Prefix</Label>
                  <Input 
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. USER_"
                    className="h-14 bg-secondary border-border rounded-xl font-mono text-xs"
                  />
                </div>
              )}

              {/* Quantity Slider */}
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/50">
                  <Label>Batch Size</Label>
                  <span className="text-primary font-mono text-lg">{quantity}</span>
                </div>
                <Slider value={[quantity]} min={1} max={500} step={1} onValueChange={(v) => setQuantity(v[0])} />
              </div>

              {/* Formatting Toggles */}
              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Protocols</Label>
                <div className="grid grid-cols-2 gap-3">
                   <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                      <span className="text-[9px] font-black uppercase text-foreground/60">No Dashes</span>
                      <Switch checked={noDashes} onCheckedChange={setNoDashes} />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                      <span className="text-[9px] font-black uppercase text-foreground/60">Uppercase</span>
                      <Switch checked={isUppercase} onCheckedChange={setIsUppercase} />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                      <span className="text-[9px] font-black uppercase text-foreground/60">Use Braces</span>
                      <Switch checked={useBraces} onCheckedChange={setUseBraces} />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                      <span className="text-[9px] font-black uppercase text-foreground/60">URN Syntax</span>
                      <Switch checked={useUrn} onCheckedChange={setUseUrn} />
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Bulk Separator</Label>
                <div className="grid grid-cols-3 gap-2">
                   {['newline', 'comma', 'space'].map((sep) => (
                     <button
                       key={sep}
                       onClick={() => setSeparator(sep as UuidSeparator)}
                       className={cn(
                         "h-10 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                         separator === sep ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground/40"
                       )}
                     >
                       {sep.replace('newline', 'LF').replace('comma', ',').replace('space', 'SPC')}
                     </button>
                   ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                <Button 
                  onClick={generateUUIDs}
                  className="h-16 flex-[2] bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-sm shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <RefreshCcw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-700" />
                  Synthesize Batch
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => { setIds([]); setHistory([]); }}
                  className="h-16 flex-1 rounded-2xl border-border bg-secondary hover:text-destructive text-[10px] font-black uppercase tracking-widest"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Card */}
          <Card className="glass-card border-border shadow-xl overflow-hidden group">
            <CardHeader className="py-6 border-b border-border bg-primary/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <Search className="w-4 h-4" /> Identifier Validator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
               <div className="relative group/val">
                  <input 
                    placeholder="Paste UUID to validate..." 
                    value={validatingText}
                    onChange={(e) => setValidatingText(e.target.value)}
                    className="h-14 w-full rounded-xl bg-secondary border border-border font-mono text-xs px-5 pr-12 focus:ring-1 focus:ring-primary outline-none"
                  />
                  <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/val:text-primary transition-colors" />
               </div>

               {validationResult && (
                 <div className={cn(
                   "p-5 rounded-2xl border flex items-center gap-5 animate-in zoom-in duration-300",
                   validationResult.valid ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/40"
                 )}>
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg",
                     validationResult.valid ? "bg-green-500" : "bg-red-500"
                   )}>
                      {validationResult.valid ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                   </div>
                   <div className="space-y-0.5">
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", validationResult.valid ? "text-green-600" : "text-red-600")}>
                        {validationResult.valid ? `Valid Protocol Detected` : "Invalid Matrix Identification"}
                      </p>
                      {validationResult.valid && (
                        <p className="text-[9px] text-foreground/40 font-bold uppercase">RFC 4122 Compliant | Version {validationResult.version}</p>
                      )}
                   </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[700px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Active Matrix Output</CardTitle>
              </div>
              
              {formattedIds.length > 0 && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={handleCopyAll} className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all">
                      {isCopied === 'all' ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                      Copy All
                   </Button>
                   <div className="flex bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                      <button onClick={() => handleDownload('txt')} className="px-3 h-9 text-[9px] font-black uppercase tracking-widest border-r border-white/5 hover:bg-white/5 text-primary">TXT</button>
                      <button onClick={() => handleDownload('csv')} className="px-3 h-9 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 text-foreground/40">CSV</button>
                   </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
               <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-black/10">
                  {formattedIds.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-40">
                       <Maximize2 className="w-20 h-20 text-primary" />
                       <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Generation Protocol</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                       {formattedIds.map((id, index) => (
                         <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-transparent hover:border-primary/20 hover:bg-white/10 transition-all group/item min-w-0">
                            <span className="text-[9px] font-mono text-foreground/10 w-8 shrink-0">{index + 1}</span>
                            <code className="flex-1 text-[11px] sm:text-xs font-mono font-bold text-foreground truncate select-all">{id}</code>
                            <button 
                              onClick={() => handleCopy(id, `id-${index}`)}
                              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/20 hover:text-primary transition-all shrink-0 border border-transparent hover:border-primary/10"
                            >
                               {isCopied === `id-${index}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
               </div>

               {/* Stats Footer */}
               <div className="p-8 border-t border-border bg-[#0a0a0c]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">WASM Synthesis</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Hardware-native secure random seed provides cryptographically-secure uniqueness.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">Zero Storage</p>
                           <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">Identifiers are volatile. Refreshing the browser or clearing the studio definitively purges all data.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* History Tracker */}
          {history.length > 0 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/60">Batch History</h3>
                  <button onClick={() => setHistory([])} className="text-[9px] font-black uppercase text-foreground/20 hover:text-destructive transition-colors">Purge History</button>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {history.map((batch) => (
                    <div key={batch.id} className="p-5 rounded-3xl bg-secondary/50 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                             <History className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase text-foreground truncate">{batch.ids.length} Identifiers • {batch.type.toUpperCase()}</p>
                             <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest mt-0.5">{new Date(batch.timestamp).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="sm" onClick={() => { setIds(batch.ids); toast({ title: "Batch Restored" }); }} className="text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg">
                          Restore
                       </Button>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
