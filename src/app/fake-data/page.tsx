"use client"

import React, { useState, useEffect, useMemo } from 'react';
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
  Hash,
  ChevronRight,
  Maximize2,
  Lock,
  Droplets,
  Car,
  Bitcoin,
  Palette,
  Layout,
  AlignLeft,
  FileCode,
  FileSpreadsheet,
  FileJson,
  Star,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  UserCircle,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';

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
  countryCodes: { 'US': '+1', 'UK': '+44', 'IN': '+91', 'CA': '+1', 'AU': '+61' },
  bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  genders: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  bios: [
    'Coffee enthusiast and digital nomad.',
    'Focused on high-performance architectures.',
    'Life is a journey, not a destination.',
    'Technologist with a passion for user privacy.',
    'Exploring the intersection of art and code.',
    'Building the future, one line at a time.'
  ]
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
  gender?: string;
  blood?: string;
  vehicle?: string;
  password?: string;
  bitcoin?: string;
  color?: string;
  website?: string;
  bio?: string;
  cc?: string;
  cc_exp?: string;
  cc_cvv?: string;
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

const HISTORY_KEY = 'mykit_fake_data_history_v3';
const FAVS_KEY = 'mykit_fake_data_favs';

export default function FakeDataGeneratorPage() {
  const { toast } = useToast();
  
  // Settings
  const [count, setCount] = useState(10);
  const [country, setCountry] = useState('US');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['name', 'email', 'phone', 'location']));
  const [uniqueOnly, setUniqueOnly] = useState(true);
  
  // View State
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof RecordData, direction: 'asc' | 'desc' } | null>(null);

  // Results
  const [results, setResults] = useState<RecordData[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<RecordData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const dataTypes = [
    { id: 'name', label: 'Full Name', icon: User },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'username', label: 'Username', icon: Fingerprint },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'gender', label: 'Gender', icon: UserCircle },
    { id: 'blood', label: 'Blood Type', icon: Droplets },
    { id: 'location', label: 'City', icon: Globe },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'company', label: 'Company', icon: Briefcase },
    { id: 'title', label: 'Job Title', icon: Activity },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'dob', label: 'DOB', icon: Calendar },
    { id: 'cc', label: 'CC Number', icon: CreditCard },
    { id: 'cc_exp', label: 'CC Expiry', icon: Calendar },
    { id: 'cc_cvv', label: 'CVV', icon: Lock },
    { id: 'bitcoin', label: 'Bitcoin', icon: Bitcoin },
    { id: 'vehicle', label: 'Vehicle #', icon: Car },
    { id: 'color', label: 'Color Hex', icon: Palette },
    { id: 'website', label: 'Website', icon: Layout },
    { id: 'bio', label: 'About/Bio', icon: AlignLeft },
    { id: 'ip', label: 'IP Address', icon: ShieldCheck },
    { id: 'uuid', label: 'UUID v4', icon: Hash },
  ];

  useEffect(() => {
    const savedHist = localStorage.getItem(HISTORY_KEY);
    const savedFavs = localStorage.getItem(FAVS_KEY);
    if (savedHist) try { setHistory(JSON.parse(savedHist)); } catch (e) {}
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
  }, []);

  const saveHistory = (newRecords: RecordData[]) => {
    const item: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      count: newRecords.length,
      country,
      records: newRecords
    };
    const next = [item, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const saveFavorites = (next: RecordData[]) => {
    setFavorites(next);
    localStorage.setItem(FAVS_KEY, JSON.stringify(next));
  };

  const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateSingleRecord = (existingEmails?: Set<string>, existingUsernames?: Set<string>): RecordData => {
    const first = getRandom(DATA_POOL.firstNames);
    const last = getRandom(DATA_POOL.lastNames);
    const record: RecordData = { id: Math.random().toString(36).substr(2, 9) };

    const genEmail = () => `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 999)}@${getRandom(DATA_POOL.domains)}`;
    const genUser = () => `${first.toLowerCase()}${last.substring(0, 1).toLowerCase()}${Math.floor(Math.random() * 9999)}`;

    if (selectedTypes.has('name')) record.name = `${first} ${last}`;
    
    if (selectedTypes.has('email')) {
      let email = genEmail();
      if (uniqueOnly && existingEmails) {
        while (existingEmails.has(email)) email = genEmail();
        existingEmails.add(email);
      }
      record.email = email;
    }

    if (selectedTypes.has('username')) {
      let user = genUser();
      if (uniqueOnly && existingUsernames) {
        while (existingUsernames.has(user)) user = genUser();
        existingUsernames.add(user);
      }
      record.username = user;
    }

    if (selectedTypes.has('phone')) record.phone = `${DATA_POOL.countryCodes[country as keyof typeof DATA_POOL.countryCodes]} ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    if (selectedTypes.has('address')) record.address = `${Math.floor(Math.random() * 9999)} ${getRandom(DATA_POOL.streets)}`;
    if (selectedTypes.has('location')) record.location = `${getRandom(DATA_POOL.cities[country as keyof typeof DATA_POOL.cities])}`;
    if (selectedTypes.has('company')) record.company = getRandom(DATA_POOL.companies);
    if (selectedTypes.has('title')) record.title = getRandom(DATA_POOL.jobs);
    if (selectedTypes.has('gender')) record.gender = getRandom(DATA_POOL.genders);
    if (selectedTypes.has('blood')) record.blood = getRandom(DATA_POOL.bloodTypes);
    if (selectedTypes.has('vehicle')) record.vehicle = `${Array.from({length: 3}, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')}-${Math.floor(Math.random() * 9000 + 1000)}`;
    if (selectedTypes.has('color')) record.color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
    if (selectedTypes.has('website')) record.website = `https://www.${first.toLowerCase()}${last.toLowerCase()}.com`;
    if (selectedTypes.has('bio')) record.bio = getRandom(DATA_POOL.bios);
    
    if (selectedTypes.has('password')) {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      record.password = Array.from({length: 12}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    if (selectedTypes.has('dob')) {
      const year = 1975 + Math.floor(Math.random() * 30);
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      record.dob = `${year}-${month}-${day}`;
    }

    if (selectedTypes.has('cc')) {
      const vendor = Math.random() > 0.5 ? '4' : '5';
      const rest = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
      record.cc = vendor + rest;
    }

    if (selectedTypes.has('cc_exp')) {
      const mm = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const yy = 25 + Math.floor(Math.random() * 5);
      record.cc_exp = `${mm}/${yy}`;
    }

    if (selectedTypes.has('cc_cvv')) record.cc_cvv = Math.floor(Math.random() * 900 + 100).toString();
    if (selectedTypes.has('bitcoin')) record.bitcoin = 'bc1' + Math.random().toString(36).substring(2, 20);
    if (selectedTypes.has('ip')) record.ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    if (selectedTypes.has('uuid')) record.uuid = crypto.randomUUID();

    return record;
  };

  const generateRecords = () => {
    setIsProcessing(true);
    const newRecords: RecordData[] = [];
    const usedEmails = new Set<string>();
    const usedUsernames = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      newRecords.push(generateSingleRecord(usedEmails, usedUsernames));
    }

    setResults(newRecords);
    saveHistory(newRecords);
    setIsProcessing(false);
    toast({ title: "Synthesis Complete", description: `Forged ${newRecords.length} identities.` });
  };

  const regenerateSingle = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? generateSingleRecord() : r));
    toast({ title: "Node Refreshed" });
  };

  const toggleType = (id: string) => {
    const next = new Set(selectedTypes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTypes(next);
  };

  const applyPreset = (type: 'dev' | 'ecommerce' | 'hr' | 'random') => {
    let next: string[] = [];
    if (type === 'dev') next = ['name', 'email', 'username', 'password', 'website', 'ip', 'uuid'];
    if (type === 'ecommerce') next = ['name', 'email', 'phone', 'location', 'address', 'cc', 'cc_exp', 'cc_cvv'];
    if (type === 'hr') next = ['name', 'email', 'title', 'company', 'dob', 'gender', 'phone'];
    if (type === 'random') next = dataTypes.sort(() => Math.random() - 0.5).slice(0, 8).map(t => t.id);
    
    setSelectedTypes(new Set(next));
    toast({ title: "Preset Applied" });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleCopyRow = (record: RecordData) => {
    const text = Object.entries(record)
      .filter(([k]) => k !== 'id')
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join('\n');
    handleCopy(text, `row-${record.id}`);
  };

  const handleCopyAll = () => {
    const content = JSON.stringify(results, null, 2);
    handleCopy(content, 'all-results');
  };

  const handleExport = (format: 'csv' | 'json' | 'xlsx' | 'sql') => {
    if (results.length === 0) return;
    let content = '';
    const headersList = Array.from(selectedTypes);

    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
    } else if (format === 'sql') {
      const rowsList = results.map(r => {
        const vals = headersList.map(h => {
          const val = r[h as keyof RecordData] || '';
          return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
        }).join(', ');
        return `INSERT INTO identities (${headersList.join(', ')}) VALUES (${vals});`;
      });
      content = rowsList.join('\n');
    } else if (format === 'csv') {
      const csvRows = [
        headersList.join(','),
        ...results.map(r => headersList.map(h => `"${r[h as keyof RecordData] || ''}"`).join(','))
      ];
      content = csvRows.join('\n');
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(results.map(({ id, ...rest }) => rest));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Identities");
      XLSX.writeFile(workbook, `fake_data_${Date.now()}.xlsx`);
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fake_data_export_${Date.now()}.${format === 'sql' ? 'sql' : format}`;
    a.click();
    toast({ title: "Export Success" });
  };

  const filteredAndSortedResults = useMemo(() => {
    let list = results.filter(r => {
      const searchTarget = Object.values(r).join(' ').toLowerCase();
      return searchTarget.includes(searchQuery.toLowerCase());
    });

    if (sortConfig) {
      list.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [results, searchQuery, sortConfig]);

  const toggleFav = (record: RecordData) => {
    const isFav = favorites.some(f => f.id === record.id);
    if (isFav) saveFavorites(favorites.filter(f => f.id !== record.id));
    else saveFavorites([...favorites, record]);
  };

  const handleClear = () => {
    setResults([]);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Database className="w-3.5 h-3.5" /> Linguistic Studio Pro
          </div>
          <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight">
            Fake Data <span className="text-primary italic">Generator</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Advanced high-fidelity identity synthesis. Forge localized datasets with clinical accuracy for professional software staging and testing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="fake-data" />
           <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Controls Column */}
        <aside className="lg:col-span-5 xl:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-visible relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Configuration
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase">Volume</Label>
                       <Select value={count.toString()} onValueChange={(v) => setCount(parseInt(v))}>
                          <SelectTrigger className="h-11 bg-secondary/50 border-border rounded-xl text-[10px] font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {[1, 5, 10, 20, 50, 100].map(n => <SelectItem key={n} value={n.toString()} className="text-[10px] uppercase font-bold">{n} Records</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black text-foreground/40 uppercase">Protocol</Label>
                       <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger className="h-11 bg-secondary/50 border-border rounded-xl text-[10px] font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             <SelectItem value="US" className="text-[10px]">🇺🇸 US Matrix</SelectItem>
                             <SelectItem value="UK" className="text-[10px]">🇬🇧 UK Matrix</SelectItem>
                             <SelectItem value="IN" className="text-[10px]">🇮🇳 IN Matrix</SelectItem>
                             <SelectItem value="CA" className="text-[10px]">🇨🇦 CA Matrix</SelectItem>
                             <SelectItem value="AU" className="text-[10px]">🇦🇺 AU Matrix</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Templates</Label>
                       <span className="text-[8px] font-black text-primary uppercase">Quick Mapping</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       {([
                         { id: 'dev', label: 'Developer', icon: FileCode },
                         { id: 'ecommerce', label: 'Checkout', icon: CreditCard },
                         { id: 'hr', label: 'Employees', icon: Briefcase },
                         { id: 'random', label: 'Chaos', icon: Dices }
                       ] as const).map(p => (
                         <button key={p.id} onClick={() => applyPreset(p.id)} className="h-10 rounded-xl bg-background border border-border flex items-center justify-center gap-2 text-[8px] font-black uppercase text-foreground/40 hover:text-primary hover:border-primary/20 transition-all">
                            <p.icon className="w-3.5 h-3.5" /> {p.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center px-1">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase">Identity Fields</Label>
                       <div className="flex gap-4">
                          <button onClick={() => setSelectedTypes(new Set(dataTypes.map(t => t.id)))} className="text-[8px] font-black text-primary/60 hover:text-primary uppercase">All</button>
                          <button onClick={() => setSelectedTypes(new Set())} className="text-[8px] font-black text-foreground/20 hover:text-primary uppercase">None</button>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[350px] overflow-auto custom-scrollbar pr-1">
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
                            <type.icon className={cn("w-4 h-4", selectedTypes.has(type.id) ? "text-primary" : "text-foreground/20")} />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", selectedTypes.has(type.id) ? "text-foreground" : "text-foreground/40")}>{type.label}</span>
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
                    Forge Dataset
                 </Button>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">WASM Sandbox</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Identity synthesis occurs 100% locally. No generated records are ever transmitted or stored on remote servers.
               </p>
             </div>
          </div>
        </aside>

        {/* Results Matrix */}
        <main className="lg:col-span-7 xl:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           
           {/* Favorites / Shortlist */}
           {favorites.length > 0 && (
             <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/40">Identity Shortlist</h3>
                   </div>
                   <button onClick={() => saveFavorites([])} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Clear Favorites</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                   {favorites.map(fav => (
                     <Card key={fav.id} className="min-w-[280px] glass-card border-yellow-500/20 bg-yellow-500/[0.02] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600"><User className="w-4 h-4" /></div>
                              <p className="text-sm font-bold uppercase truncate max-w-[150px]">{fav.name || fav.username || 'Identity'}</p>
                           </div>
                           <button onClick={() => toggleFav(fav)} className="text-yellow-600"><Star className="w-4 h-4 fill-current" /></button>
                        </div>
                        <p className="text-[10px] text-foreground/40 font-medium truncate uppercase tracking-tighter">{fav.email || fav.phone || 'Contact Private'}</p>
                        <Button variant="ghost" onClick={() => handleCopyRow(fav)} className="w-full h-9 bg-yellow-500/10 text-yellow-600 text-[8px] font-black uppercase">Copy Profile</Button>
                     </Card>
                   ))}
                </div>
             </div>
           )}

           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0 px-6 sm:px-10">
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Activity className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Linguistic Results</CardTitle>
                    </div>
                    {results.length > 0 && <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em] ml-14">Synchronized via hardware seed</p>}
                 </div>
                 
                 {results.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                       <div className="relative group/search">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                          <Input 
                            placeholder="Filter records..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-10 pl-9 w-40 bg-background/50 border-white/5 rounded-xl text-[9px] font-black uppercase"
                          />
                       </div>

                       <div className="flex bg-white/5 rounded-xl border border-white/5 p-1">
                          <button onClick={() => setViewMode('table')} className={cn("px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", viewMode === 'table' ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white")}>Table</button>
                          <button onClick={() => setViewMode('card')} className={cn("px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all", viewMode === 'card' ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white")}>Cards</button>
                       </div>

                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10 rounded-xl bg-primary text-white font-black text-[9px] uppercase tracking-widest border-none shadow-lg">
                               <FileDown className="w-3.5 h-3.5 mr-2" /> Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-card border-white/10 w-40">
                             <DropdownMenuItem onClick={() => handleExport('csv')} className="text-[9px] font-black uppercase cursor-pointer"><FileText className="w-3.5 h-3.5 mr-2 text-primary" /> CSV Matrix</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleExport('json')} className="text-[9px] font-black uppercase cursor-pointer"><FileJson className="w-3.5 h-3.5 mr-2 text-primary" /> JSON Object</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleExport('xlsx')} className="text-[9px] font-black uppercase cursor-pointer"><FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-primary" /> Excel Sheet</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleExport('sql')} className="text-[9px] font-black uppercase cursor-pointer"><FileCode className="w-3.5 h-3.5 mr-2 text-primary" /> SQL Inserts</DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-white/5" />
                             <DropdownMenuItem onClick={handleCopyAll} className="text-[9px] font-black uppercase cursor-pointer"><Copy className="w-3.5 h-3.5 mr-2" /> Copy All</DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                 <div className="flex-1 overflow-auto custom-scrollbar">
                    {results.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-40 opacity-10 gap-8 grayscale">
                         <Fingerprint className="w-32 h-32 text-primary" />
                         <p className="text-xl font-black uppercase tracking-[0.4em]">Awaiting Identity Signal</p>
                      </div>
                    ) : viewMode === 'table' ? (
                      <div className="min-w-full">
                         <Table>
                            <TableHeader className="bg-background/50 sticky top-0 z-20">
                               <TableRow className="border-border">
                                  <TableHead className="w-12"></TableHead>
                                  {Array.from(selectedTypes).map(typeId => (
                                    <TableHead key={typeId} className="h-14">
                                       <button 
                                        onClick={() => setSortConfig({ key: typeId as any, direction: sortConfig?.key === typeId && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                        className="flex items-center gap-2 text-[9px] font-black uppercase text-foreground/30 tracking-widest hover:text-primary transition-colors"
                                       >
                                          {dataTypes.find(t => t.id === typeId)?.label}
                                          {sortConfig?.key === typeId ? (
                                            sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                          ) : <ArrowUpDown className="w-3 h-3 opacity-20" />}
                                       </button>
                                    </TableHead>
                                  ))}
                                  <TableHead className="w-32"></TableHead>
                               </TableRow>
                            </TableHeader>
                            <TableBody>
                               {filteredAndSortedResults.map((record) => (
                                 <TableRow key={record.id} className="border-border hover:bg-primary/[0.02] transition-colors group/row">
                                    <TableCell className="p-4">
                                       <button onClick={() => toggleFav(record)} className={cn("transition-all", favorites.some(f => f.id === record.id) ? "text-yellow-500" : "text-foreground/10 hover:text-yellow-500")}>
                                          <Star className={cn("w-4 h-4", favorites.some(f => f.id === record.id) && "fill-current")} />
                                       </button>
                                    </TableCell>
                                    {Array.from(selectedTypes).map(typeId => {
                                      const val = record[typeId as keyof RecordData] || '—';
                                      return (
                                        <TableCell key={typeId} className="py-4">
                                           <div className="flex items-center justify-between gap-4 group/cell min-w-0">
                                              <span className="text-[11px] font-medium text-foreground/80 truncate max-w-[180px] uppercase tracking-tight">{val}</span>
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
                                    <TableCell className="text-right p-4">
                                       <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => regenerateSingle(record.id)} className="p-2 text-foreground/10 hover:text-primary opacity-0 group-hover/row:opacity-100 transition-all" title="Regenerate Node">
                                             <RefreshCcw className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => handleCopyRow(record)} className="p-2 text-foreground/10 hover:text-primary opacity-0 group-hover/row:opacity-100 transition-all" title="Copy Full Profile">
                                             <Maximize2 className="w-3.5 h-3.5" />
                                          </button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                               ))}
                            </TableBody>
                         </Table>
                      </div>
                    ) : (
                      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                         {filteredAndSortedResults.map((record) => (
                           <Card key={record.id} className="glass-card border-border hover:border-primary/20 transition-all group/card overflow-hidden">
                              <div className="p-5 border-b border-border bg-secondary/30 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User className="w-4 h-4" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{record.name || 'Anonymous'}</span>
                                 </div>
                                 <div className="flex gap-2">
                                    <button onClick={() => toggleFav(record)} className={cn("p-1.5 rounded-lg", favorites.some(f => f.id === record.id) ? "text-yellow-500" : "text-foreground/10")}>
                                       <Star className={cn("w-3.5 h-3.5", favorites.some(f => f.id === record.id) && "fill-current")} />
                                    </button>
                                    <button onClick={() => handleCopyRow(record)} className="p-1.5 rounded-lg text-foreground/10 hover:text-primary"><Copy className="w-3.5 h-3.5" /></button>
                                 </div>
                              </div>
                              <div className="p-6 space-y-4">
                                 {Array.from(selectedTypes).slice(0, 6).map(typeId => (
                                   <div key={typeId} className="flex flex-col gap-1">
                                      <span className="text-[7px] font-black text-foreground/20 uppercase tracking-widest">{dataTypes.find(t => t.id === typeId)?.label}</span>
                                      <p className="text-[11px] font-bold text-foreground/70 truncate uppercase">{record[typeId as keyof RecordData] || '—'}</p>
                                   </div>
                                 ))}
                                 <Button variant="ghost" onClick={() => regenerateSingle(record.id)} className="w-full h-8 bg-secondary/50 text-[8px] font-black uppercase hover:bg-primary/10 hover:text-primary">Reforge Node</Button>
                              </div>
                           </Card>
                         ))}
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
        </main>
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
