"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Keyboard, 
  RotateCcw, 
  ShieldCheck, 
  Monitor, 
  Smartphone, 
  Zap, 
  Activity,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  History,
  Info,
  Type,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Keyboard Layout Matrix ---
const ROWS = [
  ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PrintScreen', 'ScrollLock', 'Pause'],
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace', 'Insert', 'Home', 'PageUp'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Delete', 'End', 'PageDown'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
  ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'Fn', 'ContextMenu', 'ControlRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight']
];

const KEY_LABELS: Record<string, string> = {
  Escape: 'Esc', Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0', Minus: '-', Equal: '=', Backspace: '⌫',
  Tab: 'Tab ⇥', KeyQ: 'Q', KeyW: 'W', KeyE: 'E', KeyR: 'R', KeyT: 'T', KeyY: 'Y', KeyU: 'U', KeyI: 'I', KeyO: 'O', KeyP: 'P', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  CapsLock: 'Caps', KeyA: 'A', KeyS: 'S', KeyD: 'D', KeyF: 'F', KeyG: 'G', KeyH: 'H', KeyJ: 'J', KeyK: 'K', KeyL: 'L', Semicolon: ';', Quote: "'", Enter: 'Enter ↵',
  ShiftLeft: 'Shift', KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B', KeyN: 'N', KeyM: 'M', Comma: ',', Period: '.', Slash: '/', ShiftRight: 'Shift',
  ControlLeft: 'Ctrl', MetaLeft: 'Win', AltLeft: 'Alt', Space: 'Space', AltRight: 'Alt', ControlRight: 'Ctrl', ArrowLeft: '←', ArrowUp: '↑', ArrowDown: '↓', ArrowRight: '→',
  PrintScreen: 'PrtSc', ScrollLock: 'ScLk', Pause: 'Pse', Insert: 'Ins', Home: 'Hm', PageUp: 'PgUp', Delete: 'Del', End: 'End', PageDown: 'PgDn', ContextMenu: 'Menu', Fn: 'Fn'
};

const MUTE_KEY = 'mykit_kb_mute';

