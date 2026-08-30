"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Maximize2, 
  Zap, 
  Info,
  Layers,
  Scale,
  Thermometer,
  Maximize,
  Droplets,
  Wind,
  Clock,
  Database,
  Gauge,
  Activity,
  Zap as PowerIcon,
  Shapes,
  Type,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  RefreshCcw,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Conversion Registry ---

type CategoryId = 'length' | 'weight' | 'temp' | 'area' | 'volume' | 'speed' | 'time' | 'data' | 'pressure' | 'energy' | 'power' | 'angle';

interface Unit {
  id: string;
  label: string;
  factor: number; // relative to base
  base?: boolean;
}

const CATEGORIES: { id: CategoryId; label: string; icon: any }[] = [
  { id: 'length', label: 'Length', icon: Maximize },
  { id: 'weight', label: 'Weight', icon: Scale },
  { id: 'temp', label: 'Temp', icon: Thermometer },
  { id: 'area', label: 'Area', icon: LayoutGrid },
  { id: 'volume', label: 'Volume', icon: Droplets },
  { id: 'speed', label: 'Speed', icon: Wind },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'pressure', label: 'Pressure', icon: Gauge },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'power', label: 'Power', icon: PowerIcon },
  { id: 'angle', label: 'Angle', icon: Shapes },
];

