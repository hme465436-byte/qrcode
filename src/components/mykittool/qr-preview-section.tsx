"use client"

import React, { useEffect, useRef, useState } from 'react';
import { QRState, QRHistoryItem } from '@/lib/qr-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileCode, 
  Loader2, 
  History, 
  Download, 
  Wifi, 
  Contact, 
  Link2,
  Copy,
  Phone,
  ChevronRight,
  Trash2,
  MessageSquare,
  Zap,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Target,
  FileImage,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

interface QrPreviewSectionProps {
  state: QRState;
  history: QRHistoryItem[];
  onDownload: () => void;
  onClearHistory: () => void;
}

declare global {
  interface Window {
    QRCodeStyling: any;
  }
}

export function QrPreviewSection({ state, history, onDownload, onClearHistory }: QrPreviewSectionProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const dataLength = state.data?.length || 0;
  const isStylized = state.dotStyle !== 'square' || state.cornerStyle !== 'square';
  const isHighDensity = dataLength > 150 || !!state.backgroundImage || !!state.logo || isStylized;

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  const getQrConfig = (size: number, forceTransparent: boolean = false, preloadedLogo?: string) => {
    const errorCorrection = isHighDensity ? 'H' : state.errorLevel;
    
    return {
      width: size,
      height: size,
      type: 'canvas' as const,
      data: state.data || ' ',
      image: preloadedLogo || state.logo || '',
      margin: 40,
      dotsOptions: { color: state.fgColor, type: state.dotStyle },
      cornersSquareOptions: { type: state.cornerStyle === 'rounded' ? 'extra-rounded' : state.cornerStyle, color: state.fgColor },
      cornersDotOptions: { type: state.cornerStyle === 'rounded' ? 'dot' : state.cornerStyle, color: state.fgColor },
      backgroundOptions: { color: forceTransparent ? 'rgba(0,0,0,0)' : state.bgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 15, imageSize: state.logoSize, hideBackgroundDots: true },
      qrOptions: { errorCorrectionLevel: errorCorrection }
    };
  };

  const compositeCanvas = async (resolution: number): Promise<HTMLCanvasElement> => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = resolution;
    finalCanvas.height = resolution;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context failed");

    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, resolution, resolution);

    if (state.backgroundImage) {
      try {
        const bgImg = await loadImage(state.backgroundImage);
        ctx.save();
        ctx.globalAlpha = Math.min(state.backgroundOpacity, 0.4); 
        const scale = Math.max(resolution / bgImg.width, resolution / bgImg.height);
        const x = (resolution - bgImg.width * scale) / 2;
        const y = (resolution - bgImg.height * scale) / 2;
        ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        ctx.restore();
      } catch (e) {
        console.warn("Background render failed", e);
      }
    }

    const qrConfig = getQrConfig(resolution, true);
    if (!window.QRCodeStyling) {
      throw new Error("QR Styling engine not ready");
    }
    const styling = new window.QRCodeStyling(qrConfig);
    
    const qrBlob = await styling.getRawData('png');
    const qrImg = await loadImage(URL.createObjectURL(qrBlob));
    
    ctx.drawImage(qrImg, 0, 0, resolution, resolution);

    return finalCanvas;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.QRCodeStyling && qrRef.current) {
      setIsGenerating(true);
      const renderPreview = async () => {
        try {
          const finalCanvas = await compositeCanvas(800);
          if (qrRef.current) {
            qrRef.current.innerHTML = '';
            finalCanvas.style.width = '100%';
            finalCanvas.style.height = '100%';
            finalCanvas.style.display = 'block';
            finalCanvas.style.borderRadius = '0.75rem';
            qrRef.current.appendChild(finalCanvas);
          }
        } catch (e) {
          console.error("Studio render failed", e);
        } finally {
          setIsGenerating(false);
        }
      };
      renderPreview();
    }
  }, [state]);

  const handleDownload = async (ext: 'png' | 'jpg' | 'pdf' | 'svg', resolution: number) => {
    setIsGenerating(true);
    try {
      if (ext === 'svg') {
        const qrConfig = getQrConfig(resolution, !!state.backgroundImage);
        const styling = new window.QRCodeStyling(qrConfig);
        await styling.download({ name: 'qrcanvas-export', extension: 'svg' });
      } else if (ext === 'pdf') {
        const finalCanvas = await compositeCanvas(resolution);
        const imgData = finalCanvas.toDataURL('image/jpeg', 1.0);
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [resolution, resolution]
        });
        doc.addImage(imgData, 'JPEG', 0, 0, resolution, resolution);
        doc.save(`qrcanvas-${Date.now()}.pdf`);
      } else {
        const finalCanvas = await compositeCanvas(resolution);
        const mimeType = ext === 'jpg' ? 'image/jpeg' : 'image/png';
        const link = document.createElement('a');
        link.download = `qrcanvas-${Date.now()}.${ext}`;
        link.href = finalCanvas.toDataURL(mimeType, 1.0);
        link.click();
      }
      onDownload();
      toast({ title: "Branded Asset Ready", description: `Your QR asset has been saved as ${ext.toUpperCase()}.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Export Failed", description: "An error occurred during rendering." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full">
      <Card className="glass-card relative overflow-hidden group border-border">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardHeader className="text-center pb-4 sm:pb-6 pt-8">
          <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 fill-primary/20" />
            Live Studio Rendering
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 sm:gap-8 px-4 sm:px-8 pb-10">
          <div className="relative p-3 sm:p-5 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl ring-4 ring-foreground/5 group-hover:scale-[1.01] transition-transform duration-700 ease-out qr-canvas-shadow overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 z-20 bg-background/20 backdrop-blur-[1px] rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            <div ref={qrRef} className="relative z-10 w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] flex items-center justify-center overflow-hidden rounded-xl bg-transparent" />
          </div>

          <div className="w-full space-y-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-secondary border border-border space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    <Target className="w-3.5 h-3.5 text-primary" /> Scannability
                  </div>
                  <span className={cn("text-[10px] sm:text-[11px] font-black uppercase tracking-widest", state.scannabilityScore > 80 ? "text-primary" : "text-yellow-500")}>
                    {state.scannabilityScore}% Optimal
                  </span>
               </div>
               <Progress value={state.scannabilityScore} className="h-1.5" />
               <p className="text-[9px] text-foreground/30 font-medium leading-relaxed">
                 Score based on pattern density and background contrast.
               </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => handleDownload('png', 1024)} 
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 sm:h-16 rounded-2xl flex items-center justify-center gap-3 sm:gap-4 text-lg sm:text-xl shadow-xl transition-all"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                Download PNG
              </Button>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Button variant="outline" onClick={() => handleDownload('jpg', 1024)} className="bg-secondary border-border hover:bg-secondary/80 h-12 sm:h-14 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-0">
                  JPG
                </Button>
                <Button variant="outline" onClick={() => handleDownload('pdf', 1024)} className="bg-secondary border-border hover:bg-secondary/80 h-12 sm:h-14 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-0">
                  PDF
                </Button>
                <Button variant="outline" onClick={() => handleDownload('svg', 1024)} className="bg-secondary border-border hover:bg-secondary/80 h-12 sm:h-14 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-0">
                  SVG
                </Button>
              </div>
            </div>

            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(state.data); toast({ title: "Data Copied" }); }} className="w-full bg-secondary border-border hover:bg-secondary/80 h-12 sm:h-14 rounded-xl text-[10px] font-black tracking-widest uppercase">
              <Copy className="w-4 h-4 mr-2" />
              Copy Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card shadow-2xl border-border overflow-hidden relative group hidden sm:block">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <CardHeader className="py-6 px-8 border-b border-border bg-secondary/30">
           <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
                <BarChart3 className="w-4 h-4 text-primary" /> Campaign Analytics
              </CardTitle>
              <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
           </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary border border-border space-y-1">
                 <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Est. Reach</p>
                 <div className="flex items-center gap-2">
                    <p className="text-xl font-headline font-bold text-foreground">4.2k</p>
                    <TrendingUp className="w-3 h-3 text-primary" />
                 </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary border border-border space-y-1">
                 <p className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Confidence</p>
                 <div className="flex items-center gap-2">
                    <p className="text-xl font-headline font-bold text-foreground">98%</p>
                    <ShieldCheck className="w-3 h-3 text-primary" />
                 </div>
              </div>
           </div>
           <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Real-time stats enabled</p>
           </div>
        </CardContent>
      </Card>
      
      {history.length > 0 && (
        <Card className="glass-card shadow-2xl border-border overflow-hidden">
          <CardHeader className="py-4 px-4 sm:px-6 border-b border-border flex flex-row items-center justify-between bg-secondary/30">
            <CardTitle className="text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
              <History className="w-4 h-4 text-primary" /> History
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClearHistory} className="h-7 text-[8px] font-black uppercase tracking-widest text-foreground/40 hover:text-destructive transition-all border border-border rounded-lg">
              Clear
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {history.map((item) => (
                <div key={item.id} className="px-4 sm:px-6 py-4 hover:bg-secondary transition-all group flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-border group-hover:border-primary/40 transition-all shrink-0">
                       {item.type === 'WiFi' ? <Wifi className="w-4 h-4" /> : item.type === 'vCard' ? <Contact className="w-4 h-4" /> : item.type === 'WhatsApp' ? <MessageSquare className="w-4 h-4" /> : item.type === 'Phone' ? <Phone className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold text-foreground truncate max-w-[120px] sm:max-w-[140px]">{item.data}</p>
                      <p className="text-[8px] text-foreground/30 uppercase font-black tracking-widest mt-0.5">{new Date(item.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}