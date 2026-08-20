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
  Cpu
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
        <div className="mb-16 animate-reveal">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all mb-12 group">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="relative group/avatar">
              <div className="absolute -inset-6 bg-primary/20 blur-[60px] rounded-full opacity-50 group-hover/avatar:opacity-100 transition-opacity duration-700" />
              <div className="relative p-1 bg-gradient-to-br from-primary/40 to-transparent rounded-[3.5rem] shadow-2xl">
                <Avatar className="w-32 h-32 sm:w-48 sm:h-48 rounded-[3.4rem] border-4 border-[#0a0a0c] bg-secondary relative z-10">
                  <AvatarImage src={`https://picsum.photos/seed/${user.uid}/400/400`} />
                  <AvatarFallback className="bg-secondary text-4xl font-headline font-black text-primary">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white w-12 h-12 rounded-[1.5rem] flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.4)] border-4 border-[#0a0a0c] z-20">
                 <BadgeCheck className="w-6 h-6" />
              </div>
            </div>
            
            <div className="text-center md:text-left space-y-6 flex-1 min-w-0">
               <div className="space-y-2">
                  <h1 className="text-4xl sm:text-7xl font-headline font-black text-foreground uppercase tracking-tighter leading-none truncate">
                    {user.displayName || 'Anonymous User'}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                     <p className="text-primary font-black uppercase text-[11px] tracking-[0.3em]">{user.email}</p>
                     <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg shadow-primary/5">Studio Member</Badge>
                  </div>
               </div>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                     <Clock className="w-4 h-4 text-primary/40" />
                     Registered: {creationDate}
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                     <Smartphone className="w-4 h-4 text-primary/40" />
                     Device ID: {user.uid.substring(0, 8)}
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Management Module */}
          <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-6 duration-1000">
             <Card className="glass-card border-white/5 shadow-2xl overflow-hidden relative">
                <CardHeader className="pb-8 border-b border-white/5 bg-secondary/20">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                            <Settings2 className="w-5 h-5 text-primary" /> Profile Parameters
                        </CardTitle>
                        <CardDescription>Update your typographic identity in the studio matrix.</CardDescription>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-12">
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Display Identity (Name)</Label>
                         <div className="flex gap-3">
                            <Input 
                              value={displayName}
                              onChange={e => setDisplayName(e.target.value)}
                              placeholder="Set display name..."
                              className="h-16 bg-secondary/50 border-white/5 rounded-2xl text-base font-bold px-8 focus:ring-primary/20 uppercase"
                            />
                            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="h-16 w-16 rounded-2xl bg-primary shadow-2xl shadow-primary/20 shrink-0 active:scale-90 transition-all">
                               {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            </Button>
                         </div>
                      </div>

                      <div className="pt-10 border-t border-white/5 space-y-8">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                               <KeyRound className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                               <Label className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">Security Key Rotation</Label>
                               <p className="text-[9px] font-bold text-foreground/20 uppercase">Update your access protocol</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                              type="password" 
                              value={newPass}
                              onChange={e => setNewPass(e.target.value)}
                              placeholder="New Password" 
                              className="h-14 bg-secondary/50 border-white/5 rounded-xl text-sm font-bold px-6"
                            />
                            <Input 
                              type="password"
                              value={confirmPass}
                              onChange={e => setConfirmPass(e.target.value)} 
                              placeholder="Confirm Protocol" 
                              className="h-14 bg-secondary/50 border-white/5 rounded-xl text-sm font-bold px-6"
                            />
                         </div>
                         <Button onClick={handleChangePassword} disabled={isUpdating || !newPass} variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all">
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Zap className="w-4 h-4 mr-3" />}
                            Update Security matrix
                         </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <div className="p-10 rounded-[3rem] bg-secondary/30 border border-white/5 flex items-start gap-8 group hover:bg-secondary/50 transition-all duration-500 shadow-xl">
               <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-white/5 flex items-center justify-center text-primary shrink-0 shadow-2xl group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8" />
               </div>
               <div className="space-y-2">
                 <h4 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Hardened Encryption</h4>
                 <p className="text-xs text-foreground/40 leading-relaxed font-medium uppercase">
                   Identity parameters and security keys are processed via hardware-native Firebase Authentication protocols. No credentials ever pass through local logs.
                 </p>
               </div>
            </div>
          </div>

          {/* Info Module - Right */}
          <div className="lg:col-span-5 space-y-10 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
             <Card className="glass-card border-white/5 shadow-2xl overflow-hidden bg-black/10">
                <CardHeader className="py-8 border-b border-white/5 bg-secondary/20">
                   <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                      <Activity className="w-5 h-5 text-primary" /> Session Metadata
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 sm:p-12 space-y-10">
                   <div className="space-y-8">
                      {[
                        { label: 'Primary Email', val: user.email, icon: Mail },
                        { label: 'Provider Node', val: user.providerData[0]?.providerId === 'password' ? 'Email Matrix' : 'External SSO', icon: Globe },
                        { label: 'Status Protocol', val: user.emailVerified ? 'VERIFIED IDENTITY' : 'PENDING VERIFICATION', icon: Shield, color: user.emailVerified ? 'text-green-500' : 'text-amber-500' },
                        { label: 'Hardware ID', val: user.uid, icon: Cpu },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-6 group/item">
                           <div className="w-12 h-12 rounded-[1rem] bg-secondary flex items-center justify-center text-primary/40 shrink-0 border border-white/5 group-hover/item:text-primary transition-colors shadow-inner">
                              <item.icon className="w-5 h-5" />
                           </div>
                           <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <p className="text-[9px] font-black uppercase text-foreground/20 tracking-widest mb-1">{item.label}</p>
                              <h4 className={cn("text-[11px] font-bold truncate uppercase tracking-tight", item.color || "text-foreground")}>{item.val}</h4>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="pt-10 border-t border-white/5 space-y-6">
                      <Button onClick={handleLogout} variant="outline" className="w-full h-16 rounded-[2rem] border-white/10 bg-white/5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 font-black uppercase tracking-[0.2em] text-[11px] shadow-xl">
                         <LogOut className="w-4.5 h-4.5 mr-3" /> De-Authorize Session
                      </Button>
                      <p className="text-center text-[8px] font-black text-foreground/10 uppercase tracking-[0.5em]">Protocol ID: {user.uid}</p>
                   </div>
                </CardContent>
             </Card>

             <div className="p-10 rounded-[3rem] bg-secondary/30 border border-white/5 flex items-start gap-8 group hover:bg-secondary/50 transition-all duration-500 shadow-xl">
               <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-white/5 flex items-center justify-center text-primary shrink-0 shadow-2xl group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8" />
               </div>
               <div className="space-y-2">
                 <h4 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Instant Persistence</h4>
                 <p className="text-xs text-foreground/40 leading-relaxed font-medium uppercase">
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
