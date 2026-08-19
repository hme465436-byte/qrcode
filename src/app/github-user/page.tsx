
"use client"

import React, { useState, useCallback } from 'react';
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
  Trash2,
  Twitter,
  Link as LinkIcon,
  Star,
  GitFork,
  BookMarked
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

export default function GithubUserPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = async (login: string) => {
    setIsLoadingRepos(true);
    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}/repos?sort=updated&per_page=6`);
      if (response.ok) {
        const data = await response.json();
        setRepos(data);
      }
    } catch (err) {
      console.warn("Repository matrix retrieval failed.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const fetchUser = async (target?: string) => {
    const query = target || username.trim();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);

    try {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(query)}`);
      
      if (response.status === 404) {
        setError("Identity Not Found: This username does not exist in the GitHub registry.");
      } else if (!response.ok) {
        throw new Error("API Uplink restricted.");
      } else {
        const data = await response.json();
        setUser(data);
        fetchRepos(data.login);
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
    setRepos([]);
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
                  className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 active:scale-95 transition-all"
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

              {/* Identity Tips */}
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border space-y-4">
                 <div className="flex items-center gap-3 text-primary">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Studio Tip</span>
                 </div>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                    Profiles are retrieved via public REST nodes. Hardware-native memory isolation ensures search strings remain private to your session.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
           {isLoading ? (
             <Card className="glass-card border-border shadow-2xl p-10 space-y-10">
                <div className="flex items-center gap-8">
                   <Skeleton className="w-32 h-32 rounded-[2rem]" />
                   <div className="flex-1 space-y-3">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <Skeleton className="h-20 rounded-2xl" />
                   <Skeleton className="h-20 rounded-2xl" />
                   <Skeleton className="h-20 rounded-2xl" />
                </div>
                <div className="space-y-4">
                   <Skeleton className="h-40 rounded-[2.5rem]" />
                </div>
             </Card>
           ) : user ? (
             <div className="space-y-8 animate-in zoom-in-95 duration-500">
                {/* Profile Master Card */}
                <Card className="glass-card border-border shadow-2xl overflow-hidden relative flex flex-col bg-black/10">
                   <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                   <CardContent className="p-8 sm:p-12 space-y-12">
                      <div className="flex flex-col md:flex-row items-center gap-10">
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
                               <div className="flex items-center gap-2 text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Professional Matrix */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {[
                           { icon: Building2, label: 'Organization', val: user.company || 'Autonomous' },
                           { icon: MapPin, label: 'Location Node', val: user.location || 'Distributed' },
                           { icon: Globe, label: 'Web Blog', val: user.blog, isLink: true },
                           { icon: Twitter, label: 'Twitter Handle', val: user.twitter_username ? `@${user.twitter_username}` : null },
                         ].map((item, i) => item.val && (
                           <div key={i} className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center gap-5">
                              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary/40 shadow-inner shrink-0">
                                 <item.icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest mb-0.5">{item.label}</p>
                                 {item.isLink ? (
                                   <a href={item.val.startsWith('http') ? item.val : `https://${item.val}`} target="_blank" className="text-[11px] font-bold text-primary hover:underline truncate block uppercase">{item.val}</a>
                                 ) : (
                                   <h4 className="text-[11px] font-bold text-foreground truncate uppercase">{item.val}</h4>
                                 )}
                              </div>
                           </div>
                         ))}
                      </div>

                      {/* Stats Matrix */}
                      <div className="grid grid-cols-3 gap-4">
                         {[
                           { label: 'Repos', val: user.public_repos, icon: FileCode },
                           { label: 'Followers', val: user.followers, icon: Users },
                           { label: 'Following', val: user.following, icon: User },
                         ].map((s) => (
                           <div key={s.label} className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 text-center space-y-2 group hover:border-primary/30 transition-all">
                              <s.icon className="w-4 h-4 mx-auto text-primary/40 group-hover:text-primary transition-colors" />
                              <p className="text-2xl font-headline font-black text-foreground">{s.val}</p>
                              <p className="text-[8px] font-black uppercase text-foreground/30 tracking-widest">{s.label}</p>
                           </div>
                         ))}
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <Button asChild className="h-16 w-full bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                           <a href={user.html_url} target="_blank" rel="noopener noreferrer">
                              <Github className="w-5 h-5 mr-1" /> Open Profile Master <ExternalLink className="w-4 h-4 ml-1 opacity-20" />
                           </a>
                        </Button>
                      </div>
                   </CardContent>
                </Card>

                {/* Repositories Section */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                         <BookMarked className="w-4 h-4 text-primary" />
                         <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/40">Active Repository Matrix</h3>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">Recent Activity</Badge>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isLoadingRepos ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="glass-card p-6 space-y-4">
                             <Skeleton className="h-5 w-3/4" />
                             <Skeleton className="h-12 w-full" />
                          </Card>
                        ))
                      ) : repos.length > 0 ? (
                        repos.map((repo) => (
                          <a 
                            key={repo.id} 
                            href={repo.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group block"
                          >
                             <Card className="glass-card h-full p-6 border-border hover:border-primary/40 hover:bg-secondary/30 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <ArrowRight className="w-4 h-4 text-primary -rotate-45" />
                                </div>
                                <div className="space-y-4">
                                   <div className="space-y-1">
                                      <h4 className="text-sm font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{repo.name}</h4>
                                      {repo.language && (
                                        <div className="flex items-center gap-1.5">
                                           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                           <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{repo.language}</span>
                                        </div>
                                      )}
                                   </div>
                                   {repo.description && (
                                     <p className="text-[11px] text-foreground/40 leading-relaxed line-clamp-2 uppercase tracking-tighter">
                                        {repo.description}
                                     </p>
                                   )}
                                   <div className="flex items-center gap-6 pt-2">
                                      <div className="flex items-center gap-2 text-foreground/30">
                                         <Star className="w-3 h-3" />
                                         <span className="text-[10px] font-mono font-bold">{repo.stargazers_count}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-foreground/30">
                                         <GitFork className="w-3 h-3" />
                                         <span className="text-[10px] font-mono font-bold">{repo.forks_count}</span>
                                      </div>
                                   </div>
                                </div>
                             </Card>
                          </a>
                        ))
                      ) : (
                        <div className="col-span-full p-12 rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center opacity-10 gap-3">
                           <FileCode className="w-10 h-10" />
                           <p className="text-[10px] font-black uppercase tracking-widest">No public repositories discovered</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
           ) : (
             <Card className="glass-card border-border shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-12 border-dashed bg-black/10">
                <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center text-foreground/10 mb-6">
                  <Github className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-headline font-black text-foreground/40 uppercase tracking-widest">Awaiting Discovery Signal</h3>
                <p className="text-sm text-foreground/20 font-medium max-w-xs mt-4 uppercase tracking-tighter leading-relaxed">
                  Enter a GitHub handle to isolate the target developer identity and repository matrix.
                </p>
             </Card>
           )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .bg-checkered {
          background-image: linear-gradient(45deg, #111113 25%, transparent 25%), 
                            linear-gradient(-45deg, #111113 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #111113 75%), 
                            linear-gradient(-45deg, transparent 75%, #111113 75%);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}

