"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Database, 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  CreditCard, 
  Fingerprint, 
  Globe, 
  Zap, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Download, 
  Trash2, 
  History, 
  Activity, 
  Check, 
  ShieldCheck, 
  Search, 
  LayoutGrid, 
  Table as TableIcon,
  Plus,
  ArrowRight,
  Settings2,
  AlertCircle,
  Calendar,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Linguistic Data Matrix ---

const DATA_POOL = {
  firstNames: ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah'],
  lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzales', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'],
  domains: ['gmail.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com', 'yahoo.com', 'matrix.io', 'studio.ai', 'tech.org', 'identity.net'],
  companies: ['Vortex Industries', 'Nexus Core', 'Starlight Media', 'Quantum Labs', 'Prime Strategy', 'Global Solutions', 'Summit Ventures', 'Aether Soft', 'Blue Horizon', 'Echo Systems', 'Titan Group', 'Zenith Digital', 'Nova Corp', 'Pulse Analytics', 'Bridge Tech'],
  jobs: ['Senior Architect', 'Product Manager', 'Software Engineer', 'Creative Director', 'Analyst', 'Strategic Lead', 'Marketing Specialist', 'UI Designer', 'Systems Admin', 'Fullstack Developer', 'Data Scientist', 'HR Manager', 'Financial Advisor', 'Operations Lead', 'Content Strategist'],
  streets: ['Main St', 'Park Ave', 'Oak St', 'Cedar Lane', 'Maple Dr', 'Pine St', 'Washington Blvd', 'Lakeview Dr', 'River Road', 'Valley View'],
  cities: {
    'US': ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'],
    'UK': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool'],
    'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad'],
    'CA': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
    'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide']
  },
  countryCodes: { 'US': '+1', 'UK': '+44', 'IN': '+91', 'CA': '+1', 'AU': '+61' }
};

interface RecordData {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  address?: string;
  location?: string;
  company?: string;
  title?: string;
  dob?: string;
  cc?: string;
  ip?: string;
  uuid?: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  count: number;
  country: string;
  records: RecordData[];
}

const HISTORY_KEY = 'mykit_fake_data_history';

