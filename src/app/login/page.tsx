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
  ChevronRight,
  Eye,
  EyeOff,
  Shield
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
  const [showPassword, setShowPassword] = useState(false);
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
      
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-all group">
           <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Studio
        </Link>

        <Card className="w-full glass-card border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group/card border-t border-white/10 rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none opacity-50" />
          
          <CardHeader className="p-8 sm:p-10 border-b border-white/5 bg-secondary/10 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-[1.8rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6 shadow-2xl relative z-10 ring-1 ring-primary/20">
               {isSignUp ? <UserPlus className="w-7 h-7" /> : <Fingerprint className="w-7 h-7" />}
            </div>
            <div className="space-y-2 relative z-10">
              <CardTitle className="text-3xl sm:text-4xl font-headline font-black text-foreground uppercase tracking-tight leading-none">
                {isSignUp ? 'Join Studio' : 'Identify'}
              </CardTitle>
              <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em] leading-relaxed">
                Secure Hardware Authentication
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleAuth} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] ml-1">Identity (Email)</Label>
                  <div className="relative group/input">
                    <Input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@studio.com"
                      className="h-12 bg-secondary/40 border-white/5 rounded-xl pl-12 focus:ring-primary/20 transition-all font-bold text-sm placeholder:text-foreground/10"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/input:text-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em]">Protocol (Password)</Label>
                  </div>
                  <div className="relative group/input">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 bg-secondary/40 border-white/5 rounded-xl pl-12 pr-12 focus:ring-primary/20 transition-all font-bold tracking-[0.2em]"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/10 group-focus-within/input:text-primary transition-colors" />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/10 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-4 animate-in shake duration-500">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest leading-relaxed">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full h-14 bg-primary text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all group overflow-hidden relative">
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 {isLoading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <div className="flex items-center gap-3 relative z-10">
                     {isSignUp ? 'Register' : 'Login'}
                     <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </div>
                 )}
              </Button>

              <div className="text-center pt-6 border-t border-white/5">
                 <button 
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-[10px] font-black uppercase text-foreground/30 hover:text-primary transition-all tracking-[0.2em] group"
                 >
                   {isSignUp ? (
                     <>Already registered? <span className="text-primary ml-1 group-hover:underline">Login</span></>
                   ) : (
                     <>New to studio? <span className="text-primary ml-1 group-hover:underline">Join Now</span></>
                   )}
                 </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
