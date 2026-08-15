"use client"

import React, { useState, useRef } from 'react';
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
  History,
  AlertCircle
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
  const [sections, setSections] = useState<MetadataSection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setHasScanned(false);
      setSections([]);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const src = event.target?.result as string;
        setImage(src);

        try {
          // Deep Metadata Extraction
          const tags = await ExifReader.load(file);
          
          // Remove binary data that shouldn't be displayed as text
          delete tags['Thumbnail'];
          delete tags['MakerNote'];
          delete tags['UserComment'];

          const newSections: MetadataSection[] = [
            { title: 'Location (GPS)', icon: MapPin, tags: [] },
            { title: 'Camera & Optics', icon: Camera, tags: [] },
            { title: 'Chronology', icon: History, tags: [] },
            { title: 'File Identity', icon: FileImage, tags: [] },
            { title: 'Software & Auth', icon: Cpu, tags: [] },
            { title: 'Advanced Matrix', icon: Layers, tags: [] },
          ];

          // 1. GPS Extraction logic
          if (tags.GPSLatitude && tags.GPSLongitude) {
            const lat = tags.GPSLatitude.description;
            const lng = tags.GPSLongitude.description;
            newSections[0].tags.push({ label: 'Latitude', value: String(lat) });
            newSections[0].tags.push({ label: 'Longitude', value: String(lng) });
            
            // Generate Google Maps link if we have numeric values
            const latVal = tags.GPSLatitude.value;
            const lngVal = tags.GPSLongitude.value;
            if (latVal && lngVal) {
               // ExifReader provides decimal in description or we can use value
               // Using description for human readable, but link needs clean decimals
               const latDec = Array.isArray(latVal) ? latVal[0] : latVal;
               const lngDec = Array.isArray(lngVal) ? lngVal[0] : lngVal;
               newSections[0].tags.push({ 
                 label: 'Google Maps Protocol', 
                 value: `https://www.google.com/maps?q=${lat},${lng}` 
               });
            }
          }

          // 2. Camera & Exposure Matrix
          const camMappings = [
            { key: 'Make', label: 'Manufacturer' },
            { key: 'Model', label: 'Device Model' },
            { key: 'LensModel', label: 'Lens Specification' },
            { key: 'ISOSpeedRatings', label: 'ISO Sensitivity' },
            { key: 'FNumber', label: 'Aperture (F-Stop)' },
            { key: 'ExposureTime', label: 'Shutter Speed' },
            { key: 'FocalLength', label: 'Focal Length' },
            { key: 'Flash', label: 'Flash Mode' },
            { key: 'ExposureProgram', label: 'Exposure Program' },
            { key: 'MeteringMode', label: 'Metering Mode' },
          ];
          camMappings.forEach(m => {
            if (tags[m.key]) newSections[1].tags.push({ label: m.label, value: String(tags[m.key].description || tags[m.key].value) });
          });

          // 3. Chronology Matrix
          const dateMappings = [
            { key: 'DateTimeOriginal', label: 'Capture Date' },
            { key: 'DateTimeDigitized', label: 'Digitization Date' },
            { key: 'DateTime', label: 'Last Modification' },
          ];
          dateMappings.forEach(m => {
            if (tags[m.key]) newSections[2].tags.push({ label: m.label, value: String(tags[m.key].description || tags[m.key].value) });
          });

          // 4. File Identity Matrix
          if (tags['Image Width']) newSections[3].tags.push({ label: 'Pixel Width', value: `${tags['Image Width'].value} px` });
          if (tags['Image Height']) newSections[3].tags.push({ label: 'Pixel Height', value: `${tags['Image Height'].value} px` });
          if (tags['ColorSpace']) newSections[3].tags.push({ label: 'Color Space', value: String(tags['ColorSpace'].description) });
          if (tags['Orientation']) newSections[3].tags.push({ label: 'Display Orientation', value: String(tags['Orientation'].description) });
          if (tags['FileType']) newSections[3].tags.push({ label: 'Binary Format', value: String(tags['FileType'].value) });

          // 5. Software & Attribution
          const softMappings = [
            { key: 'Software', label: 'Editing Software' },
            { key: 'Artist', label: 'Creator/Artist' },
            { key: 'Copyright', label: 'Copyright Notice' },
            { key: 'HostComputer', label: 'Processing Host' },
          ];
          softMappings.forEach(m => {
            if (tags[m.key]) newSections[4].tags.push({ label: m.label, value: String(tags[m.key].description || tags[m.key].value) });
          });

          // 6. Advanced/Raw Matrix (Everything else remaining)
          const knownKeys = new Set([
            'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSImgDirection',
            ...camMappings.map(x => x.key), 
            ...dateMappings.map(x => x.key),
            ...softMappings.map(x => x.key),
            'Image Width', 'Image Height', 'ColorSpace', 'Orientation', 'FileType'
          ]);

          Object.entries(tags).forEach(([key, tag]: [string, any]) => {
            if (!knownKeys.has(key) && tag.description && typeof tag.description === 'string') {
              newSections[5].tags.push({ label: key, value: tag.description });
            }
          });

          const finalSections = newSections.filter(s => s.tags.length > 0);
          setSections(finalSections);
          setHasScanned(true);
          setIsProcessing(false);
          
          if (finalSections.length > 0) {
            toast({ title: "Matrix Decoded", description: "Identity headers extracted successfully." });
          } else {
            toast({ title: "Zero Data Detected", description: "File contains no recognizable metadata headers." });
          }
        } catch (err) {
          console.error("Decoding Error", err);
          setIsProcessing(false);
          setHasScanned(true);
          toast({ variant: "destructive", title: "Decoding Error", description: "Failed to read binary headers from this asset." });
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
    toast({ title: "Identity Copied", description: "Full metadata matrix saved to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setImage(null);
    setSections([]);
    setHasScanned(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Memory buffer purged." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Fingerprint className="w-3.5 h-3.5" /> Identity Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          EXIF <span className="text-primary italic">Explorer Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
          Deep clinical inspection of image headers. Extract GPS, camera optics, and hidden forensic identifiers locally and privately within your browser.
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
                <button onClick={handleClear} className="text-[10px] font-black uppercase text-foreground/30 hover:text-destructive transition-all">Reset</button>
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
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-foreground/20">Identified {sections.reduce((acc, s) => acc + s.tags.length, 0)} identifiers</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Privacy Absolute</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Extraction occurs entirely on your device via binary bitstream inspection. Your imagery never leaves your browser session, ensuring 100% data security.
              </p>
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          {!hasScanned && !isProcessing ? (
             <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12 border-dashed">
                <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-6">
                  <Compass className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Identity Extraction</h3>
                <p className="text-sm text-foreground/20 font-medium max-w-xs mt-4 uppercase tracking-tighter">
                  Upload a photo to see its hidden clinical data matrix.
                </p>
             </Card>
          ) : isProcessing ? (
            <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12">
               <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
               </div>
               <p className="mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-primary">Scanning Bitstream Matrix...</p>
            </Card>
          ) : sections.length === 0 ? (
            <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12 bg-yellow-500/5">
              <AlertCircle className="w-16 h-16 text-yellow-500 mb-6" />
              <h3 className="text-xl font-headline font-black text-yellow-500 uppercase tracking-widest">No Metadata Identified</h3>
              <p className="text-sm text-foreground/40 font-medium max-w-sm mt-4 leading-relaxed uppercase tracking-tighter">
                The asset appears to be sanitized. No forensic headers (EXIF, IPTC, XMP) were discovered in the bitstream.
              </p>
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
                                      View on Map Protocol <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="text-sm font-mono font-bold text-foreground truncate">{tag.value}</span>
                                  )}
                                  <button onClick={() => { navigator.clipboard.writeText(tag.value); toast({ title: "Value Copied" }); }} className="text-foreground/10 hover:text-primary transition-colors shrink-0">
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
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Protocol Sync</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Full synchronization with EXIF 2.32, XMP, and IPTC standard data blocks.</p>
                </div>
             </div>
             <div className="p-6 rounded-[2.5rem] bg-secondary border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                   <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-foreground uppercase tracking-widest">WASM Sandbox</p>
                   <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Binary parsing occurs in a strictly isolated browser context for maximum security.</p>
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