export default function FakeDataGeneratorPage() {
  const { toast } = useToast();
  
  // Settings
  const [count, setCount] = useState(10);
  const [country, setCountry] = useState('US');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['name', 'email', 'phone', 'location']));
  
  // Results
  const [results, setResults] = useState<RecordData[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const dataTypes = [
    { id: 'name', label: 'Full Name', icon: User },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'username', label: 'Username', icon: Fingerprint },
    { id: 'phone', label: 'Phone Number', icon: Phone },
    { id: 'address', label: 'Street Address', icon: MapPin },
    { id: 'location', label: 'City + Country', icon: Globe },
    { id: 'company', label: 'Company Name', icon: Briefcase },
    { id: 'title', label: 'Job Title', icon: Activity },
    { id: 'dob', label: 'Date of Birth', icon: Calendar },
    { id: 'cc', label: 'Credit Card', icon: CreditCard },
    { id: 'ip', label: 'IP Address', icon: ShieldCheck },
    { id: 'uuid', label: 'UUID', icon: Hash },
  ];

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}
  }, []);

  const saveHistory = (newRecords: RecordData[]) => {
    const item: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      count: newRecords.length,
      country,
      records: newRecords
    };
    const next = [item, ...history].slice(0, 5);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateRecords = () => {
    setIsProcessing(true);
    const newRecords: RecordData[] = [];
    
    for (let i = 0; i < count; i++) {
      const first = getRandom(DATA_POOL.firstNames);
      const last = getRandom(DATA_POOL.lastNames);
      const record: RecordData = { id: Math.random().toString(36).substr(2, 9) };

      if (selectedTypes.has('name')) record.name = `${first} ${last}`;
      if (selectedTypes.has('email')) record.email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 99)}@${getRandom(DATA_POOL.domains)}`;
      if (selectedTypes.has('username')) record.username = `${first.toLowerCase()}${last.substring(0, 1).toLowerCase()}${Math.floor(Math.random() * 999)}`;
      if (selectedTypes.has('phone')) record.phone = `${DATA_POOL.countryCodes[country as keyof typeof DATA_POOL.countryCodes]} ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
      if (selectedTypes.has('address')) record.address = `${Math.floor(Math.random() * 9999)} ${getRandom(DATA_POOL.streets)}`;
      if (selectedTypes.has('location')) record.location = `${getRandom(DATA_POOL.cities[country as keyof typeof DATA_POOL.cities])}, ${country}`;
      if (selectedTypes.has('company')) record.company = getRandom(DATA_POOL.companies);
      if (selectedTypes.has('title')) record.title = getRandom(DATA_POOL.jobs);
      if (selectedTypes.has('dob')) {
        const year = 1970 + Math.floor(Math.random() * 40);
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        record.dob = `${year}-${month}-${day}`;
      }
      if (selectedTypes.has('cc')) {
        const vendor = Math.random() > 0.5 ? '4' : '5'; // Visa or Master
        const rest = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
        record.cc = vendor + rest;
      }
      if (selectedTypes.has('ip')) record.ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
      if (selectedTypes.has('uuid')) record.uuid = crypto.randomUUID();

      newRecords.push(record);
    }

    setResults(newRecords);
    saveHistory(newRecords);
    setIsProcessing(false);
    toast({ title: "Synthesis Complete", description: `Generated ${newRecords.length} identity signals.` });
  };

  const toggleType = (id: string) => {
    const next = new Set(selectedTypes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTypes(next);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleCopyAll = () => {
    const headerRow = Array.from(selectedTypes).join('\t');
    const dataRows = results.map(r => 
      Array.from(selectedTypes).map(t => r[t as keyof RecordData] || '').join('\t')
    ).join('\n');
    navigator.clipboard.writeText(`${headerRow}\n${dataRows}`);
    setIsCopied('all');
    toast({ title: "Matrix Copied", description: "All records saved to clipboard." });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleExport = (format: 'csv' | 'json') => {
    let content = '';
    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
    } else {
      const headers = Array.from(selectedTypes);
      const csvRows = [
        headers.join(','),
        ...results.map(r => headers.map(h => `"${r[h as keyof RecordData] || ''}"`).join(','))
      ];
      content = csvRows.join('\n');
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fake_data_export_${Date.now()}.${format}`;
    a.click();
    toast({ title: "Export Success" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Database className="w-3.5 h-3.5" /> Linguistic Suite
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
            Fake Data <span className="text-primary italic">Generator</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
            Professional high-fidelity identity synthesis. Generate realistic datasets for development testing locally and securely within your browser.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GetHelp toolId="fake-data" />
          {(results.length > 0) && (
            <Button variant="outline" size="sm" onClick={() => setResults([])} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear Results
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Controls Column */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Matrix Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Record Volume</Label>
                    <Select value={count.toString()} onValueChange={(v) => setCount(parseInt(v))}>
                       <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold uppercase text-[10px]">
                          <SelectValue placeholder="Quantity" />
                       </SelectTrigger>
                       <SelectContent className="glass-card">
                          {[1, 5, 10, 25, 50].map(n => (
                            <SelectItem key={n} value={n.toString()} className="text-[10px] font-black uppercase">{n} Records</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Linguistic Port (Country)</Label>
                    <Select value={country} onValueChange={setCountry}>
                       <SelectTrigger className="h-12 bg-secondary border-border rounded-xl font-bold uppercase text-[10px]">
                          <SelectValue placeholder="Select Country" />
                       </SelectTrigger>
                       <SelectContent className="glass-card">
                          <SelectItem value="US" className="text-[10px] font-black uppercase">🇺🇸 United States</SelectItem>
                          <SelectItem value="UK" className="text-[10px] font-black uppercase">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="IN" className="text-[10px] font-black uppercase">🇮🇳 India</SelectItem>
                          <SelectItem value="CA" className="text-[10px] font-black uppercase">🇨🇦 Canada</SelectItem>
                          <SelectItem value="AU" className="text-[10px] font-black uppercase">🇦🇺 Australia</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Identity Fields</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                       {dataTypes.map(type => (
                         <div 
                          key={type.id} 
                          onClick={() => toggleType(type.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group/type",
                            selectedTypes.has(type.id) ? "bg-primary/10 border-primary/20" : "bg-secondary/30 border-border hover:border-primary/10"
                          )}
                         >
                            <Checkbox checked={selectedTypes.has(type.id)} className="data-[state=checked]:bg-primary" />
                            <div className="flex items-center gap-3 flex-1">
                               <type.icon className={cn("w-4 h-4", selectedTypes.has(type.id) ? "text-primary" : "text-foreground/20")} />
                               <span className={cn("text-[9px] font-black uppercase tracking-widest", selectedTypes.has(type.id) ? "text-foreground" : "text-foreground/40")}>{type.label}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <Button 
                    onClick={generateRecords} 
                    disabled={isProcessing || selectedTypes.size === 0}
                    className="h-16 w-full bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 text-xs uppercase tracking-widest active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                    Forge Matrix
                 </Button>
              </CardContent>
           </Card>

           {history.length > 0 && (
             <Card className="glass-card border-border shadow-xl flex flex-col">
                <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                   <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-primary" />
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground">Archive Log</CardTitle>
                   </div>
                   <button onClick={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} className="text-[8px] font-black text-red-500 uppercase tracking-widest hover:underline">Purge</button>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto custom-scrollbar max-h-[300px]">
                   <div className="divide-y divide-white/5">
                      {history.map(item => (
                        <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setResults(item.records)}>
                           <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-foreground truncate uppercase">{item.count} Records ({item.country})</p>
                              <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{new Date(item.timestamp).toLocaleTimeString()}</p>
                           </div>
                           <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all" />
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
           )}
        </aside>

        {/* Results Matrix */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0 px-6 sm:px-10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Data Matrix</CardTitle>
                 </div>
                 
                 {results.length > 0 && (
                    <div className="flex items-center gap-3">
                       <Button onClick={handleCopyAll} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-white/5 bg-white/5 text-[8px] font-black uppercase tracking-widest">
                          {isCopied === 'all' ? <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-2" />} Copy All
                       </Button>
                       <div className="flex bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                          <button onClick={() => handleExport('csv')} className="px-3 h-9 text-[9px] font-black uppercase tracking-widest border-r border-white/5 hover:bg-white/5 text-primary">CSV</button>
                          <button onClick={() => handleExport('json')} className="px-3 h-9 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 text-foreground/40">JSON</button>
                       </div>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-auto custom-scrollbar">
                    {results.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 gap-8 grayscale">
                         <Database className="w-32 h-32 text-primary" />
                         <p className="text-xl font-black uppercase tracking-[0.4em]">Awaiting Identity Signal</p>
                      </div>
                    ) : (
                      <div className="min-w-[800px] lg:min-w-0">
                         <Table>
                            <TableHeader className="bg-background/50">
                               <TableRow className="border-border">
                                  {Array.from(selectedTypes).map(typeId => (
                                    <TableHead key={typeId} className="text-[9px] font-black uppercase text-foreground/30 tracking-widest h-14">
                                       {dataTypes.find(t => t.id === typeId)?.label}
                                    </TableHead>
                                  ))}
                                  <TableHead className="w-16"></TableHead>
                               </TableRow>
                            </TableHeader>
                            <TableBody>
                               {results.map((record) => (
                                 <TableRow key={record.id} className="border-border hover:bg-primary/[0.02] transition-colors group/row">
                                    {Array.from(selectedTypes).map(typeId => {
                                      const val = record[typeId as keyof RecordData] || '—';
                                      return (
                                        <TableCell key={typeId} className="py-4">
                                           <div className="flex items-center justify-between gap-4 group/cell">
                                              <span className="text-[11px] font-medium text-foreground/80 truncate max-w-[150px] uppercase tracking-tight">{val}</span>
                                              <button 
                                                onClick={() => handleCopy(val.toString(), `${record.id}-${typeId}`)}
                                                className={cn(
                                                  "opacity-0 group-hover/cell:opacity-100 transition-all p-1.5 rounded-lg",
                                                  isCopied === `${record.id}-${typeId}` ? "text-emerald-500 bg-emerald-500/10" : "text-foreground/20 hover:text-primary hover:bg-primary/10"
                                                )}
                                              >
                                                 {isCopied === `${record.id}-${typeId}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                              </button>
                                           </div>
                                        </TableCell>
                                      );
                                    })}
                                    <TableCell className="text-right">
                                       <button onClick={() => handleCopy(Object.values(record).join(' '), record.id)} className="p-2 text-foreground/10 hover:text-primary opacity-0 group-hover/row:opacity-100 transition-all">
                                          <Maximize2 className="w-4 h-4" />
                                       </button>
                                    </TableCell>
                                 </TableRow>
                               ))}
                            </TableBody>
                         </Table>
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All generation occurs 100% locally in browser memory. No generated identities are ever transmitted or stored on remote servers.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <LayoutGrid className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">High-Fidelity Synthesis</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing a multi-layered linguistic matrix to ensure generated data sets maintain structural realism for professional software staging.
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
