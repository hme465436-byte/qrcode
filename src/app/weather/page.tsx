"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Search, 
  MapPin, 
  Calendar, 
  Thermometer, 
  Navigation, 
  RotateCcw,
  Activity,
  Zap,
  CheckCircle2,
  Globe,
  Loader2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CloudFog,
  CloudSnow,
  CloudDrizzle,
  AlertCircle,
  Clock,
  Navigation2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

// --- Weather Code Mapping (WMO Standard) ---
const decodeWeather = (code: number) => {
  if (code === 0) return { label: 'Clear Sky', icon: Sun, color: 'text-amber-400' };
  if (code <= 3) return { label: 'Partly Cloudy', icon: Cloud, color: 'text-blue-300' };
  if (code <= 48) return { label: 'Foggy', icon: CloudFog, color: 'text-slate-400' };
  if (code <= 57) return { label: 'Drizzle', icon: CloudDrizzle, color: 'text-sky-400' };
  if (code <= 67) return { label: 'Rain', icon: CloudRain, color: 'text-blue-500' };
  if (code <= 77) return { label: 'Snowfall', icon: CloudSnow, color: 'text-indigo-200' };
  if (code <= 82) return { label: 'Rain Showers', icon: CloudRain, color: 'text-blue-400' };
  if (code <= 86) return { label: 'Snow Showers', icon: CloudSnow, color: 'text-indigo-300' };
  if (code >= 95) return { label: 'Thunderstorm', icon: CloudLightning, color: 'text-purple-500' };
  return { label: 'Atmospheric Change', icon: Activity, color: 'text-foreground/40' };
};

interface CityResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  country_code: string;
}

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    code: number;
  };
  hourly: {
    time: string[];
    temp: number[];
    code: number[];
  };
  daily: {
    time: string[];
    max: number[];
    min: number[];
    code: number[];
  };
  city: string;
  location: string;
}

