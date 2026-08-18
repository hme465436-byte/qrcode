"use client"

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Scale, 
  Scaling, 
  Info, 
  CheckCircle2, 
  RotateCcw, 
  User, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  Heart,
  AlertCircle,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

export default function BmiCalculatorPage() {
  const { toast } = useToast();
  
  // Unit States
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  // Input States
  const [cm, setCm] = useState('170');
  const [ft, setFt] = useState('5');
  const [inches, setInches] = useState('7');
  const [weight, setWeight] = useState('70');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'none'>('none');

  // Logic Matrix
  const stats = useMemo(() => {
    let hCm = parseFloat(cm) || 0;
    if (heightUnit === 'ft') {
      const f = parseFloat(ft) || 0;
      const i = parseFloat(inches) || 0;
      hCm = (f * 12 + i) * 2.54;
    }

    let wKg = parseFloat(weight) || 0;
    if (weightUnit === 'lb') {
      wKg = wKg * 0.453592;
    }

    if (hCm <= 0 || wKg <= 0) return null;

    const heightM = hCm / 100;
    const bmi = wKg / (heightM * heightM);
    const bmiFixed = parseFloat(bmi.toFixed(1));

    // Category Matrix
    let category = 'Normal';
    let color = 'bg-emerald-500';
    let tip = 'You have a healthy body weight. Maintain a balanced diet and regular activity.';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'bg-blue-400';
      tip = 'Consider consulting a nutritionist to help reach a healthier weight range.';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      color = 'bg-yellow-500';
      tip = 'Small lifestyle changes like daily walking and reduced sugar can help.';
    } else if (bmi >= 30) {
      category = 'Obese';
      color = 'bg-red-500';
      tip = 'Maintaining a healthy weight is important for long-term heart health.';
    }

    // Healthy Range: 18.5 to 24.9
    const minW = 18.5 * (heightM * heightM);
    const maxW = 24.9 * (heightM * heightM);
    
    const healthyRange = weightUnit === 'kg' 
      ? `${minW.toFixed(1)}kg - ${maxW.toFixed(1)}kg`
      : `${(minW / 0.453592).toFixed(1)}lb - ${(maxW / 0.453592).toFixed(1)}lb`;

    return { 
      bmi: bmiFixed, 
      category, 
      color, 
      tip, 
      healthyRange,
      percent: Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100)) // Map 10-40 BMI to 0-100%
    };
  }, [cm, ft, inches, weight, heightUnit, weightUnit]);

  const handleReset = () => {
    setCm('170');
    setFt('5');
    setInches('7');
    setWeight('70');
    setAge('');
    setGender('none');
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-6xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Activity className="w-3.5 h-3.5" /> Biometric Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
              BMI <span className="text-primary italic">Calculator Studio</span>
            </h1>
            <p className="text-foreground/40 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">
              Professional health-metrics matrix. Determine body mass index and healthy weight targets locally using clinical WHO protocols.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <GetHelp toolId="bmi-calculator" />
             <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                <Scaling className="w-5 h-5 text-primary" /> Matrix Input
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-10">
              {/* Height Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Stature (Height)</Label>
                   <div className="flex bg-secondary p-1 rounded-lg border border-border h-8">
                      <button onClick={() => setHeightUnit('cm')} className={cn("px-3 rounded-md text-[8px] font-black uppercase transition-all", heightUnit === 'cm' ? "bg-primary text-white" : "text-foreground/30")}>CM</button>
                      <button onClick={() => setHeightUnit('ft')} className={cn("px-3 rounded-md text-[8px] font-black uppercase transition-all", heightUnit === 'ft' ? "bg-primary text-white" : "text-foreground/30")}>FT+IN</button>
                   </div>
                </div>
                {heightUnit === 'cm' ? (
                  <Input 
                    type="number" value={cm} onChange={e => setCm(e.target.value)} 
                    placeholder="Height in cm" 
                    className="h-16 bg-secondary/50 border-border rounded-2xl text-xl font-bold text-center" 
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Input type="number" value={ft} onChange={e => setFt(e.target.value)} className="h-16 bg-secondary/50 border-border rounded-2xl text-xl font-bold text-center pr-10" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20">FT</span>
                    </div>
                    <div className="relative">
                      <Input type="number" value={inches} onChange={e => setInches(e.target.value)} className="h-16 bg-secondary/50 border-border rounded-2xl text-xl font-bold text-center pr-10" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20">IN</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Mass (Weight)</Label>
                   <div className="flex bg-secondary p-1 rounded-lg border border-border h-8">
                      <button onClick={() => setWeightUnit('kg')} className={cn("px-3 rounded-md text-[8px] font-black uppercase transition-all", weightUnit === 'kg' ? "bg-primary text-white" : "text-foreground/30")}>KG</button>
                      <button onClick={() => setWeightUnit('lb')} className={cn("px-3 rounded-md text-[8px] font-black uppercase transition-all", weightUnit === 'lb' ? "bg-primary text-white" : "text-foreground/30")}>LB</button>
                   </div>
                </div>
                <div className="relative">
                  <Input 
                    type="number" value={weight} onChange={e => setWeight(e.target.value)} 
                    placeholder={`Weight in ${weightUnit}`} 
                    className="h-16 bg-secondary/50 border-border rounded-2xl text-xl font-bold text-center" 
                  />
                  <Scale className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/10" />
                </div>
              </div>

              {/* Extras */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                 <div className="space-y-3">
                    <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">Age (Years)</Label>
                    <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Optional" className="h-12 bg-secondary/30 border-border rounded-xl font-bold" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">Identity Gender</Label>
                    <div className="grid grid-cols-2 bg-secondary p-1 rounded-xl border border-border h-12">
                       <button onClick={() => setGender('male')} className={cn("rounded-lg text-[8px] font-black uppercase transition-all", gender === 'male' ? "bg-primary text-white" : "text-foreground/30")}>M</button>
                       <button onClick={() => setGender('female')} className={cn("rounded-lg text-[8px] font-black uppercase transition-all", gender === 'female' ? "bg-primary text-white" : "text-foreground/30")}>F</button>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">Privacy Absolute</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Your biometric data is processed entirely in your browser session. We do not store or transmit weight, height, or gender records.
               </p>
             </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                    <Zap className="w-4 h-4 fill-primary/20" /> Analysis Master
                 </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
                 {!stats ? (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                      <Activity className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Biometric Matrix</p>
                   </div>
                 ) : (
                   <div className="space-y-12 animate-in zoom-in duration-500">
                      {/* Large BMI Circle */}
                      <div className="flex flex-col items-center gap-6">
                         <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                               <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                               <circle 
                                cx="50%" cy="50%" r="45%" 
                                fill="transparent" 
                                stroke="currentColor" 
                                strokeWidth="12" 
                                strokeDasharray="283" 
                                strokeDashoffset={283 - (283 * stats.percent) / 100}
                                className={cn("transition-all duration-1000", stats.color.replace('bg-', 'text-'))} 
                               />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                               <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">Index Score</span>
                               <h2 className="text-6xl sm:text-8xl font-headline font-black text-foreground leading-none">{stats.bmi}</h2>
                            </div>
                         </div>
                         
                         <div className={cn(
                           "px-8 py-3 rounded-2xl border text-xl font-headline font-black uppercase tracking-widest shadow-xl transition-all",
                           stats.color.replace('bg-', 'bg-').replace('-500', '/10'),
                           stats.color.replace('bg-', 'text-'),
                           stats.color.replace('bg-', 'border-').replace('-500', '/20')
                         )}>
                            {stats.category}
                         </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-start gap-5">
                            <Heart className="w-6 h-6 text-primary mt-1 shrink-0" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Ideal Matrix Weight</p>
                               <p className="text-lg font-headline font-black text-foreground uppercase">{stats.healthyRange}</p>
                            </div>
                         </div>
                         <div className="p-6 rounded-[2rem] bg-secondary border border-border flex items-start gap-5">
                            <TrendingUp className="w-6 h-6 text-primary mt-1 shrink-0" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Clinical Protocol</p>
                               <p className="text-[10px] text-foreground/50 font-medium leading-relaxed uppercase">Score is based on weight-to-height quadratic synthesis for adults.</p>
                            </div>
                         </div>
                      </div>

                      {/* Tip Panel */}
                      <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="flex items-start gap-5 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shrink-0">
                               <Zap className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                               <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Studio Health Tip</h4>
                               <p className="text-[15px] font-medium text-foreground/70 leading-relaxed">{stats.tip}</p>
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-center">
                         <Button onClick={() => { navigator.clipboard.writeText(`BMI Score: ${stats.bmi} (${stats.category})\nHeight: ${heightUnit === 'cm' ? cm+'cm' : ft+'ft '+inches+'in'}`); toast({ title: "Results Copied" }); }} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary">
                            <Copy className="w-4 h-4 mr-2" /> Copy Full Matrix Data
                         </Button>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                 <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                 <p className="text-[10px] text-foreground/40 font-bold leading-relaxed uppercase">
                    BMI is a statistical screening protocol. It does not account for muscle density, bone structure, or specific regional biometric variations. Use as a general reference only.
                 </p>
              </div>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
