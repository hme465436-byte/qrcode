"use client"

import React, { useState, useRef } from 'react';
import { 
  Link as LinkIcon, 
  Upload, 
  Trash2, 
  Globe, 
  CheckCircle2, 
  Copy, 
  Loader2, 
  Info, 
  AlertCircle,
  Zap,
  Activity,
  FileImage,
  ExternalLink,
  Code2,
  FileCode,
  MessageSquare,
  ShieldCheck,
  ImageIcon,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { uploadToImgur } from './actions';

interface LinkMatrix {
  direct: string;
  view: string;
  markdown: string;
  html: string;
  bbcode: string;
}

export default function ImageToLinkPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [links, setLinks] = useState<LinkMatrix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit for anonymous uploads is 10MB." });
        return;
      }
      
      setFile(selectedFile);
      setLinks(null);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        toast({ title: "Asset Buffered", description: "Visual identity ready for transmission." });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const executeUpload = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setError(null);
    setLinks(null);

    try {
      const result = await uploadToImgur(image);
      
      if (result.success && result.data) {
        const d = result.data;
        const matrix: LinkMatrix = {
          direct: d.link,
          view: `https://imgur.com/${d.id}`,
          markdown: `![Identity](${d.link})`,
          html: `<img src="${d.link}" alt="Identity">`,
          bbcode: `[img]${d.link}[/img]`
        };
        setLinks(matrix);
        toast({ title: "Uplink Success", description: "Matrix synchronized with Imgur nodes." });
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setError(err.message || "Uplink restricted by remote host.");
      toast({ variant: "destructive", title: "Protocol Failure" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    toast({ title: "Copied", description: `${label} protocol saved.` });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleClear = () => {
    setImage(null);
    setFile(null);
    setLinks(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Web Suite Pro
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Image to <span className="text-primary italic">Link Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional-grade visual hosting. Upload imagery to the global Imgur node and synthesize a complete multi-format shareable link matrix instantly.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="image-to-link" />
              {(image || links) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Intake */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Upload className="w-5 h-5 text-primary" /> Inbound Matrix
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                  image && "border-solid border-primary/20",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
              >
                {image ? (
                  <div className="w-full h-full p-4 flex items-center justify-center relative">
                    <img src={image} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl group-hover/upload:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
                       <RefreshCcw className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all mx-auto shadow-xl">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                       <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover/upload:text-primary transition-colors">Select Visual Payload</span>
                       <p className="text-[8px] text-foreground/20 font-bold uppercase">JPG, PNG, GIF, WebP (Max 10MB)</p>
                    </div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              <Button 
                onClick={executeUpload} 
                disabled={isProcessing || !image}
                className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Zap className="w-6 h-6 mr-3" />}
                Execute Uplink
              </Button>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Identity hosting is anonymous. Your local visual matrix is transmitted via an encrypted tunnel and not stored on our infrastructure.
               </p>
             </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
                 {links && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                       Uplink Verified
                    </Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
                 {!links && !isProcessing && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-24">
                      <FileImage className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isProcessing && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-24">
                      <div className="relative">
                         <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Negotiating Cloud Matrix...</p>
                   </div>
                 )}

                 {links && (
                   <div className="space-y-8 animate-in zoom-in-95 duration-500">
                      {[
                        { label: 'Direct Link', val: links.direct, icon: LinkIcon },
                        { label: 'View Page', val: links.view, icon: ExternalLink },
                        { label: 'Markdown Code', val: links.markdown, icon: FileCode },
                        { label: 'HTML Snippet', val: links.html, icon: Code2 },
                        { label: 'BBCode Format', val: links.bbcode, icon: MessageSquare }
                      ].map((item) => (
                        <div key={item.label} className="space-y-2 group/row">
                           <div className="flex items-center justify-between px-1">
                              <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">{item.label}</Label>
                              {item.label === 'Direct Link' && (
                                <button onClick={() => window.open(item.val, '_blank')} className="text-[8px] font-black text-primary uppercase hover:underline">Verify Signal</button>
                              )}
                           </div>
                           <div className="flex gap-2">
                              <div className="flex-1 h-14 bg-secondary border border-border rounded-2xl flex items-center px-6 font-mono text-[11px] font-bold text-foreground overflow-hidden shadow-inner group-hover/row:border-primary/20 transition-colors">
                                 <span className="truncate">{item.val}</span>
                              </div>
                              <Button 
                                onClick={() => handleCopy(item.val, item.label)}
                                variant="outline"
                                className={cn(
                                  "h-14 w-14 rounded-2xl bg-secondary border-border shrink-0 transition-all",
                                  isCopied === item.label && "bg-primary text-white border-primary shadow-lg"
                                )}
                              >
                                 {isCopied === item.label ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                              </Button>
                           </div>
                        </div>
                      ))}

                      <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Master Protocol</p>
                            <p className="text-[11px] text-foreground/60 font-medium leading-relaxed uppercase">Links are permanent identifiers. Save these protocols for future deployment.</p>
                         </div>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
