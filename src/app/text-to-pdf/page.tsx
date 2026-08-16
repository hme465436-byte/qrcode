"use client"

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Type, 
  Download, 
  Trash2, 
  Upload, 
  Settings2, 
  Maximize2, 
  Zap, 
  Info, 
  CheckCircle2, 
  AlignLeft, 
  Layout,
  FileCode,
  Sparkles,
  Loader2,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

export default function TextToPdfPage() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(40);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
        toast({ title: "Matrix Injected", description: "Text file loaded into studio." });
      };
      reader.readAsText(file);
    }
  };

  const generatePdf = async () => {
    if (!text.trim()) {
      toast({ variant: "destructive", title: "Empty Payload", description: "Please enter some text to synthesize." });
      return;
    }

    setIsProcessing(true);

    try {
      // Small delay to allow UI feedback
      await new Promise(r => setTimeout(r, 500));

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: pageSize
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxLineWidth = pageWidth - (margin * 2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);

      let currentY = margin;

      // Add Title if exists
      if (title.trim()) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize + 4);
        const splitTitle = doc.splitTextToSize(title.toUpperCase(), maxLineWidth);
        doc.text(splitTitle, margin, currentY + (fontSize * 0.8));
        currentY += (splitTitle.length * (fontSize + 10)) + 20;
        
        // Horizontal divider
        doc.setDrawColor(200);
        doc.setLineWidth(1);
        doc.line(margin, currentY - 10, pageWidth - margin, currentY - 10);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
      }

      // Process Body Text - handle newlines specifically for preserve formatting
      const paragraphs = text.split(/\n/);
      
      paragraphs.forEach((para) => {
        const lines = doc.splitTextToSize(para || " ", maxLineWidth);
        
        lines.forEach((line: string) => {
          if (currentY + fontSize > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(line, margin, currentY + (fontSize * 0.8));
          currentY += fontSize + 4;
        });
        
        // Small extra gap after paragraphs
        currentY += fontSize * 0.5;
      });

      doc.save(`text-master-${Date.now()}.pdf`);
      toast({ title: "Synthesis Complete", description: "PDF document generated locally." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Production Failed", description: "Error during document re-synthesis." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setText('');
    setTitle('');
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <FileText className="w-3.5 h-3.5" /> Linguistic Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Text to <span className="text-primary italic">PDF Master</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Professional document synthesis. Convert raw text, notes, or code blocks into sanitized, high-resolution PDF documents entirely in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Editor Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <AlignLeft className="w-6 h-6" />
                </div>
                Linguistic Payload
              </CardTitle>
              <div className="flex items-center gap-3">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => fileInputRef.current?.click()}
                   className="h-9 px-4 rounded-xl border-border bg-background hover:bg-secondary text-[9px] font-black uppercase tracking-widest"
                 >
                   <Upload className="w-3.5 h-3.5 mr-2" /> Upload .txt
                 </Button>
                 <input type="file" ref={fileInputRef} accept=".txt" onChange={handleFileUpload} className="hidden" />
              </div>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Document Title (Optional)</Label>
                <Input 
                  placeholder="Enter a heading..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold focus:ring-primary/40 px-6 uppercase"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Body Content</Label>
                  <span className="text-[9px] font-mono text-primary/60">{text.length.toLocaleString()} characters</span>
                </div>
                <Textarea 
                  placeholder="Paste or type your content matrix here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[400px] bg-secondary border-border text-lg rounded-[2rem] focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none transition-all hover:bg-secondary/80 focus:bg-secondary/80 custom-scrollbar"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  onClick={generatePdf}
                  disabled={isProcessing || !text.trim()}
                  className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Synthesize PDF Master
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
        </div>

        {/* Settings Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-xl overflow-hidden relative group">
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 text-primary">
                <Settings2 className="w-4 h-4" /> Layout Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Page Architecture</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'a4', label: 'A4 Standard', desc: 'ISO 210x297mm' },
                    { id: 'letter', label: 'US Letter', desc: 'ANSI 8.5x11in' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPageSize(p.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border transition-all",
                        pageSize === p.id ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-background border-border text-foreground/40"
                      )}
                    >
                      <Layout className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                      <span className="text-[8px] font-medium opacity-60 uppercase">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                       <Label className="flex items-center gap-2"><Type className="w-3.5 h-3.5" /> Character Scale</Label>
                       <span className="text-primary font-mono">{fontSize}pt</span>
                    </div>
                    <Slider value={[fontSize]} min={8} max={32} step={1} onValueChange={(v) => setFontSize(v[0])} />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                       <Label className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5" /> Canvas Margin</Label>
                       <span className="text-primary font-mono">{margin}pt</span>
                    </div>
                    <Slider value={[margin]} min={10} max={100} step={1} onValueChange={(v) => setMargin(v[0])} />
                 </div>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-secondary border border-border space-y-4">
                 <div className="flex items-center gap-3 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</h4>
                 </div>
                 <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">
                   Documents are re-synthesized using the high-performance HELVETICA matrix for universal document compatibility.
                 </p>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
                <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                    All document synthesis occurs entirely on your device via WebAssembly. Your textual payloads never leave your browser sandbox, ensuring 100% data sovereignty.
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
