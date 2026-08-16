"use client"

import React, { useState, useRef } from 'react';
import { 
  Unlock, 
  Lock, 
  Upload, 
  Download, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  FileText,
  Settings2,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PDFDocument } from 'pdf-lib';

export default function PdfUnlockPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({ 
          variant: "destructive", 
          title: "Invalid Protocol", 
          description: "Only PDF documents are supported for decryption." 
        });
        return;
      }
      setFile(selectedFile);
      setError(null);
      toast({ title: "Asset Imported", description: "Matrix ready for access negotiation." });
    }
  };

  const executeUnlock = async () => {
    if (!file) return;
    if (!password) {
      toast({ variant: "destructive", title: "Key Required", description: "Please enter the security password." });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the document with the provided password
      // This will throw if the password is incorrect
      const pdfDoc = await PDFDocument.load(arrayBuffer, { 
        password,
        ignoreEncryption: false 
      });

      // Saving the loaded document with pdf-lib results in an unencrypted version
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `unlocked_${file.name}`;
      link.click();
      
      toast({ 
        title: "Access Granted", 
        description: "Decrypted document exported to local storage." 
      });
      handleClear();
    } catch (err: any) {
      console.error(err);
      setError("Matrix Access Denied: Incorrect security key or unsupported encryption algorithm.");
      toast({ 
        variant: "destructive", 
        title: "Negotiation Failed", 
        description: "The provided password does not match the document header." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPassword('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Security buffer cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Unlock className="w-3.5 h-3.5" /> Security Suite
        </div>
        <h1 className="text-4xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tight">
          PDF <span className="text-primary italic">Unlock Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Remove security protocols and passwords from known PDF masters. Unlock protected documents and restore full access locally and privately within your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                Inbound Payload
              </CardTitle>
              {file && (
                <button onClick={handleClear} className="text-[10px] font-black uppercase text-foreground/30 hover:text-destructive transition-all">Clear</button>
              )}
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative h-48 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center bg-secondary/30 transition-all cursor-pointer overflow-hidden group/upload",
                  file && "border-solid border-primary/20",
                  isProcessing && "cursor-not-allowed opacity-80"
                )}
              >
                {file ? (
                  <div className="text-center p-6 space-y-2">
                     <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
                     <p className="text-xs font-black uppercase text-foreground truncate max-w-[280px]">{file.name}</p>
                     <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{formatSize(file.size)} encrypted</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/10 group-hover/upload:text-primary transition-all mb-4 shadow-xl">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest group-hover/upload:text-primary transition-colors">Import Protected PDF</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              </div>

              {file && (
                <div className="space-y-10 animate-in zoom-in duration-500">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Document Password</Label>
                      <div className="relative group/pass max-w-md mx-auto">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-16 bg-secondary border-border rounded-2xl text-center text-xl font-mono font-bold pr-14 focus:ring-primary/40"
                          placeholder="••••••••"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-center text-[9px] text-foreground/20 font-bold uppercase tracking-widest">Provide the existing password to neutralize encryption</p>
                   </div>

                   {error && (
                     <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-center gap-4 animate-in shake duration-500">
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                        <p className="text-[11px] font-bold text-destructive uppercase tracking-widest leading-relaxed">{error}</p>
                     </div>
                   )}

                   <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={executeUnlock}
                      disabled={isProcessing || !password}
                      className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Unlock className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                      Unlock Document
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleClear}
                      className="flex-1 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                    >
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-xl overflow-hidden relative group min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Handshake Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 flex flex-col items-center justify-center text-center p-8 space-y-10">
              {!file && !isProcessing && (
                <div className="opacity-10 group-hover:opacity-20 transition-all duration-700">
                  <Activity className="w-20 h-20 text-primary mb-4 mx-auto" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Studio Standby</p>
                </div>
              )}

              {isProcessing && (
                <div className="w-full space-y-8 animate-in fade-in duration-500">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <KeyRound className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2">
                     <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Negotiating Access...</p>
                     <p className="text-[9px] text-foreground/30 font-bold uppercase">Deconstructing Security Dictionary</p>
                  </div>
                </div>
              )}

              {file && !isProcessing && (
                <div className="space-y-8 w-full animate-in zoom-in duration-500">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl ring-4 ring-primary/5">
                    <Zap className="w-10 h-10" />
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Binary Key Required</h3>
                     <p className="text-[10px] text-foreground/40 font-medium leading-relaxed uppercase">Enter the known document password to initialize the removal protocol.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5 group hover:bg-primary/10 transition-colors">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Decryption occurs entirely on your device using WebAssembly. Your documents and passwords never leave your browser sandbox, ensuring 100% data security.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group transition-all hover:bg-secondary/80">
                <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Protocol Sync</p>
                   <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">Supports standard PDF owner and user password removal via re-synthesis.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}
