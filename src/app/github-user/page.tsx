"use client"

import React, { useState } from 'react';
import { 
  Github, 
  Search, 
  User, 
  Building2, 
  MapPin, 
  BookOpen, 
  Users, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  Zap, 
  Activity,
  CheckCircle2,
  ArrowRight,
  RefreshCcw,
  RotateCcw,
  Globe,
  FileCode,
  Calendar,
  History,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { GetHelp } from '@/components/qr-canvas/get-help';

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  company: string | null;
  blog: string;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export default function GithubUserPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<GithubUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (target?: string) => {
    const query = target || username.trim();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setUser(null);

    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(query)}`);
      
      if (response.status === 404) {
        setError("Identity Not Found: This username does not exist in the GitHub registry.");
      } else if (!response.ok) {
        throw new Error("API Uplink restricted.");
      } else {
        const data = await response.json();
        setUser(data);
        toast({ title: "Identity Isolated", description: `Signal mapped for ${data.login}.` });
      }
    } catch (err) {
      setError("Matrix Retrieval Failure: Discovery nodes are unreachable.");
      toast({ variant: "destructive", title: "Protocol Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setUsername('');
    setUser(null);
    setError(null);
    toast({ title: "Studio Reset" });
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest mb-4">
          <Github className="w-3.5 h-3.5" /> Dev Intelligence
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h1 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tight">
                GitHub <span className="text-primary italic">Identity Finder</span>
              </h1>
              <p className="text-foreground/40 text-sm md:text-base font-medium mt-4 max-w-2xl leading-relaxed">
                Professional developer discovery engine. Isolate public profile metadata, repository density, and social reach locally via the GitHub REST protocol.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <GetHelp toolId="github-user" />
              {(user || error || username) && (
                <Button variant="outline" size="sm" onClick={handleClear} className="h-10 px-4 rounded-xl border-border bg-secondary text-[8px] font-black uppercase tracking-widest hover:text-destructive transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
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
                 <Search className="w-5 h-5 text-primary" /> Discovery Protocol
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Username Identifier</Label>
                <div className="relative group/input">
                  <Input 
                    placeholder="Enter GitHub handle (e.g. torvalds)..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUser()}
                    className="h-16 bg-secondary border-border rounded-2xl text-lg font-bold px-6 focus:ring-primary/40 uppercase"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Button 
                  onClick={() => fetchUser()} 
                  disabled={isLoading || !username.trim()}
                  className="h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RefreshCcw className="w-5 h-5 mr-2" />}
                  Execute Lookup
                </Button>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col min-h-[500px] bg-black/10">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader className="py-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Activity className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Identity Profile</CardTitle>
                 </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-8 sm:p-16 flex flex-col items-center justify-center relative overflow-hidden">
                 {!user && !isLoading && !error && (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6 py-20">
                      <Github className="w-24 h-24 text-primary" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Awaiting Discovery Signal</p>
                   </div>
                 )}

                 {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-20">
                      <div className="relative">
                         <div className="w-28 h-28 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                         <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Decoding Developer Matrix...</p>
                   </div>
                 )}

                 {user && !isLoading && (
                   <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                      {/* Profile Header */}
                      <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-12">
                         <div className="relative group/avatar shrink-0">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50 group-hover/avatar:opacity-100 transition-opacity" />
                            <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-[3rem] bg-secondary border-4 border-white dark:border-white/5 flex items-center justify-center shadow-2xl overflow-hidden ring-1 ring-border">
                               <img src={user.avatar_url} alt={user.login} className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-700" />
                            </div>
                         </div>
                         <div className="text-center md:text-left space-y-4 min-w-0 flex-1">
                            <div className="space-y-1">
                               <h2 className="text-4xl sm:text-5xl font-headline font-black text-foreground uppercase tracking-tighter leading-none truncate">{user.name || user.login}</h2>
                               <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">@{user.login}</p>
                            </div>
                            {user.bio && (
                              <p className="text-[13px] text-foreground/60 leading-relaxed font-medium">
                                {user.bio}
                              </p>
                            )}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                               <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">ID: {user.id}</Badge>
                               <div className="flex items-center gap-2 text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Joined {new Date(user.created_at).getFullYear()}
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Metrics Matrix */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {[
                           { icon: FileCode, label: 'Public Repos', val: user.public_repos },
                           { icon: Users, label: 'Followers', val: user.followers },
                           { icon: User, label: 'Following', val: user.following },
                           { icon: Building2, label: 'Organization', val: user.company || 'Autonomous' },
                           { icon: MapPin, label: 'Location Node', val: user.location || 'Distributed' },
                           { icon: Globe, label: 'Blog / Web', val: user.blog || 'None' },
                         ].map((item, i) => (
                           <div key={i} className="p-6 rounded-3xl bg-secondary/50 border border-border group hover:border-primary/20 transition-all flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary/40 group-hover:text-primary transition-all shadow-inner shrink-0">
                                 <item.icon className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                                 <p className="text-[13px] font-bold text-foreground truncate uppercase">{item.val}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                         <Button asChild className="h-16 flex-1 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            <a href={user.html_url} target="_blank" rel="noopener noreferrer">
                               <Github className="w-5 h-5 mr-1" /> Open Profile Master
                            </a>
                         </Button>
                         <Button onClick={() => { navigator.clipboard.writeText(user.html_url); toast({ title: "Identity Link Copied" }); }} variant="outline" className="h-16 px-10 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl">
                            <ArrowRight className="w-5 h-5 mr-2" /> Copy Link
                         </Button>
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
