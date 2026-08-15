
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Baby, 
  Cake, 
  Calendar, 
  RotateCcw, 
  Sparkles, 
  Info,
  CheckCircle2,
  Clock,
  History,
  User,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AgeCalculatorPage() {
  const { toast } = useToast();
  const [dob, setDob] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Set default "as of" date to today on mount
    const today = new Date().toISOString().split('T')[0];
    setAsOfDate(today);
  }, []);

  const calculateAge = () => {
    if (!dob) {
      toast({ variant: "destructive", title: "Input Required", description: "Please provide a Date of Birth." });
      return;
    }

    const birthDate = new Date(dob);
    const referenceDate = asOfDate ? new Date(asOfDate) : new Date();

    if (birthDate > referenceDate) {
      setResult(null);
      toast({ 
        variant: "destructive", 
        title: "Matrix Error", 
        description: "Date of Birth cannot be in the future relative to the reference date." 
      });
      return;
    }

    // Age Calculation
    let years = referenceDate.getFullYear() - birthDate.getFullYear();
    let months = referenceDate.getMonth() - birthDate.getMonth();
    let days = referenceDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      // Get days in the previous month
      const prevMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Total Stats
    const diffMs = referenceDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalMonths = (years * 12) + months;

    // Next Birthday
    let nextBday = new Date(referenceDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBday < referenceDate) {
      nextBday.setFullYear(referenceDate.getFullYear() + 1);
    }
    const daysToBday = Math.ceil((nextBday.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      totalMonths,
      totalDays,
      daysToBday,
      isBirthday: daysToBday === 0 || daysToBday === 365
    });

    toast({ title: "Timeline Decoded", description: "Chronological matrix updated." });
  };

  const handleClear = () => {
    setDob('');
    const today = new Date().toISOString().split('T')[0];
    setAsOfDate(today);
    setResult(null);
    toast({ title: "Studio Reset", description: "All temporal data cleared." });
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Clock className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
          Age <span className="text-primary italic">Calculator Studio</span>
        </h1>
        <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl">
          Professional chronological analysis matrix. Determine exact age, total life statistics, and birthday countdowns with precision accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Pane */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-xl font-headline flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/40 shadow-inner group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                Temporal Protocol
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Date of Birth</Label>
                  <Input 
                    type="date" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold focus:ring-primary/40 px-6"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Reference Date (As of)</Label>
                  <Input 
                    type="date" 
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="h-14 bg-secondary border-border rounded-2xl text-lg font-bold focus:ring-primary/40 px-6"
                  />
                  <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3" /> Defaults to current hardware time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={calculateAge}
                  className="flex-[2] h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 group/btn"
                >
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Analyze Timeline
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 h-16 rounded-2xl border-border bg-secondary hover:bg-secondary/80 text-foreground/40 hover:text-destructive transition-all active:scale-95"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-5">
            <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-widest">Chronological Precision</h4>
              <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                Our engine utilizes the ISO-8601 calendar standard for all calculations. Processing occurs entirely within your browser memory for 100% data privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Results Pane */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Chronos Result
                </CardTitle>
                {result && (
                  <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">Calculated</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-10">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none p-12 text-center">
                  <Baby className="w-24 h-24 text-primary mb-6" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Temporal Data</p>
                </div>
              ) : (
                <div className="space-y-12 animate-in zoom-in duration-500">
                  {/* Primary Age Display */}
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl">
                           <User className="w-10 h-10" />
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em]">Calculated Identity</p>
                           <h2 className="text-5xl sm:text-7xl font-headline font-black text-foreground uppercase tracking-tighter">
                              {result.years} <span className="text-primary italic">Years</span>
                           </h2>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 text-xl sm:text-2xl font-headline font-bold text-foreground/50 uppercase">
                        <span>{result.months} Months</span>
                        <span className="text-primary/20">•</span>
                        <span>{result.days} Days</span>
                     </div>
                  </div>

                  {/* Birthday Countdown */}
                  <div className={cn(
                    "p-8 rounded-[2.5rem] relative overflow-hidden group/bday transition-all duration-500",
                    result.isBirthday ? "bg-primary text-primary-foreground shadow-primary/30 shadow-2xl" : "bg-secondary border border-border"
                  )}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover/bday:scale-150 transition-transform" />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="space-y-2">
                        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", result.isBirthday ? "text-white/60" : "text-foreground/30")}>
                          Anniversary Milestone
                        </p>
                        <h3 className="text-xl font-headline font-black uppercase tracking-tight">
                          {result.isBirthday ? "It's your birthday! 🎂" : `${result.daysToBday} Days until next birthday`}
                        </h3>
                      </div>
                      <Cake className={cn("w-10 h-10", result.isBirthday ? "text-white animate-bounce" : "text-primary/20")} />
                    </div>
                  </div>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-center gap-6 group hover:border-primary/20 transition-all">
                       <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                          <History className="w-6 h-6" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Total Months</p>
                          <p className="text-xl font-headline font-bold text-foreground">{result.totalMonths.toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-secondary/50 border border-border flex items-center gap-6 group hover:border-primary/20 transition-all">
                       <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all">
                          <CalendarDays className="w-6 h-6" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Total Days</p>
                          <p className="text-xl font-headline font-bold text-foreground">{result.totalDays.toLocaleString()}</p>
                       </div>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                     <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Timeline Summary</p>
                        <p className="text-[11px] text-foreground/50 leading-relaxed font-medium">
                          Based on a 365.25 day annual orbital cycle. You have experienced {result.totalDays.toLocaleString()} solar cycles since inception.
                        </p>
                     </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
