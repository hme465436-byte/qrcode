
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
      toast({ title: "Name Updated", description: "Your profile has been updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Failed to update profile name." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPass) return;
    if (newPass !== confirmPass) {
      toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
      return;
    }
    
    setIsUpdating(true);
    try {
      await updatePassword(user, newPass);
      setNewPass('');
      setConfirmPass('');
      toast({ title: "Password Changed", description: "Your password has been updated." });
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        toast({ variant: "destructive", title: "Login Required", description: "Please log out and back in to change your password." });
      } else {
        toast({ variant: "destructive", title: "Failed", description: err.message });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
      toast({ title: "Logged Out" });
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-[#0a0a0c]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Loading Profile...</p>
      </div>
    );
  }

  const creationDate = user.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="min-h-screen bg-[#0a0a0c] selection:bg-primary/20">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-5xl">
        {/* Header */}
        <div className="mb-12 animate-reveal">
          <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 hover:text-primary transition-all mb-10 group">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative group/avatar">
              <div className="absolute -inset-6 bg-primary/10 blur-[60px] rounded-full opacity-40 group-hover/avatar:opacity-100 transition-opacity duration-1000" />
              <div className="relative p-1 bg-gradient-to-br from-primary/30 to-transparent rounded-[2.5rem] shadow-2xl ring-1 ring-white/5">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.3rem] border-[4px] border-[#0a0a0c] bg-secondary relative z-10 shadow-inner">
                  <AvatarImage src={`https://picsum.photos/seed/${user.uid}/300/300`} className="object-cover" />
                  <AvatarFallback className="bg-secondary text-3xl font-headline font-black text-primary">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-white w-10 h-10 rounded-[1.2rem] flex items-center justify-center shadow-xl border-[4px] border-[#0a0a0c] z-20">
                 <BadgeCheck className="w-5 h-5" />
              </div>
            </div>
            
            <div className="text-center md:text-left space-y-4 flex-1 min-w-0">
               <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl font-headline font-black text-foreground uppercase tracking-tighter leading-none truncate">
                    {user.displayName || 'Member'}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                     <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em]">{user.email}</p>
                     <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase px-3 py-1 rounded-full">Studio Member</Badge>
                  </div>
               </div>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-foreground/20 uppercase tracking-widest">
                     <Clock className="w-3.5 h-3.5 text-primary/30" />
                     Joined: {creationDate}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-foreground/20 uppercase tracking-widest">
                     <Smartphone className="w-3.5 h-3.5 text-primary/30" />
                     User ID: {user.uid.substring(0, 8).toUpperCase()}
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Controls */}
          <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-left-6 duration-1000">
             <Card className="glass-card border-white/5 shadow-2xl overflow-hidden relative rounded-[2.5rem]">
                <CardHeader className="p-6 sm:p-8 border-b border-white/5 bg-secondary/10">
                   <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-foreground">
                      <Settings2 className="w-4 h-4 text-primary" /> Profile Settings
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-8">
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <Label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-1">Full Name</Label>
                         <div className="flex flex-col sm:flex-row gap-3">
                            <Input 
                              value={displayName}
                              onChange={e => setDisplayName(e.target.value)}
                              placeholder="Your name..."
                              className="h-12 bg-black/40 border-white/5 rounded-xl text-sm font-bold px-6 focus:ring-primary/20 uppercase flex-1"
                            />
                            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="h-12 px-6 rounded-xl bg-primary text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all">
                               {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="flex items-center gap-2"><Save className="w-4 h-4" /> Save</div>}
                            </Button>
                         </div>
                      </div>

                      <div className="pt-8 border-t border-white/5 space-y-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                               <KeyRound className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                               <Label className="text-[10px] font-black text-foreground uppercase tracking-[0.3em]">Change Password</Label>
                               <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Update your account password</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                              type="password" 
                              value={newPass}
                              onChange={e => setNewPass(e.target.value)}
                              placeholder="New Password" 
                              className="h-12 bg-black/40 border-white/5 rounded-xl text-xs font-bold px-6"
                            />
                            <Input 
                              type="password"
                              value={confirmPass}
                              onChange={e => setConfirmPass(e.target.value)} 
                              placeholder="Confirm Password" 
                              className="h-12 bg-black/40 border-white/5 rounded-xl text-xs font-bold px-6"
                            />
                         </div>
                         <Button onClick={handleChangePassword} disabled={isUpdating || !newPass} variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all">
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                            Update Password
                         </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <div className="p-6 rounded-[2.5rem] bg-secondary/20 border border-white/5 flex items-start gap-6 group hover:bg-secondary/30 transition-all shadow-xl">
               <div className="w-12 h-12 rounded-2xl bg-background border border-white/5 flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] leading-none">Security Guaranteed</h4>
                 <p className="text-[11px] text-foreground/40 leading-relaxed font-medium uppercase tracking-tight">
                   Your account details and passwords are encrypted and managed securely via Firebase.
                 </p>
               </div>
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-6 duration-1000">
             <Card className="glass-card border-white/5 shadow-2xl overflow-hidden bg-black/10 rounded-[2.5rem]">
                <CardHeader className="p-6 sm:p-8 border-b border-white/5 bg-secondary/10">
                   <CardTitle className="text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-foreground">
                      <Activity className="w-4 h-4 text-primary" /> Session Details
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-8">
                   <div className="space-y-6">
                      {[
                        { label: 'Email Address', val: user.email, icon: Mail },
                        { label: 'Login Method', val: user.providerData[0]?.providerId === 'password' ? 'Email/Password' : 'SSO', icon: Globe },
                        { label: 'Account Status', val: user.emailVerified ? 'VERIFIED' : 'PENDING', icon: Shield, color: user.emailVerified ? 'text-green-500' : 'text-amber-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 group/item">
                           <div className="w-9 h-9 rounded-lg bg-secondary border border-white/5 flex items-center justify-center text-primary/30 shrink-0 group-hover/item:text-primary transition-all shadow-inner">
                              <item.icon className="w-4 h-4" />
                           </div>
                           <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <p className="text-[8px] font-black uppercase text-foreground/20 tracking-[0.2em] mb-0.5">{item.label}</p>
                              <h4 className={cn("text-[10px] font-bold truncate uppercase tracking-tight", item.color || "text-foreground/70")}>{item.val}</h4>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="pt-6 border-t border-white/5 space-y-4">
                      <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 font-black uppercase tracking-[0.3em] text-[9px] transition-all">
                         <LogOut className="w-4 h-4 mr-2" /> Logout
                      </Button>
                   </div>
                </CardContent>
             </Card>

             <div className="p-6 rounded-[2rem] bg-secondary/10 border border-white/5 flex items-start gap-4 group hover:bg-secondary/20 transition-all shadow-xl">
               <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
               </div>
               <div className="space-y-1">
                 <h4 className="text-[9px] font-black text-foreground uppercase tracking-[0.2em] leading-none">Always Synced</h4>
                 <p className="text-[9px] text-foreground/40 leading-relaxed font-medium uppercase tracking-tight">
                   Changes to your profile are reflected across all your devices immediately.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