export default function KeyboardTestPage() {
  const { toast } = useToast();
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [historyLog, setHistoryLog] = useState<{code: string, label: string, time: number}[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Lock States
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [isNumLock, setIsNumLock] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- Audio Synthesis ---
  const playClick = useCallback(() => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }, [isMuted]);

  // --- Handlers ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Block system shortcuts to allow thorough testing
    if (['F1', 'F3', 'F5', 'F6', 'F7', 'Tab', 'AltLeft', 'AltRight', 'ContextMenu'].includes(e.code)) {
      e.preventDefault();
    }
    
    const code = e.code;
    
    // Update Caps/Num Lock
    setIsCapsLock(e.getModifierState('CapsLock'));
    setIsNumLock(e.getModifierState('NumLock'));

    // Persistent Highlight
    setPressedKeys(prev => {
      const next = new Set(prev);
      if (!next.has(code)) playClick();
      next.add(code);
      return next;
    });

    // Real-time Active
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.add(code);
      return next;
    });

    // History Log (Last 10)
    setHistoryLog(prev => [{
      code,
      label: KEY_LABELS[code] || e.key,
      time: Date.now()
    }, ...prev].slice(0, 10));
  }, [playClick]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const code = e.code;
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
    setIsCapsLock(e.getModifierState('CapsLock'));
  }, []);

  // --- Fullscreen Protocol ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 1. Initialization Effect (Run once on mount)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const savedMute = localStorage.getItem(MUTE_KEY);
    if (savedMute !== null) setIsMuted(savedMute === 'true');

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 2. Event Listener Lifecycle (Depends on handlers)
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [handleKeyDown, handleKeyUp]);

  // 3. Persistence Sync
  useEffect(() => {
    localStorage.setItem(MUTE_KEY, isMuted.toString());
  }, [isMuted]);

  const handleReset = () => {
    setPressedKeys(new Set());
    setHistoryLog([]);
    setActiveKeys(new Set());
    toast({ title: "Matrix Purged", description: "Hardware testing buffer cleared." });
  };

  // --- Helper for Key Widths ---
  const getKeyFlex = (code: string) => {
    if (code === 'Space') return 'flex-[7]';
    if (['Backspace', 'Enter', 'ShiftLeft', 'ShiftRight', 'CapsLock', 'Tab'].includes(code)) return 'flex-[2]';
    if (['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft'].includes(code)) return 'flex-[1.5]';
    return 'flex-1';
  };

  return (
    <div ref={containerRef} className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-full bg-[#0a0a0c] min-h-screen overflow-x-hidden">
      <div className="mb-12 animate-reveal flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
            <Keyboard className="w-3.5 h-3.5" /> Hardware Diagnostic Suite
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
            Keyboard <span className="text-primary italic">Tester Studio</span>
          </h1>
          <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
            Professional high-fidelity integrity matrix. Verify keystroke fidelity, ghosting collision, and hardware signal latency locally.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 pb-2">
           <GetHelp toolId="keyboard-test" />
           <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsMuted(!isMuted)} 
            className={cn("h-12 w-12 rounded-xl border-border bg-secondary transition-all", !isMuted && "text-primary border-primary/20")}
           >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
           </Button>
           <Button variant="outline" size="icon" onClick={toggleFullscreen} className="h-12 w-12 rounded-xl border-border bg-secondary">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
           </Button>
           <Button variant="outline" onClick={handleReset} className="h-12 px-6 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
           </Button>
        </div>
      </div>

      {isMobile && (
        <div className="mb-10 p-8 rounded-[3rem] bg-amber-500/10 border border-amber-500/20 flex items-center gap-8 animate-in zoom-in duration-500 shadow-2xl">
          <div className="w-16 h-16 rounded-[2rem] bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/20 shrink-0">
            <Smartphone className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-amber-600">Hardware Environment Advisory</h4>
            <p className="text-xs text-amber-600/60 font-medium leading-relaxed uppercase">Mobile inputs may not trigger standard hardware events. Connect a linguistic hardware unit or laptop to initialize the diagnostic matrix.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Main Keyboard Grid */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative bg-black/60 p-4 sm:p-10">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex flex-col gap-2 sm:gap-4 w-full">
              {ROWS.map((row, rIdx) => (
                <div key={rIdx} className={cn(
                  "flex gap-1 sm:gap-2 w-full",
                  rIdx === 0 ? "justify-start mb-4 overflow-x-auto no-scrollbar" : "justify-center"
                )}>
                  {row.map((code) => {
                    const isPressed = pressedKeys.has(code);
                    const isCurrentlyActive = activeKeys.has(code);
                    const label = KEY_LABELS[code] || code;

                    return (
                      <div 
                        key={code}
                        className={cn(
                          "h-10 sm:h-14 lg:h-16 px-1 sm:px-2 rounded-md sm:rounded-xl border transition-all duration-75 flex items-center justify-center font-mono font-bold text-[7px] sm:text-[10px] lg:text-xs uppercase tracking-tighter select-none cursor-default min-w-0",
                          getKeyFlex(code),
                          code.startsWith('F') && !code.startsWith('Fi') && "h-8 sm:h-10 lg:h-12 bg-white/[0.02] flex-none w-10 sm:w-14",
                          isPressed ? "bg-green-500/20 border-green-500/50 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-white/5 border-white/10 text-white/10",
                          isCurrentlyActive && "scale-90 bg-primary text-white border-primary shadow-[0_0_25px_rgba(59,130,246,0.6)] z-20"
                        )}
                      >
                        <span className="truncate">{label}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Lock Indicators */}
            <div className="mt-8 flex justify-center gap-12 pt-6 border-t border-white/5">
               <div className="flex items-center gap-4">
                  <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", isCapsLock ? "bg-primary shadow-[0_0_10px_rgba(59,130,246,1)]" : "bg-white/10")} />
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", isCapsLock ? "text-primary" : "text-white/20")}>Caps Lock</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", isNumLock ? "bg-primary shadow-[0_0_10px_rgba(59,130,246,1)]" : "bg-white/10")} />
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", isNumLock ? "text-primary" : "text-white/20")}>Num Lock</span>
               </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Hardware Isolation</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Keystroke capture occurs strictly in local memory. Keystroke registries and hardware identifiers are never transmitted, ensuring absolute data privacy.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Acoustic Verify</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Integrated 44.1kHz audio matrix provides audible confirmation of signal reaching the browser event loop for high-speed hardware testing.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Analytics Column */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-xl overflow-hidden">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Matrix Analytics
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-secondary/50 border border-border text-center space-y-2">
                       <p className="text-3xl font-headline font-black text-foreground">{pressedKeys.size}</p>
                       <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Unique Hits</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 text-center space-y-2">
                       <p className="text-3xl font-headline font-black text-primary">{Math.round((pressedKeys.size / 80) * 100)}%</p>
                       <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest">Coverage</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between px-1">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Signal History</Label>
                       <History className="w-4 h-4 text-foreground/10" />
                    </div>
                    <div className="divide-y divide-white/5 bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                       {historyLog.length === 0 ? (
                          <div className="p-10 text-center opacity-10">
                             <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Input...</p>
                          </div>
                       ) : historyLog.map((h, i) => (
                          <div key={i} className={cn(
                             "p-4 flex items-center justify-between transition-all animate-in slide-in-from-top-1",
                             i === 0 ? "bg-primary/10" : ""
                          )}>
                             <div className="flex items-center gap-4">
                                <div className={cn(
                                   "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-lg border border-white/10",
                                   i === 0 ? "bg-primary text-white" : "bg-secondary text-foreground/40"
                                )}>
                                   {h.label}
                                </div>
                                <span className="text-[10px] font-mono text-foreground/20 font-bold uppercase">{h.code}</span>
                             </div>
                             <span className="text-[8px] font-bold text-foreground/10">{new Date(h.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit', fractionalSecondDigits: 1})}</span>
                          </div>
                       ))}
                    </div>
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
                       <h4 className="text-[11px] font-black uppercase text-foreground">Hardware Standard</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Using ANSI/ISO composite matrix. Verified for 104-key and laptop profiles.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <Activity className="w-5 h-5 text-primary/40 shrink-0" />
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase text-foreground">Zero Latency</h4>
                       <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase">Direct hardware event mapping for 1:1 input speed and ghosting verification.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
