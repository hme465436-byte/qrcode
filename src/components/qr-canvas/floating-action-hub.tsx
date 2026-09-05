"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Plus, 
  X, 
  Check, 
  Settings2, 
  QrCode, 
  Layers, 
  Type, 
  Eraser, 
  Image as ImageIcon,
  Zap,
  ShieldCheck,
  Search,
  FileCode,
  Languages,
  Smartphone,
  Hash,
  Database,
  Calculator,
  Lock,
  Box,
  FileArchive,
  Palette,
  Maximize2,
  ListFilter,
  MonitorPlay,
  RotateCcw,
  Bot,
  Globe,
  ArrowRightLeft,
  Mail,
  AlignLeft,
  Fingerprint,
  Binary,
  Stamp,
  Grid2X2,
  Film,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// --- Tool Registry for the Picker ---
const TOOL_MAP = [
  { id: 'single', label: 'Single QR', href: '/single', icon: QrCode },
  { id: 'bulk', label: 'Bulk QR', href: '/bulk', icon: Layers },
  { id: 'logo', label: 'Logo Maker', href: '/logo-maker', icon: Type },
  { id: 'ocr', label: 'Photo to Text', href: '/ocr', icon: FileCode },
  { id: 'bg-remove', label: 'BG Remove', href: '/background-remove', icon: Eraser },
  { id: 'img-to-link', label: 'Image to Link', href: '/image-to-link', icon: Globe },
  { id: 'password', label: 'Password Studio', href: '/password-generator', icon: Lock },
  { id: 'translate', label: 'Translate', href: '/translate', icon: Languages },
  { id: 'units', label: 'Units Converter', href: '/all-units-converter', icon: ArrowRightLeft },
  { id: 'fake-data', label: 'Fake Data', href: '/fake-data', icon: Database },
  { id: 'temp-mail', label: 'Temp Mail', href: '/temp-mail', icon: Mail },
  { id: 'speed', label: 'Speed Test', href: '/speed-test', icon: Zap },
  { id: 'ip', label: 'IP Finder', href: '/ip-finder', icon: Smartphone },
  { id: 'dns', label: 'DNS Lookup', href: '/dns-lookup', icon: Globe },
  { id: 'whois', label: 'Whois', href: '/domain-whois', icon: Search },
  { id: 'lorem', label: 'Lorem Ipsum', href: '/lorem-ipsum-generator', icon: AlignLeft },
  { id: 'hash', label: 'Hash Gen', href: '/hash-generator', icon: Fingerprint },
  { id: 'uuid', label: 'UUID Gen', href: '/uuid-generator', icon: Hash },
  { id: 'hex', label: 'Hex Converter', href: '/hex-converter', icon: FileCode },
  { id: 'aob', label: 'AOB Converter', href: '/code-converter', icon: Binary },
  { id: 'compress', label: 'Compressor', href: '/file-compressor', icon: FileArchive },
  { id: 'watermark', label: 'Watermark', href: '/custom-watermark', icon: Stamp },
  { id: 'drawing', label: 'Photo Editor', href: '/photo-editor', icon: ImageIcon },
  { id: 'collage', label: 'Collage Maker', href: '/collage-maker', icon: Grid2X2 },
  { id: 'gif', label: 'GIF Maker', href: '/images-to-gif', icon: Film },
  { id: 'dp', label: 'WA DP Maker', href: '/whatsapp-dp-maker', icon: User },
];

const STORAGE_KEY = 'mykit_fab_slots_v1';

