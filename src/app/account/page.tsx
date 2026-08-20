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
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Negotiating Identity Node...</p>
      </div>
    );
  }

  const creationDate = user.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })
    : 'Archive Unknown';

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-5xl">
      {/* Header Matrix */}
      <div className="mb-12 animate-reveal">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
        </Link>
        
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative group/avatar">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 rounded-[3rem] border-4 border-white dark:border-white/5 shadow-2xl ring-1 ring-border relative z-10">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200/200`} />
              <AvatarFallback className="bg-secondary text-2xl font-black text-primary">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl border-4 border-[#0a0a0c] z-20">
               <BadgeCheck className="w-5 h-5" />
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-4 flex-1">
             <div className="space-y-1">
                <h1 className="text-4xl sm:text-6xl font-headline font-black text-foreground uppercase tracking-tighter leading-none">
                  {user.displayName || 'Anonymous User'}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                   <p className="text-primary font-black uppercase text-[10px] tracking-[0.4em]">{user.email}</p>
                   <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-black uppercase px-2 py-0.5">Studio Member</Badge>
                </div>
             </div>
             
             <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                   <Clock className="w-3.5 h-3.5" />
                   Registered: {creationDate}
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                   <Smartphone className="w-3.5 h-3.5" />
                   Device ID: {user.uid.substring(0, 8)}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Management Module */}
        <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
           <Card className="glass-card border-border shadow-2xl overflow-hidden relative">
              <CardHeader className="pb-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Profile Parameters
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Typographic Identity (Name)</Label>
                       <div className="flex gap-2">
                          <Input 
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="Set display name..."
                            className="h-14 bg-secondary border-border rounded-2xl text-sm font-bold px-6 focus:ring-primary/20 uppercase"
                          />
                          <Button onClick={handleUpdateProfile} disabled={isUpdating} className="h-14 w-14 rounded-2xl bg-primary shadow-xl shrink-0">
                             {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          </Button>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-6">
                       <div className="flex items-center gap-3">
                          <KeyRound className="w-4 h-4 text-primary" />
                          <Label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Security Key Rotation</Label>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input 
                            type="password" 
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            placeholder="New Password" 
                            className="h-12 bg-secondary border-border rounded-xl text-xs font-bold"
                          />
                          <Input 
                            type="password"
                            value={confirmPass}
                            onChange={e => setConfirmPass(e.target.value)} 
                            placeholder="Confirm Protocol" 
                            className="h-12 bg-secondary border-border rounded-xl text-xs font-bold"
                          />
                       </div>
                       <Button onClick={handleChangePassword} disabled={isUpdating || !newPass} variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.2em]">
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Zap className="w-3.5 h-3.5 mr-2" />}
                          Update Security matrix
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Hardened Encryption</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Identity parameters and security keys are processed via hardware-native Firebase Authentication protocols. No credentials ever pass through local logs.
               </p>
             </div>
          </div>
        </div>

        {/* Info Module - Right */}
        <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right-6 duration-1000 stagger-2">
           <Card className="glass-card border-border shadow-2xl overflow-hidden bg-black/10">
              <CardHeader className="py-8 border-b border-border bg-secondary/30">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-foreground">
                    <Activity className="w-5 h-5 text-primary" /> Session Metadata
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                 <div className="space-y-6">
                    {[
                      { label: 'Primary Email', val: user.email, icon: Mail },
                      { label: 'Provider Node', val: user.providerData[0]?.providerId === 'password' ? 'Email Matrix' : 'External SSO', icon: Globe },
                      { label: 'Status Protocol', val: user.emailVerified ? 'VERIFIED IDENTITY' : 'PENDING VERIFICATION', icon: Shield, color: user.emailVerified ? 'text-green-500' : 'text-amber-500' },
                      { label: 'Hardware ID', val: user.uid, icon: Fingerprint },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-5 group/item">
                         <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary/40 shrink-0 border border-border group-hover/item:text-primary transition-colors">
                            <item.icon className="w-4 h-4" />
                         </div>
                         <div className="min-w-0 flex-1">
                            <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest mb-0.5">{item.label}</p>
                            <h4 className={cn("text-[11px] font-bold truncate uppercase", item.color || "text-foreground")}>{item.val}</h4>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <Button onClick={handleLogout} variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-white/5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 font-black uppercase tracking-[0.3em] text-[10px]">
                       <LogOut className="w-4 h-4 mr-3" /> De-Authorize Session
                    </Button>
                    <p className="text-center text-[8px] font-black text-foreground/10 uppercase tracking-widest">Protocol ID: {user.uid}</p>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[3rem] bg-secondary border border-border flex items-start gap-6 group hover:bg-secondary/80 transition-all duration-500 shadow-lg">
             <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
             </div>
             <div className="space-y-2">
               <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest leading-none">Instant Persistence</h4>
               <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase">
                 Identity changes synchronize immediately across all connected hardware sessions.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
