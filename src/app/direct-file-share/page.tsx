
"use client"

import React, { useState, useRef, useMemo } from 'react';
import { 
  Share2, 
  Upload, 
  X, 
  ShieldCheck, 
  Info, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Copy, 
  File,
  Loader2,
  AlertCircle,
  Cloud,
  Link as LinkIcon,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';
import { useFirestore, useStorage } from '@/firebase';
import { 
  doc, 
  setDoc, 
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * STORAGE RULES ADVISORY:
 * match /shares/{id}/{file} { 
 *   allow read: if true; 
 *   allow write: if request.resource.size < 50 * 1024 * 1024; 
 * }
 */

export default function DirectFileSharePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [shareId, setShareId] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateShareId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !shareId) return '';
    return `${window.location.origin}/share/${shareId}`;
  }, [shareId]);

  const handleFileUpload = async (selectedFile: File) => {
    // Show file info immediately as requested
    setFile(selectedFile);
    setErrorMessage('');
    
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 50MB." });
      setFile(null);
      return;
    }

    if (!firestore || !storage) {
      setErrorMessage("Service linking failed. Check your connection.");
      setStatus('error');
      return;
    }

    const id = generateShareId();
    setShareId(id);
    setStatus('uploading');
    setProgress(0);

    // Start Cloud Upload
    const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storageRef = ref(storage, `shares/${id}/${safeName}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(p);
      }, 
      (err) => {
        console.error("Upload failed", err);
        setStatus('error');
        setErrorMessage(err.message || "Failed to upload file.");
        toast({ variant: "destructive", title: "Upload Failed", description: err.message });
      }, 
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const roomRef = doc(firestore, 'shares', id);
          
          await setDoc(roomRef, {
            name: selectedFile.name,
            size: selectedFile.size,
            url: downloadURL,
            createdAt: serverTimestamp(),
          });

          setStatus('complete');
          toast({ title: "Ready to share" });
        } catch (e: any) {
          setStatus('error');
          setErrorMessage(e.message || "Could not save file details.");
          toast({ variant: "destructive", title: "Metadata Error", description: e.message });
        }
      }
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast({ title: "Link copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setShareId('');
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-10 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Share2 className="w-3.5 h-3.5" /> File Share
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                Send <span className="text-primary italic">Files</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
                Upload and share files instantly. Secure, simple, and private.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="direct-file-share" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[400px] bg-secondary/10">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <CardContent className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
                {status === 'idle' && !file ? (
                  <div className="w-full max-w-lg space-y-8">
                    <div 
                      onClick={() => !isProcessing && fileInputRef.current?.click()}
                      className="group relative h-64 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all duration-500 shadow-xl border-white/10 hover:border-primary/40 cursor-pointer bg-black/40"
                    >
                      <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:scale-110 transition-all">
                        <Upload className="w-10 h-10" />
                      </div>
                      <div className="text-center space-y-2">
                        <span className="text-sm font-headline font-black uppercase text-white/40 group-hover:text-white transition-colors">Choose a file to send</span>
                        <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest">Supports all formats up to 50MB</p>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl space-y-12 animate-in fade-in zoom-in duration-500">
                     <div className="flex flex-col items-center gap-10">
                        {status === 'complete' && (
                          <div className="text-center space-y-6 w-full">
                             <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-xl animate-in zoom-in duration-500">
                                <CheckCircle2 className="w-12 h-12" />
                             </div>
                             <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Your Link is Ready</h3>
                                <div className="p-6 bg-black/40 rounded-[2.5rem] border border-primary/20 shadow-2xl relative group/url overflow-hidden max-w-full">
                                   <p className="text-lg sm:text-xl font-bold text-white break-all">{shareUrl}</p>
                                </div>
                                <div className="flex justify-center gap-4">
                                   <Button onClick={handleCopyLink} className="h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl">
                                      {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                                      Copy link
                                   </Button>
                                   <Button onClick={reset} variant="outline" className="h-14 px-8 border-white/10 bg-white/5 text-white font-black rounded-2xl">
                                      Send another
                                   </Button>
                                </div>
                             </div>
                          </div>
                        )}

                        {(status === 'uploading' || status === 'error' || (status === 'idle' && file)) && (
                          <div className="w-full space-y-8">
                             <div className="flex items-center justify-center gap-6 p-6 rounded-3xl bg-black/40 border border-white/5">
                                <File className="w-8 h-8 text-primary/40" />
                                <div className="text-left overflow-hidden">
                                   <p className="text-sm font-bold text-white truncate">{file?.name}</p>
                                   <p className="text-[9px] text-white/20 font-black uppercase">{(file?.size || 0) / (1024 * 1024) < 1 ? `${((file?.size || 0) / 1024).toFixed(1)} KB` : `${((file?.size || 0) / (1024 * 1024)).toFixed(1)} MB`}</p>
                                </div>
                             </div>

                             {status === 'uploading' ? (
                               <div className="w-full max-w-sm mx-auto space-y-3">
                                  <div className="flex justify-between text-[10px] font-black uppercase text-white/40">
                                     <span>Uploading to cloud</span>
                                     <span>{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-1.5" />
                                  <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-widest animate-pulse">Processing binary stream...</p>
                               </div>
                             ) : status === 'error' ? (
                               <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-4">
                                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                                  <p className="text-xs font-bold text-red-400 uppercase leading-relaxed">Upload failed: {errorMessage}</p>
                                  <Button onClick={reset} variant="outline" className="h-10 border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase">Try again</Button>
                               </div>
                             ) : null}
                          </div>
                        )}
                     </div>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl">
              <CardHeader className="py-6 border-b border-white/5 bg-white/2">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Info className="w-5 h-5 text-primary" /> How it works
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="space-y-6">
                    {[
                      { icon: Upload, title: 'Pick your file', desc: 'Select or drop any file up to 50MB.' },
                      { icon: LinkIcon, title: 'Share the link', desc: 'Copy the secure link and send it to your recipient.' },
                      { icon: Download, title: 'Recipient downloads', desc: 'They open the link and save the file to their device.' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-5">
                         <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                            <step.icon className="w-5 h-5" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[11px] font-black uppercase text-foreground">{step.title}</h4>
                            <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">{step.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary/50 border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Secure Cloud Transit</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Your files are uploaded to our secure temporary cloud. Once the recipient downloads it, or after 1 hour, the data is automatically purged.
                  </p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