export function FloatingActionHub() {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [showPicker, setShowAddPicker] = useState(false);
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  // --- 1. Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSlots(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  }, [slots]);

  // --- 2. Long Press Logic ---
  const handleStart = (e: any) => {
    isLongPressActive.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true;
      setIsOpen(true);
      window.navigator.vibrate?.(50); // Haptic feedback if supported
    }, 600);
  };

  const handleEnd = (e: any, isMain: boolean, slotId?: string | null, idx?: number) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    
    if (!isLongPressActive.current) {
      // Normal Click Logic
      if (isMain) {
        if (isOpen) setIsOpen(false);
        else router.push('/ai-chatbot');
      } else {
        if (slotId) {
          const tool = TOOL_MAP.find(t => t.id === slotId);
          if (tool) router.push(tool.href);
        } else {
          setActiveSlotIdx(idx ?? null);
          setShowAddPicker(true);
        }
      }
    }
  };

  const handleSlotLongPress = (idx: number) => {
    if (slots[idx]) {
      setDeleteConfirmIdx(idx);
      window.navigator.vibrate?.(50);
    }
  };

  const startSlotLongPress = (idx: number) => {
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true;
      handleSlotLongPress(idx);
    }, 600);
  };

  // --- 3. Management ---
  const pickTool = (toolId: string) => {
    if (activeSlotIdx !== null) {
      const next = [...slots];
      next[activeSlotIdx] = toolId;
      setSlots(next);
      setShowAddPicker(false);
      setSearchQuery('');
      toast({ title: "Slot Mapped", description: "Tool identity saved to hardware memory." });
    }
  };

  const removeTool = (idx: number) => {
    const next = [...slots];
    next[idx] = null;
    setSlots(next);
    setDeleteConfirmIdx(null);
    toast({ title: "Slot Purged" });
  };

  const filteredTools = useMemo(() => {
    return TOOL_MAP.filter(t => 
      t.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getToolIcon = (id: string | null) => {
    if (!id) return <Plus className="w-5 h-5" />;
    const tool = TOOL_MAP.find(t => t.id === id);
    if (!tool) return <Plus className="w-5 h-5" />;
    return <tool.icon className="w-5 h-5" />;
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* SLOTS MATRIX */}
        <div className={cn(
          "flex flex-col-reverse items-center gap-3 transition-all duration-500 ease-out",
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"
        )}>
          {slots.map((s, i) => (
            <div key={i} className="relative group/slot">
              <button
                onMouseDown={handleStart}
                onMouseUp={(e) => handleEnd(e, false, s, i)}
                onTouchStart={() => startSlotLongPress(i)}
                onTouchEnd={(e) => handleEnd(e, false, s, i)}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl border active:scale-90",
                  s ? "bg-white dark:bg-card border-white/10 text-primary" : "bg-white/10 backdrop-blur-xl border-dashed border-white/20 text-white/20 hover:border-primary/40 hover:text-primary"
                )}
              >
                {getToolIcon(s)}
              </button>

              {/* Delete Overlay */}
              {deleteConfirmIdx === i && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-1.5 z-10 animate-in zoom-in duration-200">
                   <button onClick={() => removeTool(i)} className="p-1 text-emerald-500 hover:scale-125 transition-transform"><Check className="w-4 h-4" /></button>
                   <button onClick={() => setDeleteConfirmIdx(null)} className="p-1 text-red-500 hover:scale-125 transition-transform"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MAIN FAB */}
        <div className="relative">
           <button
             onMouseDown={handleStart}
             onMouseUp={(e) => handleEnd(e, true)}
             onTouchStart={handleStart}
             onTouchEnd={(e) => handleEnd(e, true)}
             className={cn(
               "w-14 h-14 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 shadow-[0_20px_50px_rgba(37,99,235,0.4)] active:scale-95 group/main overflow-hidden",
               isOpen ? "bg-white text-black rotate-45" : "bg-primary text-white"
             )}
           >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/main:opacity-100 transition-opacity" />
             {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7 icon-3d" />}
           </button>
           
           {!isOpen && (
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0a0c] animate-pulse" />
           )}
        </div>
      </div>

      {/* TOOL PICKER MODAL */}
      <Dialog open={showPicker} onOpenChange={setShowAddPicker}>
         <DialogContent className="glass-card border-white/20 p-0 overflow-hidden max-w-xl">
            <DialogHeader className="p-6 border-b border-white/5 bg-secondary/30">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                     <Settings2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                     <DialogTitle className="text-xl font-headline font-black uppercase tracking-tight text-white">Map Workspace</DialogTitle>
                     <DialogDescription className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">Select unit for hardware slot 0{activeSlotIdx! + 1}</DialogDescription>
                  </div>
               </div>
            </DialogHeader>
            
            <div className="p-4 border-b border-white/5">
               <div className="relative group/search">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within/search:text-primary transition-colors" />
                  <Input 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search studio registry..."
                    className="h-12 pl-11 bg-secondary/50 border-white/5 text-xs font-bold uppercase rounded-xl"
                  />
               </div>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar bg-black/20">
               {filteredTools.map(t => (
                 <button
                   key={t.id}
                   onClick={() => pickTool(t.id)}
                   className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group/item flex flex-col gap-3"
                 >
                    <div className="w-8 h-8 rounded-lg bg-background border border-white/5 flex items-center justify-center text-primary/40 group-hover/item:text-primary transition-colors">
                       <t.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 group-hover/item:text-white">{t.label}</span>
                 </button>
               ))}
            </div>

            <div className="p-4 bg-secondary/30 border-t border-white/5 flex justify-center">
               <p className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground/10">Studio Registry v7.2</p>
            </div>
         </DialogContent>
      </Dialog>

      <style jsx global>{`
        .icon-3d { filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.2)); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
      `}</style>
    </>
  );
}