export default function WeatherPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setSelectedCity(null);
    setWeather(null);

    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        setError("Geocoding Matrix Error: No locations identified for this query.");
      } else {
        setSearchResults(data.results);
      }
    } catch (err) {
      setError("Uplink failure. Discovery node unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchForecast = async (city: CityResult) => {
    setIsLoading(true);
    setError(null);
    setSelectedCity(city);

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
      const data = await response.json();

      setWeather({
        current: {
          temp: data.current.temperature_2m,
          feelsLike: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m,
          code: data.current.weather_code
        },
        hourly: {
          time: data.hourly.time.slice(0, 12),
          temp: data.hourly.temperature_2m.slice(0, 12),
          code: data.hourly.weather_code.slice(0, 12)
        },
        daily: {
          time: data.daily.time,
          max: data.daily.temperature_2m_max,
          min: data.daily.temperature_2m_min,
          code: data.daily.weather_code
        },
        city: city.name,
        location: `${city.admin1 ? city.admin1 + ', ' : ''}${city.country}`
      });
      
      setSearchResults([]);
      toast({ title: "Atmosphere Isolated", description: `Forecast matrix active for ${city.name}.` });
    } catch (err) {
      setError("Atmospheric Retrieval Failure: Forecast nodes are restricted.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Geolocation not supported by this hardware." });
      return;
    }

    setIsLoading(true);
    setError(null);
    setWeather(null);
    setSearchResults([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get city name
          const revRes = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`);
          const revData = await revRes.json();
          
          const cityData: CityResult = revData.results?.[0] || {
            id: 0,
            name: "Current Location",
            country: "Local Node",
            latitude,
            longitude,
            country_code: "???"
          };

          fetchForecast(cityData);
        } catch (e) {
          fetchForecast({
            id: 0,
            name: "Current Location",
            country: "Local Node",
            latitude,
            longitude,
            country_code: "???"
          });
        }
      },
      (err) => {
        setIsLoading(false);
        setError("Location permission needed to initialize hardware sync.");
        toast({ variant: "destructive", title: "Access Denied", description: "Hardware location permissions required." });
      }
    );
  };

  const handleReset = () => {
    setQuery('');
    setSearchResults([]);
    setSelectedCity(null);
    setWeather(null);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  const refreshData = () => {
    if (selectedCity) fetchForecast(selectedCity);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Cloud className="w-3.5 h-3.5" /> Environmental Suite
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                Weather <span className="text-primary italic">Intelligence Studio</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional atmospheric diagnostic unit. Isolate global meteorological data with real-time telemetry, hourly sync, and 7-day projection matrices.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="weather" />
              {weather && (
                 <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-primary">
                    <RotateCcw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} /> Refresh
                 </Button>
              )}
              {(weather || selectedCity || query) && (
                <Button variant="outline" size="sm" onClick={handleReset} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                   <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="pb-8 border-b border-border bg-secondary/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                 <Search className="w-5 h-5 text-primary" /> Location Protocol
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">City Matrix</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Enter city name (e.g. Lahore, London)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCities()}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold text-center uppercase tracking-widest focus:ring-primary/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <Button 
                    onClick={fetchCities} 
                    disabled={isLoading || !query.trim()} 
                    className="h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                  >
                    {isLoading && query ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 mr-3" />}
                    Search City
                  </Button>
                  <Button 
                    onClick={handleMyLocation} 
                    disabled={isLoading}
                    variant="outline"
                    className="h-14 border-border bg-secondary hover:bg-white/5 text-foreground font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all"
                  >
                    {isLoading && !query ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation2 className="w-6 h-6 mr-3 text-primary" />}
                    My Location
                  </Button>
                </div>
              </div>

              {/* City Selection Matrix */}
              {searchResults.length > 0 && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Discovered Nodes</Label>
                  <div className="divide-y divide-white/5 bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                    {searchResults.map(city => (
                      <button 
                        key={city.id}
                        onClick={() => fetchForecast(city)}
                        className="w-full p-5 flex items-center justify-between group hover:bg-white/5 transition-all text-left"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-secondary border border-white/5 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors shrink-0 shadow-inner">
                               <MapPin className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm font-bold text-foreground truncate uppercase">{city.name}</p>
                               <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">{city.admin1 ? city.admin1 + ', ' : ''}{city.country}</p>
                            </div>
                         </div>
                         <ChevronRight className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Privacy Sovereign</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Environmental lookups are volatile and held strictly in local memory. The studio does not track or store your location history.
               </p>
             </div>
          </div>
        </div>

        {/* Results Panel - Right */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
          <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="py-8 border-b border-border bg-secondary/30">
              <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-3">
                <Activity className="w-4 h-4 fill-primary/20" /> Atmospheric Master
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 sm:p-10 flex flex-col gap-10 bg-black/10">
               {!weather && !isLoading && !error && (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                    <Cloud className="w-24 h-24 text-primary" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Location Signal</p>
                 </div>
               )}

               {isLoading && (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                    <div className="relative">
                       <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                       <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Atmospheric Buffer...</p>
                       <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Hardware Edge Synthesis</p>
                    </div>
                 </div>
               )}

               {weather && !isLoading && (
                 <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                    {/* Header: Large Temp */}
                    <div className="text-center space-y-6">
                       <div className="flex flex-col items-center gap-2">
                          <div className={cn("w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-4", decodeWeather(weather.current.code).color)}>
                             {React.createElement(decodeWeather(weather.current.code).icon, { className: "w-10 h-10" })}
                          </div>
                          <p className="text-[10px] font-black uppercase text-primary tracking-[0.6em]">{decodeWeather(weather.current.code).label}</p>
                       </div>
                       
                       <div className="relative inline-block">
                         <h2 className="text-7xl sm:text-9xl font-headline font-black text-foreground tracking-tighter leading-none">{Math.round(weather.current.temp)}°</h2>
                         <div className="absolute -top-4 -right-12 sm:-right-16 text-left">
                            <p className="text-[8px] sm:text-[10px] font-black uppercase text-foreground/20 tracking-widest">Feels Like</p>
                            <p className="text-lg sm:text-2xl font-black text-primary">{Math.round(weather.current.feelsLike)}°</p>
                         </div>
                       </div>
                       
                       <div className="space-y-1">
                          <h3 className="text-2xl font-headline font-black uppercase text-foreground">{weather.city}</h3>
                          <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{weather.location}</p>
                       </div>
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5">
                          <Droplets className="w-5 h-5 text-primary mt-1 shrink-0" />
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Humidity</p>
                             <p className="text-xl font-headline font-black text-foreground uppercase">{weather.current.humidity}%</p>
                          </div>
                       </div>
                       <div className="p-6 rounded-[2.5rem] bg-secondary/50 border border-border flex items-start gap-5">
                          <Wind className="w-5 h-5 text-primary mt-1 shrink-0" />
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Wind Flow</p>
                             <p className="text-xl font-headline font-black text-foreground uppercase">{weather.current.wind} <span className="text-[10px]">km/h</span></p>
                          </div>
                       </div>
                    </div>

                    {/* Hourly Scroll Matrix */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-3">
                             <Clock className="w-4 h-4 text-primary" />
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">12-Hour Telemetry</h4>
                          </div>
                          <span className="text-[8px] font-black text-primary uppercase animate-pulse">Sync Active</span>
                       </div>
                       <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4">
                          {weather.hourly.time.map((time, i) => {
                            const w = decodeWeather(weather.hourly.code[i]);
                            const date = new Date(time);
                            return (
                              <div key={i} className="min-w-[100px] p-5 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center gap-3 snap-start group hover:border-primary/20 transition-all">
                                 <span className="text-[8px] font-black uppercase text-white/20">{date.getHours().toString().padStart(2, '0')}:00</span>
                                 <div className={cn("w-8 h-8 rounded-lg bg-secondary flex items-center justify-center transition-transform group-hover:scale-110", w.color)}>
                                    {React.createElement(w.icon, { className: "w-4 h-4" })}
                                 </div>
                                 <span className="text-sm font-black text-foreground">{Math.round(weather.hourly.temp[i])}°</span>
                              </div>
                            );
                          })}
                       </div>
                    </div>

                    {/* 7-Day Projection */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3 px-1">
                          <Calendar className="w-4 h-4 text-primary" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">7-Day Projection Matrix</h4>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {weather.daily.time.map((time, idx) => {
                            const w = decodeWeather(weather.daily.code[idx]);
                            const isToday = idx === 0;
                            return (
                              <div key={idx} className={cn(
                                "p-6 rounded-[2.5rem] border flex flex-col items-center gap-4 hover:border-primary/20 transition-all group",
                                isToday ? "bg-primary/10 border-primary/20 shadow-xl" : "bg-white/5 border-white/5"
                              )}>
                                 <p className={cn("text-[9px] font-black uppercase", isToday ? "text-primary" : "text-foreground/40")}>
                                    {isToday ? 'Today' : new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                                 </p>
                                 <div className={cn("w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-transform group-hover:scale-110", w.color)}>
                                    <w.icon className="w-5 h-5" />
                                 </div>
                                 <div className="text-center space-y-0.5">
                                    <p className="text-lg font-headline font-black text-foreground">{Math.round(weather.daily.max[idx])}°</p>
                                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{Math.round(weather.daily.min[idx])}° LOW</p>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Navigation className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Precision Calibration</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Telemetry is sourced via the Open-Meteo edge network using verified GPS coordinates for high-fidelity regional accuracy.
               </p>
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
