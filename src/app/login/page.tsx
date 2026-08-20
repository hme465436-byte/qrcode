"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  Command,
  Zap,
  User,
  Fingerprint,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { SpaceBackground } from '@/components/qr-canvas/space-background';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  const mapAuthError = (code: string) => {
    switch (code) {
      case 'auth/user-not-found': return "Identity not recognized in registry.";
      case 'auth/wrong-password': return "Incorrect security key.";
      case 'auth/email-already-in-use': return "Email already mapped to an existing identity.";
      case 'auth/invalid-email': return "Malformed email format protocol.";
      case 'auth/weak-password': return "Security key is too weak (min 6 chars).";
      case 'auth/too-many-requests': return "Access throttled due to multiple failures.";
      default: return "Authentication protocol failure. Check your connection.";
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase Auth not connected.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account Created", description: "Identity registered in studio matrix." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome Back", description: "Protocol authentication successful." });
      }
      router.push(redirectTo);
    } catch (err: any) {
      setError(mapAuthError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden bg-[#0a0a0c]">
      <SpaceBackground />
      
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all group">
           <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
        </Link>

        <Card className="w-full glass-card border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group/card border-t border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />
          
          <CardHeader className="pb-8 border-b border-white/5 bg-secondary/20 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6 shadow-2xl relative z-10">
               {isSignUp ? <UserPlus className="w-7 h-7" /> : <Fingerprint className="w-7 h-7" />}
            </div>
            <div className="space-y-2 relative z-10">
              <CardTitle className="text-3xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                {isSignUp ? 'Join Studio' : 'Identity Login'}
              </CardTitle>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Protocol Verification Matrix</p>
            </div>
          </CardHeader>

          <CardContent className="p-8 sm:p-12">
            <form onSubmit={handleAuth} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Secure Email Address</Label>
                  <div className="relative group/input">
                    <Input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@studio.com"
                      className="h-14 bg-secondary/50 border-white/5 rounded-2xl pl-12 focus:ring-primary/20 transition-all font-medium"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Security Key</Label>
                    {!isSignUp && (
                      <button type="button" className="text-[9px] font-black uppercase text-primary/40 hover:text-primary transition-colors">Recover</button>
                    )}
                  </div>
                  <div className="relative group/input">
                    <Input 
                      type="password" 
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-14 bg-secondary/50 border-white/5 rounded-2xl pl-12 focus:ring-primary/20 transition-all"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4 animate-in shake duration-500 shadow-xl shadow-destructive/5">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-destructive uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full h-16 bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group">
                 {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <div className="flex items-center gap-3">
                     {isSignUp ? 'Initialize Identity' : 'Authorize Session'}
                     <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </div>
                 )}
              </Button>

              <div className="text-center pt-6 border-t border-white/5">
                 <button 
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-[10px] font-black uppercase text-foreground/30 hover:text-primary transition-all tracking-[0.1em] hover:tracking-[0.15em]"
                 >
                   {isSignUp ? 'Already have an account? Login' : 'Not registered? Create account'}
                 </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-x-10 gap-y-6 opacity-30">
           {[
             { icon: ShieldCheck, label: 'Secure Matrix' },
             { icon: CheckCircle2, label: 'Verified Host' },
             { icon: Zap, label: 'Zero Lag' }
           ].map((badge, i) => (
             <div key={i} className="flex items-center gap-2.5">
                <badge.icon className="w-4 h-4 text-primary/60" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">{badge.label}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
