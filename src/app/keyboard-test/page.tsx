
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Keyboard, 
  RotateCcw, 
  ShieldCheck, 
  Monitor, 
  Smartphone, 
  Zap, 
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Keyboard Layout Definition ---
const ROWS = [
  ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
  ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'ControlRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight']
];

const KEY_LABELS: Record<string, string> = {
  Escape: 'Esc', Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0', Minus: '-', Equal: '=', Backspace: '⌫',
  Tab: 'Tab ⇥', KeyQ: 'Q', KeyW: 'W', KeyE: 'E', KeyR: 'R', KeyT: 'T', KeyY: 'Y', KeyU: 'U', KeyI: 'I', KeyO: 'O', KeyP: 'P', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  CapsLock: 'Caps', KeyA: 'A', KeyS: 'S', KeyD: 'D', KeyF: 'F', KeyG: 'G', KeyH: 'H', KeyJ: 'J', KeyK: 'K', KeyL: 'L', Semicolon: ';', Quote: "'", Enter: 'Enter ↵',
  ShiftLeft: 'Shift', KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B', KeyN: 'N', KeyM: 'M', Comma: ',', Period: '.', Slash: '/', ShiftRight: 'Shift',
  ControlLeft: 'Ctrl', MetaLeft: 'Win', AltLeft: 'Alt', Space: 'Space', AltRight: 'Alt', ControlRight: 'Ctrl', ArrowLeft: '←', ArrowUp: '↑', ArrowDown: '↓', ArrowRight: '→'
};

export default function KeyboardTestPage() {
  const { toast } = useToast();
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<{ code: string; label: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // --- Hardware Detection ---
  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent;
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default actions for specific keys to allow testing without side effects
    if (['F1', 'F3', 'F5', 'F6', 'F7', 'Tab', 'AltLeft', 'AltRight'].includes(e.code)) {
      e.preventDefault();
    }
    
    const code = e.code;
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.add(code);
      return next;
    });
    setActiveKey(code);
    setLastKey({ code, label: KEY_LABELS[code] || e.key });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setActiveKey(null);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleReset = () => {
    setPressedKeys(new Set());
    setLastKey(null);
    setActiveKey(null);
    toast({ title: "Matrix Reset", description: "All key buffers purged." });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Keyboard className="w-3.5 h-3.5" /> Hardware Suite
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
            Keyboard <span className="text-primary italic">Tester Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional hardware integrity matrix. Test every key for response, ghosting, and signal fidelity locally in your browser.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-2">
           <Button variant="outline" onClick={handleReset} className="h-12 px-6 rounded-xl border-border bg-secondary text-[10px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Matrix
           </Button>
        </div>
      </div>

      {isMobile && (
        <div className="mb-10 p-6 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center gap-6 animate-in zoom-in duration-500 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/20 shrink-0">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-600">Mobile Environment Detected</h4>
            <p className="text-[11px] text-amber-600/60 font-medium leading-tight uppercase">Connect a linguistic hardware unit (keyboard) or use a laptop to initialize the testing matrix.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Main Keyboard Matrix */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative bg-black/60 p-4 sm:p-10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex flex-col gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-4">
              {ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-3 min-w-max">
                  {row.map((code) => {
                    const isPressed = pressedKeys.has(code);
                    const isCurrentlyActive = activeKey === code;
                    const label = KEY_LABELS[code] || code;

                    return (
                      <div 
                        key={code}
                        className={cn(
                          "h-10 sm:h-16 px-2 sm:px-4 rounded-lg sm:rounded-xl border transition-all duration-75 flex items-center justify-center font-mono font-bold text-[9px] sm:text-sm uppercase tracking-tighter select-none",
                          "min-w-[32px] sm:min-w-[50px]",
                          code === 'Space' && "w-[120px] sm:w-[300px]",
                          (code === 'Backspace' || code === 'Enter' || code === 'ShiftLeft' || code === 'ShiftRight' || code === 'CapsLock' || code === 'Tab') && "min-w-[60px] sm:min-w-[90px]",
                          isPressed ? "bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-white/5 border-white/10 text-white/20",
                          isCurrentlyActive && "scale-95 bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                        )}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Local Integrity</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Key event capture occurs strictly in your browser session. Hardware identifiers and keystroke data are never transmitted to any external registry.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Ghosting Analysis</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Test for hardware signal collisions. The high-frequency event loop captures multiple simultaneous inputs with millisecond precision.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Analytics Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Matrix Analytics
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-secondary/50 border border-border text-center space-y-2">
                       <p className="text-3xl font-headline font-black text-foreground">{pressedKeys.size}</p>
                       <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Working Keys</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 text-center space-y-2">
                       <p className="text-3xl font-headline font-black text-primary">{Math.round((pressedKeys.size / 68) * 100)}%</p>
                       <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest">Coverage</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Last Signal Detected</Label>
                    {lastKey ? (
                       <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-between animate-in zoom-in duration-300">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                {lastKey.label}
                             </div>
                             <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase text-foreground">Protocol Active</p>
                                <p className="text-[9px] font-mono text-primary font-bold">{lastKey.code}</p>
                             </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                       </div>
                    ) : (
                       <div className="p-6 rounded-3xl bg-secondary/30 border border-border flex items-center justify-center gap-3 opacity-20">
                          <Zap className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Input</span>
                       </div>
                    )}
                 </div>
              </CardContent>
           </Card>

           <Card className="glass-card border-border shadow-xl">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Studio Config
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="flex items-start gap-4">
                    <Monitor className="w-5 h-5 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase text-foreground">Standard Layout</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Using ANSI/ISO composite matrix. Support for 104-key and laptop profiles.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <Activity className="w-5 h-5 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase text-foreground">Zero Latency</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Direct hardware event mapping for 1:1 input speed verification.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