const UNIT_MATRIX: Record<CategoryId, Unit[]> = {
  length: [
    { id: 'mm', label: 'Millimeter (mm)', factor: 0.001 },
    { id: 'cm', label: 'Centimeter (cm)', factor: 0.01 },
    { id: 'm', label: 'Meter (m)', factor: 1, base: true },
    { id: 'km', label: 'Kilometer (km)', factor: 1000 },
    { id: 'in', label: 'Inch (in)', factor: 0.0254 },
    { id: 'ft', label: 'Foot (ft)', factor: 0.3048 },
    { id: 'yd', label: 'Yard (yd)', factor: 0.9144 },
    { id: 'mi', label: 'Mile (mi)', factor: 1609.34 },
  ],
  weight: [
    { id: 'mg', label: 'Milligram (mg)', factor: 0.000001 },
    { id: 'g', label: 'Gram (g)', factor: 0.001 },
    { id: 'kg', label: 'Kilogram (kg)', factor: 1, base: true },
    { id: 'ton', label: 'Metric Ton (t)', factor: 1000 },
    { id: 'oz', label: 'Ounce (oz)', factor: 0.0283495 },
    { id: 'lb', label: 'Pound (lb)', factor: 0.453592 },
  ],
  temp: [
    { id: 'c', label: 'Celsius (°C)', factor: 1, base: true },
    { id: 'f', label: 'Fahrenheit (°F)', factor: 1 },
    { id: 'k', label: 'Kelvin (K)', factor: 1 },
  ],
  area: [
    { id: 'mm2', label: 'Sq Millimeter', factor: 0.000001 },
    { id: 'cm2', label: 'Sq Centimeter', factor: 0.0001 },
    { id: 'm2', label: 'Sq Meter (m²)', factor: 1, base: true },
    { id: 'km2', label: 'Sq Kilometer', factor: 1000000 },
    { id: 'ft2', label: 'Sq Foot', factor: 0.092903 },
    { id: 'ac', label: 'Acre (ac)', factor: 4046.86 },
    { id: 'ha', label: 'Hectare (ha)', factor: 10000 },
  ],
  volume: [
    { id: 'ml', label: 'Milliliter (ml)', factor: 0.001 },
    { id: 'l', label: 'Liter (L)', factor: 1, base: true },
    { id: 'm3', label: 'Cubic Meter', factor: 1000 },
    { id: 'tsp', label: 'Teaspoon', factor: 0.00492892 },
    { id: 'tbsp', label: 'Tablespoon', factor: 0.0147868 },
    { id: 'cup', label: 'Cup', factor: 0.24 },
    { id: 'pt', label: 'Pint', factor: 0.473176 },
    { id: 'gal', label: 'Gallon (gal)', factor: 3.78541 },
  ],
  speed: [
    { id: 'ms', label: 'Meter/Sec (m/s)', factor: 1, base: true },
    { id: 'kmh', label: 'Km/Hour (km/h)', factor: 0.277778 },
    { id: 'mph', label: 'Miles/Hour (mph)', factor: 0.44704 },
    { id: 'knot', label: 'Knot (kn)', factor: 0.514444 },
  ],
  time: [
    { id: 'sec', label: 'Second (s)', factor: 1, base: true },
    { id: 'min', label: 'Minute (m)', factor: 60 },
    { id: 'hour', label: 'Hour (h)', factor: 3600 },
    { id: 'day', label: 'Day (d)', factor: 86400 },
    { id: 'week', label: 'Week (w)', factor: 604800 },
  ],
  data: [
    { id: 'bit', label: 'Bit (b)', factor: 0.125 },
    { id: 'byte', label: 'Byte (B)', factor: 1, base: true },
    { id: 'kb', label: 'Kilobyte (KB)', factor: 1024 },
    { id: 'mb', label: 'Megabyte (MB)', factor: 1048576 },
    { id: 'gb', label: 'Gigabyte (GB)', factor: 1073741824 },
    { id: 'tb', label: 'Terabyte (TB)', factor: 1099511627776 },
  ],
  pressure: [
    { id: 'pa', label: 'Pascal (Pa)', factor: 1, base: true },
    { id: 'bar', label: 'Bar', factor: 100000 },
    { id: 'psi', label: 'PSI', factor: 6894.76 },
    { id: 'atm', label: 'Atmosphere (atm)', factor: 101325 },
  ],
  energy: [
    { id: 'j', label: 'Joule (J)', factor: 1, base: true },
    { id: 'kj', label: 'Kilojoule (kJ)', factor: 1000 },
    { id: 'cal', label: 'Calorie (cal)', factor: 4.184 },
    { id: 'kcal', label: 'Kilocalorie (kcal)', factor: 4184 },
    { id: 'wh', label: 'Watt-hour (Wh)', factor: 3600 },
    { id: 'kwh', label: 'Kilowatt-hour (kWh)', factor: 3600000 },
  ],
  power: [
    { id: 'w', label: 'Watt (W)', factor: 1, base: true },
    { id: 'kw', label: 'Kilowatt (kW)', factor: 1000 },
    { id: 'hp', label: 'Horsepower (hp)', factor: 745.7 },
  ],
  angle: [
    { id: 'deg', label: 'Degree (°)', factor: 1, base: true },
    { id: 'rad', label: 'Radian (rad)', factor: 57.2958 },
  ]
};

const QUICK_LINKS: Record<CategoryId, { from: string, to: string, label: string }[]> = {
  length: [
    { from: 'cm', to: 'in', label: 'CM to Inch' },
    { from: 'm', to: 'ft', label: 'Meter to Feet' },
    { from: 'km', to: 'mi', label: 'KM to Mile' },
  ],
  weight: [
    { from: 'kg', to: 'lb', label: 'KG to Pound' },
    { from: 'g', to: 'oz', label: 'Gram to Ounce' },
  ],
  temp: [
    { from: 'c', to: 'f', label: 'C to F' },
    { from: 'f', to: 'c', label: 'F to C' },
  ],
  area: [
    { from: 'm2', to: 'ac', label: 'M² to Acre' },
    { from: 'ha', to: 'ac', label: 'Hectare to Acre' },
  ],
  volume: [
    { from: 'l', to: 'gal', label: 'Liter to Gallon' },
    { from: 'ml', to: 'cup', label: 'ML to Cup' },
  ],
  speed: [
    { from: 'kmh', to: 'mph', label: 'Km/h to MPH' },
  ],
  time: [
    { from: 'hour', to: 'min', label: 'Hour to Min' },
  ],
  data: [
    { from: 'gb', to: 'mb', label: 'GB to MB' },
    { from: 'tb', to: 'gb', label: 'TB to GB' },
  ],
  pressure: [
    { from: 'bar', to: 'psi', label: 'Bar to PSI' },
  ],
  energy: [
    { from: 'kcal', to: 'kj', label: 'Kcal to kJ' },
  ],
  power: [
    { from: 'kw', to: 'hp', label: 'kW to HP' },
  ],
  angle: [
    { from: 'deg', to: 'rad', label: 'Deg to Rad' },
  ]
};

