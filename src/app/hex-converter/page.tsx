
"use client"

import React, { useState, useRef } from 'react';
import { 
  FileCode, 
  Upload, 
  Copy, 
  Trash2, 
  Sparkles, 
  Info,
  CheckCircle2,
  FileDigit,
  Settings2,
  AlertTriangle,
  Download,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function HexConverterPage() {
  const { toast } = useToast();
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [output, setOutput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Options
  const [useCLike, setUseCLike] = useState(false);
  const [useNewlines, setUseNewlines] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ 
          variant: "destructive", 
          title: "File Too Large", 
          description: "For browser stability, we recommend files under 1MB." 
        });
      }
      setFileInfo({ name: file.name, size: file.size });
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileBuffer(event.target?.result as ArrayBuffer);
        toast({ title: "File Loaded", description: "Ready for hex conversion." });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const convertToHex = () => {
    if (!fileBuffer) {
      toast({ variant: "destructive", title: "No File", description: "Please select a file first." });
      return;
    }

    setIsProcessing(true);
    
    // Use setTimeout to allow UI to show processing state if the file is large
    setTimeout(() => {
      const bytes = new Uint8Array(fileBuffer);
      let result = [];
      
      for (let i = 0; i < bytes.length; i++) {
        let hex = bytes[i].toString(16).padStart(2, '0').toUpperCase();
        
        if (useCLike) {
          hex = `0x${hex}`;
        }
        
        result.push(hex);

        // Add separator (comma or space)
        if (i < bytes.length - 1) {
          if (useCLike) {
            result.push(', ');
          } else {
            result.push(' ');
          }
        }

        // Handle newlines every 16 bytes
        if (useNewlines && (i + 1) % 16 === 0 && i < bytes.length - 1) {
          result.push('\n');
        }
      }

      setOutput(result.join(''));
      setIsProcessing(false);
      toast({ title: "Conversion Complete", description: "Binary matrix translated to hex." });
    }, 100);
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Hex data saved to clipboard." });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setFileInfo(null);
    setFileBuffer(null);
    setOutput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Cleared", description: "Studio reset." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileCode className="w-3.5 h-3.5" /> Dev Intelligence
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          File to <span className="text-primary italic">Hex Converter</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional binary analysis utility. Convert any local file into a formatted hexadecimal matrix instantly without server-side processing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Input Controls */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                Binary Source
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              {/* File Upload Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Source File</Label>
                  {fileInfo && (
                    <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
                      {(fileInfo.size / 1024).toFixed(2)} KB Detected
                    </div>
                  )}
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-48 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    fileInfo && "border-solid border-primary/40"
                  )}
                >
                  {fileInfo ? (
                    <div className="text-center p-6 space-y-2">
                       <FileDigit className="w-10 h-10 text-primary mx-auto mb-2" />
                       <p className="text-xs font-black uppercase text-foreground truncate max-w-[200px]">{fileInfo.name}</p>
                       <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors">No file chosen or drop file here</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
                
                {fileInfo && fileInfo.size > 1024 * 1024 && (
                   <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-yellow-500/70 font-bold leading-relaxed uppercase tracking-wider">
                        Warning: Large files (&gt;1MB) may cause temporary browser performance degradation during conversion.
                      </p>
                   </div>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="space-y-6 pt-2">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Conversion Protocol</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-2xl bg-secondary border border-border">
                    <Checkbox id="c-like" checked={useCLike} onCheckedChange={(v) => setUseCLike(v as boolean)} />
                    <Label htmlFor="c-like" className="text-[10px] font-black uppercase tracking-widest text-foreground/60 cursor-pointer select-none">C-Style (0x, 0x...)</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-2xl bg-secondary border border-border">
                    <Checkbox id="newlines" checked={useNewlines} onCheckedChange={(v) => setUseNewlines(v as boolean)} />
                    <Label htmlFor="newlines" className="text-[10px] font-black uppercase tracking-widest text-foreground/60 cursor-pointer select-none">Newlines (16 bytes)</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={convertToHex}
                  disabled={!fileBuffer || isProcessing}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Sparkles className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Process Binary
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="w-16 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border shadow-xl overflow-hidden group">
            <CardHeader className="py-6 border-b border-border bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <Info className="w-4 h-4" /> Studio Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-medium text-foreground/50 uppercase tracking-wider leading-relaxed">
                <div className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all">
                  <span className="text-foreground font-black block mb-1">Standard Mode</span>
                  Space-separated hexadecimal pairs (e.g. 4A 6F 01).
                </div>
                <div className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all">
                  <span className="text-foreground font-black block mb-1">C-Style Mode</span>
                  Prefixed with 0x and comma-separated for source code integration.
                </div>
                <div className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all">
                  <span className="text-foreground font-black block mb-1">Row Alignment</span>
                  Optional line breaks every 16 bytes for standard memory visualization.
                </div>
                <div className="p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all">
                  <span className="text-foreground font-black block mb-1">Privacy Guarantee</span>
                  Zero server transmission. Entirely processed within browser memory.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Hexadecimal Result
                </CardTitle>
                {output && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                    {output.length.toLocaleString()} Chars
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="relative group/output">
                <Textarea 
                  readOnly
                  value={output}
                  placeholder="Output will appear here..."
                  className="w-full min-h-[440px] bg-white dark:bg-black/20 border-border text-foreground font-mono rounded-[2.5rem] p-8 text-sm leading-relaxed resize-none shadow-inner custom-scrollbar transition-all overflow-auto"
                />
                {!output && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <FileDigit className="w-20 h-20 text-primary mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Standby</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleCopy}
                  disabled={!output}
                  className={cn(
                    "h-16 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-xl shadow-lg transition-all active:scale-95",
                    output ? "text-primary border-primary/20" : "opacity-50"
                  )}
                >
                  {isCopied ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary" />}
                  {isCopied ? 'Copied' : 'Copy All Hex'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([output], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `hex-${fileInfo?.name || 'dump'}.txt`;
                    a.click();
                  }}
                  disabled={!output}
                  className="h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/50 font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Save .txt
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-secondary border border-border flex items-start gap-4">
                 <Settings2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Master Production</p>
                    <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">
                      Our engine automatically pads hex values to 2 digits and applies sanitized formatting based on active protocols.
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
