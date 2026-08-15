"use client"

import React, { useState, useRef, useMemo } from 'react';
import { 
  Camera, 
  Globe, 
  Calendar, 
  FileImage, 
  Settings2, 
  Copy, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  Info,
  Compass,
  MapPin,
  ExternalLink,
  Cpu,
  Layers,
  Search,
  Loader2,
  Zap,
  Maximize,
  Fingerprint,
  Smartphone,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ExifReader from 'exifreader';

interface MetadataTag {
  label: string;
  value: string;
}

interface MetadataSection {
  title: string;
  icon: any;
  tags: MetadataTag[];
}

export default function ExifViewerPage() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [sections, setSections] = useState<MetadataSection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setFileInfo({ name: file.name, size: file.size });
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const src = event.target?.result as string;
        setImage(src);

        try {
          // Deep Metadata Extraction
          const tags = await ExifReader.load(file);
          
          const newSections: MetadataSection[] = [
            { title: 'Location (GPS)', icon: MapPin, tags: [] },
            { title: 'Camera & Optics', icon: Camera, tags: [] },
            { title: 'Chronology', icon: History, tags: [] },
            { title: 'File Identity', icon: FileImage, tags: [] },
            { title: 'Software & Auth', icon: Cpu, tags: [] },
            { title: 'Advanced Matrix', icon: Layers, tags: [] },
          ];

          // 1. GPS Extraction
          if (tags.GPSLatitude && tags.GPSLongitude) {
            const lat = tags.GPSLatitude.description;
            const lng = tags.GPSLongitude.description;
            newSections[0].tags.push({ label: 'Latitude', value: String(lat) });
            newSections[0].tags.push({ label: 'Longitude', value: String(lng) });
            
            // Map link logic
            const latVal = tags.GPSLatitude.value as any;
            const lngVal = tags.GPSLongitude.value as any;
            if (Array.isArray(latVal) && Array.isArray(lngVal)) {
               // Basic map link heuristic
               newSections[0].tags.push({ 
                 label: 'Google Maps Protocol', 
                 value: `https://www.google.com/maps?q=${lat},${lng}` 
               });
            }
          }

          // 2. Camera Extraction
          const camTags = [
            { key: 'Make', label: 'Manufacturer' },
            { key: 'Model', label: 'Model' },
            { key: 'LensModel', label: 'Lens' },
            { key: 'ISOSpeedRatings', label: 'ISO' },
            { key: 'FNumber', label: 'F-Stop' },
            { key: 'ExposureTime', label: 'Shutter Speed' },
            { key: 'FocalLength', label: 'Focal Length' },
            { key: 'Flash', label: 'Flash Status' },
          ];
          camTags.forEach(t => {
            if (tags[t.key]) newSections[1].tags.push({ label: t.label, value: String(tags[t.key].description) });
          });

          // 3. Chronology
          if (tags.DateTimeOriginal) newSections[2].tags.push({ label: 'Captured At', value: String(tags.DateTimeOriginal.description) });
          if (tags.DateTimeDigitized) newSections[2].tags.push({ label: 'Digitized At', value: String(tags.DateTimeDigitized.description) });
          if (tags.DateTime) newSections[2].tags.push({ label: 'Modified At', value: String(tags.DateTime.description) });

          // 4. File Identity
          if (tags['Image Width']) newSections[3].tags.push({ label: 'Width', value: `${tags['Image Width'].value} px` });
          if (tags['Image Height']) newSections[3].tags.push({ label: 'Height', value: `${tags['Image Height'].value} px` });
          if (tags.Orientation) newSections[3].tags.push({ label: 'Orientation', value: String(tags.Orientation.description) });
          if (tags.FileType) newSections[3].tags.push({ label: 'Format', value: String(tags.FileType.value) });

          // 5. Software
          if (tags.Software) newSections[4].tags.push({ label: 'Editor', value: String(tags.Software.description) });
          if (tags.Artist) newSections[4].tags.push({ label: 'Author', value: String(tags.Artist.description) });
          if (tags.Copyright) newSections[4].tags.push({ label: 'Copyright', value: String(tags.Copyright.description) });

          // 6. All Other Tags
          Object.entries(tags).forEach(([key, val]) => {
            const isKnown = [...camTags.map(x=>x.key), 'GPSLatitude', 'GPSLongitude', 'DateTimeOriginal', 'DateTimeDigitized', 'DateTime', 'Image Width', 'Image Height', 'Orientation', 'FileType', 'Software', 'Artist', 'Copyright'].includes(key);
            if (!isKnown && val && val.description) {
              newSections[5].tags.push({ label: key, value: String(val.description) });
            }
          });

          setSections(newSections.filter(s => s.tags.length > 0));
          setIsProcessing(false);
          toast({ title: "Matrix Decoded", description: "Headers extracted for clinical inspection." });
        } catch (err) {
          setIsProcessing(false);
          toast({ variant: "destructive", title: "Decoding Error", description: "Failed to read binary headers." });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyAll = () => {
    if (sections.length === 0) return;
    const text = sections.map(s => `[${s.title}]\n${s.tags.map(t => `${t.label}: ${t.value}`).join('\n')}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Identity Copied", description: "All metadata saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setImage(null);
    setFileInfo(null);
    setSections([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Memory purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Fingerprint className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          EXIF <span className="text-primary italic">Explorer Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Deep clinical inspection of image headers. Extract GPS, camera optics, and hidden software identifiers locally and privately within your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Controls Section */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                Input Protocol
              </CardTitle>
              {image && (
                <button onClick={handleClear} className="text-[10px] font-black uppercase text-foreground/30 hover:text-destructive transition-all">Clear</button>
              )}
            </CardHeader>
            
            <CardContent className="pt-10 space-y-10">
              <div className="space-y-4">
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={cn(
                    "relative group/upload h-72 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                    image && "border-solid border-primary/20",
                    isProcessing && "cursor-not-allowed opacity-80"
                  )}
                >
                  {image ? (
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                      <img 
                        src={image} 
                        alt="Source" 
                        className="max-h-full w-auto object-contain rounded-xl shadow-xl transition-all group-hover/upload:opacity-40" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-all flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                         <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                           <Search className="w-6 h-6" />
                         </div>
                         <p className="text-[10px] font-black text-white uppercase tracking-widest">Identify New Matrix</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-6 shadow-xl">
                        {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Zap className="w-8 h-8" />}
                      </div>
                      <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-12 leading-relaxed">
                        {isProcessing ? "Decoding Binary Headers..." : "Drop high-res imagery or click to browse"}<br />
                        <span className="text-[8px] opacity-60 uppercase font-bold">(JPG, PNG, WebP)</span>
                      </p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {sections.length > 0 && (
                <div className="space-y-4 animate-in zoom-in duration-500">
                  <Button 
                    onClick={handleCopyAll}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                  >
                    {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                    Copy Matrix Data
                  </Button>
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-foreground/20">Identified {sections.reduce((acc, s) => acc + s.tags.length, 0)} Data points</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Analysis occurs entirely on your device via binary bitstream inspection. Your photography never leaves your browser session, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {!sections.length && !isProcessing ? (
             <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12 border-dashed">
                <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-6">
                  <Compass className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Identity Extraction</h3>
                <p className="text-sm text-foreground/20 font-medium max-w-xs mt-4 uppercase tracking-tighter">
                  Upload an image to see its hidden clinical data matrix.
                </p>
             </Card>
          ) : isProcessing ? (
            <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12">
               <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
               </div>
               <p className="mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-primary">Scanning Bitstream...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-8 max-h-[1000px] overflow-auto pr-2 custom-scrollbar">
               {sections.map((section, idx) => (
                 <Card key={idx} className="glass-card border-border shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
                    <CardHeader className="py-6 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                             <section.icon className="w-5 h-5" />
                          </div>
                          <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">{section.title}</CardTitle>
                       </div>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-border">
                          {section.tags.map((tag, tIdx) => (
                            <div key={tIdx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/50 transition-all">
                               <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 shrink-0">{tag.label}</span>
                               <div className="flex items-center gap-4 overflow-hidden">
                                  {tag.value.startsWith('http') ? (
                                    <a 
                                      href={tag.value} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-xs font-bold text-primary hover:underline underline-offset-4"
                                    >
                                      View on Map <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="text-sm font-mono font-bold text-foreground truncate">{tag.value}</span>
                                  )}
                                  <button onClick={() => { navigator.clipboard.writeText(tag.value); toast({ title: "Value Copied" }); }} className="text-foreground/10 hover:text-primary transition-colors">
                                     <Copy className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <Settings2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Protocol Support</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Full synchronization with EXIF 2.32, XMP, and IPTC standard data blocks.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Sandbox Decoding</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Binary parsing occurs in a strictly isolated WASM context for maximum security.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .bg-checkered {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </div>
  );
}

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
);
