"use client"

import React, { useState } from 'react';
import { QRState } from '@/lib/qr-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Layers, 
  Download, 
  Loader2, 
  FileJson,
  Settings2,
  Archive,
  Palette,
  ClipboardType,
  Maximize,
  FileImage,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { QrStylingControls } from './qr-styling-controls';
import { QrBrandingControls } from './qr-branding-controls';
import { QrPresetsControls } from './qr-presets-controls';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

interface QrBulkSectionProps {
  state: QRState;
  updateState: (updates: Partial<QRState>) => void;
}

type ExportFormat = 'png' | 'jpg' | 'pdf';

export function QrBulkSection({ state, updateState }: QrBulkSectionProps) {
  const { toast } = useToast();
  const [bulkData, setBulkData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  const processMergedQr = async (data: string, format: ExportFormat, resolution: number = 1024): Promise<Blob> => {
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
        ctx.globalAlpha = state.backgroundOpacity;
        const scale = Math.max(resolution / bgImg.width, resolution / bgImg.height);
        const x = (resolution - bgImg.width * scale) / 2;
        const y = (resolution - bgImg.height * scale) / 2;
        ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        ctx.restore();
      } catch (e) {
        console.warn("Bulk background image failed", e);
      }
    }

    const isStylized = state.dotStyle !== 'square' || state.cornerStyle !== 'square';
    const errorLevel = (state.logo || state.backgroundImage || isStylized) ? 'H' : 'Q';
    
    const config = {
      width: resolution,
      height: resolution,
      data: data,
      image: state.logo || '',
      dotsOptions: { color: state.fgColor, type: state.dotStyle },
      cornersSquareOptions: { type: state.cornerStyle, color: state.fgColor },
      backgroundOptions: { color: 'rgba(0,0,0,0)' }, 
      imageOptions: { margin: 12, imageSize: state.logoSize, hideBackgroundDots: true, crossOrigin: 'anonymous' },
      qrOptions: { errorCorrectionLevel: errorLevel }
    };

    if (!(window as any).QRCodeStyling) {
      throw new Error("QR Styling engine not loaded");
    }
    const qrCode = new (window as any).QRCodeStyling(config);
    const qrBlob = await qrCode.getRawData('png');
    const qrImg = await loadImage(URL.createObjectURL(qrBlob));
    ctx.drawImage(qrImg, 0, 0, resolution, resolution);

    if (format === 'pdf') {
      const imgData = finalCanvas.toDataURL('image/jpeg', 1.0);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [resolution, resolution]
      });
      doc.addImage(imgData, 'JPEG', 0, 0, resolution, resolution);
      return doc.output('blob');
    }

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    return new Promise((resolve) => {
      finalCanvas.toBlob((blob) => resolve(blob!), mimeType, 1.0);
    });
  };

  const handleBulkGenerate = async () => {
    const lines = bulkData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      toast({ variant: "destructive", title: "Empty Payload", description: "Please enter at least one URL or text line." });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const zip = new JSZip();

    try {
      for (let i = 0; i < lines.length; i++) {
        const data = lines[i];
        const blob = await processMergedQr(data, exportFormat);
        const ext = exportFormat === 'pdf' ? 'pdf' : exportFormat === 'jpg' ? 'jpg' : 'png';
        const filename = `${data.substring(0, 20).replace(/[^a-z0-9]/gi, '_') || 'qr'}_${i + 1}.${ext}`;
        zip.file(filename, blob);
        setProgress(Math.round(((i + 1) / lines.length) * 100));
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `qrcanvas-bulk-${exportFormat}-${Date.now()}.zip`;
      link.click();

      toast({ title: "Bulk Export Complete", description: `Successfully bundled ${lines.length} high-res assets.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Bulk Render Failed", description: "An error occurred during batch generation." });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border-border space-y-3 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border">
            <ClipboardType className="w-5 h-5" />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">1. Batch Payload</h4>
          <p className="text-[11px] text-foreground/70 leading-relaxed font-medium">Paste your target list, one item per line.</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-border space-y-3 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border">
            <Palette className="w-5 h-5" />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">2. Auto Branding</h4>
          <p className="text-[11px] text-foreground/70 leading-relaxed font-medium">Active styles and imagery are injected automatically.</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-border space-y-3 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border">
            <Archive className="w-5 h-5" />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">3. Bundle Export</h4>
          <p className="text-[11px] text-foreground/70 leading-relaxed font-medium">Download all high-res assets in one organized ZIP.</p>
        </div>
      </div>

      <QrPresetsControls state={state} updateState={updateState} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <QrStylingControls state={state} updateState={updateState} />
        <QrBrandingControls state={state} updateState={updateState} />
      </div>

      <Card className="glass-card border-border shadow-2xl overflow-hidden">
        <CardHeader className="py-8 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner">
                <Layers className="w-6 h-6" />
              </div>
              Bulk Production Engine
            </CardTitle>
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[9px] font-black tracking-widest text-primary uppercase">Engine Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-[11px] font-black text-foreground/70 uppercase tracking-[0.2em]">Data Strings</Label>
                <p className="text-[10px] text-foreground/40 font-bold uppercase">One URL or text string per line</p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-secondary border border-border">
                <span className="text-[10px] font-mono text-primary font-black">{bulkData.split('\n').filter(l => l.trim()).length} Items</span>
              </div>
            </div>
            <Textarea 
              placeholder="https://brand-url-1.com&#10;https://brand-url-2.com&#10;https://brand-url-3.com"
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="min-h-[250px] bg-secondary border-border text-lg rounded-3xl focus:ring-primary/40 p-8 text-foreground leading-relaxed resize-none font-mono"
            />
          </div>

          <div className="p-8 rounded-[2rem] bg-secondary border border-border space-y-8 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            
            <div className="space-y-4">
              <Label className="text-[11px] font-black text-foreground/70 uppercase tracking-[0.2em]">Export Format</Label>
              <div className="flex gap-3">
                {(['png', 'jpg', 'pdf'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={cn(
                      "flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                      exportFormat === fmt 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                        : "bg-background border-border text-foreground/40 hover:text-foreground hover:bg-background/80"
                    )}
                  >
                    {fmt === 'png' || fmt === 'jpg' ? <FileImage className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 ring-1 ring-primary/40">
                <Settings2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">Studio Asset Sync</h4>
                <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                  Applying chromatic matrix and active brand imagery to the entire batch in {exportFormat.toUpperCase()} format.
                </p>
              </div>
            </div>
            
            {isProcessing && (
              <div className="space-y-3 animate-in fade-in duration-500">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Batch Rendering...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={handleBulkGenerate}
              disabled={isProcessing || !bulkData.trim()}
              className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Bundle {progress}%
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  Export {exportFormat.toUpperCase()} Bundle ZIP
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                <Maximize className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Master Production Quality</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">1024px assets with active brand backgrounds.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary border border-border group">
                <FileJson className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-foreground uppercase tracking-widest">Asset Sanitization</p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">Automatic file naming for efficient project organization.</p>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}