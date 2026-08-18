"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Table as TableIcon, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  X, 
  Settings2, 
  Info, 
  CheckCircle2, 
  FileText, 
  Zap, 
  Layout, 
  Save, 
  FileDown, 
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Type,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Templates ---
const TEMPLATES = {
  attendance: {
    headers: ['Date', 'Participant Name', 'Status (P/A)', 'Notes'],
    rows: [['2024-03-20', 'John Doe', 'Present', 'Morning Shift'], ['2024-03-20', 'Jane Smith', 'Absent', 'On Leave']]
  },
  inventory: {
    headers: ['Item Name', 'SKU', 'Stock Level', 'Unit Price', 'Total Value'],
    rows: [['Processor A', 'CPU-001', '15', '45000', '675000'], ['SSD 1TB', 'STO-512', '42', '12500', '525000']]
  },
  udhar: {
    headers: ['Date', 'Customer Name', 'Amount (Rs)', 'Status', 'Due Date'],
    rows: [['2024-03-15', 'Hammad Ali', '1500', 'Unpaid', '2024-03-30'], ['2024-03-18', 'Usman Tech', '8500', 'Partial', '2024-04-05']]
  },
  sales: {
    headers: ['Date', 'Item Sold', 'Quantity', 'Price Per Unit', 'Total Sale'],
    rows: [['2024-03-20', 'Keyboard Mech', '2', '3500', '7000'], ['2024-03-20', 'Mouse Gaming', '5', '1200', '6000']]
  },
  invoice: {
    headers: ['Description', 'Qty', 'Unit Price', 'Discount %', 'Final Amount'],
    rows: [['UI/UX Design Phase 1', '1', '15000', '0', '15000'], ['Technical Consultation', '4', '2500', '10', '9000']]
  }
};

