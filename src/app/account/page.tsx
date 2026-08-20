"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  Edit3, 
  CheckCircle2, 
  ArrowLeft,
  KeyRound,
  Fingerprint,
  Activity,
  BadgeCheck,
  Shield,
  Clock,
  Loader2,
  Settings2,
  Smartphone,
  Save,
  Trash2,
  ChevronRight,
  Globe,
  Bell,
  Cpu,
  Zap,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut, updateProfile, updatePassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AccountPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();

  // Edit State
  const [displayName, setDisplayName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account');
    }
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, loading, router]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName });
      toast({ title: "Identity Updated", description: "Your display name has been synchronized." });
    } catch (err) {
      toast({ variant: "destructive", title: "Protocol Failure", description: "Failed to update profile matrix." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPass) return;
    if (newPass !== confirmPass) {
      toast({ variant: "destructive", title: "Matrix Mismatch", description: "Passwords do not align." });
      return;
    }
    
    setIsUpdating(true);
    try {
      await updatePassword(user, newPass);
      setNewPass('');
      setConfirmPass('');
      toast({ title: "Security Key Rotated", description: "New password protocol active." });
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        toast({ variant: "destructive", title: "Re-Auth Required", description: "Please log out and back in to change security keys." });
      } else {
        toast({ variant: "destructive", title: "Protocol Failure", description: err.message });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
      toast({ title: "Session De-Authorized" });
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-[#0a0a0c]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Negotiating Identity Node...</p>
      </div>
    );
  }

  const creationDate = user.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })
    : 'Archive Unknown';

  return (
    <div className="min-h-screen bg-[#0a0a0c] selection:bg-primary/20">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-6xl">
        {/* Header Matrix */}
        <div className="mb-20 animate-reveal">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 hover:text-primary transition-all mb-16 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Studio
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="relative group/avatar">
              <div className="absolute -inset-8 bg-primary/10 blur-[80px] rounded-full opacity-40 group-hover/avatar:opacity-100 transition-opacity duration-1000" />
              <div className="relative p-1.5 bg-gradient-to-br from-primary/30 to-transparent rounded-[4rem] shadow-2xl ring-1 ring-white/5">
                <Avatar className="w-40 h-40 sm:w-56 sm:h-56 rounded-[3.8rem] border-[6px] border-[#0a0a0c] bg-secondary relative z-10 shadow-inner">
                  <AvatarImage src={`https://picsum.photos/seed/${user.uid}/500/500`} className="object-cover" />
                  <AvatarFallback className="bg-secondary text-5xl font-headline font-black text-primary">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white w-14 h-14 rounded-[1.8rem] flex items-center justify-center shadow-[0_15px_40px_rgba(37,99,235,0.4)] border-[6px] border-[#0a0a0c] z-20">
                 <BadgeCheck className="w-7 h-7" />
              </div>
            </div>
            
            <div className="text-center md:text-left space-y-6 flex-1 min-w-0">
               <div className="space-y-4">
                  <h1 className="text-5xl sm:text-8xl font-headline font-black text-foreground uppercase tracking-tighter leading-[0.9] truncate">
                    {user.displayName || 'IDENTITY_NODE'}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                     <p className="text-primary font-black uppercase text-xs tracking-[0.4em]">{user.email}</p>
                     <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg shadow-primary/5">Studio Member</Badge>
                  </div>
               </div>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-x-10 gap-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                     <Clock className="w-4 h-4 text-primary/30" />
                     Registered: {creationDate}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                     <Smartphone className="w-4 h-4 text-primary/30" />
                     Hardware ID: {user.uid.substring(0, 8).toUpperCase()}
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Management Module */}
          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
             <Card className="glass-card border-white/5 shadow-2xl overflow-hidden relative rounded-[3rem]">
                <CardHeader className="p-8 sm:p-12 border-b border-white/5 bg-secondary/10">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-4 text-foreground">
                            <Settings2 className="w-5 h-5 text-primary" /> Profile Parameters
                        </CardTitle>
                        <CardDescription className="text-[10px] tracking-widest">Update your typographic identity in the studio matrix.</CardDescription>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-12">
                   <div className="space-y-10">
                      <div className="space-y-5">
                         <Label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-1">Display Identity (Name)</Label>
                         <div className="flex flex-col sm:flex-row gap-4">
                            <Input 
                              value={displayName}
                              onChange={e => setDisplayName(e.target.value)}
                              placeholder="Set display name..."
                              className="h-16 bg-black/40 border-white/5 rounded-2xl text-base font-bold px-8 focus:ring-primary/20 uppercase flex-1 shadow-inner"
                            />
                            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="h-16 px-8 rounded-2xl bg-primary shadow-2xl shadow-primary/20 active:scale-95 transition-all text-[11px]">
                               {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="flex items-center gap-3"><Save className="w-5 h-5" /> Sync Name</div>}
                            </Button>
                         </div>
                      </div>

                      <div className="pt-12 border-t border-white/5 space-y-10">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner ring-1 ring-primary/20">
                               <KeyRound className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                               <Label className="text-[11px] font-black text-foreground uppercase tracking-[0.3em]">Security Key Rotation</Label>
                               <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Rotate your encrypted access protocol</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input 
                              type="password" 
                              value={newPass}
                              onChange={e => setNewPass(e.target.value)}
                              placeholder="New Protocol Key" 
                              className="h-16 bg-black/40 border-white/5 rounded-2xl text-sm font-bold px-8 shadow-inner"
                            />
                            <Input 
                              type="password"
                              value={confirmPass}
                              onChange={e => setConfirmPass(e.target.value)} 
                              placeholder="Verify Matrix" 
                              className="h-16 bg-black/40 border-white/5 rounded-2xl text-sm font-bold px-8 shadow-inner"
                            />
                         </div>
                         <Button onClick={handleChangePassword} disabled={isUpdating || !newPass} variant="outline" className="w-full h-16 rounded-[2rem] border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-xl">
                            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-4" />}
                            Update Security Matrix
                         </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <div className="p-10 rounded-[3.5rem] bg-secondary/20 border border-white/5 flex items-start gap-10 group hover:bg-secondary/30 transition-all duration-700 shadow-2xl">
               <div className="w-20 h-20 rounded-[2.2rem] bg-background border border-white/5 flex items-center justify-center text-primary shrink-0 shadow-2xl group-hover:scale-110 transition-transform ring-1 ring-white/5">
                  <ShieldCheck className="w-10 h-10" />
               </div>
               <div className="space-y-3">
                 <h4 className="text-base font-black text-foreground uppercase tracking-[0.2em] leading-none">Hardened Encryption</h4>
                 <p className="text-[13px] text-foreground/40 leading-relaxed font-medium uppercase tracking-tight">
                   Identity parameters and security keys are processed via hardware-native Firebase Authentication protocols. No credentials ever pass through local logs or remote intermediate nodes.
                 </p>
               </div>
            </div>
          </div>

          {/* Info Module - Right */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000">
             <Card className="glass-card border-white/5 shadow-2xl overflow-hidden bg-black/10 rounded-[3rem]">
                <CardHeader className="p-8 sm:p-10 border-b border-white/5 bg-secondary/10">
                   <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4 text-foreground">
                      <Activity className="w-5 h-5 text-primary" /> Session Metadata
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 sm:p-10 space-y-12">
                   <div className="space-y-8">
                      {[
                        { label: 'Primary Email', val: user.email, icon: Mail },
                        { label: 'Provider Node', val: user.providerData[0]?.providerId === 'password' ? 'Studio Matrix' : 'External SSO', icon: Globe },
                        { label: 'Status Protocol', val: user.emailVerified ? 'VERIFIED IDENTITY' : 'PENDING VERIFICATION', icon: Shield, color: user.emailVerified ? 'text-green-500' : 'text-amber-500' },
                        { label: 'Hardware ID', val: user.uid.substring(0, 16).toUpperCase(), icon: Cpu },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-6 group/item">
                           <div className="w-12 h-12 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center text-primary/30 shrink-0 group-hover/item:text-primary transition-all shadow-inner">
                              <item.icon className="w-5 h-5" />
                           </div>
                           <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <p className="text-[9px] font-black uppercase text-foreground/20 tracking-[0.3em] mb-1.5">{item.label}</p>
                              <h4 className={cn("text-[11px] font-bold truncate uppercase tracking-tight", item.color || "text-foreground/70")}>{item.val}</h4>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="pt-10 border-t border-white/5 space-y-6">
                      <Button onClick={handleLogout} variant="outline" className="w-full h-16 rounded-[2.2rem] border-white/10 bg-white/5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 font-black uppercase tracking-[0.4em] text-[11px] shadow-xl active:scale-95 transition-all">
                         <LogOut className="w-5 h-5 mr-4" /> De-Authorize
                      </Button>
                      <p className="text-center text-[8px] font-black text-foreground/10 uppercase tracking-[0.6em]">Protocol Cycle: Stable</p>
                   </div>
                </CardContent>
             </Card>

             <div className="p-8 rounded-[2.5rem] bg-secondary/10 border border-white/5 flex items-start gap-6 group hover:bg-secondary/20 transition-all duration-700 shadow-xl">
               <div className="w-14 h-14 rounded-2xl bg-background border border-white/5 flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform ring-1 ring-white/5">
                  <Zap className="w-7 h-7" />
               </div>
               <div className="space-y-1.5">
                 <h4 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] leading-none">Instant Persistence</h4>
                 <p className="text-[10px] text-foreground/40 leading-relaxed font-medium uppercase tracking-tight">
                   Identity changes synchronize immediately across all connected hardware sessions. No manual refresh required.
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
      `}</style>
    </div>
  );
}
