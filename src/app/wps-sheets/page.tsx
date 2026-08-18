
"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Maximize2,
  Undo2,
  Search,
  SortAsc,
  DollarSign,
  Calculator,
  Calendar,
  Grid3X3,
  Copy,
  Hash,
  ChevronDown,
  Sigma
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Production Templates ---
const TEMPLATES = {
  attendance: {
    headers: ['Date', 'Participant Name', 'Status (P/A)', 'Notes'],
    rows: [['2024-03-20', 'Umar Farooq', 'Present', 'Lead'], ['2024-03-20', 'Jane Smith', 'Absent', 'On Leave']]
  },
  inventory: {
    headers: ['Item Name', 'SKU', 'Stock', 'Price', 'Value'],
    rows: [['Monitor 4K', 'HW-101', '10', '45000', '=SUM(C2*D2)'], ['Keyboard', 'HW-102', '50', '1200', '60000']]
  },
  salary: {
    headers: ['Employee', 'Basic', 'Bonus', 'Tax', 'Net Payable'],
    rows: [['Umar', '150000', '10000', '5000', '155000'], ['Ali', '80000', '5000', '2000', '83000']]
  },
  expense: {
    headers: ['Date', 'Category', 'Description', 'Amount'],
    rows: [['2024-03-01', 'Server', 'Hosting V7', '1500'], ['2024-03-05', 'Caffeine', 'Studio Coffee', '450']]
  },
  udhar: {
    headers: ['Customer', 'Amount (Rs)', 'Date', 'Status'],
    rows: [['Hammad Ali', '1500', '2024-03-15', 'Unpaid'], ['Usman Tech', '8500', '2024-03-18', 'Partial']]
  },
  student: {
    headers: ['Name', 'Math', 'Science', 'English', 'Total'],
    rows: [['Zain', '88', '92', '85', '=SUM(B2:D2)'], ['Sara', '95', '88', '90', '=SUM(B3:D3)']]
  }
};

const STORAGE_KEY = 'mykit_wps_sheets_persist';

export default function WpsSheetsAdvancedPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('New Spreadsheet');
  const [headers, setHeaders] = useState<string[]>(['A', 'B', 'C', 'D']);
  const [rows, setRows] = useState<string[][]>([['', '', '', ''], ['', '', '', ''], ['', '', '', '']]);
  const [history, setHistory] = useState<{ headers: string[], rows: string[][] }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTotals, setShowTotals] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Matrix ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTitle(parsed.title || 'Untitled');
        setHeaders(parsed.headers || ['A', 'B', 'C', 'D']);
        setRows(parsed.rows || [['', '', '', '']]);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const data = { title, headers, rows };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [title, headers, rows]);

  // --- Structural Logic ---
  const pushHistory = () => {
    setHistory(prev => [...prev.slice(-19), { headers: [...headers], rows: rows.map(r => [...r]) }]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHeaders(last.headers);
    setRows(last.rows);
    setHistory(prev => prev.slice(0, -1));
    toast({ title: "Undo Executed" });
  };

  const addRow = () => { pushHistory(); setRows(prev => [...prev, new Array(headers.length).fill('')]); };
  const addCol = () => { pushHistory(); setHeaders(prev => [...prev, String.fromCharCode(65 + prev.length)]); setRows(prev => prev.map(r => [...r, ''])); };
  
  const deleteRow = (idx: number) => {
    if (rows.length <= 1) return;
    pushHistory();
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const duplicateRow = (idx: number) => {
    pushHistory();
    const newRows = [...rows];
    newRows.splice(idx + 1, 0, [...rows[idx]]);
    setRows(newRows);
  };

  const deleteCol = (idx: number) => {
    if (headers.length <= 1) return;
    pushHistory();
    setHeaders(prev => prev.filter((_, i) => i !== idx));
    setRows(prev => prev.map(r => r.filter((_, i) => i !== idx)));
  };

  // --- Formula Engine ---
  const getCellValue = (coord: string, currentRows: string[][]) => {
    const colMatch = coord.match(/[A-Z]+/);
    const rowMatch = coord.match(/\d+/);
    if (!colMatch || !rowMatch) return 0;
    
    const col = colMatch[0].charCodeAt(0) - 65;
    const row = parseInt(rowMatch[0]) - 1;
    
    if (currentRows[row] && currentRows[row][col] !== undefined) {
      const val = parseFloat(currentRows[row][col]);
      return isNaN(val) ? 0 : val;
    }
    return 0;
  };

  const evaluateFormula = (cellVal: string, currentRows: string[][]) => {
    if (!cellVal.startsWith('=')) return cellVal;
    
    const formula = cellVal.substring(1).toUpperCase();
    
    try {
      // 1. Basic SUM(A1:A5)
      if (formula.startsWith('SUM(')) {
        const range = formula.match(/\((.*?)\)/)?.[1];
        if (!range) return '#ERR';
        if (range.includes(':')) {
          const [start, end] = range.split(':');
          const startCol = start.match(/[A-Z]+/)?.[0].charCodeAt(0) - 65;
          const startRow = parseInt(start.match(/\d+/)?.[0] || '1') - 1;
          const endCol = end.match(/[A-Z]+/)?.[0].charCodeAt(0) - 65;
          const endRow = parseInt(end.match(/\d+/)?.[0] || '1') - 1;
          
          let sum = 0;
          for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
            for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
              const val = parseFloat(currentRows[r]?.[c] || '0');
              if (!isNaN(val)) sum += val;
            }
          }
          return sum.toString();
        }
      }
      
      // 2. Direct Reference A1 + B2
      const resolved = formula.replace(/[A-Z]+\d+/g, (match) => {
        return getCellValue(match, currentRows).toString();
      });
      
      // Safety check for eval
      if (/^[0-9+\-*/().\s]+$/.test(resolved)) {
        return eval(resolved).toString();
      }
    } catch (e) {
      return '#REF!';
    }
    
    return cellVal;
  };

  // --- Sorting ---
  const sortColumn = (idx: number) => {
    pushHistory();
    const sorted = [...rows].sort((a, b) => {
      const valA = a[idx];
      const valB = b[idx];
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return valA.localeCompare(valB);
    });
    setRows(sorted);
    toast({ title: "Column Sorted" });
  };

  // --- Export/Import ---
  const handleExportCsv = () => {
    setIsProcessing(true);
    const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
    const content = [
      headers.map(escape).join(','),
      ...rows.map(r => r.map(c => escape(evaluateFormula(c, rows))).join(','))
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
    setIsProcessing(false);
    toast({ title: "WPS Master Exported" });
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const parseLine = (l: string) => l.split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
        setHeaders(parseLine(lines[0]));
        setRows(lines.slice(1).map(parseLine));
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsText(file);
  };

  // --- Totals Calc ---
  const columnTotals = useMemo(() => {
    return headers.map((_, cIdx) => {
      let sum = 0;
      let count = 0;
      rows.forEach(row => {
        const val = parseFloat(evaluateFormula(row[cIdx], rows));
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      return count > 0 ? sum : null;
    });
  }, [rows, headers]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full overflow-hidden">
      <div className="mb-8 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <TableIcon className="w-3.5 h-3.5" /> Fiscal Engine V7.2
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
            WPS Sheets <span className="text-primary italic">Studio Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="wps-sheets" />
           <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest">
              <Undo2 className="w-3.5 h-3.5 mr-2" /> Undo
           </Button>
           <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      {/* Templates Row */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
         {Object.keys(TEMPLATES).map((t) => (
            <button key={t} onClick={() => loadTemplate(t as any)} className="px-5 py-2.5 rounded-xl bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap">
               {t} Matrix
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[650px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          {/* Advanced Toolbar */}
          <CardHeader className="pb-4 border-b border-border bg-secondary/30 flex flex-col gap-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1 max-w-md group/title">
                   <Input value={title} onChange={e => setTitle(e.target.value)} className="h-10 bg-transparent border-none text-xl font-headline font-black uppercase tracking-tight focus-visible:ring-0 p-0" />
                   <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Master Identifier</p>
                </div>

                <div className="flex items-center gap-3">
                   <div className="relative group/search">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within/search:text-primary" />
                      <Input placeholder="Search matrix..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-10 pl-9 w-40 sm:w-64 bg-background/50 border-border rounded-xl text-xs font-bold" />
                   </div>
                   <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border">
                      <Sigma className="w-3 h-3 text-primary" />
                      <span className="text-[8px] font-black uppercase text-foreground/40">Auto Totals</span>
                      <Switch checked={showTotals} onCheckedChange={setShowTotals} className="scale-75" />
                   </div>
                </div>
             </div>

             <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-background border border-border p-1 rounded-xl">
                   <Button variant="ghost" size="sm" onClick={addRow} className="h-8 px-3 text-[8px] font-black uppercase"><Plus className="w-3 h-3 mr-1" /> Row</Button>
                   <Button variant="ghost" size="sm" onClick={addCol} className="h-8 px-3 text-[8px] font-black uppercase"><Plus className="w-3 h-3 mr-1" /> Col</Button>
                </div>
                <div className="w-[1px] h-6 bg-border mx-1" />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-9 px-4 rounded-xl border-border bg-background text-[9px] font-black uppercase"><Upload className="w-3.5 h-3.5 mr-2" /> Import</Button>
                <input type="file" ref={fileInputRef} accept=".csv" onChange={handleImportCsv} className="hidden" />
                <Button onClick={handleExportCsv} className="h-9 px-6 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg"><Download className="w-3.5 h-3.5 mr-2" /> Export CSV</Button>
             </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
             <div className="flex-1 overflow-auto custom-scrollbar bg-black/5 dark:bg-black/20 relative">
                <table className="w-full border-collapse text-left min-w-full table-fixed">
                   <thead className="sticky top-0 z-30 shadow-sm">
                      <tr className="bg-secondary/90 backdrop-blur-xl border-b border-border">
                         <th className="w-12 p-2 text-center border-r border-border bg-secondary font-black text-[8px] text-foreground/20">#</th>
                         {headers.map((h, i) => (
                           <th key={i} className="p-0 border-r border-border group/th min-w-[120px]">
                              <div className="flex items-center">
                                 <input 
                                   value={h}
                                   onChange={e => handleHeaderChange(i, e.target.value)}
                                   className="w-full bg-transparent p-4 text-[10px] font-black uppercase tracking-widest text-primary outline-none"
                                 />
                                 <div className="flex items-center pr-2 opacity-0 group-hover/th:opacity-100 transition-opacity">
                                    <button onClick={() => sortColumn(i)} className="p-1.5 hover:text-primary"><SortAsc className="w-3 h-3" /></button>
                                    <button onClick={() => deleteCol(i)} className="p-1.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                                 </div>
                              </div>
                           </th>
                         ))}
                      </tr>
                   </thead>
                   <tbody>
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-border hover:bg-primary/[0.02] transition-colors group/tr h-12">
                           <td className="w-12 p-2 text-center border-r border-border bg-secondary/20 text-[8px] font-mono text-foreground/20 relative">
                              {rIdx + 1}
                              <div className="absolute inset-0 bg-destructive/10 opacity-0 group-hover/tr:opacity-100 flex items-center justify-center transition-opacity">
                                 <button onClick={() => deleteRow(rIdx)} className="p-2 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                           </td>
                           {row.map((cell, cIdx) => {
                             const isFormula = cell.startsWith('=');
                             const displayValue = isFormula ? evaluateFormula(cell, rows) : cell;
                             const isHighlighted = searchQuery && displayValue.toLowerCase().includes(searchQuery.toLowerCase());
                             
                             return (
                               <td key={cIdx} className={cn("p-0 border-r border-border h-full relative", isHighlighted && "bg-primary/10")}>
                                  <input 
                                    value={cell}
                                    onChange={e => handleCellChange(rIdx, cIdx, e.target.value)}
                                    className={cn(
                                      "w-full h-full bg-transparent px-4 py-3 text-xs font-medium text-foreground outline-none transition-all focus:bg-white/5",
                                      isFormula && "text-primary/80 font-bold"
                                    )}
                                    title={isFormula ? `Formula: ${cell}` : ''}
                                  />
                                  {isFormula && (
                                     <div className="absolute top-0 right-1 pointer-events-none">
                                        <div className="w-0 h-0 border-t-[6px] border-t-primary/40 border-l-[6px] border-l-transparent" />
                                     </div>
                                  )}
                               </td>
                             );
                           })}
                        </tr>
                      ))}

                      {/* Totals Row */}
                      {showTotals && (
                        <tr className="bg-primary/[0.03] font-black border-t-2 border-primary/20 sticky bottom-0 z-20 backdrop-blur-md">
                           <td className="w-12 p-4 text-center border-r border-border text-[8px] uppercase tracking-widest text-primary">SUM</td>
                           {columnTotals.map((tot, i) => (
                             <td key={i} className="px-4 py-3 border-r border-border text-xs font-headline font-black text-primary">
                                {tot !== null ? `Rs. ${tot.toLocaleString()}` : ''}
                             </td>
                           ))}
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
              <ShieldCheck className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-6 h-6" />
              </div >
              <div className="space-y-2">
                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">100% local synthesis. Spreadsheet payloads are held strictly in browser memory and never transmitted.</p>
              </div>
           </div>
           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
              <Calculator className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                 <Calculator className="w-6 h-6" />
              </div >
              <div className="space-y-2">
                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Formula Intelligence</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Supports standard arithmetic and range operators including =SUM(A1:A5) for clinical data modeling.</p>
              </div>
           </div>
           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
              <Zap className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                 <Zap className="w-6 h-6" />
              </div >
              <div className="space-y-2">
                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Instant Matrix</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">High-performance grid rendering ensures zero-latency interaction even with large data structures.</p>
              </div>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
    