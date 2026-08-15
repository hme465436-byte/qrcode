
"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Upload, 
  CheckCircle2,
  Info,
  Loader2,
  Maximize,
  FileArchive,
  LayoutGrid,
  Monitor,
  Smartphone,
  MousePointer2,
  Box,
  Copy,
  Code2,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  Search,
  Globe,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface FaviconSize {
  size: number;
  label: string;
  filename: string;
  desc: string;
  icon: any;
  dataUrl: string | null;
}

const TARGET_SIZES: Omit<FaviconSize, 'dataUrl'>[] = [
  { size: 16, label: '16x16', filename: 'favicon-16x16.png', desc: 'Standard Browser Tab', icon: MousePointer2 },
  { size: 32, label: '32x32', filename: 'favicon-32x32.png', desc: 'High-Res Browser Tab', icon: Monitor },
  { size: 48, label: '48x48', filename: 'favicon-48x48.png', desc: 'Desktop Taskbar', icon: Box },
  { size: 96, label: '96x96', filename: 'favicon-96x96.png', desc: 'High-DPI Desktop', icon: Monitor },
  { size: 180, label: '180x180', filename: 'apple-touch-icon.png', desc: 'iOS Home Screen', icon: Smartphone },
  { size: 192, label: '192x192', filename: 'android-chrome-192x192.png', desc: 'Android PWA Small', icon: Layers },
  { size: 512, label: '512x512', filename: 'android-chrome-512x512.png', desc: 'Android PWA Large', icon: LayoutGrid },
];