export default function AllUnitsConverterPage() {
  const { toast } = useToast();
  
  // Studio State
  const [activeCategory, setActiveCategory] = useState<CategoryId>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('cm');
  const [precision, setPrecision] = useState(2);
  const [isCopied, setIsCopied] = useState(false);

  // Sync from/to when category changes
  useEffect(() => {
    const list = UNIT_MATRIX[activeCategory];
    setFromUnit(list[0].id);
    setToUnit(list[1]?.id || list[0].id);
  }, [activeCategory]);

  // --- Logic Matrix ---
  const conversionResult = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return null;

    const units = UNIT_MATRIX[activeCategory];
    const from = units.find(u => u.id === fromUnit);
    const to = units.find(u => u.id === toUnit);

    if (!from || !to) return null;

    // Special Case: Temperature
    if (activeCategory === 'temp') {
      let celsius = val;
      if (fromUnit === 'f') celsius = (val - 32) * 5/9;
      if (fromUnit === 'k') celsius = val - 273.15;

      let result = celsius;
      if (toUnit === 'f') result = (celsius * 9/5) + 32;
      if (toUnit === 'k') result = celsius + 273.15;
      
      return result;
    }

    // Standard Multiplier logic
    const baseValue = val * from.factor;
    return baseValue / to.factor;
  }, [inputValue, fromUnit, toUnit, activeCategory]);

  const formulaHint = useMemo(() => {
    if (activeCategory === 'temp') return null;
    const units = UNIT_MATRIX[activeCategory];
    const from = units.find(u => u.id === fromUnit);
    const to = units.find(u => u.id === toUnit);
    if (!from || !to) return null;
    const rate = from.factor / to.factor;
    return `Protocol: Multiply by ${rate < 0.0001 ? rate.toExponential(4) : rate.toFixed(6)}`;
  }, [fromUnit, toUnit, activeCategory]);

  // --- Actions ---
  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    toast({ title: "Matrix Inverted" });
  };

  const handleCopy = () => {
    if (conversionResult === null) return;
    const text = `${inputValue} ${fromUnit} = ${conversionResult.toFixed(precision)} ${toUnit}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({ title: "Result Copied" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setInputValue('');
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Activity className="w-3.5 h-3.5" /> Intelligence Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="min-w-0">
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                All Units <span className="text-primary italic">Converter</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional universal measurement matrix. Translate any linguistic or numeric unit across 12 distinct categories locally with 1:1 precision fidelity.
              </p>
           </div>
           <div className="flex items-center gap-3 shrink-0 pb-2">
              <GetHelp toolId="all-units-converter" />
              <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Category & Input */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           {/* Category Selection */}
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
              <CardHeader className="py-6 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Layers className="w-5 h-5 text-primary" /> Dimension Matrix
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all h-24",
                          activeCategory === cat.id ? "bg-primary text-white border-primary shadow-xl scale-105" : "bg-secondary/50 border-border text-foreground/40 hover:text-primary"
                        )}
                      >
                         <cat.icon className="w-5 h-5" />
                         <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                      </button>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* Input Configuration */}
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Calibration Node
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Input Value</Label>
                    <div className="relative group/input">
                       <Input 
                        type="number"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        className="h-16 bg-secondary border-border rounded-2xl text-2xl font-bold px-6 text-center focus:ring-primary/40"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                          <Zap className="w-6 h-6 text-primary" />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-end">
                    <div className="space-y-3">
                       <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">From Unit</Label>
                       <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {UNIT_MATRIX[activeCategory].map(u => (
                               <SelectItem key={u.id} value={u.id} className="text-[10px] font-black uppercase tracking-widest">{u.label}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>

                    <Button variant="outline" size="icon" onClick={handleSwap} className="h-12 w-12 rounded-xl bg-background border-border hover:text-primary transition-all active:rotate-180 duration-500">
                       <ArrowRightLeft className="w-5 h-5" />
                    </Button>

                    <div className="space-y-3">
                       <Label className="text-[9px] font-black text-foreground/30 uppercase ml-1">To Unit</Label>
                       <Select value={toUnit} onValueChange={setToUnit}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border rounded-xl font-bold uppercase text-[10px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card">
                             {UNIT_MATRIX[activeCategory].map(u => (
                               <SelectItem key={u.id} value={u.id} className="text-[10px] font-black uppercase tracking-widest">{u.label}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Precision Protocol</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {[2, 4, 6].map(p => (
                         <button
                           key={p}
                           onClick={() => setPrecision(p)}
                           className={cn(
                             "h-10 rounded-xl border text-[9px] font-black uppercase transition-all",
                             precision === p ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 border-border text-foreground/40 hover:text-primary"
                           )}
                         >
                            {p} Decimals
                         </button>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Result Matrix */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Output</CardTitle>
                 </div>
                 {conversionResult !== null && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">CALCULATED</Badge>
                 )}
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {conversionResult === null ? (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <RefreshCcw className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Linguistic Signal</p>
                   </div>
                 ) : (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-4">
                         <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.6em]">Validated Result</p>
                         <h2 className="text-5xl sm:text-7xl font-headline font-black text-foreground break-all leading-none">
                           {conversionResult.toLocaleString(undefined, { maximumFractionDigits: precision })}
                         </h2>
                         <p className="text-2xl font-headline font-bold text-primary uppercase tracking-[0.2em]">
                           {UNIT_MATRIX[activeCategory].find(u => u.id === toUnit)?.label.split('(')[0]}
                         </p>
                      </div>

                      <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-center justify-center gap-6 shadow-inner group/res relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover/res:opacity-100 transition-opacity" />
                         <span className="text-xl font-headline font-black text-foreground/40">{inputValue} {fromUnit}</span>
                         <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                         <span className="text-xl font-headline font-black text-foreground">{conversionResult.toFixed(precision)} {toUnit}</span>
                      </div>

                      {formulaHint && (
                        <div className="text-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">{formulaHint}</p>
                        </div>
                      )}

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button onClick={handleCopy} className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            {isCopied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />} 
                            Copy Matrix
                         </Button>
                         <Button variant="outline" onClick={() => handleDownload('txt')} className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-all">
                            <FileDown className="w-5 h-5" />
                         </Button>
                      </div>
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* Popular Shortcuts */}
           <div className="space-y-4">
              <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Quick Access Matrix</Label>
              <div className="flex flex-wrap gap-2">
                 {(QUICK_LINKS[activeCategory] || []).map((link, i) => (
                    <button
                      key={i}
                      onClick={() => { setFromUnit(link.from); setToUnit(link.to); toast({ title: "Profile Synced" }); }}
                      className="px-6 py-3 rounded-2xl bg-secondary/50 border border-border text-[9px] font-black uppercase tracking-widest text-foreground/60 hover:text-primary hover:border-primary/20 transition-all flex items-center gap-2 group"
                    >
                       {link.label} <ChevronRight className="w-3 h-3 opacity-20 group-hover:translate-x-1 transition-all" />
                    </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    All conversion payloads are processed strictly in local browser memory. Hardware identifiers are never transmitted or logged.
                  </p>
                </div>
             </div>
             <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Formula Integrity</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Utilizing 1:1 standardized SI and Imperial multipliers to ensure clinical accuracy across all scientific measurement blocks.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