export default function WpsSheetsPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('Untitled Spreadsheet');
  const [headers, setHeaders] = useState<string[]>(['Column 1', 'Column 2', 'Column 3', 'Column 4']);
  const [rows, setRows] = useState<string[][]>([['', '', '', ''], ['', '', '', ''], ['', '', '', '']]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic ---
  const addRow = () => setRows(prev => [...prev, new Array(headers.length).fill('')]);
  const deleteRow = (idx: number) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const addCol = () => {
    setHeaders(prev => [...prev, `Column ${prev.length + 1}`]);
    setRows(prev => prev.map(row => [...row, '']));
  };

  const deleteCol = (idx: number) => {
    if (headers.length <= 1) return;
    setHeaders(prev => prev.filter((_, i) => i !== idx));
    setRows(prev => prev.map(row => row.filter((_, i) => i !== idx)));
  };

  const handleHeaderChange = (idx: number, val: string) => {
    const next = [...headers];
    next[idx] = val;
    setHeaders(next);
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const next = [...rows];
    next[rIdx][cIdx] = val;
    setRows(next);
  };

  const loadTemplate = (id: keyof typeof TEMPLATES) => {
    const t = TEMPLATES[id];
    setHeaders([...t.headers]);
    setRows(t.rows.map(r => [...r]));
    setTitle(id.charAt(0).toUpperCase() + id.slice(1) + ' Sheet');
    toast({ title: "Template Active", description: `${id.toUpperCase()} protocol initialized.` });
  };

  const handleClear = () => {
    setRows([['', '', '', '']]);
    setHeaders(['Column 1', 'Column 2', 'Column 3', 'Column 4']);
    toast({ title: "Sheet Cleared" });
  };

  const handleExportCsv = () => {
    setIsProcessing(true);
    // Escape commas and quotes for CSV stability
    const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    
    const csvContent = [
      headers.map(escape).join(','),
      ...rows.map(r => r.map(escape).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    setIsProcessing(false);
    toast({ title: "Master Exported", description: "CSV file ready for WPS / Excel." });
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      
      if (lines.length > 0) {
        // Basic CSV Parser
        const parseLine = (line: string) => {
          const result = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
              result.push(cur.trim());
              cur = '';
            } else {
              cur += char;
            }
          }
          result.push(cur.trim());
          return result.map(v => v.startsWith('"') && v.endsWith('"') ? v.slice(1, -1).replace(/""/g, '"') : v);
        };

        const parsedHeaders = parseLine(lines[0]);
        const parsedRows = lines.slice(1).map(parseLine);
        
        setHeaders(parsedHeaders);
        setRows(parsedRows);
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        toast({ title: "Import Success", description: "Matrix reconstructed from CSV payload." });
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <TableIcon className="w-3.5 h-3.5" /> Fiscal Utility
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
              WPS Sheets <span className="text-primary italic">Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              High-performance browser-side spreadsheet production. Create technical tables, manage inventories, and export production-ready CSV masters locally.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="wps-sheets" />
             <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
          </div>
        </div>
      </div>

      {/* Templates Bar */}
      <div className="mb-10 p-2 rounded-3xl bg-secondary/50 border border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
         {Object.keys(TEMPLATES).map((t) => (
            <button
              key={t}
              onClick={() => loadTemplate(t as keyof typeof TEMPLATES)}
              className="px-6 py-3 rounded-2xl bg-background border border-border text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap"
            >
               {t.replace(/([A-Z])/g, ' $1')} Protocol
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-10 items-start">
        {/* Editor Card */}
        <Card className="glass-card border-border shadow-2xl overflow-hidden relative group flex flex-col min-h-[600px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <CardHeader className="pb-6 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
             <div className="flex-1 max-w-md">
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="h-12 bg-transparent border-none text-xl font-headline font-black uppercase tracking-tight focus-visible:ring-0 p-0"
                />
                <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Active Matrix Identifier</p>
             </div>

             <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-background border border-border p-1 rounded-xl">
                   <button onClick={addCol} className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase hover:bg-secondary transition-all flex items-center gap-2">
                      <Plus className="w-3 h-3" /> Column
                   </button>
                   <button onClick={addRow} className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase hover:bg-secondary transition-all flex items-center gap-2">
                      <Plus className="w-3 h-3" /> Row
                   </button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-4 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest"
                >
                   <Upload className="w-3.5 h-3.5 mr-2" /> Import .csv
                </Button>
                <input type="file" ref={fileInputRef} accept=".csv" onChange={handleImportCsv} className="hidden" />
                <Button onClick={handleExportCsv} className="h-9 px-6 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg">
                   <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
                </Button>
             </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
             <div className="flex-1 overflow-auto custom-scrollbar bg-black/5 dark:bg-black/20">
                <table className="w-full border-collapse text-left min-w-[800px]">
                   <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                         <th className="w-12 p-4 text-center border-r border-border bg-black/5">
                            <Settings2 className="w-3.5 h-3.5 text-foreground/20 mx-auto" />
                         </th>
                         {headers.map((h, i) => (
                           <th key={i} className="p-0 border-r border-border relative group/th">
                              <input 
                                value={h}
                                onChange={e => handleHeaderChange(i, e.target.value)}
                                className="w-full h-full bg-transparent p-4 text-[10px] font-black uppercase tracking-[0.1em] text-primary focus:bg-white/5 outline-none"
                              />
                              <button 
                                onClick={() => deleteCol(i)}
                                className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover/th:opacity-100 transition-opacity text-foreground/20 hover:text-destructive"
                              >
                                 <X className="w-3 h-3" />
                              </button>
                           </th>
                         ))}
                      </tr>
                   </thead>
                   <tbody>
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-border hover:bg-primary/[0.02] transition-colors group/tr">
                           <td className="w-12 p-2 text-center border-r border-border bg-black/5 text-[8px] font-mono text-foreground/20 relative">
                              {rIdx + 1}
                              <button 
                                onClick={() => deleteRow(rIdx)}
                                className="absolute inset-0 bg-destructive text-white opacity-0 group-hover/tr:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                 <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </td>
                           {row.map((cell, cIdx) => (
                             <td key={cIdx} className="p-0 border-r border-border h-12">
                                <input 
                                  value={cell}
                                  onChange={e => handleCellChange(rIdx, cIdx, e.target.value)}
                                  className="w-full h-full bg-transparent px-4 py-3 text-xs font-medium text-foreground focus:bg-primary/5 outline-none transition-all"
                                />
                             </td>
                           ))}
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             
             {/* Bottom Quick Controls */}
             <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">{rows.length} Rows</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">{headers.length} Columns</span>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em] hidden sm:block">Hardware Pulse Status: Stable</p>
                   <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                      <Plus className="w-3 h-3" /> Insert Row
                   </button>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
              <ShieldCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Processing occurs strictly in local memory. Spreadsheet payloads never touch remote servers.</p>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
              <FileDown className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">WPS Verified</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">CSV masters are encoded with standard delimiters for clinical compatibility with WPS Office.</p>
              </div>
           </div>
           <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
              <Zap className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Instant Matrix</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Linguistic templates allow for rapid data entry without structural setup latency.</p>
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