export default function FaviconGeneratorPage() {
  const { toast } = useToast();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [favicons, setFavicons] = useState<FaviconSize[]>(
    TARGET_SIZES.map(s => ({ ...s, dataUrl: null }))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Heavy Payload", description: "Standard limit for icons is 20MB." });
        return;
      }
      setFileInfo({ name: file.name, size: file.size });
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        toast({ title: "Asset Imported", description: "Ready for studio synthesis." });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFavicons = useCallback(() => {
    if (!sourceImage) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceImage;
    img.onload = () => {
      const updatedFavicons = [...favicons];
      
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      updatedFavicons.forEach((favicon, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = favicon.size;
        canvas.height = favicon.size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, favicon.size, favicon.size);
        updatedFavicons[index].dataUrl = canvas.toDataURL('image/png');
      });

      setFavicons(updatedFavicons);
      setIsProcessing(false);
      toast({ title: "Synthesis Complete", description: "All sizes generated with 1:1 pixel mapping." });
    };
  }, [sourceImage, favicons, toast]);

  useEffect(() => {
    if (sourceImage) {
      generateFavicons();
    }
  }, [sourceImage]);

  const handleCopyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(label);
    toast({ title: "Snippet Copied", description: `${label} implementation ready.` });
    setTimeout(() => setIsCopied(null), 2000);
  };

  const downloadZip = async () => {
    const hasIcons = favicons.some(f => f.dataUrl);
    if (!hasIcons) return;

    setIsProcessing(true);
    const zip = new JSZip();
    
    // Add all PNGs
    favicons.forEach(f => {
      if (f.dataUrl) {
        const base64Data = f.dataUrl.split(',')[1];
        zip.file(f.filename, base64Data, { base64: true });
        
        // Also map 32x32 to favicon.ico for standard naming
        if (f.size === 32) {
           zip.file('favicon.ico', base64Data, { base64: true });
        }
      }
    });

    // Create simple SVG wrapper
    if (favicons[6]?.dataUrl) {
       const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <image href="${favicons[6].dataUrl}" width="512" height="512"/>
</svg>`;
       zip.file('favicon.svg', svgContent);
    }

    // Create site.webmanifest
    const manifest = {
      name: "Brand Master App",
      short_name: "App",
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone"
    };
    zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

    // Create README
    const readme = `# Favicon Master Bundle
Generated via MY KIT TOOL

## Implementation
1. Place all files in your web project's root directory (or /public).
2. Copy the corresponding code snippet from the studio.
3. Verify that paths match your folder structure.

## Metadata
Created: ${new Date().toLocaleString()}
Engine: Hardware-Accelerated Canvas Synthesis
`;
    zip.file('README.md', readme);

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `favicon-master-bundle-${Date.now()}.zip`;
    link.click();
    
    setIsProcessing(false);
    toast({ title: "Bundle Exported", description: "Full icon set and protocols saved to ZIP." });
  };

  const handleClear = () => {
    setSourceImage(null);
    setFileInfo(null);
    setFavicons(TARGET_SIZES.map(s => ({ ...s, dataUrl: null })));
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: "Studio Reset", description: "Buffers cleared." });
  };

  const SNIPPETS = {
    html: `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`,
    
    react: `// Add to your main layout or index.html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="manifest" href="/site.webmanifest" />`,

    nextjs: `// In your app/layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};`,

    rails: `<%= favicon_link_tag 'favicon.ico' %>
<%= favicon_link_tag 'apple-touch-icon.png', rel: 'apple-touch-icon', type: 'image/png' %>`,

    node: `// Express.js setup
app.use(express.static('public'));
// Favicon usually handled via serve-favicon middleware
const favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));`,

    gulp: `gulp.task('icons', function() {
  return gulp.src('src/icons/**/*')
    .pipe(gulp.dest('dist/'));
});`,

    grunt: `copy: {
  main: {
    expand: true,
    cwd: 'src/icons/',
    src: '**',
    dest: 'dist/',
  },
},`
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <LayoutGrid className="w-3.5 h-3.5" /> Web Production Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Favicon <span className="text-primary italic">Master Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional-grade icon synthesis. Generate optimized bundles for iOS, Android, and all modern browsers with hard-coded implementation protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input & Controls */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                Source Imagery
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "relative group/upload h-64 rounded-[2.5rem] border-2 border-dashed border-border hover:border-primary/40 transition-all flex flex-col items-center justify-center bg-secondary/30 overflow-hidden cursor-pointer",
                  sourceImage && "border-solid border-primary/40",
                  isProcessing && "cursor-not-allowed opacity-80"
                )}
              >
                {sourceImage ? (
                  <div className="w-full h-full p-8 flex flex-col items-center justify-center gap-4">
                     <img src={sourceImage} alt="Source" className="max-h-32 w-auto rounded-xl shadow-2xl object-contain ring-1 ring-white/20" />
                     <div className="text-center">
                        <p className="text-xs font-black uppercase text-foreground truncate max-w-[200px]">{fileInfo?.name}</p>
                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{(fileInfo?.size || 0) > 0 ? (fileInfo!.size / 1024).toFixed(1) : 0} KB detected</p>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-foreground/20 group-hover:text-primary group-hover:scale-110 transition-all mb-6 shadow-xl">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest group-hover:text-primary transition-colors text-center px-10 leading-relaxed">
                      Drop imagery for synthesis<br />
                      <span className="text-[8px] opacity-60">(Square high-res logo recommended)</span>
                    </p>
                  </>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {sourceImage && (
                <div className="space-y-4">
                  <Button 
                    onClick={downloadZip}
                    disabled={isProcessing}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                  >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileArchive className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                    Download ZIP Bundle
                  </Button>
                  <Button variant="ghost" onClick={handleClear} className="w-full text-[9px] font-black uppercase tracking-widest text-foreground/30 hover:text-destructive transition-colors">
                     Reset Workspace
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Master Protocol</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                We utilize bi-linear interpolation for high-quality downsampling. All generated assets are sanitized of metadata for absolute performance and privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Preview & Implementation */}
        <div className="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-right-6 duration-1000">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="bg-secondary p-1.5 rounded-2xl h-14 mb-8">
              <TabsTrigger value="preview" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background">
                <LayoutGrid className="w-3.5 h-3.5 mr-2" /> Asset Grid
              </TabsTrigger>
              <TabsTrigger value="codes" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background">
                <Code2 className="w-3.5 h-3.5 mr-2" /> Implementation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-0">
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                 {favicons.map((favicon) => (
                   <Card key={favicon.label} className="glass-card border-border shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
                     <CardHeader className="py-4 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-3">
                         <favicon.icon className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{favicon.label}</span>
                       </div>
                       {favicon.dataUrl && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                     </CardHeader>
                     <CardContent className="p-8 flex flex-col items-center justify-center min-h-[160px] relative">
                       {favicon.dataUrl ? (
                         <div className="space-y-4 text-center">
                            <img 
                             src={favicon.dataUrl} 
                             alt={favicon.label} 
                             style={{ width: Math.max(32, favicon.size > 128 ? 128 : favicon.size), height: 'auto' }}
                             className="shadow-xl bg-white ring-1 ring-border mx-auto"
                            />
                            <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{favicon.desc}</p>
                         </div>
                       ) : (
                         <div className="opacity-5">
                            <Sparkles className="w-10 h-10" />
                         </div>
                       )}
                     </CardContent>
                   </Card>
                 ))}
               </div>
            </TabsContent>

            <TabsContent value="codes" className="mt-0 space-y-8">
               <Card className="glass-card border-border shadow-2xl overflow-hidden">
                  <CardHeader className="py-6 border-b border-border bg-secondary/30">
                     <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary">
                        <Terminal className="w-4 h-4" /> Code Protocols
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="html" className="w-full">
                       <div className="flex bg-background border-b border-border overflow-x-auto no-scrollbar">
                         {Object.keys(SNIPPETS).map((key) => (
                           <TabsTrigger 
                             key={key} 
                             value={key} 
                             className="px-6 py-4 rounded-none text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary/5 data-[state=active]:text-primary border-r border-border transition-all"
                           >
                             {key}
                           </TabsTrigger>
                         ))}
                       </div>
                       
                       {Object.entries(SNIPPETS).map(([key, code]) => (
                         <TabsContent key={key} value={key} className="m-0 p-8 space-y-6 animate-in fade-in duration-500">
                            <div className="relative group/snippet">
                               <pre className="p-8 rounded-[2rem] bg-black/90 text-green-500/80 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner border border-white/5 custom-scrollbar max-h-[300px]">
                                 {code}
                               </pre>
                               <Button 
                                 size="sm"
                                 onClick={() => handleCopyCode(code, key.toUpperCase())}
                                 className="absolute top-4 right-4 h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-widest backdrop-blur-md border border-white/10"
                               >
                                 {isCopied === key.toUpperCase() ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                                 {isCopied === key.toUpperCase() ? 'Copied' : 'Copy'}
                               </Button>
                            </div>
                            
                            <div className="flex items-center gap-3 text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                               <Settings2 className="w-3.5 h-3.5" />
                               <span>Protocol: {key === 'nextjs' ? 'Metadata API' : 'Static Distribution'}</span>
                            </div>
                         </TabsContent>
                       ))}
                    </Tabs>
                  </CardContent>
               </Card>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                     <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                        <Globe className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Cross-Platform Sync</p>
                        <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">Verified support for Safari, Chrome, Edge, and PWA environments.</p>
                     </div>
                  </div>
                  <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5 group hover:border-primary/20 transition-all">
                     <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                        <Maximize className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Precision Raster</p>
                        <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">1:1 pixel mapping ensures crisp clarity even at the 16px scale.</p>
                     </div>
                  </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
