"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileCode, 
  Link as LinkIcon, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle2,
  Copy,
  Globe,
  ExternalLink,
  Zap,
  ShieldCheck,
  Code2,
  Activity,
  ArrowRight,
  Eye,
  RefreshCcw,
  Maximize2,
  History,
  Layout,
  User,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { doc, setDoc, serverTimestamp, collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { GetHelp } from '@/components/qr-canvas/get-help';

const ID_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

export default function HtmlToUrlPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const [html, setHtml] = useState('');
  const [debouncedHtml, setDebouncedHtml] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');

  // Debounce HTML for preview
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(html);
    }, 250);
    return () => clearTimeout(timer);
  }, [html]);

  // Fetch User Pages
  const pagesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "pages"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [firestore, user]);

  const { data: myPages } = useCollection(pagesQuery);

  const generateId = () => {
    return Array.from({ length: 5 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join('');
  };

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${generatedId}` : '';

  const handleMakeLink = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to publish your matrix." });
      return;
    }

    if (!html.trim()) {
      toast({ variant: "destructive", title: "Payload Empty", description: "Please paste your HTML code first." });
      return;
    }

    if (!firestore) {
      toast({ variant: "destructive", title: "Handshake Failed", description: "Firestore signaling is inactive." });
      return;
    }

    const size = new TextEncoder().encode(html).length;
    if (size > 150 * 1024) {
      toast({ variant: "destructive", title: "Heavy Payload", description: "Matrix exceeded 150KB limit." });
      return;
    }

    setIsProcessing(true);
    setGeneratedId(null);

    const id = generateId();
    try {
      await setDoc(doc(firestore, "pages", id), {
        html: html.trim(),
        title: title.trim() || 'Untitled Studio Page',
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      setGeneratedId(id);
      toast({ title: "Protocol Published", description: "HTML matrix mapped to public URL." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Publish Error", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setHtml('');
    setTitle('');
    setGeneratedId(null);
    toast({ title: "Studio Reset" });
  };

  const openFullscreenPreview = () => {
    const win = window.open();
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Globe className="w-3.5 h-3.5" /> Web Production Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              HTML to <span className="text-primary italic">URL Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
              Convert raw HTML code into a shareable web link. Host snippets, demos, or landing pages instantly via our secure document matrix.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="html-to-url" />
             {html && (
               <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                 <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Editor Column */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)} className="w-full lg:hidden">
             <TabsList className="grid grid-cols-2 bg-secondary p-1.5 rounded-2xl h-14 mb-8">
                <TabsTrigger value="edit" className="rounded-xl text-[9px] font-black uppercase">Edit Matrix</TabsTrigger>
                <TabsTrigger value="preview" className="rounded-xl text-[9px] font-black uppercase">Visual Master</TabsTrigger>
             </TabsList>
          </Tabs>

          <div className={cn("space-y-8", activeView === 'preview' ? "max-lg:hidden" : "block")}>
            <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Code2 className="w-5 h-5 text-primary" /> Matrix Payload
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-8">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Page Identity (Optional)</Label>
                    <Input 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="ENTER PAGE TITLE..."
                      className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">HTML Content (Supports Inline CSS/JS)</Label>
                      <span className={cn("text-[9px] font-mono", html.length > 150000 ? "text-red-500" : "text-primary/60")}>
                        {Math.round(html.length / 1024)} KB / 150 KB
                      </span>
                    </div>
                    <Textarea 
                      value={html}
                      onChange={e => setHtml(e.target.value)}
                      placeholder="Paste your HTML here..."
                      className="min-h-[400px] bg-secondary border-border text-xs font-mono p-8 rounded-[2rem] leading-relaxed resize-none focus:ring-primary/40 custom-scrollbar shadow-inner"
                    />
                 </div>

                 <div className="pt-4">
                    {!user ? (
                      <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center gap-4 text-center">
                         <AlertCircle className="w-6 h-6 text-amber-500" />
                         <p className="text-[10px] font-black uppercase text-amber-700/60 leading-relaxed">Identity verification required to publish to public matrix.</p>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleMakeLink}
                        disabled={!html.trim() || isProcessing || html.length > 150000}
                        className="h-16 w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                      >
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <LinkIcon className="w-6 h-6" />}
                        Make Shareable Link
                      </Button>
                    )}
                 </div>
              </CardContent>
            </Card>

            {myPages && myPages.length > 0 && (
              <Card className="glass-card border-border shadow-xl overflow-hidden">
                <CardHeader className="py-6 border-b border-border bg-secondary/30">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
                      <History className="w-4 h-4 text-primary" /> My Hosted Pages
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-border">
                      {myPages.map((p: any) => (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-all group">
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">{p.title}</p>
                              <p className="text-[8px] font-mono text-foreground/20">{p.id}</p>
                           </div>
                           <div className="flex gap-2">
                              <Button asChild size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:text-primary">
                                 <a href={`/p/${p.id}`} target="_blank"><ExternalLink className="w-3.5 h-3.5" /></a>
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleCopy(`${window.location.origin}/p/${p.id}`)} className="h-8 w-8 rounded-lg hover:text-primary">
                                 <Copy className="w-3.5 h-3.5" />
                              </Button>
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2 lg:sticky lg:top-24">
          <Card className={cn(
            "glass-card border-border shadow-2xl overflow-hidden relative group min-h-[600px] flex flex-col bg-white",
            activeView === 'edit' ? "max-lg:hidden" : "block"
          )}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
               <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Visual Master
               </CardTitle>
               <div className="flex items-center gap-3">
                  <button onClick={() => setDebouncedHtml('')} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Clear Preview">
                     <RefreshCcw className="w-3.5 h-3.5 text-foreground/40" />
                  </button>
                  <button onClick={openFullscreenPreview} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Fullscreen Preview">
                     <Maximize2 className="w-3.5 h-3.5 text-foreground/40" />
                  </button>
               </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden bg-white">
               {debouncedHtml ? (
                 <iframe 
                   srcDoc={debouncedHtml}
                   title="Studio Preview"
                   sandbox="allow-scripts allow-forms"
                   className="w-full h-full border-none"
                 />
               ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 py-32 space-y-4">
                    <Layout className="w-24 h-24 text-primary" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Preview will show here</p>
                 </div>
               )}
            </CardContent>
          </Card>

          {generatedId && (
            <Card className="glass-card border-primary/20 bg-primary/[0.03] shadow-2xl overflow-hidden relative animate-in zoom-in duration-500">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
               <CardHeader className="py-8 border-b border-primary/10">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-3 text-primary">
                    <CheckCircle2 className="w-4 h-4" /> Protocol Published
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-10 space-y-8">
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Hosted URL Registry</Label>
                     <div className="p-6 bg-background border border-primary/20 rounded-[2.5rem] shadow-inner relative group/url overflow-hidden">
                        <p className="text-lg font-bold text-foreground break-all leading-tight">{fullUrl}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Button 
                      onClick={() => handleCopy(fullUrl)}
                      className="h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30"
                     >
                        {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                        Copy Link
                     </Button>
                     <Button 
                      asChild
                      variant="outline"
                      className="h-16 rounded-2xl border-white/10 bg-white/5 text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-white/10"
                     >
                        <a href={`/p/${generatedId}`} target="_blank">
                           <ExternalLink className="w-5 h-5 mr-2" /> Open Page
                        </a>
                     </Button>
                  </div>
               </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Isolated Host</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Your markup is hosted within a dedicated Firestore document matrix. It remains publicly accessible until manually purged via user protocols.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
