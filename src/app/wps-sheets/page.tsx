
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
  Sigma,
  Eraser,
  Split,
  FileSearch,
  AlertCircle,
  Loader2,
  Check,
  History
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
import * as XLSX from 'xlsx';

// --- Production Templates ---
const TEMPLATES = {
  attendance: {
    headers: ['Date', 'Participant Name', 'Status (P/A)', 'Notes'],
    rows: [['2024-03-20', 'Umar Farooq', 'Present', 'Lead'], ['2024-03-20', 'Jane Smith', 'Absent', 'On Leave']]
  },
  inventory: {
    headers: ['Item Name', 'SKU', 'Stock', 'Price', 'Value'],
    rows: [['Monitor 4K', 'HW-101', '10', '45000', '=C2*D2'], ['Keyboard', 'HW-102', '50', '1200', '=C3*D3']]
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
  
  // Clean & Arrange State
  const [showCleaningLab, setShowCleaningLab] = useState(false);
  const [rawUploadData, setRawUploadData] = useState<string[][]>([]);
  const [cleanedResult, setCleanedResult] = useState<{ headers: string[], rows: string[][] } | null>(null);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cleanupInputRef = useRef<HTMLInputElement>(null);

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

  const handleHeaderChange = (index: number, val: string) => {
    pushHistory();
    const next = [...headers];
    next[index] = val;
    setHeaders(next);
  };

  const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
    pushHistory();
    const nextRows = rows.map((row, rIdx) => 
      rIdx === rowIdx ? row.map((cell, cIdx) => cIdx === colIdx ? val : cell) : [...row]
    );
    setRows(nextRows);
  };

  const loadTemplate = (id: keyof typeof TEMPLATES) => {
    pushHistory();
    const t = TEMPLATES[id];
    setHeaders([...t.headers]);
    setRows(t.rows.map(r => [...r]));
    setTitle(`${id.charAt(0).toUpperCase() + id.slice(1)} Matrix`);
    toast({ title: "Template Active", description: `${id.toUpperCase()} protocol loaded.` });
  };

  const handleClear = () => {
    setHeaders(['A', 'B', 'C', 'D']);
    setRows([['', '', '', ''], ['', '', '', ''], ['', '', '', '']]);
    setTitle('New Spreadsheet');
    setHistory([]);
    toast({ title: "Studio Reset", description: "All parameters cleared." });
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        if (json.length > 0) {
          pushHistory();
          setHeaders(json[0].map((h, i) => (h || `Col ${i + 1}`).toString()));
          setRows(json.slice(1).map(row => row.map(cell => (cell ?? "").toString())));
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
          toast({ title: "Import Success", description: "Document matrix synchronized." });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Import Failed", description: "Malformed file structure." });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
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
    if (!cellVal || typeof cellVal !== 'string' || !cellVal.startsWith('=')) return cellVal;
    
    const formula = cellVal.substring(1).toUpperCase();
    
    try {
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
      
      // Basic math operations
      const resolved = formula.replace(/[A-Z]+\d+/g, (match) => {
        return getCellValue(match, currentRows).toString();
      });
      
      if (/^[0-9+\-*/().\s]+$/.test(resolved)) {
        // Safe evaluation of simple math
        return Function(`"use strict"; return (${resolved})`)().toString();
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

  // --- Clean & Arrange Logic ---
  const handleCleanupUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        setRawUploadData(json);
        setShowCleaningLab(true);
        executeClean(json);
      } catch (err) {
        toast({ variant: "destructive", title: "Read Error", description: "Failed to parse document matrix." });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const executeClean = (data: string[][]) => {
    setIsProcessing(true);
    
    // 1. Remove entirely empty rows
    let workingRows = data.filter(row => row.some(cell => cell && cell.toString().trim() !== ""));
    
    // 2. Detect Header (Row with max non-empty cells in first 3 rows)
    let headerIdx = 0;
    let maxFilled = -1;
    for (let i = 0; i < Math.min(3, workingRows.length); i++) {
      const filled = workingRows[i].filter(c => c).length;
      if (filled > maxFilled) {
        maxFilled = filled;
        headerIdx = i;
      }
    }
    
    const headersRaw = workingRows[headerIdx] || [];
    workingRows = workingRows.slice(headerIdx + 1);

    // 3. Trim and Clean values
    let processed = workingRows.map(row => {
      return row.map(cell => {
        let val = (cell || "").toString().trim();
        
        // Fix Phone Numbers: if mostly digits, keep only digits
        if (val.length > 5 && (val.match(/\d/g)?.length || 0) > val.length * 0.7) {
          val = val.replace(/[^0-9+]/g, '');
        }

        return val;
      });
    });

    // 4. Remove empty columns
    const colsToKeep: number[] = [];
    headersRaw.forEach((_, cIdx) => {
      const hasData = processed.some(row => row[cIdx] && row[cIdx] !== "");
      if (hasData || headersRaw[cIdx]) colsToKeep.push(cIdx);
    });

    const finalHeaders = colsToKeep.map(i => headersRaw[i] || `Column_${i + 1}`);
    let finalRows = processed.map(row => colsToKeep.map(i => row[i] || ""));

    // 5. Duplicate Removal
    if (removeDuplicates) {
      const seen = new Set();
      finalRows = finalRows.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // 6. Initial Sort (First Column)
    finalRows.sort((a, b) => (a[0] || "").localeCompare(b[0] || ""));

    setCleanedResult({ headers: finalHeaders, rows: finalRows });
    setIsProcessing(false);
  };

  const applyCleanedData = () => {
    if (!cleanedResult) return;
    pushHistory();
    setHeaders(cleanedResult.headers);
    setRows(cleanedResult.rows);
    setShowCleaningLab(false);
    toast({ title: "Matrix Synchronized", description: "Cleaned data injected into workspace." });
  };

  const downloadXlsx = () => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows.map(r => r.map(c => evaluateFormula(c, rows)))]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StudioMaster");
    XLSX.writeFile(wb, `${title}.xlsx`);
    toast({ title: "Excel Master Exported" });
  };

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

      {/* Templates & Core Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
          {Object.keys(TEMPLATES).map((t) => (
              <button key={t} onClick={() => loadTemplate(t as any)} className="px-5 py-2.5 rounded-xl bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap">
                {t} Matrix
              </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
           <Button 
            onClick={() => cleanupInputRef.current?.click()}
            className="h-11 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-500/20"
           >
              <Eraser className="w-4 h-4 mr-2" /> Clean & Arrange
           </Button>
           <input type="file" ref={cleanupInputRef} accept=".csv,.xlsx,.xls" onChange={handleCleanupUpload} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[650px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
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
                <div className="flex gap-2">
                   <Button onClick={handleExportCsv} variant="outline" className="h-9 px-4 border-border bg-background text-foreground font-black text-[9px] uppercase tracking-widest rounded-xl">CSV</Button>
                   <Button onClick={downloadXlsx} className="h-9 px-6 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">Download XLSX</Button>
                </div>
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
                             const isFormula = cell && typeof cell === 'string' && cell.startsWith('=');
                             const displayValue = isFormula ? evaluateFormula(cell, rows) : cell;
                             const isHighlighted = searchQuery && displayValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
                             
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
              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">100% local synthesis. Spreadsheet payloads are held strictly in browser memory and never transmitted.</p>
              </div>
           </div>
           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                 <Calculator className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Formula Intelligence</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Supports standard arithmetic and range operators including =SUM(A1:A5) for clinical data modeling.</p>
              </div>
           </div>
           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                 <Eraser className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest leading-none">Matrix Sanitization</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">Advanced Clean & Arrange protocol for re-structuring messy CSV/Excel datasets automatically.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Cleaning Lab Modal Overlay */}
      {showCleaningLab && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-hidden">
           <div className="w-full max-w-7xl h-full max-h-[90vh] bg-card rounded-[3rem] border border-white/10 shadow-2xl flex flex-col relative">
              <CardHeader className="py-8 px-10 border-b border-white/5 bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                       <Eraser className="w-7 h-7" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tighter">Cleaning Lab</h2>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Protocol Execution Matrix</p>
                    </div>
                 </div>
                 <button onClick={() => setShowCleaningLab(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </CardHeader>

              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                 {/* Parameter Controls - Left */}
                 <aside className="w-full lg:w-80 border-r border-white/5 p-8 space-y-10 bg-secondary/10 shrink-0">
                    <div className="space-y-6">
                       <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Sanitization Rules</Label>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 group hover:border-primary/20 transition-all">
                             <span className="text-[9px] font-black text-white/60 uppercase">Deduplicate</span>
                             <Switch checked={removeDuplicates} onCheckedChange={(v) => { setRemoveDuplicates(v); executeClean(rawUploadData); }} />
                          </div>
                          <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                             <div className="flex items-center gap-2 text-indigo-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase">Auto-Trim</span>
                             </div>
                             <p className="text-[8px] text-white/20 font-bold uppercase">Active: Removing padding</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                             <div className="flex items-center gap-2 text-indigo-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase">Null Filter</span>
                             </div>
                             <p className="text-[8px] text-white/20 font-bold uppercase">Active: Removing empty nodes</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-10 border-t border-white/5">
                       <Button onClick={applyCleanedData} className="w-full h-16 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30">
                          <Zap className="w-4 h-4 mr-2" /> Apply to Sheet
                       </Button>
                       <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" onClick={() => {
                            if (!cleanedResult) return;
                            const ws = XLSX.utils.aoa_to_sheet([cleanedResult.headers, ...cleanedResult.rows]);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "Sanitized");
                            XLSX.writeFile(wb, "cleaned_data.xlsx");
                          }} className="h-10 text-[8px] font-black uppercase border-white/10 bg-white/5">XLSX</Button>
                          <Button variant="outline" onClick={() => {
                            if (!cleanedResult) return;
                            const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
                            const content = [cleanedResult.headers.map(escape).join(','), ...cleanedResult.rows.map(r => r.map(escape).join(','))].join('\n');
                            const b = new Blob([content], { type: 'text/csv' });
                            const u = URL.createObjectURL(b);
                            const a = document.createElement('a'); a.href = u; a.download = "cleaned.csv"; a.click();
                          }} className="h-10 text-[8px] font-black uppercase border-white/10 bg-white/5">CSV</Button>
                       </div>
                    </div>
                 </aside>

                 {/* Comparison Matrix - Right */}
                 <div className="flex-1 p-10 overflow-hidden flex flex-col gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full">
                       {/* Before View */}
                       <div className="flex flex-col h-full space-y-4">
                          <div className="flex items-center justify-between px-2">
                             <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-3.5 h-3.5" /> Source Stream (Dirty)
                             </h4>
                             <span className="text-[8px] font-mono text-red-400">{rawUploadData.length} Rows</span>
                          </div>
                          <div className="flex-1 rounded-[2.5rem] bg-black/40 border border-white/5 overflow-auto custom-scrollbar p-6">
                             <table className="w-full border-collapse opacity-40">
                                <tbody>
                                   {rawUploadData.slice(0, 20).map((row, i) => (
                                     <tr key={i} className="border-b border-white/5 h-8">
                                        {row.slice(0, 4).map((c, j) => (
                                          <td key={j} className="text-[9px] font-mono text-white/40 px-2 truncate max-w-[100px]">{c}</td>
                                        ))}
                                     </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>

                       {/* After View */}
                       <div className="flex flex-col h-full space-y-4">
                          <div className="flex items-center justify-between px-2">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Optimized Matrix (Clean)
                             </h4>
                             <span className="text-[8px] font-mono text-green-500">{cleanedResult?.rows.length || 0} Rows Sanitized</span>
                          </div>
                          <div className="flex-1 rounded-[2.5rem] bg-black/40 border border-primary/20 overflow-auto custom-scrollbar p-6 shadow-2xl">
                             <table className="w-full border-collapse">
                                <thead className="border-b border-white/10">
                                   <tr>
                                      {cleanedResult?.headers.slice(0, 4).map((h, i) => (
                                        <th key={i} className="text-[9px] font-black text-primary uppercase tracking-tighter p-2">{h}</th>
                                      ))}
                                   </tr>
                                </thead>
                                <tbody>
                                   {cleanedResult?.rows.slice(0, 20).map((row, i) => (
                                     <tr key={i} className="border-b border-white/5 h-10 hover:bg-primary/5 transition-colors">
                                        {row.slice(0, 4).map((c, j) => (
                                          <td key={j} className="text-[10px] font-medium text-white/80 px-2 truncate max-w-[120px]">{c}</td>
                                        ))}
                                     </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
